"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

interface Props {
  resource: {
    id: string;
    type: string;
    title: string;
    author: string | null;
    url: string | null;
    chapter: string | null;
    progress: number;
    notes: string | null;
    pdfPath: string | null;
    totalPages: number | null;
    currentPage: number | null;
  };
}

export function EditResourceDialog({ resource }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pdfs, setPdfs] = useState<string[]>([]);
  const [form, setForm] = useState({
    type: resource.type,
    title: resource.title,
    author: resource.author ?? "",
    url: resource.url ?? "",
    chapter: resource.chapter ?? "",
    progress: resource.progress,
    notes: resource.notes ?? "",
    pdfPath: resource.pdfPath ?? "",
    totalPages: resource.totalPages ?? null as number | null,
    currentPage: resource.currentPage ?? null as number | null,
  });

  useEffect(() => {
    if (open && pdfs.length === 0) {
      fetch("/api/pdf-list")
        .then((r) => r.json())
        .then((d) => setPdfs(d.pdfs ?? []))
        .catch(() => {});
    }
  }, [open, pdfs.length]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/resources/${resource.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          author: form.author || null,
          url: form.url || null,
          chapter: form.chapter || null,
          notes: form.notes || null,
          pdfPath: form.pdfPath || null,
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

  if (!open) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-lg border bg-card shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b p-4 sticky top-0 bg-card">
          <h2 className="text-lg font-semibold">编辑资源</h2>
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
            <Label>标题</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <Label>作者</Label>
            <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
          </div>
          <div>
            <Label>链接</Label>
            <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          </div>
          <div>
            <Label>当前章节</Label>
            <Input value={form.chapter} onChange={(e) => setForm({ ...form, chapter: e.target.value })} />
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
          {form.type === "book" && (
            <>
              <div>
                <Label>关联 PDF（book_pdf 目录）</Label>
                <Select
                  value={form.pdfPath}
                  onChange={(e) => setForm({ ...form, pdfPath: e.target.value })}
                >
                  <option value="">不关联</option>
                  {pdfs.map((p) => (
                    <option key={p} value={p}>{p.length > 55 ? "…" + p.slice(-52) : p}</option>
                  ))}
                </Select>
              </div>
              {form.pdfPath && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>总页数</Label>
                    <Input
                      type="number"
                      min={1}
                      value={form.totalPages ?? ""}
                      onChange={(e) => setForm({ ...form, totalPages: e.target.value ? parseInt(e.target.value) : null })}
                    />
                  </div>
                  <div>
                    <Label>当前页</Label>
                    <Input
                      type="number"
                      min={1}
                      value={form.currentPage ?? ""}
                      onChange={(e) => setForm({ ...form, currentPage: e.target.value ? parseInt(e.target.value) : null })}
                    />
                  </div>
                </div>
              )}
            </>
          )}
          <div>
            <Label>备注</Label>
            <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t p-4">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>取消</Button>
          <Button onClick={handleSave} disabled={loading}>保存</Button>
        </div>
      </div>
    </div>
  );
}
