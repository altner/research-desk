import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idea = await prisma.idea.findUnique({
    where: { id },
    include: {
      location: { include: { parent: { include: { parent: true } } } },
      ideaSources: {
        include: {
          source: {
            select: {
              id: true, platform: true, url: true, capturedAt: true,
              status: true, locationId: true, location: true,
            },
          },
        },
      },
      articles: true,
    },
  });
  if (!idea) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(idea);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { title, category, summary, locationId, credibility, status, researchNotes } = body;

  const idea = await prisma.idea.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(category !== undefined && { category }),
      ...(summary !== undefined && { summary }),
      ...(locationId !== undefined && { locationId }),
      ...(credibility !== undefined && { credibility }),
      ...(status !== undefined && { status }),
      ...(researchNotes !== undefined && { researchNotes }),
    },
    include: { location: true },
  });
  return NextResponse.json(idea);
}
