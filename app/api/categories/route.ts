import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const { key, labelDe, color } = await req.json();
  if (!key?.trim() || !labelDe?.trim()) {
    return NextResponse.json({ error: "key and labelDe required" }, { status: 400 });
  }
  const category = await prisma.category.create({
    data: { key: key.trim(), labelDe: labelDe.trim(), color: color ?? "#7B5EA7" },
  });
  return NextResponse.json(category, { status: 201 });
}
