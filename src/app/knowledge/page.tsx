import { Suspense } from "react";
import { KnowledgeList } from "@/components/knowledge/knowledge-list";
import { getKnowledgeCards, getAllTopics, getAllTags } from "@/lib/knowledge";
import { BookOpen } from "lucide-react";
import { requireUser } from "@/lib/auth";

interface SearchParams {
  topic?: string;
  tag?: string;
  search?: string;
  sort?: string;
  due?: string;
}

export default async function KnowledgePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requireUser();
  const sortBy = (searchParams.sort ?? "updatedAt") as "mastery" | "nextReview" | "title" | "difficulty" | "updatedAt";
  const [cards, topics, tags] = await Promise.all([
    getKnowledgeCards(user.id, {
      topicId: searchParams.topic,
      tag: searchParams.tag,
      search: searchParams.search,
      dueOnly: searchParams.due === "1",
      sortBy: sortBy === "updatedAt" ? undefined : sortBy,
    }),
    getAllTopics(user.id),
    getAllTags(user.id),
  ]);

  return (
    <div className="space-y-4 fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          Knowledge Cards
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          共 {cards.length} 张卡片 · 结构化笔记 + 主动回忆
        </p>
      </div>

      <Suspense fallback={<div className="text-muted-foreground">加载中...</div>}>
        <KnowledgeList
          cards={cards.map((c) => ({
            ...c,
            topic: { id: c.topic.id, name: c.topic.name },
            recallQuestions: c._count.recallQuestions,
            nextReviewAt: c.nextReviewAt,
            lastReviewedAt: c.lastReviewedAt,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
          })) as any}
          topics={topics.map((t) => ({
            id: t.id,
            name: t.name,
            _count: t._count,
          }))}
          tags={tags}
          initialFilters={{
            topicId: searchParams.topic,
            tag: searchParams.tag,
            search: searchParams.search,
            sortBy,
            dueOnly: searchParams.due === "1",
          }}
        />
      </Suspense>
    </div>
  );
}
