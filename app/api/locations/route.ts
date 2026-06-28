import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const parentId = searchParams.get("parentId");
  const flat = searchParams.get("flat") === "true";

  const projectId = req.headers.get("x-project-id");
  if (flat) {
    const locations = await prisma.location.findMany({
      where: {
        ...(projectId ? { projectId } : {}),
        ...(type ? { type } : {}),
      },
      orderBy: [{ type: "asc" }, { nameDe: "asc" }],
      include: {
        parent: {
          select: { nameDe: true, slug: true, type: true },
        },
      },
    });
    return NextResponse.json(locations);
  }

  const locations = await prisma.location.findMany({
    where: {
      ...(projectId ? { projectId } : {}),
      ...(type ? { type } : { type: "country" }),
      ...(parentId ? { parentId } : {}),
    },
    orderBy: { nameDe: "asc" },
    include: {
      children: {
        orderBy: { nameDe: "asc" },
        include: {
          children: { orderBy: { nameDe: "asc" } },
        },
      },
    },
  });
  return NextResponse.json(locations);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, nameDe, nameEn, nameTh, slug, parentId } = body;
  if (!type || !nameDe || !nameEn || !slug) {
    return NextResponse.json({ error: "type, nameDe, nameEn, slug required" }, { status: 400 });
  }

  const projectId = req.headers.get("x-project-id");
  if (!projectId) {
    return NextResponse.json({ error: "x-project-id header required" }, { status: 400 });
  }
  try {
    const location = await prisma.location.create({
      data: {
        type, nameDe, nameEn, nameTh: nameTh ?? null, slug, parentId: parentId ?? null,
        projectId,
      },
    });
    return NextResponse.json(location, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    throw e;
  }
}
