import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { sourceIds, ideaId, newIdea } = await req.json();
  if (!sourceIds?.length) return NextResponse.json({ error: "sourceIds required" }, { status: 400 });

  let targetIdeaId = ideaId;

  const projectId = req.headers.get("x-project-id");
  if (!targetIdeaId && newIdea) {
    const { title, category, locationId, summary } = newIdea;
    const created = await prisma.idea.create({
      data: { title, category, summary: summary ?? "", locationId, status: "idea", ...(projectId ? { projectId } : {}) },
    });
    targetIdeaId = created.id;
  }

  if (!targetIdeaId) {
    return NextResponse.json({ error: "ideaId or newIdea required" }, { status: 400 });
  }

  await Promise.all(
    sourceIds.map((sourceId: string) =>
      prisma.ideaSource.upsert({
        where: { ideaId_sourceId: { ideaId: targetIdeaId, sourceId } },
        update: {},
        create: { ideaId: targetIdeaId, sourceId },
      })
    )
  );

  await prisma.source.updateMany({
    where: { id: { in: sourceIds } },
    data: { status: "linked_to_idea" },
  });

  return NextResponse.json({ ideaId: targetIdeaId, linked: sourceIds.length });
}
