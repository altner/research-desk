import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const platform = searchParams.get("platform");
  const includeMerged = searchParams.get("includeMerged") === "true";
  const search = searchParams.get("q");
  const folderId = searchParams.get("folderId"); // "none" = unfiled, else folder id
  const tagId = searchParams.get("tagId");
  const projectId = req.headers.get("x-project-id");

  const where: Record<string, unknown> = {};
  if (projectId) where.projectId = projectId;
  if (status) where.status = status;
  else if (!includeMerged) where.status = { not: "merged" };
  if (platform) where.platform = platform;
  if (folderId === "none") where.folderId = null;
  else if (folderId) where.folderId = folderId;
  if (tagId) where.sourceTags = { some: { tagId } };
  if (search) {
    where.OR = [
      { rawText: { contains: search } },
      { url: { contains: search } },
    ];
  }

  const sources = await prisma.source.findMany({
    where,
    orderBy: { capturedAt: "desc" },
    include: {
      location: true,
      locationGuess: true,
      originSource: { select: { id: true, url: true, platform: true, capturedAt: true } },
      derivedSources: { select: { id: true, url: true, platform: true, capturedAt: true, status: true } },
      ideaSources: { include: { idea: { select: { id: true, title: true, status: true } } } },
      sourceTags: { include: { tag: true } },
    },
  });

  // Attach duplicate flags (same urlNormalized, different id)
  const urlCounts = new Map<string, string[]>();
  for (const s of sources) {
    const arr = urlCounts.get(s.urlNormalized) ?? [];
    arr.push(s.id);
    urlCounts.set(s.urlNormalized, arr);
  }

  const withDuplicates = sources.map((s) => ({
    ...s,
    _hasDuplicate: (urlCounts.get(s.urlNormalized)?.length ?? 0) > 1,
  }));

  return NextResponse.json(withDuplicates);
}
