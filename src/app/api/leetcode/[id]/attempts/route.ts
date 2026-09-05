import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const {
      duration, solved, usedHint = false, usedSolution = false,
      algorithm, timeComplexity, spaceComplexity,
      whyFailed, mistakeType, patternRecognition, nextTimeSignal, notes,
    } = body;

    const independent = solved && !usedHint && !usedSolution;

    // 先确认题目属于当前用户
    const problem = await prisma.leetcodeProblem.findFirst({
      where: { id: params.id, userId: user.id },
      include: { attempts: { orderBy: { date: "asc" } } },
    });
    if (!problem) return NextResponse.json({ error: "题目不存在" }, { status: 404 });

    const attempt = await prisma.leetcodeAttempt.create({
      data: {
        problemId: params.id,
        duration: parseInt(duration) || 0,
        solved: !!solved,
        usedHint: !!usedHint,
        usedSolution: !!usedSolution,
        independent,
        algorithm,
        timeComplexity,
        spaceComplexity,
        whyFailed,
        mistakeType,
        patternRecognition,
        nextTimeSignal,
        notes,
      },
    });

    // 重新拉 attempts（含刚刚创建的）
    const allAttempts = await prisma.leetcodeAttempt.findMany({
      where: { problemId: params.id },
      orderBy: { date: "asc" },
    });

    const { inferLeetcodeStatus } = await import("@/lib/leetcode-status");
    const newStatus = inferLeetcodeStatus({
      attemptCount: allAttempts.length,
      independentSolveCount: allAttempts.filter((a) => a.independent).length,
      usedHintCount: allAttempts.filter((a) => a.usedHint).length,
      usedSolutionCount: allAttempts.filter((a) => a.usedSolution).length,
      attempts: allAttempts.map((a) => ({
        date: new Date(a.date),
        solved: a.solved,
        usedHint: a.usedHint,
        usedSolution: a.usedSolution,
        independent: a.independent,
      })),
    });

    const { calculateMastery } = await import("@/lib/mastery");
    const independentRate = allAttempts.length > 0
      ? allAttempts.filter((a) => a.independent).length / allAttempts.length
      : 0;
    const totalTime = allAttempts.reduce((s, a) => s + a.duration, 0);

    const masteryScore = calculateMastery({
      recentRecallAccuracy: independentRate,
      reviewCount: allAttempts.length,
      consecutiveSuccess: independent ? 1 : 0,
      daysSinceLastReview: 0,
      hasLongTermRetention: allAttempts.some((a, i) => {
        if (!a.independent) return false;
        for (let j = 0; j < i; j++) {
          const diffDays = Math.floor(
            (new Date(a.date).getTime() - new Date(allAttempts[j].date).getTime()) / (1000 * 60 * 60 * 24)
          );
          if (diffDays >= 14) return true;
        }
        return false;
      }),
      hasPracticalCoding: !!notes,
      leetcodeIndependentRate: independentRate,
    });

    let nextReviewAt = new Date();
    if (usedHint || usedSolution) {
      nextReviewAt.setDate(nextReviewAt.getDate() + 1);
    } else if (independent) {
      const days = [3, 7, 14, 30];
      const idx = Math.min(allAttempts.filter((a) => a.independent).length - 1, 3);
      nextReviewAt.setDate(nextReviewAt.getDate() + (days[idx] ?? 30));
    } else {
      nextReviewAt.setDate(nextReviewAt.getDate() + 2);
    }

    await prisma.leetcodeProblem.update({
      where: { id: params.id },
      data: {
        status: newStatus,
        masteryScore,
        attemptCount: allAttempts.length,
        independentSolveCount: allAttempts.filter((a) => a.independent).length,
        usedHintCount: allAttempts.filter((a) => a.usedHint).length,
        usedSolutionCount: allAttempts.filter((a) => a.usedSolution).length,
        totalTime,
        nextReviewAt,
      },
    });

    return NextResponse.json({ attempt, newStatus, masteryScore, nextReviewAt });
  } catch (error: any) {
    if (error?.status === 401) return NextResponse.json({ error: "未登录" }, { status: 401 });
    console.error("POST /api/leetcode/[id]/attempts error:", error);
    return NextResponse.json({ error: "提交失败" }, { status: 500 });
  }
}
