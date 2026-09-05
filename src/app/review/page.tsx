import { Suspense } from "react";
import { Brain } from "lucide-react";
import { ReviewClient } from "@/components/review/review-client";
import { getReviewQueue, getReviewStats } from "@/lib/review";
import { requireUser } from "@/lib/auth";

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: { cardId?: string };
}) {
  const user = await requireUser();
  const [queue, stats] = await Promise.all([
    getReviewQueue(user.id, 50),
    getReviewStats(user.id),
  ]);

  return (
    <div className="space-y-4 fade-in max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="h-6 w-6" />
          Review
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          主动回忆是长期记忆的关键。先思考，再查看答案。
        </p>
      </div>

      <Suspense fallback={<div>加载中...</div>}>
        <ReviewClient
          initialCardId={searchParams.cardId}
          cards={queue.map((c) => ({
            id: c.id,
            title: c.title,
            topic: c.topic.name,
            problemSolved: c.problemSolved,
            corePrinciple: c.corePrinciple,
            codeExample: c.codeExample,
            masteryScore: c.masteryScore,
            recallQuestions: c.recallQuestions.map((q) => ({
              id: q.id,
              question: q.question,
              answer: q.answer,
            })),
          }))}
          stats={stats}
        />
      </Suspense>
    </div>
  );
}
