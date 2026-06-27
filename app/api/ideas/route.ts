import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const locationId = searchParams.get("locationId");

  const where: Record<string, unknown> = {};
  if (status) where.status = { not: "verworfen", ...(status !== "all" && { equals: status }) };
  if (category) where.category = category;
  if (locationId) where.locationId = locationId;

  const ideas = await prisma.idea.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      location: { include: { parent: { include: { parent: true } } } },
      ideaSources: {
        include: {
          source: {
            select: { id: true, platform: true, url: true, capturedAt: true, status: true },
          },
        },
      },
      articles: { select: { id: true, publishStatus: true } },
    },
  });

  return NextResponse.json(ideas);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, category, summary, locationId, credibility, researchNotes } = body;

  if (!title || !category || !locationId) {
    return NextResponse.json({ error: "title, category, locationId required" }, { status: 400 });
  }

  const idea = await prisma.idea.create({
    data: {
      title,
      category,
      summary: summary ?? "",
      locationId,
      credibility: credibility ?? "niedrig",
      researchNotes: researchNotes ?? null,
      status: "idea",
    },
    include: { location: true },
  });

  return NextResponse.json(idea, { status: 201 });
}
