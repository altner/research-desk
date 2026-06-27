/**
 * Regression test: AI prompt builder must never include Source.rawText.
 * Checks actual DB access and field selection, not variable names or comments.
 */

import fs from "fs";
import path from "path";

const GENERATE_DRAFT_FILE = path.resolve(
  __dirname,
  "../app/api/ideas/[id]/generate-draft/route.ts"
);
const IDEA_READER_FILE = path.resolve(__dirname, "../lib/idea-reader.ts");

// Strip single-line and multi-line comments for structural analysis
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*/g, "");
}

describe("Architecture constraint: no Source.rawText in AI prompt", () => {
  it("generate-draft route does not query the Source table or select rawText", () => {
    const raw = fs.readFileSync(GENERATE_DRAFT_FILE, "utf-8");
    const src = stripComments(raw);
    // Must not directly call prisma.source (the Source table)
    expect(src).not.toMatch(/prisma\.source\b/i);
    // Must not select or destructure rawText as a data field (not in comments)
    expect(src).not.toMatch(/\.rawText\b/);
    expect(src).not.toMatch(/rawText\s*:/);
    // Must use the idea-reader service
    expect(src).toContain("readIdeaForPrompt");
  });

  it("idea-reader service never selects rawText from the Source table", () => {
    const raw = fs.readFileSync(IDEA_READER_FILE, "utf-8");
    const src = stripComments(raw);
    // Must not select rawText field
    expect(src).not.toMatch(/rawText\s*:/);
    expect(src).not.toMatch(/\.rawText\b/);
    // Must not join ideaSources with a full source include (only select is safe)
    expect(src).not.toMatch(/ideaSources.*include.*source\b(?!.*select)/s);
  });

  it("buildPrompt function only accesses IdeaForPrompt fields, not Source fields", () => {
    const raw = fs.readFileSync(GENERATE_DRAFT_FILE, "utf-8");
    // Extract the buildPrompt function body (multiline match)
    const buildPromptFn = raw.match(/function buildPrompt[\s\S]*?^}/m)?.[0] ?? "";
    expect(buildPromptFn).toBeTruthy();
    const src = stripComments(buildPromptFn);
    // Must not access .rawText
    expect(src).not.toMatch(/\.rawText\b/);
    // Must not access ideaSources collection
    expect(src).not.toMatch(/ideaSources/);
    // Must not call prisma
    expect(src).not.toMatch(/prisma\b/);
  });
});
