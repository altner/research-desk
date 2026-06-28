import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: ideaId } = await params;

  const idea = await prisma.idea.findUnique({
    where: { id: ideaId },
    select: { title: true, locationId: true, projectId: true },
  });
  if (!idea) return NextResponse.json({ error: "Idea not found" }, { status: 404 });
  if (!idea.projectId) return NextResponse.json({ error: "Idea has no projectId" }, { status: 400 });

  let article = await prisma.article.findFirst({ where: { ideaId } });
  if (article) {
    return NextResponse.json({ article });
  }

  article = await prisma.article.create({
    data: {
      ideaId,
      locationId: idea.locationId,
      title: idea.title,
      bodyMarkdown: "",
      generationSource: "manual",
      publishStatus: "draft",
      projectId: idea.projectId,
    },
  });

  await prisma.idea.update({ where: { id: ideaId }, data: { status: "im_entwurf" } });

  return NextResponse.json({ article });
}
