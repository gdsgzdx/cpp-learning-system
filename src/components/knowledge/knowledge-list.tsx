"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search, Filter, Calendar, Brain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MasteryBar } from "@/components/mastery-bar";
import { CreateCardDialog } from "@/components/knowledge/create-card-dialog";
import { formatDate, isOverdue, difficultyLabel, parseTags, cn } from "@/lib/utils";

interface KnowledgeCard {
  id: string;
  title: string;
  topicId: string;
  difficulty: number;
  masteryScore: number;
  nextReviewAt: Date | string;
  lastReviewedAt: Date | string | null;
  tags: string;
  recallQuestions?: any[];
  topic: { id: string; name: string };
}

interface Props {
  cards: KnowledgeCard[];
  topics: Array<{ id: string; name: string; _count?: { knowledgeCards: number } }>;
  tags: string[];
  initialFilters: {
    topicId?: string;
    tag?: string;
    search?: string;
    sortBy: string;
    dueOnly: boolean;
  };
}

export function KnowledgeList({ cards, topics, tags, initialFilters }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialFilters.search ?? "");
  const [createOpen, setCreateOpen] = useState(false);

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all" && value !== "") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/knowledge?${params.toString()}`);
  };

  const filtered = useMemo(() => {
    return cards.filter((c) => {
      if (initialFilters.topicId && c.topicId !== initialFilters.topicId) return false;
      if (initialFilters.tag && !parseTags(c.tags).includes(initialFilters.tag)) return false;
      if (initialFilters.search) {
        const s = initialFilters.search.toLowerCase();
        if (!c.title.toLowerCase().includes(s)) return false;
      }
      if (initialFilters.dueOnly && !isOverdue(c.nextReviewAt) && new Date(c.nextReviewAt) > new Date()) {
        return false;
      }
      return true;
    });
  }, [cards, initialFilters]);

  return (
    <div className="space-y-4 fade-in">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索知识点..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") updateParam("search", search);
            }}
            className="pl-9"
          />
        </div>

        <Select
          value={initialFilters.topicId ?? "all"}
          onChange={(e) => updateParam("topic", e.target.value)}
          className="md:w-48"
        >
          <option value="all">全部 Topic</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t._count?.knowledgeCards ?? 0})
            </option>
          ))}
        </Select>

        <Select
          value={initialFilters.tag ?? "all"}
          onChange={(e) => updateParam("tag", e.target.value)}
          className="md:w-40"
        >
          <option value="all">全部 Tag</option>
          {tags.map((t) => (
            <option key={t} value={t}>
              #{t}
            </option>
          ))}
        </Select>

        <Select
          value={initialFilters.sortBy}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="md:w-40"
        >
          <option value="updatedAt">最近编辑</option>
          <option value="mastery">掌握度↑</option>
          <option value="nextReview">下次复习</option>
          <option value="title">名称</option>
          <option value="difficulty">难度↓</option>
        </Select>

        <Button
          variant={initialFilters.dueOnly ? "default" : "outline"}
          onClick={() => updateParam("due", initialFilters.dueOnly ? null : "1")}
          size="default"
        >
          <Filter className="h-4 w-4 mr-1" />
          待复习
        </Button>

        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          新建
        </Button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>没有匹配的知识点</p>
            <p className="text-sm mt-1">试试调整筛选条件，或点击"新建"添加第一个。</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((card) => {
            const overdue = isOverdue(card.nextReviewAt);
            const tagList = parseTags(card.tags);
            return (
              <Link key={card.id} href={`/knowledge/${card.id}`}>
                <Card className={cn("hover:border-primary/50 transition-colors h-full", overdue && "border-red-500/30")}>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-medium text-sm leading-tight">{card.title}</h3>
                        <Badge variant="outline" className="shrink-0 text-xs">
                          {difficultyLabel(card.difficulty)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{card.topic.name}</p>
                    </div>

                    <MasteryBar score={card.masteryScore} />

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {overdue ? (
                          <span className="text-red-500">已逾期 · {formatDate(card.nextReviewAt)}</span>
                        ) : (
                          <span>{formatDate(card.nextReviewAt)}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Brain className="h-3 w-3" />
                        {card.recallQuestions?.length ?? 0} 题
                      </div>
                    </div>

                    {tagList.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tagList.slice(0, 4).map((t) => (
                          <Badge key={t} variant="secondary" className="text-xs">
                            #{t}
                          </Badge>
                        ))}
                        {tagList.length > 4 && (
                          <Badge variant="secondary" className="text-xs">
                            +{tagList.length - 4}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <CreateCardDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        topics={topics}
      />
    </div>
  );
}
