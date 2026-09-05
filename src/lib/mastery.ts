// Mastery Score 计算 (0-100)
// 对应 Prompt 第二十节

export interface MasteryInput {
  // 最近 10 次复习正确率（0-1）
  recentRecallAccuracy: number;
  // 复习次数
  reviewCount: number;
  // 连续正确次数
  consecutiveSuccess: number;
  // 距离上次复习的天数
  daysSinceLastReview: number;
  // 是否经历过 >=14 天间隔后仍正确
  hasLongTermRetention: boolean;
  // 是否有 codeExample
  hasPracticalCoding: boolean;
  // LeetCode 独立完成率（仅 LeetCode 类型；非 LeetCode 传 -1 表示不计）
  leetcodeIndependentRate?: number;
}

/**
 * 综合 7 个维度计算 Mastery Score (0-100)
 */
export function calculateMastery(input: MasteryInput): number {
  // 1. 主动回忆正确率（最近 10 次）权重 30
  const recallScore = Math.min(100, input.recentRecallAccuracy * 100) * 0.3;

  // 2. 复习次数因子（log 曲线封顶）权重 15
  // log10(1) = 0, log10(11) ≈ 1, log10(101) ≈ 2
  const reviewFactor = Math.min(1, Math.log10(input.reviewCount + 1) / 2) * 100 * 0.15;

  // 3. 连续正确次数（封顶 5 次）权重 10
  const consecutiveBonus = Math.min(1, input.consecutiveSuccess / 5) * 100 * 0.1;

  // 4. 距离上次复习时间（越近分越高；30 天线性衰减）权重 10
  const recencyScore = Math.max(0, 1 - input.daysSinceLastReview / 30) * 100 * 0.1;

  // 5. 长期保持（>=14 天间隔仍正确）权重 15
  const longTermBonus = (input.hasLongTermRetention ? 1 : 0) * 100 * 0.15;

  // 6. 是否实际编码 权重 10
  const codingBonus = (input.hasPracticalCoding ? 1 : 0.3) * 100 * 0.1;

  // 7. LeetCode 独立完成率 权重 10
  const lcBonus = input.leetcodeIndependentRate !== undefined && input.leetcodeIndependentRate >= 0
    ? input.leetcodeIndependentRate * 100 * 0.1
    : 0.05 * 100 * 0.1; // 非 LeetCode 给基础分

  const total = recallScore + reviewFactor + consecutiveBonus + recencyScore +
                longTermBonus + codingBonus + lcBonus;

  return Math.round(Math.max(0, Math.min(100, total)));
}

/**
 * 掌握度等级描述
 */
export function getMasteryLevel(score: number): {
  level: string;
  description: string;
  color: string;
} {
  if (score <= 20) return { level: "刚接触", description: "了解概念", color: "text-slate-500" };
  if (score <= 40) return { level: "理解", description: "能讲出原理", color: "text-blue-500" };
  if (score <= 60) return { level: "可以复现", description: "关闭资料能复现", color: "text-cyan-500" };
  if (score <= 80) return { level: "基本掌握", description: "能独立应用", color: "text-green-500" };
  if (score <= 90) return { level: "熟练", description: "面试能讲清", color: "text-emerald-500" };
  return { level: "长期掌握", description: "可传授他人", color: "text-purple-500" };
}
