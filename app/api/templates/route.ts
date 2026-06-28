import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const locationInclude = {
  location: { select: { id: true, nameEn: true, nameDe: true } },
} as const;

export async function GET(req: NextRequest) {
  const projectId = req.headers.get("x-project-id");
  const templates = await prisma.promptTemplate.findMany({
    where: projectId ? { projectId } : {},
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    include: locationInclude,
  });
  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  const { name, description, template, isDefault, locationId } = await req.json();
  if (!name || !template) {
    return NextResponse.json({ error: "name and template are required" }, { status: 400 });
  }
  const projectId = req.headers.get("x-project-id");
  if (isDefault) {
    await prisma.promptTemplate.updateMany({ data: { isDefault: false } });
  }
  const created = await prisma.promptTemplate.create({
    data: {
      name,
      description: description || null,
      template,
      isDefault: !!isDefault,
      locationId: locationId ?? null,
      ...(projectId ? { projectId } : {}),
    },
    include: locationInclude,
  });
  return NextResponse.json(created, { status: 201 });
}
