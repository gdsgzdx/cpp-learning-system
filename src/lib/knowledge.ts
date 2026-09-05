// Knowledge 相关数据查询
import { prisma } from "./db";

export async function getKnowledgeCards(userId: string, filters?: {
  topicId?: string;
  tag?: string;
  search?: string;
  dueOnly?: boolean;
  sortBy?: "mastery" | "nextReview" | "title" | "difficulty";
}) {
  const where: any = { userId };
  if (filters?.topicId) where.topicId = filters.topicId;
  if (filters?.tag) where.tags = { contains: filters.tag };
  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search } },
      { problemSolved: { contains: filters.search } },
      { corePrinciple: { contains: filters.search } },
    ];
  }
  if (filters?.dueOnly) {
    where.interval = { gt: 0 };
    where.nextReviewAt = { lte: new Date() };
  }

  let orderBy: any = { updatedAt: "desc" };
  if (filters?.sortBy === "mastery") orderBy = { masteryScore: "asc" };
  else if (filters?.sortBy === "nextReview") orderBy = { nextReviewAt: "asc" };
  else if (filters?.sortBy === "title") orderBy = { title: "asc" };
  else if (filters?.sortBy === "difficulty") orderBy = { difficulty: "desc" };

  return prisma.knowledgeCard.findMany({
    where,
    include: {
      topic: true,
      _count: { select: { recallQuestions: true } },
    },
    orderBy,
  });
}

export async function getKnowledgeCard(userId: string, id: string) {
  return prisma.knowledgeCard.findFirst({
    where: { id, userId },
    include: {
      topic: true,
      recallQuestions: { orderBy: { createdAt: "asc" } },
      reviewRecords: {
        orderBy: { reviewedAt: "desc" },
        take: 20,
      },
    },
  });
}

export async function getAllTopics(userId: string) {
  return prisma.topic.findMany({
    where: { userId },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { knowledgeCards: true } },
    },
  });
}

export async function getAllTags(userId: string) {
  const cards = await prisma.knowledgeCard.findMany({
    where: { userId },
    select: { tags: true },
  });
  const tagSet = new Set<string>();
  for (const c of cards) {
    if (c.tags) {
      for (const t of c.tags.split(",").map((s) => s.trim()).filter(Boolean)) {
        tagSet.add(t);
      }
    }
  }
  return Array.from(tagSet).sort();
}
