// LeetCode 状态机
// 对应 Prompt 第九节 LeetCode 状态系统

export type LeetcodeStatus =
  | "NotStarted"
  | "Attempted"
  | "SolvedWithHint"
  | "SolvedAfterSolution"
  | "Reproduced"
  | "SolvedIndependently"
  | "Mastered";

export const STATUS_LABELS: Record<LeetcodeStatus, string> = {
  NotStarted: "未开始",
  Attempted: "尝试过",
  SolvedWithHint: "看提示后完成",
  SolvedAfterSolution: "看题解后完成",
  Reproduced: "关闭题解后复现",
  SolvedIndependently: "独立完成",
  Mastered: "熟练掌握",
};

export const STATUS_COLORS: Record<LeetcodeStatus, string> = {
  NotStarted: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  Attempted: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  SolvedWithHint: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  SolvedAfterSolution: "bg-red-500/10 text-red-400 border-red-500/20",
  Reproduced: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  SolvedIndependently: "bg-green-500/10 text-green-400 border-green-500/20",
  Mastered: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export interface AttemptSummary {
  attemptCount: number;
  independentSolveCount: number;
  usedHintCount: number;
  usedSolutionCount: number;
  attempts: Array<{
    date: Date;
    solved: boolean;
    usedHint: boolean;
    usedSolution: boolean;
    independent: boolean;
  }>;
}

/**
 * 根据尝试历史推导 LeetCode 当前状态
 */
export function inferLeetcodeStatus(summary: AttemptSummary): LeetcodeStatus {
  const { attemptCount, independentSolveCount, usedHintCount, usedSolutionCount, attempts } = summary;

  if (attemptCount === 0) return "NotStarted";

  // 检查是否 Mastered：>=3 次独立完成 + 至少一次间隔 >=14 天仍独立完成
  if (independentSolveCount >= 3 && hasLongTermIndependentSolve(attempts)) {
    return "Mastered";
  }

  if (independentSolveCount >= 1) {
    return "SolvedIndependently";
  }

  if (usedSolutionCount > 0) {
    // 检查最近一次是否是"关闭题解后重新编码"
    const lastAttempt = attempts[attempts.length - 1];
    if (lastAttempt?.usedSolution && lastAttempt?.solved && !lastAttempt?.usedHint) {
      // 看了题解但能独立复现
      return "Reproduced";
    }
    return "SolvedAfterSolution";
  }

  if (usedHintCount > 0) {
    return "SolvedWithHint";
  }

  return "Attempted";
}

/**
 * 检查是否存在：某次独立完成，距离前一次 attempt 至少 14 天
 */
function hasLongTermIndependentSolve(
  attempts: AttemptSummary["attempts"]
): boolean {
  for (let i = 0; i < attempts.length; i++) {
    if (!attempts[i].independent) continue;
    for (let j = 0; j < i; j++) {
      const diffDays = Math.floor(
        (attempts[i].date.getTime() - attempts[j].date.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays >= 14) return true;
    }
  }
  return false;
}

/**
 * 错题本筛选条件
 */
export const MISTAKE_TYPES = [
  "不会识别题型",
  "算法不知道",
  "边界错误",
  "索引错误",
  "数据结构选择错误",
  "复杂度过高",
  "代码实现错误",
  "C++ 语法问题",
  "忘记模板",
  "粗心",
  "其他",
] as const;

export type MistakeType = (typeof MISTAKE_TYPES)[number];

/**
 * 错误类型标签
 */
export const MISTAKE_LABELS: Record<MistakeType, string> = {
  "不会识别题型": "不会识别题型",
  "算法不知道": "算法不知道",
  "边界错误": "边界错误",
  "索引错误": "索引错误",
  "数据结构选择错误": "数据结构选择错误",
  "复杂度过高": "复杂度过高",
  "代码实现错误": "代码实现错误",
  "C++ 语法问题": "C++ 语法问题",
  "忘记模板": "忘记模板",
  "粗心": "粗心",
  "其他": "其他",
};
