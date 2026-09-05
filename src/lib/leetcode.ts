import { prisma } from "./db";
import { inferLeetcodeStatus, type LeetcodeStatus } from "./leetcode-status";

export async function getLeetcodeList(userId: string, filters?: {
  pattern?: string;
  difficulty?: string;
  status?: string;
  search?: string;
  source?: string;
}) {
  const where: any = { userId };
  if (filters?.pattern) where.pattern = filters.pattern;
  if (filters?.difficulty) where.difficulty = filters.difficulty;
  if (filters?.status) where.status = filters.status;
  if (filters?.source) where.source = filters.source;
  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search } },
      { leetcodeNumber: { equals: parseInt(filters.search) || undefined } },
    ];
  }

  return prisma.leetcodeProblem.findMany({
    where,
    // Hot 题置顶，再按 source，再按 leetcode 编号升序
    orderBy: [{ isHot: "desc" }, { source: "asc" }, { leetcodeNumber: "asc" }],
  });
}

export async function getLeetcodeStats(userId: string) {
  const all = await prisma.leetcodeProblem.findMany({ where: { userId } });
  const byStatus: Record<string, number> = {};
  const byPattern: Record<string, { count: number; mastered: number; totalMastery: number }> = {};
  const byDifficulty: Record<string, number> = { Easy: 0, Medium: 0, Hard: 0 };
  const bySource: Record<string, number> = {};

  for (const p of all) {
    byStatus[p.status] = (byStatus[p.status] ?? 0) + 1;
    byDifficulty[p.difficulty] = (byDifficulty[p.difficulty] ?? 0) + 1;
    const src = p.source ?? "其他";
    bySource[src] = (bySource[src] ?? 0) + 1;
    if (!byPattern[p.pattern]) {
      byPattern[p.pattern] = { count: 0, mastered: 0, totalMastery: 0 };
    }
    byPattern[p.pattern].count++;
    byPattern[p.pattern].totalMastery += p.masteryScore;
    if (p.status === "Mastered") byPattern[p.pattern].mastered++;
  }

  return {
    total: all.length,
    hotCount: all.filter((p) => p.isHot).length,
    byStatus,
    bySource,
    byPattern: Object.fromEntries(
      Object.entries(byPattern).map(([k, v]) => [
        k,
        { ...v, avgMastery: Math.round(v.totalMastery / v.count) },
      ])
    ),
    byDifficulty,
  };
}

export async function getMistakes(userId: string) {
  const problems = await prisma.leetcodeProblem.findMany({
    where: {
      userId,
      OR: [
        { status: { in: ["SolvedWithHint", "SolvedAfterSolution", "Reproduced"] } },
        { masteryScore: { lt: 60 } },
      ],
    },
    include: {
      attempts: { orderBy: { date: "desc" }, take: 3 },
    },
    orderBy: { masteryScore: "asc" },
  });
  return problems;
}

export async function getLeetcodeProblem(userId: string, id: string) {
  return prisma.leetcodeProblem.findFirst({
    where: { id, userId },
    include: {
      attempts: { orderBy: { date: "desc" } },
      reviews: { orderBy: { reviewedAt: "desc" }, take: 10 },
    },
  });
}
