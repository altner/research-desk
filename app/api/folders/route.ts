import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const projectId = req.headers.get("x-project-id");
  const folders = await prisma.folder.findMany({
    where: { ...(projectId ? { projectId } : {}), parentId: null },
    include: {
      children: { include: { _count: { select: { sources: true } } } },
      _count: { select: { sources: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(folders);
}

export async function POST(req: NextRequest) {
  const projectId = req.headers.get("x-project-id");
  const { name, parentId } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "name required" }, { status: 400 });
  const folder = await prisma.folder.create({
    data: { name: name.trim(), parentId: parentId ?? null, ...(projectId ? { projectId } : {}) },
    include: { _count: { select: { sources: true } } },
  });
  return NextResponse.json(folder, { status: 201 });
}
