import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { sourceIds } = await req.json();
  if (!sourceIds?.length) return NextResponse.json({ error: "sourceIds required" }, { status: 400 });

  await prisma.source.updateMany({
    where: { id: { in: sourceIds } },
    data: { status: "discarded" },
  });

  return NextResponse.json({ discarded: sourceIds.length });
}
