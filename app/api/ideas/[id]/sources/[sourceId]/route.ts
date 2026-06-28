import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; sourceId: string }> }
) {
  const { id, sourceId } = await params;
  await prisma.ideaSource.deleteMany({
    where: { ideaId: id, sourceId },
  });
  return NextResponse.json({ ok: true });
}
