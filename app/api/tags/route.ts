import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const projectId = req.headers.get("x-project-id");
  const tags = await prisma.tag.findMany({
    where: projectId ? { projectId } : {},
    orderBy: { name: "asc" },
    include: { _count: { select: { sources: true } } },
  });
  return NextResponse.json(tags);
}

export async function POST(req: NextRequest) {
  const projectId = req.headers.get("x-project-id");
  const { name, color } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "name required" }, { status: 400 });
  const tag = await prisma.tag.create({
    data: { name: name.trim(), color: color ?? "#A89C8E", projectId: projectId ?? null },
    include: { _count: { select: { sources: true } } },
  });
  return NextResponse.json(tag, { status: 201 });
}
