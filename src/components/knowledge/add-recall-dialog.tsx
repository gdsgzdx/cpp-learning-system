"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function AddRecallDialog({ cardId }: { cardId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ question: "", answer: "", difficulty: 3 });

  const handleAdd = async () => {
    if (!form.question.trim() || !form.answer.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/knowledge/${cardId}/recall`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ question: "", answer: "", difficulty: 3 });
        setOpen(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-1" />
        添加问题
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-lg border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">添加主动回忆问题</h2>
          <button onClick={() => setOpen(false)} className="rounded-md p-1 hover:bg-accent">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3 p-4">
          <div>
            <Label>问题</Label>
            <Textarea
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              placeholder="unique_ptr 能否复制？"
              rows={2}
            />
          </div>
          <div>
            <Label>标准答案</Label>
            <Textarea
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
              placeholder="不能。unique_ptr 表示独占所有权，复制会破坏语义。如果需要共享应使用 shared_ptr。"
              rows={4}
            />
          </div>
          <div>
            <Label>难度</Label>
            <Select
              value={String(form.difficulty)}
              onChange={(e) => setForm({ ...form, difficulty: parseInt(e.target.value) })}
            >
              {[1, 2, 3, 4, 5].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t p-4">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>取消</Button>
          <Button onClick={handleAdd} disabled={loading || !form.question.trim() || !form.answer.trim()}>
            {loading ? "保存中..." : "保存"}
          </Button>
        </div>
      </div>
    </div>
  );
}
