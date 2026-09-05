"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Play, Square, Brain, BookOpen, Code2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type SessionType = "REVIEW" | "LEARN" | "PRACTICE" | "REFLECT";

const TYPE_LABEL: Record<SessionType, string> = {
  REVIEW: "复习",
  LEARN: "学习",
  PRACTICE: "刷题",
  REFLECT: "复盘",
};

const TYPE_ICON: Record<SessionType, typeof Brain> = {
  REVIEW: Brain,
  LEARN: BookOpen,
  PRACTICE: Code2,
  REFLECT: Save,
};

/**
 * 全局 Header 计时器入口
 * - 未启动：显示 "▶ 开始" 按钮
 * - 启动中：显示实时倒计时 + 停止按钮 + 类型徽章
 * - 点击展开 Popover，可选类型、填写复盘
 */
export function StudySessionButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(false);
  const [sessionType, setSessionType] = useState<SessionType>("REVIEW");
  const [elapsed, setElapsed] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [reflection, setReflection] = useState("");

  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, [active]);

  const startSession = async () => {
    setElapsed(0);
    setActive(true);
    setOpen(false);
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
    if (!sessionId) {
      // 极端情况：sessionId 没拿到也要清状态
      setActive(false);
      setOpen(false);
      return;
    }
    const minutes = Math.round(elapsed / 60);
    await fetch("/api/session", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: sessionId,
        endTime: new Date().toISOString(),
        duration: minutes,
        reflection,
      }),
    });
    setActive(false);
    setSessionId(null);
    setElapsed(0);
    setReflection("");
    setOpen(false);
    router.refresh();
  };

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const ActiveIcon = TYPE_ICON[sessionType];

  return (
    <div className="relative">
      {/* 触发按钮 */}
      {active ? (
        <button
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-3 h-9 text-sm font-mono font-medium",
            "hover:bg-primary/15 transition-colors"
          )}
        >
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <ActiveIcon className="h-3.5 w-3.5 text-primary" />
          <span>{TYPE_LABEL[sessionType]}</span>
          <span className="tabular-nums">{formatTime(elapsed)}</span>
        </button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen((o) => !o)}
          className="h-9"
        >
          <Play className="h-3.5 w-3.5 mr-1" />
          开始 Session
        </Button>
      )}

      {/* 弹出面板 */}
      {open && (
        <>
          {/* 点外面关闭 */}
          <div
            className="fixed inset-0 z-20"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-30 w-80 rounded-lg border bg-card shadow-lg p-4 space-y-3">
            {!active ? (
              <>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">选择本次学习类型</p>
                  <div className="grid grid-cols-4 gap-2">
                    {(["REVIEW", "LEARN", "PRACTICE", "REFLECT"] as SessionType[]).map((t) => {
                      const Icon = TYPE_ICON[t];
                      return (
                        <button
                          key={t}
                          onClick={() => setSessionType(t)}
                          className={cn(
                            "rounded-md border p-2 text-center transition-colors",
                            sessionType === t
                              ? "border-primary bg-primary/10 text-primary"
                              : "hover:bg-accent"
                          )}
                        >
                          <Icon className="h-4 w-4 mx-auto mb-1" />
                          <div className="text-[11px] font-medium">{TYPE_LABEL[t]}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <Button onClick={startSession} className="w-full" size="sm">
                  <Play className="h-3.5 w-3.5 mr-1" />
                  开始 {TYPE_LABEL[sessionType]}
                </Button>
              </>
            ) : (
              <>
                <div className="rounded-md border-2 border-primary/30 bg-primary/5 p-4 text-center space-y-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {TYPE_LABEL[sessionType]} 进行中
                  </p>
                  <p className="text-3xl font-mono font-bold tracking-tight">
                    {formatTime(elapsed)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">本次反思（可选）</p>
                  <Textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="今天学了什么？卡在哪里？"
                    rows={3}
                    className="text-sm"
                  />
                </div>
                <Button onClick={endSession} className="w-full" size="sm">
                  <Square className="h-3.5 w-3.5 mr-1" />
                  结束 Session（{Math.max(1, Math.round(elapsed / 60))} 分钟）
                </Button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
