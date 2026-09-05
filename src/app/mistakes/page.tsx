import Link from "next/link";
import { AlertTriangle, Code2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MasteryBar } from "@/components/mastery-bar";
import { getMistakes } from "@/lib/leetcode";
import { STATUS_LABELS, STATUS_COLORS, type LeetcodeStatus } from "@/lib/leetcode-status";
import { cn } from "@/lib/utils";
import { requireUser } from "@/lib/auth";

export default async function MistakesPage() {
  const user = await requireUser();
  const problems = await getMistakes(user.id);

  // 按 Pattern 分组
  const byPattern = new Map<string, typeof problems>();
  for (const p of problems) {
    if (!byPattern.has(p.pattern)) byPattern.set(p.pattern, []);
    byPattern.get(p.pattern)!.push(p);
  }

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-orange-500" />
          错题本
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          共 {problems.length} 道 · 按 Pattern 分组 · 这些题还没真正掌握
        </p>
      </div>

      {problems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>🎉 没有错题！</p>
            <p className="text-sm mt-1">所有题目都已独立完成或掌握。</p>
          </CardContent>
        </Card>
      ) : (
        Array.from(byPattern.entries()).map(([pattern, items]) => (
          <Card key={pattern}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Code2 className="h-4 w-4" />
                    {pattern}
                  </CardTitle>
                  <CardDescription>{items.length} 道未掌握</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/patterns#${pattern}`}>学习此 Pattern</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {items.map((p) => {
                  const status = p.status as LeetcodeStatus;
                  const lastAttempt = p.attempts[0];
                  return (
                    <Link
                      key={p.id}
                      href={`/leetcode/${p.id}`}
                      className="block rounded-md border bg-card/30 hover:bg-accent p-3 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs text-muted-foreground">#{p.leetcodeNumber}</span>
                            <span className="font-medium text-sm">{p.title}</span>
                            <Badge variant="outline" className={cn(
                              p.difficulty === "Easy" ? "text-green-500" :
                              p.difficulty === "Medium" ? "text-yellow-500" :
                              "text-red-500"
                            )}>{p.difficulty}</Badge>
                          </div>
                          {lastAttempt && (
                            <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                              {lastAttempt.mistakeType && (
                                <div>错误类型: <Badge variant="outline" className="text-xs">{lastAttempt.mistakeType}</Badge></div>
                              )}
                              {lastAttempt.whyFailed && (
                                <div className="line-clamp-1">原因: {lastAttempt.whyFailed}</div>
                              )}
                            </div>
                          )}
                        </div>
                        <Badge variant="outline" className={STATUS_COLORS[status]}>
                          {STATUS_LABELS[status]}
                        </Badge>
                      </div>
                      <MasteryBar score={p.masteryScore} />
                      {lastAttempt?.nextTimeSignal && (
                        <p className="text-xs text-primary mt-2">
                          💡 {lastAttempt.nextTimeSignal}
                        </p>
                      )}
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
