import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const publishStatus = searchParams.get("publishStatus");
  const search = searchParams.get("q");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const pageSize = 30;
  const projectId = req.headers.get("x-project-id");

  const where: Record<string, unknown> = {};
  if (projectId) where.projectId = projectId;
  if (publishStatus) where.publishStatus = publishStatus;
  if (search) where.title = { contains: search };

  const [total, articles] = await Promise.all([
    prisma.article.count({ where }),
    prisma.article.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        location: { include: { parent: { include: { parent: true } } } },
        idea: { select: { id: true, title: true, category: true, confirmationCount: true, credibility: true } },
      },
    }),
  ]);

  return NextResponse.json({ articles, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { ideaId, title, bodyMarkdown } = body;
  if (!ideaId) return NextResponse.json({ error: "ideaId required" }, { status: 400 });

  const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
  if (!idea) return NextResponse.json({ error: "Idea not found" }, { status: 404 });

  const resolvedProjectId = req.headers.get("x-project-id") ?? idea.projectId;
  if (!resolvedProjectId) return NextResponse.json({ error: "projectId could not be resolved" }, { status: 400 });
  const article = await prisma.article.create({
    data: {
      ideaId,
      locationId: idea.locationId,
      title: title ?? idea.title,
      bodyMarkdown: bodyMarkdown ?? "",
      generationSource: "human",
      publishStatus: "draft",
      projectId: resolvedProjectId,
    },
    include: { location: true, idea: true },
  });
  return NextResponse.json(article, { status: 201 });
}
