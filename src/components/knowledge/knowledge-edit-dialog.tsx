"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  card: {
    id: string;
    title: string;
    topicId: string;
    difficulty: number;
    source: string | null;
    tags: string;
    problemSolved: string | null;
    corePrinciple: string | null;
    differences: string | null;
    commonMistakes: string | null;
    codeExample: string | null;
    interviewQs: string | null;
    pdfPath?: string | null;
    pdfPage?: number | null;
  };
}

export function KnowledgeEditDialog({ card }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pdfs, setPdfs] = useState<string[]>([]);
  const [form, setForm] = useState({
    ...card,
    pdfPath: card.pdfPath ?? "",
    pdfPage: card.pdfPage ?? null as number | null,
  });

  useEffect(() => {
    if (open && pdfs.length === 0) {
      fetch("/api/pdf-list")
        .then((r) => r.json())
        .then((d) => setPdfs(d.pdfs ?? []))
        .catch(() => {});
    }
  }, [open, pdfs.length]);

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4 mr-1" />
        编辑
      </Button>
    );
  }

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/knowledge/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
          <h2 className="text-lg font-semibold">编辑知识卡片</h2>
          <button onClick={() => setOpen(false)} className="rounded-md p-1 hover:bg-accent">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>标题</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
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
            <div>
              <Label>来源</Label>
              <Input value={form.source ?? ""} onChange={(e) => setForm({ ...form, source: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label>Tags（逗号分隔）</Label>
              <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label className="flex items-center gap-1"><FileText className="h-3 w-3" /> 关联 PDF 书</Label>
              <Select
                value={form.pdfPath ?? ""}
                onChange={(e) => setForm({ ...form, pdfPath: e.target.value })}
              >
                <option value="">不关联</option>
                {pdfs.map((p) => (
                  <option key={p} value={p}>{p.length > 60 ? "…" + p.slice(-57) : p}</option>
                ))}
              </Select>
            </div>
            <div className="col-span-2">
              <Label>对应页码（可选）</Label>
              <Input
                type="number"
                min={1}
                value={form.pdfPage ?? ""}
                onChange={(e) => setForm({ ...form, pdfPage: e.target.value ? parseInt(e.target.value) : null })}
                placeholder="留空表示跳到首页"
              />
            </div>
          </div>
          <div>
            <Label>它解决什么问题？</Label>
            <Textarea value={form.problemSolved ?? ""} onChange={(e) => setForm({ ...form, problemSolved: e.target.value })} rows={2} />
          </div>
          <div>
            <Label>核心原理</Label>
            <Textarea value={form.corePrinciple ?? ""} onChange={(e) => setForm({ ...form, corePrinciple: e.target.value })} rows={2} />
          </div>
          <div>
            <Label>与类似概念的区别</Label>
            <Textarea value={form.differences ?? ""} onChange={(e) => setForm({ ...form, differences: e.target.value })} rows={2} />
          </div>
          <div>
            <Label>我容易犯的错误</Label>
            <Textarea value={form.commonMistakes ?? ""} onChange={(e) => setForm({ ...form, commonMistakes: e.target.value })} rows={2} />
          </div>
          <div>
            <Label>最小代码示例</Label>
            <Textarea value={form.codeExample ?? ""} onChange={(e) => setForm({ ...form, codeExample: e.target.value })} rows={4} />
          </div>
          <div>
            <Label>面试问题</Label>
            <Textarea value={form.interviewQs ?? ""} onChange={(e) => setForm({ ...form, interviewQs: e.target.value })} rows={2} />
          </div>
        </div>

        <div className="sticky bottom-0 flex justify-end gap-2 border-t bg-card p-4">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>取消</Button>
          <Button onClick={handleSave} disabled={loading}>{loading ? "保存中..." : "保存"}</Button>
        </div>
      </div>
    </div>
  );
}
