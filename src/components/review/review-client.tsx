"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, Check, RotateCcw, Calendar, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";

interface ReviewCard {
  id: string;
  title: string;
  topic: string;
  problemSolved: string | null;
  corePrinciple: string | null;
  codeExample: string | null;
  masteryScore: number;
  recallQuestions: Array<{
    id: string;
    question: string;
    answer: string;
  }>;
}

interface Props {
  initialCardId?: string;
  cards: ReviewCard[];
  stats: { dueToday: number; overdue: number; total: number; reviewedToday: number };
}

type Phase = "QUESTION" | "ANSWER" | "RATE";

export function ReviewClient({ initialCardId, cards, stats }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 从 searchParams.cardId 找到初始卡片索引
  const initialIndex = useMemo(() => {
    if (!initialCardId) return 0;
    const idx = cards.findIndex((c) => c.id === initialCardId);
    return idx === -1 ? 0 : idx;
  }, [initialCardId, cards]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [phase, setPhase] = useState<Phase>("QUESTION");
  const [selfAnswer, setSelfAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [results, setResults] = useState<{ cardId: string; result: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const currentCard = cards[currentIndex];

  useEffect(() => {
    if (initialCardId) {
      setCurrentIndex(initialIndex);
    }
  }, [initialCardId, initialIndex]);

  if (cards.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>🎉 没有待复习的内容！</p>
          <p className="text-sm mt-1">所有卡片都已掌握。可以去学点新知识。</p>
          <Button asChild className="mt-4">
            <Link href="/knowledge">查看 Knowledge</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (currentIndex >= cards.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-3">
          <p className="text-2xl">🎉</p>
          <h2 className="text-xl font-semibold">本轮复习完成！</h2>
          <p className="text-sm text-muted-foreground">
            本次复习了 {reviewedCount} 张卡片
          </p>
          <div className="flex justify-center gap-4 text-xs mt-4">
            <span className="text-green-500">Good/Easy: {results.filter((r) => r.result !== "AGAIN").length}</span>
            <span className="text-red-500">Again: {results.filter((r) => r.result === "AGAIN").length}</span>
          </div>
          <Button asChild className="mt-4">
            <Link href="/">
              <ArrowRight className="h-4 w-4 mr-1" />
              返回 Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const question = currentCard.recallQuestions[0];

  const handleRate = async (result: "AGAIN" | "HARD" | "GOOD" | "EASY") => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await fetch(`/api/review/${currentCard.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          result,
          recallQuestionId: question?.id ?? null,
        }),
      });
      setResults((prev) => [...prev, { cardId: currentCard.id, result }]);
      setReviewedCount((c) => c + 1);
      setSubmitted(false);
      setSelfAnswer("");
      setPhase("QUESTION");
      setCurrentIndex((i) => i + 1);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 进度条 */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          进度 {currentIndex + 1} / {cards.length}
        </span>
        <span>
          待复习 {stats.dueToday} · 已逾期 {stats.overdue}
        </span>
      </div>
      <div className="h-1 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${((currentIndex) / cards.length) * 100}%` }}
        />
      </div>

      {/* 卡片 */}
      <Card className="min-h-[400px]">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Badge variant="outline">{currentCard.topic}</Badge>
              <h2 className="text-2xl font-bold mt-2">{currentCard.title}</h2>
              {currentCard.problemSolved && (
                <p className="text-sm text-muted-foreground mt-2 max-w-prose">
                  {currentCard.problemSolved}
                </p>
              )}
            </div>
            <Badge variant="secondary" className="font-mono shrink-0">
              Mastery {Math.round(currentCard.masteryScore)}
            </Badge>
          </div>

          {phase === "QUESTION" && question && (
            <div className="space-y-4 rounded-lg border-2 border-primary/30 bg-primary/5 p-5">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                主动回忆问题
              </div>
              <p className="text-lg leading-relaxed">{question.question}</p>
              <details className="text-xs">
                <summary className="cursor-pointer text-primary hover:underline">
                  或先思考后查看提示（核心原理）
                </summary>
                {currentCard.corePrinciple && (
                  <p className="mt-2 text-muted-foreground">{currentCard.corePrinciple}</p>
                )}
              </details>
              <div>
                <textarea
                  placeholder="先在脑中或纸上作答。也可以写下来加深印象..."
                  value={selfAnswer}
                  onChange={(e) => setSelfAnswer(e.target.value)}
                  className="w-full min-h-[100px] rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => { setSubmitted(true); setPhase("ANSWER"); }} className="flex-1">
                  <Eye className="h-4 w-4 mr-1" />
                  查看答案
                </Button>
              </div>
            </div>
          )}

          {phase === "ANSWER" && question && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-card/50 p-4 space-y-2">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">问题</div>
                <p className="text-base">{question.question}</p>
              </div>

              <div className="rounded-lg border-2 border-green-500/30 bg-green-500/5 p-4 space-y-2">
                <div className="text-xs text-green-500 uppercase tracking-wider font-semibold">
                  标准答案
                </div>
                <pre className="text-sm whitespace-pre-wrap leading-relaxed">{question.answer}</pre>
              </div>

              {currentCard.codeExample && (
                <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">代码示例</div>
                  <pre className="text-xs whitespace-pre-wrap overflow-x-auto">{currentCard.codeExample}</pre>
                </div>
              )}

              <p className="text-sm text-muted-foreground text-center pt-2">
                评估你的回忆准确度，选择下方按钮：
              </p>

              <div className="grid grid-cols-4 gap-2 pt-2">
                <RateButton color="red" label="Again" desc="完全不会" onClick={() => handleRate("AGAIN")} disabled={submitting} />
                <RateButton color="yellow" label="Hard" desc="记得一点" onClick={() => handleRate("HARD")} disabled={submitting} />
                <RateButton color="blue" label="Good" desc="基本正确" onClick={() => handleRate("GOOD")} disabled={submitting} />
                <RateButton color="green" label="Easy" desc="完全正确" onClick={() => handleRate("EASY")} disabled={submitting} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-center">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/knowledge/${currentCard.id}`}>
            查看完整知识卡片 →
          </Link>
        </Button>
      </div>
    </div>
  );
}

function RateButton({
  color,
  label,
  desc,
  onClick,
  disabled,
}: {
  color: "red" | "yellow" | "blue" | "green";
  label: string;
  desc: string;
  onClick: () => void;
  disabled: boolean;
}) {
  const colorClass = {
    red: "border-red-500/30 hover:bg-red-500/10 hover:border-red-500/60 text-red-500",
    yellow: "border-yellow-500/30 hover:bg-yellow-500/10 hover:border-yellow-500/60 text-yellow-500",
    blue: "border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500/60 text-blue-500",
    green: "border-green-500/30 hover:bg-green-500/10 hover:border-green-500/60 text-green-500",
  }[color];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-md border bg-card p-3 text-center transition-all disabled:opacity-50",
        colorClass
      )}
    >
      <div className="font-semibold text-sm">{label}</div>
      <div className="text-xs opacity-70 mt-0.5">{desc}</div>
    </button>
  );
}
