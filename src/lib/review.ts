import { prisma } from "./db";

export async function getReviewQueue(userId: string, limit: number = 30) {
  // 优先级：1. Overdue  2. Due Today  3. Weak Topics  4. New
  // 仅包含已学过的卡片（interval > 0），新卡片走"新卡"流程
  const now = new Date();
  return prisma.knowledgeCard.findMany({
    where: {
      userId,
      interval: { gt: 0 },
      OR: [
        { nextReviewAt: { lte: now } }, // 到期或逾期
      ],
    },
    include: {
      topic: true,
      recallQuestions: { take: 1, orderBy: { nextReviewAt: "asc" } },
    },
    orderBy: [{ masteryScore: "asc" }, { nextReviewAt: "asc" }],
    take: limit,
  });
}

export async function getReviewStats(userId: string) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 仅统计已学过的卡片（interval > 0），新卡片走"新卡"流程
  const [dueToday, overdue, total, reviewedToday] = await Promise.all([
    prisma.knowledgeCard.count({
      where: {
        userId,
        interval: { gt: 0 },
        nextReviewAt: { gte: today, lt: tomorrow },
      },
    }),
    prisma.knowledgeCard.count({
      where: {
        userId,
        interval: { gt: 0 },
        nextReviewAt: { lt: today },
      },
    }),
    prisma.knowledgeCard.count({ where: { userId } }),
    prisma.reviewRecord.count({
      where: { userId, reviewedAt: { gte: today, lt: tomorrow } },
    }),
  ]);

  return { dueToday, overdue, total, reviewedToday };
}
