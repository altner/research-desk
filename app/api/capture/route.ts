import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeUrl, hashText, detectPlatform } from "@/lib/url-utils";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    url,
    title,
    platform,
    rawText,
    locationId,
    originSourceId,
    createIdea,
    status,
  } = body;

  if (!url) return NextResponse.json({ error: "url is required" }, { status: 400 });

  const urlNorm = normalizeUrl(url);
  const detectedPlatform = platform ?? detectPlatform(url);

  // Duplicate check
  const existing = await prisma.source.findFirst({
    where: { urlNormalized: urlNorm },
    select: { id: true },
  });

  const rawTextHash = rawText ? hashText(rawText) : null;

  const projectId = req.headers.get("x-project-id");
  const source = await prisma.source.create({
    data: {
      platform: detectedPlatform,
      url,
      urlNormalized: urlNorm,
      title: title ?? null,
      rawText: rawText ?? null,
      rawTextHash,
      locationId: locationId ?? null,
      originSourceId: originSourceId ?? null,
      status: status ?? "new",
      ...(projectId ? { projectId } : {}),
    },
  });

  if (createIdea) {
    const { title, category } = createIdea;
    if (!title || !category) {
      return NextResponse.json({ error: "title and category required for createIdea" }, { status: 400 });
    }
    const locId = locationId;
    if (!locId) {
      return NextResponse.json({ error: "locationId required when createIdea is set" }, { status: 400 });
    }
    const idea = await prisma.idea.create({
      data: {
        title,
        category,
        summary: rawText ?? title,
        locationId: locId,
        status: "idea",
        ...(projectId ? { projectId } : {}),
      },
    });
    await prisma.ideaSource.create({ data: { ideaId: idea.id, sourceId: source.id } });
    await prisma.source.update({ where: { id: source.id }, data: { status: "linked_to_idea" } });

    return NextResponse.json({ source, idea, duplicate: existing?.id ?? null }, { status: 201 });
  }

  return NextResponse.json({ source, duplicate: existing?.id ?? null }, { status: 201 });
}
