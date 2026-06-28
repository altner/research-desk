import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const source = await prisma.source.findUnique({
    where: { id },
    include: {
      location: { include: { parent: { include: { parent: true } } } },
      locationGuess: true,
      originSource: {
        include: { location: true },
      },
      derivedSources: {
        include: { location: true },
        orderBy: { capturedAt: "asc" },
      },
      ideaSources: { include: { idea: { include: { location: true, articles: { select: { id: true, title: true, publishStatus: true } } } } } },
      mergedInto: { select: { id: true, url: true, platform: true } },
      mergedFrom: { select: { id: true, url: true, platform: true, rawText: true } },
    },
  });
  if (!source) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(source);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { status, locationId, locationGuessId, rawText, originalPostedAt, url, platform, folderId, title } = body;

  if (status === "new" || status === "reviewed") {
    await prisma.ideaSource.deleteMany({ where: { sourceId: id } });
  }

  const source = await prisma.source.update({
    where: { id },
    data: {
      ...(status !== undefined && { status }),
      ...(locationId !== undefined && { locationId }),
      ...(locationGuessId !== undefined && { locationGuessId }),
      ...(rawText !== undefined && { rawText }),
      ...(originalPostedAt !== undefined && { originalPostedAt: new Date(originalPostedAt) }),
      ...(url !== undefined && { url }),
      ...(platform !== undefined && { platform }),
      ...(title !== undefined && { title }),
      ...(folderId !== undefined && { folderId: folderId || null }),
    },
    include: { location: true },
  });
  return NextResponse.json(source);
}
