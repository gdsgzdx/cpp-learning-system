"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Lightbulb, FileText, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MISTAKE_TYPES } from "@/lib/leetcode-status";

export function AddAttemptDialog({ problemId }: { problemId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<"SOLVE" | "REVIEW">("SOLVE");
  const [usedHint, setUsedHint] = useState(false);
  const [usedSolution, setUsedSolution] = useState(false);
  const [solved, setSolved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [startTime] = useState(Date.now());
  const [form, setForm] = useState({
    duration: 30,
    algorithm: "",
    timeComplexity: "",
    spaceComplexity: "",
    whyFailed: "",
    mistakeType: "",
    patternRecognition: "",
    nextTimeSignal: "",
    notes: "",
  });

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-1" />
        记录做题
      </Button>
    );
  }

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const duration = Math.round((Date.now() - startTime) / 60000) || form.duration;
      const res = await fetch(`/api/leetcode/${problemId}/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          duration,
          solved,
          usedHint,
          usedSolution,
        }),
      });
      if (res.ok) {
        setOpen(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border bg-card shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b bg-card p-4">
          <h2 className="text-lg font-semibold">记录一次做题</h2>
          <button onClick={() => setOpen(false)} className="rounded-md p-1 hover:bg-accent">
            <X className="h-4 w-4" />
          </button>
        </div>

        {phase === "SOLVE" ? (
          <div className="space-y-4 p-4">
            <div className="rounded-md border bg-muted/30 p-3 text-sm">
              独立思考 20–30 分钟。需要提示/题解请标记。
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant={usedHint ? "destructive" : "outline"}
                onClick={() => setUsedHint(!usedHint)}
                className="w-full"
              >
                <Lightbulb className="h-4 w-4 mr-1" />
                {usedHint ? "已看提示" : "查看提示"}
              </Button>
              <Button
                variant={usedSolution ? "destructive" : "outline"}
                onClick={() => setUsedSolution(!usedSolution)}
                className="w-full"
              >
                <FileText className="h-4 w-4 mr-1" />
                {usedSolution ? "已看题解" : "查看题解"}
              </Button>
              <Button
                variant={solved ? "success" as any : "outline"}
                onClick={() => setSolved(!solved)}
                className="w-full"
              >
                {solved ? "✓ 通过" : "标记通过"}
              </Button>
            </div>

            {(usedSolution || usedHint) && (
              <div className="rounded-md border-2 border-yellow-500/30 bg-yellow-500/10 p-3 text-sm">
                <p className="font-medium">提示：看完题解后必须"关闭题解重新编码"才能真正掌握。</p>
                <p className="text-muted-foreground mt-1">这一题今天先标记，下一次复习时独立重做。</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
              <Button onClick={() => setPhase("REVIEW")}>
                下一步：复盘
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            <div className="text-sm font-medium">复盘（对应 Prompt 第十一节）</div>

            <div>
              <Label>最终使用什么算法？</Label>
              <Input
                value={form.algorithm}
                onChange={(e) => setForm({ ...form, algorithm: e.target.value })}
                placeholder="Sliding Window + Hash Map"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>时间复杂度</Label>
                <Input
                  value={form.timeComplexity}
                  onChange={(e) => setForm({ ...form, timeComplexity: e.target.value })}
                  placeholder="O(n)"
                />
              </div>
              <div>
                <Label>空间复杂度</Label>
                <Input
                  value={form.spaceComplexity}
                  onChange={(e) => setForm({ ...form, spaceComplexity: e.target.value })}
                  placeholder="O(1)"
                />
              </div>
            </div>

            <div>
              <Label>错误类型</Label>
              <Select
                value={form.mistakeType}
                onChange={(e) => setForm({ ...form, mistakeType: e.target.value })}
              >
                <option value="">无</option>
                {MISTAKE_TYPES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label>我第一次为什么没有想到？（最重要）</Label>
              <Textarea
                value={form.whyFailed}
                onChange={(e) => setForm({ ...form, whyFailed: e.target.value })}
                placeholder="不知道什么时候移动 left..."
                rows={2}
              />
            </div>

            <div>
              <Label>Pattern 识别</Label>
              <Input
                value={form.patternRecognition}
                onChange={(e) => setForm({ ...form, patternRecognition: e.target.value })}
                placeholder="Sliding Window"
              />
            </div>

            <div>
              <Label>下次看到什么特征应该想到这个方法？</Label>
              <Textarea
                value={form.nextTimeSignal}
                onChange={(e) => setForm({ ...form, nextTimeSignal: e.target.value })}
                placeholder="连续子串 + 求最长 + 满足条件 → Sliding Window"
                rows={2}
              />
            </div>

            <div>
              <Label>其他备注</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="用 map 代替 set 可以跳到重复位置之后..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setPhase("SOLVE")}>
                上一步
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "保存中..." : "提交"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
