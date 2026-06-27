/**
 * Reads only Idea-level data for AI prompt building.
 * MUST NOT access Source.rawText — enforced by never joining the Source table.
 */
import { prisma } from "@/lib/prisma";

export interface IdeaForPrompt {
  id: string;
  title: string;
  category: string;
  summary: string;
  researchNotes: string | null;
  confirmationCount: number;
  credibility: string;
  location: {
    id: string;
    nameDe: string;
    parent?: { id: string; nameDe: string; parent?: { id: string; nameDe: string } | null } | null;
  };
}

export async function readIdeaForPrompt(ideaId: string): Promise<IdeaForPrompt | null> {
  const idea = await prisma.idea.findUnique({
    where: { id: ideaId },
    select: {
      id: true,
      title: true,
      category: true,
      summary: true,
      researchNotes: true,
      confirmationCount: true,
      credibility: true,
      location: {
        select: {
          id: true,
          nameDe: true,
          parent: {
            select: {
              id: true,
              nameDe: true,
              parent: { select: { id: true, nameDe: true } },
            },
          },
        },
      },
      // Explicitly no ideaSources join — rawText never loaded
    },
  });
  return idea;
}
