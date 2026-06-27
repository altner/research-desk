import path from "path";
import fs from "fs/promises";

export interface ExportPayload {
  slug: string;
  title: string;
  bodyMarkdown: string;
  category: string;
  location: {
    path: string[];
    slugPath: string[];
  };
  publishedAt: string;
}

function buildMarkdownFrontmatter(payload: ExportPayload): string {
  return `---
slug: ${payload.slug}
title: "${payload.title.replace(/"/g, '\\"')}"
category: ${payload.category}
location_path: ${JSON.stringify(payload.location.path)}
published_at: ${payload.publishedAt}
---

${payload.bodyMarkdown}
`;
}

async function fileAdapter(payload: ExportPayload): Promise<void> {
  const exportDir = process.env.EXPORT_DIR ?? "./exports";
  const absDir = path.isAbsolute(exportDir) ? exportDir : path.resolve(process.cwd(), exportDir);
  await fs.mkdir(absDir, { recursive: true });

  await fs.writeFile(
    path.join(absDir, `${payload.slug}.json`),
    JSON.stringify(payload, null, 2),
    "utf-8"
  );
  await fs.writeFile(
    path.join(absDir, `${payload.slug}.md`),
    buildMarkdownFrontmatter(payload),
    "utf-8"
  );
}

async function httpAdapter(payload: ExportPayload): Promise<void> {
  const targetUrl = process.env.EXPORT_TARGET_URL;
  const apiKey = process.env.EXPORT_API_KEY;
  if (!targetUrl) throw new Error("EXPORT_TARGET_URL not configured");

  const res = await fetch(targetUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Export HTTP error: ${res.status} ${await res.text()}`);
}

export async function exportArticle(payload: ExportPayload): Promise<void> {
  const mode = process.env.EXPORT_MODE ?? "file";
  if (mode === "http") {
    await httpAdapter(payload);
  } else {
    await fileAdapter(payload);
  }
}
