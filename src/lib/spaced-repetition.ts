// Spaced Repetition (SM-2 简化版) 算法
// 对应 Prompt 第七节间隔重复系统

export type ReviewResult = "AGAIN" | "HARD" | "GOOD" | "EASY";

export interface ReviewInput {
  currentInterval: number;
  currentEase: number;
  reviewCount: number;
  result: ReviewResult;
}

export interface ReviewOutput {
  newInterval: number;       // 新间隔（天）
  newEase: number;           // 新难度系数
  nextReviewAt: Date;        // 下次复习时间
  selfScore: number;         // 0-3
}

/**
 * 根据用户自评计算下次复习参数
 * 规则：
 *  - AGAIN: interval=1, ease -= 0.2 (最低 1.3)
 *  - HARD:  interval *= 1.2, ease -= 0.15
 *  - GOOD:  interval *= ease, ease 不变
 *  - EASY:  interval *= ease * 1.3, ease += 0.15 (最高 2.8)
 */
export function calculateNextReview(input: ReviewInput): ReviewOutput {
  const { currentInterval, currentEase, result } = input;
  let newInterval: number;
  let newEase = currentEase;
  let selfScore: number;

  switch (result) {
    case "AGAIN":
      newInterval = 1;
      newEase = Math.max(1.3, currentEase - 0.2);
      selfScore = 0;
      break;
    case "HARD":
      newInterval = Math.max(1, Math.round(currentInterval * 1.2 || 3));
      newEase = Math.max(1.3, currentEase - 0.15);
      selfScore = 1;
      break;
    case "GOOD": {
      // 首次复习默认 1 天
      const base = currentInterval === 0 ? 1 : currentInterval;
      newInterval = Math.max(1, Math.round(base * currentEase));
      selfScore = 2;
      break;
    }
    case "EASY": {
      const base = currentInterval === 0 ? 1 : currentInterval;
      newInterval = Math.max(1, Math.round(base * currentEase * 1.3));
      newEase = Math.min(2.8, currentEase + 0.15);
      selfScore = 3;
      break;
    }
    default:
      newInterval = currentInterval || 1;
      selfScore = 2;
  }

  // 引入序列：第 1,2,3,4,5,6,7 次固定 1,3,7,14,30,60,90
  // 第 8 次之后才进入 SM-2 公式
  if (input.reviewCount < 7) {
    const sequence = [1, 3, 7, 14, 30, 60, 90];
    const idx = Math.min(input.reviewCount, 6);
    if (result === "AGAIN") {
      newInterval = 1;
    } else if (result === "HARD") {
      newInterval = Math.max(1, Math.round(sequence[idx] * 0.7));
    } else if (result === "GOOD") {
      newInterval = sequence[idx];
    } else {
      // EASY
      newInterval = Math.round(sequence[idx] * 1.5);
    }
  }

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + newInterval);
  nextReviewAt.setHours(0, 0, 0, 0);

  return {
    newInterval,
    newEase,
    nextReviewAt,
    selfScore,
  };
}

/**
 * 计算 Forgetting Risk（0-100）
 * 对应 Prompt 第二十一节遗忘风险系统
 */
export function calculateForgettingRisk(params: {
  daysSinceLastReview: number;
  interval: number;
  failureRate: number;     // 0-1
  difficulty: number;      // 1-5
  isOverdue: boolean;
}): "Low" | "Medium" | "High" | "Critical" {
  const { daysSinceLastReview, interval, failureRate, difficulty, isOverdue } = params;
  const overdueRatio = interval > 0 ? daysSinceLastReview / interval : 1;
  let score = overdueRatio * 40 + failureRate * 30 + (difficulty - 3) * 5;
  if (isOverdue) score += 20;

  if (score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (score >= 30) return "Medium";
  return "Low";
}

export function riskToColor(risk: "Low" | "Medium" | "High" | "Critical"): string {
  switch (risk) {
    case "Low": return "text-green-500";
    case "Medium": return "text-yellow-500";
    case "High": return "text-orange-500";
    case "Critical": return "text-red-500";
  }
}
