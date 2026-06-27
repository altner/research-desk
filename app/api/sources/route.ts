import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const platform = searchParams.get("platform");
  const includeMerged = searchParams.get("includeMerged") === "true";
  const search = searchParams.get("q");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  else if (!includeMerged) where.status = { not: "merged" };
  if (platform) where.platform = platform;
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
