import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const locationInclude = {
  location: { select: { id: true, nameEn: true, nameDe: true } },
} as const;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await prisma.promptTemplate.findUnique({ where: { id }, include: locationInclude });
  if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(t);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  if (body.isDefault === true) {
    await prisma.promptTemplate.updateMany({ data: { isDefault: false } });
  }
  const updated = await prisma.promptTemplate.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description || null }),
      ...(body.template !== undefined && { template: body.template }),
      ...(body.isDefault !== undefined && { isDefault: body.isDefault }),
      ...(body.locationId !== undefined && { locationId: body.locationId || null }),
    },
    include: locationInclude,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.promptTemplate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
