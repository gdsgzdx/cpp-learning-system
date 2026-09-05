import { Library, Plus, FileText, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { AddResourceDialog } from "@/components/resources/add-resource-dialog";
import { DeleteResourceButton } from "@/components/resources/delete-resource-button";
import { EditResourceDialog } from "@/components/resources/edit-resource-dialog";
import { buildPdfUrl } from "@/lib/pdf-utils";

export default async function ResourcesPage() {
  const user = await requireUser();
  const resources = await prisma.resource.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  const typeLabels: Record<string, string> = {
    book: "书籍",
    video: "视频",
    course: "课程",
    blog: "博客",
    doc: "文档",
  };

  return (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Library className="h-6 w-6" />
            学习资源
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            管理书籍、视频、课程等学习资源 · 点击书籍可直接在浏览器打开 PDF
          </p>
        </div>
        <AddResourceDialog />
      </div>

      {/* 按类型分组 */}
      {resources.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            还没有资源。点击"添加资源"开始管理。
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {resources.map((r) => (
            <Card key={r.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{typeLabels[r.type] ?? r.type}</Badge>
                      {r.author && <span className="text-xs text-muted-foreground">· {r.author}</span>}
                    </div>
                    <CardTitle className="text-base">
                      {r.url ? (
                        <a href={r.url} target="_blank" rel="noopener" className="hover:text-primary">
                          {r.title}
                        </a>
                      ) : (
                        r.title
                      )}
                    </CardTitle>
                    {r.chapter && (
                      <p className="text-xs text-muted-foreground mt-1">
                        📖 当前: {r.chapter}
                        {r.currentPage && r.totalPages && (
                          <span> · 第 {r.currentPage}/{r.totalPages} 页</span>
                        )}
                      </p>
                    )}
                  </div>
                  <DeleteResourceButton id={r.id} />
                  <EditResourceDialog resource={r} />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* 书籍类型：显示 PDF 跳转 */}
                {r.type === "book" && r.pdfPath && (
                  <div className="flex items-center gap-2 mb-1">
                    <a
                      href={buildPdfUrl(r.pdfPath, r.currentPage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      {r.currentPage ? `继续阅读（第 ${r.currentPage} 页）` : "打开 PDF"}
                      <ExternalLink className="h-3 w-3 opacity-50" />
                    </a>
                  </div>
                )}

                {r.type === "book" && !r.pdfPath && (
                  <p className="text-xs text-muted-foreground italic">
                    未关联 PDF · 可在编辑中关联 book_pdf 目录中的文件
                  </p>
                )}

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">进度</span>
                  <span className="font-mono">{r.progress}%</span>
                </div>
                <Progress value={r.progress} />

                {r.notes && (
                  <p className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap">{r.notes}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
