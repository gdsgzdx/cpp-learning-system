// PDF URL 工具函数（服务端和客户端都可使用，无 "use client" 限制）
/**
 * 生成 PDF 阅读链接。浏览器 PDF 阅读器支持 #page=N 跳转。
 * @param pdfPath PDF 文件名（来自 book_pdf 目录）
 * @param pdfPage 可选的页码
 */
export function buildPdfUrl(pdfPath: string, pdfPage?: number | null): string {
  // 路径用 encodeURIComponent 编码每个段（保持 / 分隔符）
  const encoded = pdfPath
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
  const base = `/api/pdf/${encoded}`;
  return pdfPage ? `${base}#page=${pdfPage}` : base;
}
