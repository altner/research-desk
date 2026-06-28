import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { sources: true, ideas: true, articles: true } },
    },
  });
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const { name, description } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  const project = await prisma.project.create({
    data: { name: name.trim(), description: description?.trim() || null },
    include: {
      _count: { select: { sources: true, ideas: true, articles: true } },
    },
  });
  return NextResponse.json(project, { status: 201 });
}
