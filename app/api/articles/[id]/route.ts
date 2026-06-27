import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      location: { include: { parent: { include: { parent: true } } } },
      idea: {
        select: {
          id: true, title: true, category: true, confirmationCount: true,
          credibility: true, summary: true, researchNotes: true,
        },
      },
      draftGenerations: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(article);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { title, bodyMarkdown, publishStatus, publishedUrl } = body;

  const article = await prisma.article.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(bodyMarkdown !== undefined && { bodyMarkdown }),
      ...(publishStatus !== undefined && { publishStatus }),
      ...(publishedUrl !== undefined && { publishedUrl }),
    },
    include: { location: true, idea: { select: { id: true, category: true, confirmationCount: true, credibility: true } } },
  });

  // Sync idea status when article is published
  if (publishStatus === "published") {
    await prisma.idea.update({ where: { id: article.ideaId }, data: { status: "veroeffentlicht" } });
  } else if (publishStatus === "in_review") {
    await prisma.idea.update({ where: { id: article.ideaId }, data: { status: "review" } });
  }

  return NextResponse.json(article);
}
