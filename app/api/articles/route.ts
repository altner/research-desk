import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const publishStatus = searchParams.get("publishStatus");

  const where: Record<string, unknown> = {};
  if (publishStatus) where.publishStatus = publishStatus;

  const articles = await prisma.article.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      location: { include: { parent: { include: { parent: true } } } },
      idea: { select: { id: true, title: true, category: true, confirmationCount: true, credibility: true } },
    },
  });
  return NextResponse.json(articles);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { ideaId, title, bodyMarkdown } = body;
  if (!ideaId) return NextResponse.json({ error: "ideaId required" }, { status: 400 });

  const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
  if (!idea) return NextResponse.json({ error: "Idea not found" }, { status: 404 });

  const article = await prisma.article.create({
    data: {
      ideaId,
      locationId: idea.locationId,
      title: title ?? idea.title,
      bodyMarkdown: bodyMarkdown ?? "",
      generationSource: "human",
      publishStatus: "draft",
    },
    include: { location: true, idea: true },
  });
  return NextResponse.json(article, { status: 201 });
}
