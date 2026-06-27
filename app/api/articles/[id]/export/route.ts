import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exportArticle, type ExportPayload } from "@/lib/export-service";
import slugify from "slugify";

function buildSlug(title: string): string {
  return slugify(title, { lower: true, strict: true, locale: "de" });
}

function buildLocationPath(location: {
  nameDe: string;
  slug: string;
  parent?: { nameDe: string; slug: string; parent?: { nameDe: string; slug: string } | null } | null;
}): { path: string[]; slugPath: string[] } {
  const names: string[] = ["Thailand"];
  const slugs: string[] = ["thailand"];

  if (location.parent?.parent) {
    names.push(location.parent.parent.nameDe);
    slugs.push(location.parent.parent.slug);
  }
  if (location.parent) {
    names.push(location.parent.nameDe);
    slugs.push(location.parent.slug);
  }
  names.push(location.nameDe);
  slugs.push(location.slug);

  return { path: names, slugPath: slugs };
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      location: { include: { parent: { include: { parent: true } } } },
      idea: { select: { category: true } },
    },
  });

  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (article.publishStatus !== "published") {
    return NextResponse.json({ error: "Article must be published before export" }, { status: 400 });
  }

  const payload: ExportPayload = {
    slug: buildSlug(article.title),
    title: article.title,
    bodyMarkdown: article.bodyMarkdown,
    category: article.idea?.category ?? "sonstige",
    location: buildLocationPath(article.location as Parameters<typeof buildLocationPath>[0]),
    publishedAt: new Date().toISOString(),
  };

  await exportArticle(payload);

  await prisma.article.update({ where: { id }, data: { exportedAt: new Date() } });

  return NextResponse.json({ slug: payload.slug, exportedAt: new Date().toISOString() });
}
