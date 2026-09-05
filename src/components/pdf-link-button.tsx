// PDF 跳转链接按钮 - 点击跳转到对应书的对应页
"use client";

import { FileText, ExternalLink } from "lucide-react";
import { buildPdfUrl } from "@/lib/pdf-utils";

interface Props {
  pdfPath: string;
  pdfPage?: number | null;
  label?: string;
  variant?: "button" | "badge";
}

export function PdfLinkButton({ pdfPath, pdfPage, label, variant = "button" }: Props) {
  const href = buildPdfUrl(pdfPath, pdfPage);
  const display = label ?? (pdfPage ? `查看 PDF 第 ${pdfPage} 页` : "查看 PDF");

  if (variant === "badge") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs hover:bg-primary/20 transition-colors"
      >
        <FileText className="h-3 w-3" />
        {display}
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border bg-card hover:bg-accent transition-colors text-sm"
    >
      <FileText className="h-4 w-4" />
      {display}
      <ExternalLink className="h-3 w-3 opacity-50" />
    </a>
  );
}
