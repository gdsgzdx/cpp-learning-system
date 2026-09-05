"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function AddResourceDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: "book",
    title: "",
    author: "",
    url: "",
    chapter: "",
    progress: 0,
    notes: "",
  });

  const handleAdd = async () => {
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ type: "book", title: "", author: "", url: "", chapter: "", progress: 0, notes: "" });
        setOpen(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-1" />
        添加资源
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-lg border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">添加资源</h2>
          <button onClick={() => setOpen(false)} className="rounded-md p-1 hover:bg-accent">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3 p-4">
          <div>
            <Label>类型</Label>
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="book">书籍</option>
              <option value="video">视频</option>
              <option value="course">课程</option>
              <option value="blog">博客</option>
              <option value="doc">文档</option>
            </Select>
          </div>
          <div>
            <Label>标题 *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="C++ Primer"
            />
          </div>
          <div>
            <Label>作者</Label>
            <Input
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              placeholder="Stanley Lippman"
            />
          </div>
          <div>
            <Label>链接</Label>
            <Input
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div>
            <Label>当前章节</Label>
            <Input
              value={form.chapter}
              onChange={(e) => setForm({ ...form, chapter: e.target.value })}
            />
          </div>
          <div>
            <Label>进度 ({form.progress}%)</Label>
            <Input
              type="range"
              min={0}
              max={100}
              value={form.progress}
              onChange={(e) => setForm({ ...form, progress: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <Label>备注</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t p-4">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>取消</Button>
          <Button onClick={handleAdd} disabled={loading || !form.title.trim()}>
            {loading ? "保存中..." : "保存"}
          </Button>
        </div>
      </div>
    </div>
  );
}
