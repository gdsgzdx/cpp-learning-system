import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Calendar, Clock, Brain, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MasteryBar, MasteryBadge } from "@/components/mastery-bar";
import { getKnowledgeCard } from "@/lib/knowledge";
import { formatDate, formatDateTime, timeAgo, parseTags, difficultyLabel } from "@/lib/utils";
import { KnowledgeEditDialog } from "@/components/knowledge/knowledge-edit-dialog";
import { AddRecallDialog } from "@/components/knowledge/add-recall-dialog";
import { DeleteCardButton } from "@/components/knowledge/delete-card-button";
import { PdfLinkButton } from "@/components/pdf-link-button";
import { requireUser } from "@/lib/auth";

export default async function KnowledgeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireUser();
  const card = await getKnowledgeCard(user.id, params.id);
  if (!card) notFound();

  const tags = parseTags(card.tags);

  return (
    <div className="space-y-6 fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2">
          <Link href="/knowledge">
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回列表
          </Link>
        </Button>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{card.topic.name}</Badge>
              <Badge variant="secondary">{difficultyLabel(card.difficulty)}</Badge>
              <MasteryBadge score={card.masteryScore} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{card.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              {card.source && <span>来源: {card.source}</span>}
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                下次复习: {formatDate(card.nextReviewAt)}
              </span>
              {card.lastReviewedAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  上次复习: {timeAgo(card.lastReviewedAt)}
                </span>
              )}
            </div>
            {card.pdfPath && (
              <div className="mt-2">
                <PdfLinkButton pdfPath={card.pdfPath} pdfPage={card.pdfPage} />
              </div>
            )}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">#{t}</Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href={`/review?cardId=${card.id}`}>
                <Brain className="h-4 w-4 mr-1" />
                复习
              </Link>
            </Button>
            <KnowledgeEditDialog
              card={{
                id: card.id,
                title: card.title,
                topicId: card.topicId,
                difficulty: card.difficulty,
                source: card.source,
                tags: card.tags,
                problemSolved: card.problemSolved,
                corePrinciple: card.corePrinciple,
                differences: card.differences,
                commonMistakes: card.commonMistakes,
                codeExample: card.codeExample,
                interviewQs: card.interviewQs,
                pdfPath: card.pdfPath,
                pdfPage: card.pdfPage,
              }}
            />
            <DeleteCardButton id={card.id} />
          </div>
        </div>
      </div>

      {/* Mastery */}
      <Card>
        <CardContent className="pt-6">
          <MasteryBar score={card.masteryScore} />
        </CardContent>
      </Card>

      {/* 结构化笔记（对应 Prompt 第五节） */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            核心笔记
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <Section title="它解决什么问题？" content={card.problemSolved} />
          <Section title="核心原理" content={card.corePrinciple} />
          <Section title="与类似概念的区别" content={card.differences} multiline />
          <Section title="我容易犯的错误" content={card.commonMistakes} multiline />
          <Section title="最小代码示例" content={card.codeExample} code />
          <Section title="面试问题" content={card.interviewQs} multiline />
        </CardContent>
      </Card>

      {/* Recall Questions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              主动回忆问题 ({card.recallQuestions.length})
            </CardTitle>
            <AddRecallDialog cardId={card.id} />
          </div>
        </CardHeader>
        <CardContent>
          {card.recallQuestions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              还没有主动回忆问题。点击右上角"添加问题"。
            </p>
          ) : (
            <ul className="space-y-3">
              {card.recallQuestions.map((q, idx) => (
                <li key={q.id} className="rounded-md border bg-card/50 p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-muted-foreground font-mono shrink-0">
                      Q{idx + 1}
                    </span>
                    <p className="text-sm flex-1">{q.question}</p>
                  </div>
                  <details className="text-xs">
                    <summary className="cursor-pointer text-primary hover:underline">
                      查看答案
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap text-muted-foreground">{q.answer}</pre>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* 复习历史 */}
      {card.reviewRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>复习历史（最近 {card.reviewRecords.length} 次）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {card.reviewRecords.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between text-sm rounded-md border bg-card/30 p-2"
                >
                  <span className="text-muted-foreground">{formatDateTime(r.reviewedAt)}</span>
                  <Badge
                    variant={
                      r.result === "EASY" ? "success" :
                      r.result === "GOOD" ? "default" :
                      r.result === "HARD" ? "warning" :
                      "destructive"
                    }
                  >
                    {r.result}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Section({
  title,
  content,
  multiline,
  code,
}: {
  title: string;
  content: string | null;
  multiline?: boolean;
  code?: boolean;
}) {
  if (!content) return null;
  return (
    <div>
      <h3 className="text-sm font-medium mb-2">{title}</h3>
      {code ? (
        <pre className="text-sm whitespace-pre-wrap">{content}</pre>
      ) : multiline ? (
        <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{content}</p>
      ) : (
        <p className="text-sm text-muted-foreground">{content}</p>
      )}
    </div>
  );
}
