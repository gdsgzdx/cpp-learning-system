import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Clock, Code2, AlertTriangle, Plus, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MasteryBar, MasteryBadge } from "@/components/mastery-bar";
import { getLeetcodeProblem } from "@/lib/leetcode";
import { STATUS_LABELS, STATUS_COLORS, type LeetcodeStatus, MISTAKE_TYPES } from "@/lib/leetcode-status";
import { formatDate, formatDateTime, cn } from "@/lib/utils";
import { AddAttemptDialog } from "@/components/leetcode/add-attempt-dialog";
import { PdfLinkButton } from "@/components/pdf-link-button";
import { requireUser } from "@/lib/auth";

export default async function LeetcodeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireUser();
  const problem = await getLeetcodeProblem(user.id, params.id);
  if (!problem) notFound();

  const status = problem.status as LeetcodeStatus;
  const lastAttempt = problem.attempts[0];

  return (
    <div className="space-y-6 fade-in max-w-4xl mx-auto">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2">
          <Link href="/leetcode">
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回列表
          </Link>
        </Button>

        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-mono text-sm text-muted-foreground">LC #{problem.leetcodeNumber}</span>
              <Badge variant="outline" className={cn(
                problem.difficulty === "Easy" ? "text-green-500" :
                problem.difficulty === "Medium" ? "text-yellow-500" :
                "text-red-500"
              )}>
                {problem.difficulty}
              </Badge>
              <Badge variant="outline">{problem.pattern}</Badge>
              <Badge variant="outline" className={STATUS_COLORS[status]}>
                {STATUS_LABELS[status]}
              </Badge>
              {problem.isHot && (
                <Badge variant="outline" className="text-orange-500 border-orange-500/50 gap-1">
                  <Flame className="h-3 w-3" />
                  大厂常考
                </Badge>
              )}
              <MasteryBadge score={problem.masteryScore} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{problem.title}</h1>
            {problem.url && (
              <a
                href={problem.url}
                target="_blank"
                rel="noopener"
                className="text-sm text-primary hover:underline mt-2 inline-flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                在 LeetCode 上查看
              </a>
            )}
            {problem.source && (
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <span>来源: {problem.source}</span>
                {problem.chapter && <span>· {problem.chapter}</span>}
              </div>
            )}
            {problem.pdfPath && (
              <div className="mt-2">
                <PdfLinkButton pdfPath={problem.pdfPath} pdfPage={problem.pdfPage} />
              </div>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span>尝试 {problem.attemptCount} 次</span>
              <span>独立完成 {problem.independentSolveCount} 次</span>
              <span>看提示 {problem.usedHintCount} 次</span>
              <span>看题解 {problem.usedSolutionCount} 次</span>
              {problem.nextReviewAt && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  下次复习 {formatDate(problem.nextReviewAt)}
                </span>
              )}
            </div>
          </div>

          <AddAttemptDialog problemId={problem.id} />
        </div>
      </div>

      {/* Mastery */}
      <Card>
        <CardContent className="pt-6">
          <MasteryBar score={problem.masteryScore} />
        </CardContent>
      </Card>

      {/* 做题记录 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-4 w-4" />
            做题记录 ({problem.attempts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {problem.attempts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              还没有做题记录。点击右上角"记录一次做题"。
            </p>
          ) : (
            <div className="space-y-3">
              {problem.attempts.map((a, idx) => (
                <div
                  key={a.id}
                  className={cn(
                    "rounded-md border p-3 space-y-2",
                    a.independent ? "border-green-500/30 bg-green-500/5" :
                    a.usedSolution ? "border-red-500/30 bg-red-500/5" :
                    a.usedHint ? "border-yellow-500/30 bg-yellow-500/5" :
                    ""
                  )}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-mono">#{problem.attempts.length - idx}</span>
                      <span className="text-muted-foreground">{formatDateTime(a.date)}</span>
                      <span>· {a.duration}m</span>
                      {a.independent && <Badge variant="success">独立</Badge>}
                      {a.usedHint && <Badge variant="warning">看提示</Badge>}
                      {a.usedSolution && <Badge variant="destructive">看题解</Badge>}
                    </div>
                    {a.solved ? (
                      <Badge variant="success">✓ AC</Badge>
                    ) : (
                      <Badge variant="destructive">✗ WA</Badge>
                    )}
                  </div>

                  {(a.algorithm || a.timeComplexity) && (
                    <div className="text-xs space-y-1">
                      {a.algorithm && (
                        <div><span className="text-muted-foreground">算法:</span> {a.algorithm}</div>
                      )}
                      {(a.timeComplexity || a.spaceComplexity) && (
                        <div>
                          <span className="text-muted-foreground">复杂度:</span> {a.timeComplexity ?? "-"} / {a.spaceComplexity ?? "-"}
                        </div>
                      )}
                    </div>
                  )}

                  {a.whyFailed && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">为什么没想出来:</span>
                      <p className="mt-1">{a.whyFailed}</p>
                    </div>
                  )}

                  {a.mistakeType && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">错误类型:</span>{" "}
                      <Badge variant="outline">{a.mistakeType}</Badge>
                    </div>
                  )}

                  {a.nextTimeSignal && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">下次识别信号:</span>
                      <p className="mt-1 text-primary">{a.nextTimeSignal}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
