import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readIdeaForPrompt } from "@/lib/idea-reader";
import Anthropic from "@anthropic-ai/sdk";

const CATEGORY_EN: Record<string, string> = {
  geheimtipp: "Hidden Gem",
  warnung_abzocke: "Warning / Risk",
  erwartung_vs_realitaet: "Expectation vs. Reality",
  food_tipp: "Food & Drink",
  stimmungsbild: "Atmosphere",
  kultureller_fauxpas: "Cultural Note",
  praktischer_tipp: "Practical Tip",
  sonstige: "Other",
};

function buildLocationPath(idea: Awaited<ReturnType<typeof readIdeaForPrompt>>): string {
  if (!idea) return "";
  const parts: string[] = [];
  const loc = idea.location;
  if (loc.parent?.parent) parts.push(loc.parent.parent.nameDe);
  if (loc.parent) parts.push(loc.parent.nameDe);
  parts.push(loc.nameDe);
  return parts.join(" › ");
}

function substituteTemplate(
  template: string,
  vars: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

function buildPrompt(
  idea: Awaited<ReturnType<typeof readIdeaForPrompt>>,
  templateText: string
): string {
  if (!idea) return "";

  const locationPath = buildLocationPath(idea);
  const categoryLabel = CATEGORY_EN[idea.category] ?? idea.category;
  const date = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return substituteTemplate(templateText, {
    title: idea.title,
    category: categoryLabel,
    area: locationPath,
    sourceCount: String(idea.confirmationCount),
    credibility: idea.credibility,
    summary: idea.summary,
    researchNotes: idea.researchNotes ?? "",
    date,
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: ideaId } = await params;
  const body = await req.json().catch(() => ({}));
  const templateId: string | undefined = body.templateId;

  // Load idea WITHOUT any Source.rawText access
  const idea = await readIdeaForPrompt(ideaId);
  if (!idea) return NextResponse.json({ error: "Idea not found" }, { status: 404 });

  // Resolve template — explicit > location ancestor > global default
  let template = null;

  if (templateId) {
    template = await prisma.promptTemplate.findUnique({ where: { id: templateId } });
  } else {
    const loc = idea.location;
    const locationIds = [loc.id, loc.parent?.id, loc.parent?.parent?.id].filter(Boolean) as string[];
    if (locationIds.length) {
      const candidates = await prisma.promptTemplate.findMany({
        where: { locationId: { in: locationIds } },
      });
      for (const locId of locationIds) {
        const match = candidates.find((t) => t.locationId === locId);
        if (match) { template = match; break; }
      }
    }
    if (!template) {
      template = await prisma.promptTemplate.findFirst({
        where: { isDefault: true },
        orderBy: { createdAt: "asc" },
      });
    }
  }

  if (!template) {
    return NextResponse.json({ error: "No prompt template found. Create one in Settings." }, { status: 400 });
  }

  const prompt = buildPrompt(idea, template.template);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your-anthropic-api-key-here") {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  const client = new Anthropic({ apiKey });
  const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";

  const message = await client.messages.create({
    model,
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const modelOutput = message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");

  // Upsert article
  const ideaRow = await prisma.idea.findUnique({ where: { id: ideaId }, select: { locationId: true, projectId: true } });
  if (!ideaRow?.projectId) return NextResponse.json({ error: "Idea has no projectId" }, { status: 400 });
  let article = await prisma.article.findFirst({ where: { ideaId } });
  if (!article) {
    article = await prisma.article.create({
      data: {
        ideaId,
        locationId: ideaRow.locationId,
        title: idea.title,
        bodyMarkdown: modelOutput,
        generationSource: "ai_draft_human_edited",
        publishStatus: "draft",
        projectId: ideaRow.projectId,
      },
    });
  } else {
    article = await prisma.article.update({
      where: { id: article.id },
      data: {
        bodyMarkdown: modelOutput,
        generationSource: "ai_draft_human_edited",
      },
    });
  }

  // Audit log — includes the filled prompt (no rawText in it)
  await prisma.articleDraftGeneration.create({
    data: {
      articleId: article.id,
      promptTemplateId: template.id,
      ideaSnapshot: JSON.stringify(idea),
      promptUsed: prompt,
      modelOutput,
    },
  });

  // Update idea status
  await prisma.idea.update({ where: { id: ideaId }, data: { status: "im_entwurf" } });

  return NextResponse.json({ article, templateUsed: template.name });
}
