// Dashboard 数据获取
import { prisma } from "./db";
import { generateTodayPlan, type TodayPlan } from "./today-plan";
import { isDue, isOverdue } from "./utils";

export async function getDashboardData(userId: string) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 1. 用户设置
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  // 2. 今日/逾期复习统计
  const dueCards = await prisma.knowledgeCard.findMany({
    where: {
      userId,
      nextReviewAt: { lte: tomorrow },
    },
    include: { topic: true },
  });
  const reviewDue = dueCards.length;
  const overdueCount = dueCards.filter((c) => isOverdue(c.nextReviewAt)).length;

  // 3. LeetCode 状态统计
  const leetcodeStats = await prisma.leetcodeProblem.groupBy({
    by: ["status"],
    where: { userId },
    _count: { _all: true },
  });
  const lcByStatus = Object.fromEntries(
    leetcodeStats.map((s) => [s.status, s._count._all])
  );
  const lcMastered = lcByStatus["Mastered"] ?? 0;
  const lcLearning = (lcByStatus["Attempted"] ?? 0) +
    (lcByStatus["SolvedWithHint"] ?? 0) +
    (lcByStatus["SolvedAfterSolution"] ?? 0) +
    (lcByStatus["Reproduced"] ?? 0) +
    (lcByStatus["SolvedIndependently"] ?? 0);
  const lcDue = await prisma.leetcodeProblem.count({
    where: {
      userId,
      status: { not: "NotStarted" },
      nextReviewAt: { lte: tomorrow },
    },
  });

  // 4. 平均掌握度
  const allCards = await prisma.knowledgeCard.findMany({
    where: { userId },
    select: { masteryScore: true },
  });
  const avgMastery = allCards.length === 0 ? 0 :
    Math.round(allCards.reduce((s, c) => s + c.masteryScore, 0) / allCards.length);

  // 5. Recall 正确率（最近 10 次）
  const recentReviews = await prisma.reviewRecord.findMany({
    where: { knowledgeCard: { userId } },
    orderBy: { reviewedAt: "desc" },
    take: 50,
    select: { selfScore: true },
  });
  const recentGood = recentReviews.filter((r) => r.selfScore >= 2).length;
  const recallAccuracy = recentReviews.length === 0 ? 0 :
    Math.round((recentGood / recentReviews.length) * 100);

  // 6. 今日学习时长
  const todaySessions = await prisma.learningSession.findMany({
    where: { userId, startTime: { gte: today, lt: tomorrow } },
    select: { duration: true },
  });
  const todayStudyMinutes = todaySessions.reduce((s, x) => s + x.duration, 0);

  // 7. 学习 Streak
  const streak = await calculateStreak(userId);

  // 8. Weak Topics
  const topicsWithCards = await prisma.topic.findMany({
    where: { userId, knowledgeCards: { some: {} } },
    include: { knowledgeCards: true },
  });
  const weakTopics = topicsWithCards
    .map((t) => ({
      topicId: t.id,
      name: t.name,
      avgMastery: t.knowledgeCards.length === 0 ? 0 :
        Math.round(t.knowledgeCards.reduce((s, c) => s + c.masteryScore, 0) / t.knowledgeCards.length),
      cardCount: t.knowledgeCards.length,
    }))
    .filter((t) => t.cardCount > 0)
    .sort((a, b) => a.avgMastery - b.avgMastery)
    .slice(0, 5);

  // 9. Today Plan
  const todayPlan = generateTodayPlan({
    reviewRatio: user.reviewRatio,
    dailyGoalMinutes: user.dailyGoalMinutes,
    dueKnowledgeCards: dueCards.map((c) => ({
      id: c.id,
      title: c.title,
      topicId: c.topicId,
      masteryScore: c.masteryScore,
    })),
    dueLeetcodeProblems: (await prisma.leetcodeProblem.findMany({
      where: {
        userId,
        status: { not: "NotStarted" },
        nextReviewAt: { lte: tomorrow },
      },
      select: { id: true, leetcodeNumber: true, title: true, pattern: true, masteryScore: true },
      take: 10,
    })),
    weakTopics: weakTopics.map((w) => ({ topicId: w.topicId, avgMastery: w.avgMastery })),
    newCards: [],
  });

  // 10. LeetCode Pattern 分布
  const lcByPattern = await prisma.leetcodeProblem.groupBy({
    by: ["pattern"],
    where: { userId },
    _count: { _all: true },
    _avg: { masteryScore: true },
  });

  return {
    user,
    stats: {
      todayStudyMinutes,
      reviewDue,
      overdueCount,
      lcMastered,
      lcLearning,
      lcDue,
      avgMastery,
      recallAccuracy,
      streak,
      totalCards: allCards.length,
    },
    weakTopics,
    todayPlan,
    lcByPattern: lcByPattern.map((p) => ({
      pattern: p.pattern,
      count: p._count._all,
      avgMastery: Math.round((p._avg.masteryScore ?? 0) * 10) / 10,
    })),
  };
}

/**
 * 计算连续学习天数
 */
async function calculateStreak(userId: string): Promise<number> {
  const sessions = await prisma.learningSession.findMany({
    where: { userId, duration: { gt: 0 } },
    select: { startTime: true },
    orderBy: { startTime: "desc" },
  });

  if (sessions.length === 0) return 0;

  const dates = new Set<string>();
  for (const s of sessions) {
    const d = new Date(s.startTime);
    dates.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  }

  let streak = 0;
  const cursor = new Date();
  while (true) {
    const key = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
    if (dates.has(key)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      if (streak === 0) {
        cursor.setDate(cursor.getDate() - 1);
        const prevKey = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
        if (!dates.has(prevKey)) break;
        continue;
      }
      break;
    }
  }
  return streak;
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
