import Link from "next/link";
import { Layers, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MasteryBar } from "@/components/mastery-bar";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export default async function PatternsPage() {
  const user = await requireUser();
  const [patterns, lcByPattern] = await Promise.all([
    prisma.algorithmPattern.findMany({ where: { userId: user.id }, orderBy: { order: "asc" } }),
    prisma.leetcodeProblem.groupBy({
      by: ["pattern"],
      where: { userId: user.id },
      _count: { _all: true },
      _avg: { masteryScore: true },
    }),
  ]);

  const stats = new Map(
    lcByPattern.map((p) => [p.pattern, { count: p._count._all, avgMastery: p._avg.masteryScore ?? 0 }])
  );

  return (
    <div className="space-y-4 fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Layers className="h-6 w-6" />
          算法 Pattern 学习
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          20 个核心 Pattern · 推荐学习顺序 · 每个 Pattern 配套模板与典型题目
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {patterns.map((p) => {
          const stat = stats.get(p.name);
          return (
            <Card key={p.id} id={p.name} className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        #{p.order}
                      </Badge>
                      <CardTitle className="text-base">{p.name}</CardTitle>
                    </div>
                    {p.scenario && (
                      <CardDescription className="line-clamp-2">{p.scenario}</CardDescription>
                    )}
                  </div>
                  <Link
                    href={`/leetcode?pattern=${encodeURIComponent(p.name)}`}
                    className="text-muted-foreground hover:text-primary shrink-0"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {p.signals && (
                  <div className="text-xs">
                    <span className="text-muted-foreground">识别信号: </span>
                    <span className="text-foreground">{p.signals}</span>
                  </div>
                )}

                {p.template && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-primary hover:underline">
                      查看代码模板
                    </summary>
                    <pre className="mt-2 rounded bg-muted/50 p-2 overflow-x-auto whitespace-pre-wrap">
                      {p.template}
                    </pre>
                  </details>
                )}

                {p.commonErrors && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-primary hover:underline">
                      常见错误
                    </summary>
                    <p className="mt-2 text-muted-foreground whitespace-pre-wrap">{p.commonErrors}</p>
                  </details>
                )}

                {stat && stat.count > 0 && (
                  <>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{stat.count} 道题</span>
                      <Link
                        href={`/leetcode?pattern=${encodeURIComponent(p.name)}`}
                        className="text-primary hover:underline"
                      >
                        查看题目 →
                      </Link>
                    </div>
                    <MasteryBar score={stat.avgMastery} showLabel={false} />
                  </>
                )}

                {!stat && (
                  <Link
                    href={`/leetcode/new`}
                    className="text-xs text-muted-foreground hover:text-primary"
                  >
                    还没有题目 → 添加
                  </Link>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
