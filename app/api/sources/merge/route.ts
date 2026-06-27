import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { sourceIds, mainSourceId } = await req.json();
  if (!sourceIds?.length || !mainSourceId) {
    return NextResponse.json({ error: "sourceIds and mainSourceId required" }, { status: 400 });
  }

  const othersIds: string[] = sourceIds.filter((id: string) => id !== mainSourceId);
  if (!othersIds.length) {
    return NextResponse.json({ error: "Need at least 2 different sources to merge" }, { status: 400 });
  }

  const others = await prisma.source.findMany({
    where: { id: { in: othersIds } },
    select: { id: true, rawText: true, capturedAt: true },
  });

  const main = await prisma.source.findUnique({
    where: { id: mainSourceId },
    select: { id: true, rawText: true },
  });
  if (!main) return NextResponse.json({ error: "mainSourceId not found" }, { status: 404 });

  // Append notes from merged sources
  let appendedText = main.rawText ?? "";
  for (const o of others) {
    if (o.rawText) {
      const date = new Date(o.capturedAt).toLocaleDateString("de-DE");
      appendedText += `\n\n--- Zusammengeführt von ${date} ---\n${o.rawText}`;
    }
  }

  // Re-point derivedSources and ideaSources to main
  await prisma.source.updateMany({
    where: { originSourceId: { in: othersIds } },
    data: { originSourceId: mainSourceId },
  });

  await Promise.all(
    othersIds.flatMap((sourceId) => [
      prisma.ideaSource
        .findMany({ where: { sourceId } })
        .then((links) =>
          Promise.all(
            links.map((l) =>
              prisma.ideaSource.upsert({
                where: { ideaId_sourceId: { ideaId: l.ideaId, sourceId: mainSourceId } },
                update: {},
                create: { ideaId: l.ideaId, sourceId: mainSourceId },
              })
            )
          )
        ),
    ])
  );

  await prisma.ideaSource.deleteMany({ where: { sourceId: { in: othersIds } } });

  await prisma.source.updateMany({
    where: { id: { in: othersIds } },
    data: { status: "merged", mergedIntoId: mainSourceId },
  });

  const updated = await prisma.source.update({
    where: { id: mainSourceId },
    data: { rawText: appendedText || null },
  });

  return NextResponse.json({ main: updated, merged: othersIds.length });
}
