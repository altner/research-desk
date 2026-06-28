import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name } = await req.json();
  const folder = await prisma.folder.update({
    where: { id },
    data: { ...(name !== undefined && { name: name.trim() }) },
    include: { _count: { select: { sources: true } } },
  });
  return NextResponse.json(folder);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.source.updateMany({ where: { folderId: id }, data: { folderId: null } });
  await prisma.folder.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
