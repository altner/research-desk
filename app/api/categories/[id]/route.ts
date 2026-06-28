import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { labelDe, color } = await req.json();
  const category = await prisma.category.update({
    where: { id },
    data: {
      ...(labelDe !== undefined && { labelDe: labelDe.trim() }),
      ...(color !== undefined && { color }),
    },
  });
  return NextResponse.json(category);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.category.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
