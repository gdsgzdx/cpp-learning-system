"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Play, Square, RotateCcw, BookOpen, Brain, Code2, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type SessionType = "REVIEW" | "LEARN" | "PRACTICE" | "REFLECT";

export function StudySessionClient() {
  const router = useRouter();
  const [active, setActive] = useState(false);
  const [sessionType, setSessionType] = useState<SessionType>("REVIEW");
  const [elapsed, setElapsed] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [reflection, setReflection] = useState("");
  const [counts, setCounts] = useState({ review: 0, leetcode: 0 });

  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, [active]);

  const startSession = async () => {
    setElapsed(0);
    setActive(true);
    setCounts({ review: 0, leetcode: 0 });
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionType }),
      });
      const data = await res.json();
      setSessionId(data.id);
    } catch (err) {
      console.error(err);
    }
  };

  const endSession = async () => {
    if (!sessionId) return;
    setActive(false);
    await fetch("/api/session", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: sessionId,
        endTime: new Date().toISOString(),
        duration: Math.round(elapsed / 60),
        reflection,
      }),
    });
    router.refresh();
  };

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>学习 Session</CardTitle>
        <CardDescription>点击开始，开始你的专注学习时间</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {!active ? (
          <>
            <div>
              <Label>会话类型</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {([
                  { type: "REVIEW", label: "复习", icon: Brain },
                  { type: "LEARN", label: "学习", icon: BookOpen },
                  { type: "PRACTICE", label: "刷题", icon: Code2 },
                  { type: "REFLECT", label: "复盘", icon: Save },
                ] as const).map(({ type, label, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => setSessionType(type)}
                    className={`rounded-md border p-3 text-center transition-colors ${
                      sessionType === type
                        ? "border-primary bg-primary/10 text-primary"
                        : "hover:bg-accent"
                    }`}
                  >
                    <Icon className="h-4 w-4 mx-auto mb-1" />
                    <div className="text-xs font-medium">{label}</div>
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={startSession} size="lg" className="w-full">
              <Play className="h-4 w-4 mr-2" />
              开始 Session
            </Button>
          </>
        ) : (
          <>
            <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-8 text-center space-y-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {sessionType}
              </p>
              <p className="text-5xl font-mono font-bold tracking-tight">
                {formatTime(elapsed)}
              </p>
              <p className="text-sm text-muted-foreground">
                已复习 {counts.review} · 已刷题 {counts.leetcode}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => setCounts((c) => ({ ...c, review: c.review + 1 }))}
              >
                <Brain className="h-4 w-4 mr-1" />
                +1 复习
              </Button>
              <Button
                variant="outline"
                onClick={() => setCounts((c) => ({ ...c, leetcode: c.leetcode + 1 }))}
              >
                <Code2 className="h-4 w-4 mr-1" />
                +1 刷题
              </Button>
            </div>

            <div>
              <Label htmlFor="reflection">本次 Session 反思</Label>
              <Textarea
                id="reflection"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="今天学了什么？卡在哪里？下次注意什么？"
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setActive(false); setSessionId(null); setElapsed(0); }}>
                <RotateCcw className="h-4 w-4 mr-1" />
                重置
              </Button>
              <Button onClick={endSession} className="flex-1">
                <Square className="h-4 w-4 mr-1" />
                结束 Session
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
