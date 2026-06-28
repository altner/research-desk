import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { tagIds } = await req.json() as { tagIds: string[] };

  await prisma.sourceTag.deleteMany({ where: { sourceId: id } });
  if (tagIds.length > 0) {
    await prisma.sourceTag.createMany({
      data: tagIds.map((tagId) => ({ sourceId: id, tagId })),
    });
  }

  const source = await prisma.source.findUnique({
    where: { id },
    include: { sourceTags: { include: { tag: true } } },
  });
  return NextResponse.json(source);
}
