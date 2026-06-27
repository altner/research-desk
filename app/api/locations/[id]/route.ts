import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { nameDe, nameEn, nameTh } = await req.json();
  const updated = await prisma.location.update({
    where: { id },
    data: {
      ...(nameDe !== undefined && { nameDe }),
      ...(nameEn !== undefined && { nameEn }),
      ...(nameTh !== undefined && { nameTh: nameTh || null }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ideaCount, articleCount, childCount] = await Promise.all([
    prisma.idea.count({ where: { locationId: id } }),
    prisma.article.count({ where: { locationId: id } }),
    prisma.location.count({ where: { parentId: id } }),
  ]);
  if (ideaCount > 0 || articleCount > 0) {
    return NextResponse.json(
      { error: `Cannot delete: ${ideaCount} idea(s) and ${articleCount} article(s) are linked to this location.` },
      { status: 409 }
    );
  }
  if (childCount > 0) {
    return NextResponse.json(
      { error: `Cannot delete: this location has ${childCount} child location(s). Remove them first.` },
      { status: 409 }
    );
  }
  try {
    await prisma.location.delete({ where: { id } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }
    throw e;
  }
  return NextResponse.json({ ok: true });
}
