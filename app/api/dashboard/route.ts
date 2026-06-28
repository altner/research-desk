import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const projectId = req.headers.get("x-project-id");
  const where = projectId ? { projectId } : {};

  const [sources, ideas, articles, recentArticles, recentSources] = await Promise.all([
    prisma.source.count({ where }),
    prisma.idea.count({ where }),
    prisma.article.count({ where }),
    prisma.article.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, publishStatus: true, updatedAt: true },
    }),
    prisma.source.findMany({
      where,
      orderBy: { capturedAt: "desc" },
      take: 5,
      select: { id: true, platform: true, url: true, title: true, capturedAt: true },
    }),
  ]);

  const ideaGroups = await prisma.idea.groupBy({
    by: ["status"],
    where,
    _count: true,
  });

  const articleGroups = await prisma.article.groupBy({
    by: ["publishStatus"],
    where,
    _count: true,
  });

  const ideasByStatus = Object.fromEntries(ideaGroups.map((g) => [g.status, g._count]));
  const articlesByStatus = Object.fromEntries(articleGroups.map((g) => [g.publishStatus, g._count]));

  return NextResponse.json({
    stats: { sources, ideas, articles, ideasByStatus, articlesByStatus },
    recentArticles,
    recentSources,
  });
}
