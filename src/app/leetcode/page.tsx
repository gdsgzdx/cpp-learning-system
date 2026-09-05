import { Suspense } from "react";
import Link from "next/link";
import { Code2, Plus, ExternalLink, Flame, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { MasteryBar } from "@/components/mastery-bar";
import { getLeetcodeList, getLeetcodeStats } from "@/lib/leetcode";
import { STATUS_LABELS, STATUS_COLORS, type LeetcodeStatus } from "@/lib/leetcode-status";
import { PATTERNS } from "@/lib/patterns-list";
import { cn } from "@/lib/utils";
import { requireUser } from "@/lib/auth";

interface SearchParams {
  pattern?: string;
  difficulty?: string;
  status?: string;
  source?: string;
}

export default async function LeetcodePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requireUser();
  const [problems, stats] = await Promise.all([
    getLeetcodeList(user.id, searchParams),
    getLeetcodeStats(user.id),
  ]);

  // 按 source 分组
  const groups: Record<string, typeof problems> = {};
  for (const p of problems) {
    const key = p.source ?? "其他";
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  }

  return (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Code2 className="h-6 w-6" />
            LeetCode 题库
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            共 {stats.total} 道 · 掌握 {stats.byStatus["Mastered"] ?? 0} · 🔥 大厂常考 {stats.hotCount}
          </p>
        </div>
        <Button asChild>
          <Link href="/leetcode/new">
            <Plus className="h-4 w-4 mr-1" />
            添加题目
          </Link>
        </Button>
      </div>

      {/* 状态统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(["Mastered", "SolvedIndependently", "SolvedWithHint", "SolvedAfterSolution"] as LeetcodeStatus[]).map((s) => (
          <Card key={s}>
            <CardContent className="p-3">
              <Badge variant="outline" className={cn("w-full justify-start", STATUS_COLORS[s])}>
                {STATUS_LABELS[s]}
              </Badge>
              <p className="text-2xl font-bold mt-2">{stats.byStatus[s] ?? 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 筛选 */}
      <div className="flex flex-wrap gap-3">
        <Select defaultValue={searchParams.pattern ?? "all"} className="md:w-48">
          <option value="all">全部 Pattern</option>
          {PATTERNS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </Select>
        <Select defaultValue={searchParams.difficulty ?? "all"} className="md:w-32">
          <option value="all">全部难度</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </Select>
        <Select defaultValue={searchParams.status ?? "all"} className="md:w-40">
          <option value="all">全部状态</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
        <Select defaultValue={searchParams.source ?? "all"} className="md:w-40">
          <option value="all">全部来源</option>
          {Object.entries(stats.bySource).map(([k, v]) => (
            <option key={k} value={k}>{k} ({v})</option>
          ))}
        </Select>
      </div>

      {/* 分组显示 */}
      {problems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            还没有 LeetCode 题目。点击"添加题目"开始追踪。
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groups).map(([source, items]) => (
            <section key={source}>
              <div className="flex items-center gap-2 mb-3 sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">{source}</h2>
                <Badge variant="secondary" className="text-xs">{items.length} 题</Badge>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {items.map((p) => (
                  <Link key={p.id} href={`/leetcode/${p.id}`}>
                    <Card className={cn(
                      "hover:border-primary/50 transition-colors h-full",
                      p.isHot && "border-orange-500/40 bg-orange-500/5"
                    )}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs text-muted-foreground">
                                #{p.leetcodeNumber}
                              </span>
                              <Badge variant="outline" className={cn(
                                p.difficulty === "Easy" ? "text-green-500" :
                                p.difficulty === "Medium" ? "text-yellow-500" :
                                "text-red-500"
                              )}>
                                {p.difficulty}
                              </Badge>
                              {p.isHot && (
                                <Badge variant="outline" className="text-orange-500 border-orange-500/50 text-xs gap-1">
                                  <Flame className="h-3 w-3" />
                                  Hot
                                </Badge>
                              )}
                            </div>
                            <h3 className="font-medium text-sm leading-tight mt-1">{p.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{p.pattern}</p>
                            {p.chapter && (
                              <p className="text-xs text-muted-foreground mt-0.5">📖 {p.chapter}</p>
                            )}
                          </div>
                          {p.url && (
                            <a href={p.url} target="_blank" rel="noopener" className="text-muted-foreground hover:text-primary">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>

                        <Badge variant="outline" className={STATUS_COLORS[p.status as LeetcodeStatus]}>
                          {STATUS_LABELS[p.status as LeetcodeStatus]}
                        </Badge>

                        <MasteryBar score={p.masteryScore} />

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>尝试 {p.attemptCount} 次</span>
                          <span>独立 {p.independentSolveCount} 次</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
