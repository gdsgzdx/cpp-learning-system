import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateNextReview } from "@/lib/spaced-repetition";
import { calculateMastery } from "@/lib/mastery";
import { requireUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const { result, recallQuestionId } = body;

    const card = await prisma.knowledgeCard.findFirst({
      where: { id: params.id, userId: user.id },
      include: { reviewRecords: { orderBy: { reviewedAt: "desc" }, take: 50 } },
    });

    if (!card) {
      return NextResponse.json({ error: "卡片不存在" }, { status: 404 });
    }

    const { newInterval, newEase, nextReviewAt, selfScore } = calculateNextReview({
      currentInterval: card.interval,
      currentEase: card.ease,
      reviewCount: card.reviewCount,
      result,
    });

    const recentReviews = [
      { selfScore },
      ...card.reviewRecords.map((r) => ({ selfScore: r.selfScore })),
    ].slice(0, 10);
    const recentGood = recentReviews.filter((r) => r.selfScore >= 2).length;
    const recentAccuracy = recentGood / Math.max(1, recentReviews.length);

    let consecutiveSuccess = 0;
    for (const r of recentReviews) {
      if (r.selfScore >= 2) consecutiveSuccess++;
      else break;
    }

    const hasLongTermRetention = card.reviewRecords.some((r) => {
      if (r.intervalAfter >= 14 && r.selfScore >= 2) return true;
      return false;
    });

    const daysSinceLastReview = card.lastReviewedAt
      ? Math.floor((Date.now() - new Date(card.lastReviewedAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const masteryScore = calculateMastery({
      recentRecallAccuracy: recentAccuracy,
      reviewCount: card.reviewCount + 1,
      consecutiveSuccess,
      daysSinceLastReview,
      hasLongTermRetention,
      hasPracticalCoding: !!card.codeExample,
    });

    const updated = await prisma.knowledgeCard.update({
      where: { id: card.id },
      data: {
        interval: newInterval,
        ease: newEase,
        reviewCount: { increment: 1 },
        successCount: result === "AGAIN" ? card.successCount : { increment: 1 },
        failureCount: result === "AGAIN" ? { increment: 1 } : card.failureCount,
        lastReviewedAt: new Date(),
        nextReviewAt,
        masteryScore,
      },
    });

    await prisma.reviewRecord.create({
      data: {
        knowledgeCardId: card.id,
        recallQuestionId: recallQuestionId ?? null,
        result,
        selfScore,
        intervalAfter: newInterval,
      },
    });

    if (recallQuestionId) {
      await prisma.recallQuestion.update({
        where: { id: recallQuestionId },
        data: {
          lastResult: result,
          reviewCount: { increment: 1 },
          nextReviewAt,
        },
      });
    }

    return NextResponse.json({
      ...updated,
      nextInterval: newInterval,
      nextReviewAt,
    });
  } catch (error: any) {
    if (error?.status === 401) return NextResponse.json({ error: "未登录" }, { status: 401 });
    console.error("POST /api/review/[id] error:", error);
    return NextResponse.json({ error: "复习失败" }, { status: 500 });
  }
}
