import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { ideaId, newIdea } = await req.json();

  let targetIdeaId = ideaId;

  if (!targetIdeaId && newIdea) {
    const { title, category, locationId } = newIdea;
    const created = await prisma.idea.create({
      data: { title, category, summary: "", locationId, status: "idea" },
    });
    targetIdeaId = created.id;
  }

  if (!targetIdeaId) {
    return NextResponse.json({ error: "ideaId or newIdea required" }, { status: 400 });
  }

  await prisma.ideaSource.upsert({
    where: { ideaId_sourceId: { ideaId: targetIdeaId, sourceId: id } },
    update: {},
    create: { ideaId: targetIdeaId, sourceId: id },
  });

  await prisma.source.update({ where: { id }, data: { status: "linked_to_idea" } });

  // Update confirmationCount
  const count = await prisma.ideaSource.count({ where: { ideaId: targetIdeaId } });
  await prisma.idea.update({ where: { id: targetIdeaId }, data: { confirmationCount: count } });

  return NextResponse.json({ ideaId: targetIdeaId });
}
