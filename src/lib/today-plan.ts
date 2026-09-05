// 今日计划生成算法
// 对应 Prompt 第十六、二十九节

import type { Prisma } from "@prisma/client";

export interface TodayPlanInput {
  reviewRatio: number;             // 复习占比 (0-1)
  dailyGoalMinutes: number;        // 每日目标时长（分钟）
  // 待复习的 KnowledgeCard（nextReviewAt <= today）
  dueKnowledgeCards: Array<{ id: string; title: string; topicId: string; masteryScore: number }>;
  // 待复习的 LeetCode 题目
  dueLeetcodeProblems: Array<{ id: string; leetcodeNumber: number; title: string; pattern: string; masteryScore: number }>;
  // 薄弱 Topics（按 masteryScore 升序）
  weakTopics: Array<{ topicId: string; avgMastery: number }>;
  // 最近 N 天新学未复习的卡
  newCards: Array<{ id: string; title: string; topicId: string }>;
}

export interface TodayTask {
  type: "REVIEW" | "PRACTICE" | "LEARN";
  itemId: string;
  title: string;
  topicId?: string;
  reason: string;             // 为什么被推荐
  estimatedMinutes: number;
}

export interface TodayPlan {
  reviewTasks: TodayTask[];
  practiceTasks: TodayTask[];
  learnTasks: TodayTask[];
  totalEstimatedMinutes: number;
  reviewRatio: number;        // 实际复习占比
  summary: string;
}

/**
 * 生成今日学习计划
 * 优先级：
 *  1. Overdue Review (nextReviewAt < today)
 *  2. Today Review (nextReviewAt == today)
 *  3. Weak Topics
 *  4. New Learning
 *  5. Optional Tasks
 */
export function generateTodayPlan(input: TodayPlanInput): TodayPlan {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const reviewTasks: TodayTask[] = [];
  const practiceTasks: TodayTask[] = [];
  const learnTasks: TodayTask[] = [];

  // 1. Overdue + Today Review
  const weakTopicIds = new Set(input.weakTopics.map((w) => w.topicId));
  const sortedDueCards = [...input.dueKnowledgeCards].sort((a, b) => {
    const aIsWeak = weakTopicIds.has(a.topicId);
    const bIsWeak = weakTopicIds.has(b.topicId);
    if (aIsWeak !== bIsWeak) return aIsWeak ? -1 : 1;
    return a.masteryScore - b.masteryScore;
  });

  const reviewCount = Math.ceil(input.dailyGoalMinutes * input.reviewRatio / 10);
  for (const card of sortedDueCards.slice(0, reviewCount)) {
    reviewTasks.push({
      type: "REVIEW",
      itemId: card.id,
      title: card.title,
      topicId: card.topicId,
      reason: weakTopicIds.has(card.topicId)
        ? "薄弱 Topic，优先复习"
        : card.masteryScore < 50
        ? "掌握度较低，需要巩固"
        : "到期复习",
      estimatedMinutes: 10,
    });
  }

  // 2. LeetCode 练习
  const sortedLeetcode = [...input.dueLeetcodeProblems].sort(
    (a, b) => a.masteryScore - b.masteryScore
  );
  const leetcodeCount = Math.max(1, Math.floor(reviewCount * 0.3));
  for (const p of sortedLeetcode.slice(0, leetcodeCount)) {
    practiceTasks.push({
      type: "PRACTICE",
      itemId: p.id,
      title: `LC ${p.leetcodeNumber} - ${p.title}`,
      reason: p.masteryScore < 50
        ? `${p.pattern} 掌握不足`
        : `${p.pattern} 复习`,
      estimatedMinutes: 30,
    });
  }

  // 3. 新学（按需）
  const learnCount = Math.max(0, Math.floor(input.dailyGoalMinutes * (1 - input.reviewRatio) / 15));
  for (const card of input.newCards.slice(0, learnCount)) {
    learnTasks.push({
      type: "LEARN",
      itemId: card.id,
      title: card.title,
      topicId: card.topicId,
      reason: "新知识点学习",
      estimatedMinutes: 15,
    });
  }

  const totalEstimatedMinutes =
    reviewTasks.reduce((s, t) => s + t.estimatedMinutes, 0) +
    practiceTasks.reduce((s, t) => s + t.estimatedMinutes, 0) +
    learnTasks.reduce((s, t) => s + t.estimatedMinutes, 0);

  const totalReview = reviewTasks.length + practiceTasks.length;
  const totalAll = totalReview + learnTasks.length;
  const actualReviewRatio = totalAll > 0 ? totalReview / totalAll : 0;

  let summary = `今日建议：复习 ${reviewTasks.length} 个知识点，刷 ${practiceTasks.length} 道 LeetCode`;
  if (learnTasks.length > 0) {
    summary += `，学习 ${learnTasks.length} 个新知识点`;
  }
  summary += `。预计 ${totalEstimatedMinutes} 分钟。`;

  return {
    reviewTasks,
    practiceTasks,
    learnTasks,
    totalEstimatedMinutes,
    reviewRatio: actualReviewRatio,
    summary,
  };
}
