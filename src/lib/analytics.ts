import { prisma } from "@/lib/db";

export async function getAnalytics(userId: string) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  // 本周每日学习时长
  const weekSessions = await prisma.learningSession.findMany({
    where: { userId, startTime: { gte: weekAgo } },
    select: { startTime: true, duration: true, sessionType: true },
  });
  const dailyStudy = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dailyStudy.set(d.toISOString().slice(0, 10), 0);
  }
  for (const s of weekSessions) {
    const key = new Date(s.startTime).toISOString().slice(0, 10);
    if (dailyStudy.has(key)) {
      dailyStudy.set(key, (dailyStudy.get(key) ?? 0) + s.duration);
    }
  }

  // 本周复习情况
  const weekReviews = await prisma.reviewRecord.findMany({
    where: { knowledgeCard: { userId }, reviewedAt: { gte: weekAgo } },
  });
  const recallAccuracy = weekReviews.length === 0 ? 0 :
    Math.round((weekReviews.filter((r) => r.selfScore >= 2).length / weekReviews.length) * 100);

  // LeetCode 统计
  const lcAll = await prisma.leetcodeProblem.findMany({
    where: { userId },
    select: { status: true, masteryScore: true, independentSolveCount: true, attemptCount: true },
  });
  const lcMastered = lcAll.filter((p) => p.status === "Mastered").length;
  const lcIndependent = lcAll.filter((p) => p.independentSolveCount > 0).length;
  const lcDependencyRate = lcAll.length === 0 ? 0 :
    Math.round((1 - lcIndependent / Math.max(1, lcAll.reduce((s, p) => s + p.attemptCount, 0))) * 100);

  // Overdue
  const overdueCount = await prisma.knowledgeCard.count({
    where: { userId, interval: { gt: 0 }, nextReviewAt: { lt: today } },
  });
  const totalCards = await prisma.knowledgeCard.count({ where: { userId } });

  // 按 Topic 掌握度
  const topics = await prisma.topic.findMany({
    where: { userId },
    include: { knowledgeCards: true },
  });
  const topicStats = topics
    .filter((t) => t.knowledgeCards.length > 0)
    .map((t) => ({
      name: t.name,
      count: t.knowledgeCards.length,
      avgMastery: Math.round(
        t.knowledgeCards.reduce((s, c) => s + c.masteryScore, 0) / t.knowledgeCards.length
      ),
    }))
    .sort((a, b) => a.avgMastery - b.avgMastery);

  // 按 Pattern 掌握度
  const patterns = await prisma.algorithmPattern.findMany({ where: { userId } });
  const lcByPattern = await prisma.leetcodeProblem.groupBy({
    by: ["pattern"],
    where: { userId },
    _count: { _all: true },
    _avg: { masteryScore: true },
  });

  const patternStats = lcByPattern.map((p) => {
    const info = patterns.find((x) => x.name === p.pattern);
    return {
      name: p.pattern,
      count: p._count._all,
      avgMastery: Math.round((p._avg.masteryScore ?? 0) * 10) / 10,
      scenario: info?.scenario ?? "",
    };
  }).sort((a, b) => a.avgMastery - b.avgMastery);

  return {
    dailyStudy: Array.from(dailyStudy.entries()).map(([date, minutes]) => ({ date, minutes })),
    weekTotal: weekSessions.reduce((s, x) => s + x.duration, 0),
    sessionCount: weekSessions.length,
    recallAccuracy,
    reviewCount: weekReviews.length,
    lcTotal: lcAll.length,
    lcMastered,
    lcIndependent,
    lcDependencyRate,
    overdueCount,
    totalCards,
    topicStats,
    patternStats,
  };
}

export type AnalyticsData = Awaited<ReturnType<typeof getAnalytics>>;
