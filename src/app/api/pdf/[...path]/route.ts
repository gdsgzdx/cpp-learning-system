// PDF 文件访问 API
// 安全地从 book_pdf 目录提供 PDF 文件，支持范围请求（浏览器跳转）
import { NextRequest, NextResponse } from "next/server";
import { promises as fs, createReadStream, statSync } from "fs";
import path from "path";

// 解析页码到 PDF 文件字节偏移（用于浏览器 URL #page=N 跳转）
// 注意：实际 PDF 阅读器通过 #page= N&zoom=... 实现跳转，不需要服务端解析
// 这个路由主要做：路径校验 + 流式返回 + Range 支持

const BOOK_PDF_DIR = path.join(process.cwd(), "book_pdf");

// 防止目录穿越
function safePath(filename: string): string | null {
  // 禁止 .. 和绝对路径
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return null;
  }
  if (filename.startsWith("/") || /^[a-zA-Z]:/.test(filename)) {
    return null;
  }
  const fullPath = path.join(BOOK_PDF_DIR, filename);
  // 必须解析后仍在 BOOK_PDF_DIR 内
  const resolved = path.resolve(fullPath);
  if (!resolved.startsWith(path.resolve(BOOK_PDF_DIR) + path.sep) && resolved !== path.resolve(BOOK_PDF_DIR)) {
    return null;
  }
  return resolved;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const filename = decodeURIComponent(params.path.join("/"));
  const filePath = safePath(filename);
  if (!filePath) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  let stat;
  try {
    stat = statSync(filePath);
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }

  const fileSize = stat.size;
  const range = request.headers.get("range");

  // 设置允许 PDF 阅读器内嵌展示的 header
  const headers: Record<string, string> = {
    "Content-Type": "application/pdf",
    "Accept-Ranges": "bytes",
    "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(filename)}`,
    "Cache-Control": "private, max-age=3600",
  };

  // 处理 Range 请求（PDF 阅读器会发起）
  if (range) {
    const match = /bytes=(\d+)-(\d*)/.exec(range);
    if (match) {
      const start = parseInt(match[1], 10);
      const end = match[2] ? parseInt(match[2], 10) : Math.min(start + 1024 * 1024 - 1, fileSize - 1);
      if (start >= fileSize) {
        return new NextResponse("Range Not Satisfiable", { status: 416 });
      }
      const chunkSize = end - start + 1;
      headers["Content-Range"] = `bytes ${start}-${end}/${fileSize}`;
      headers["Content-Length"] = String(chunkSize);
      const stream = createReadStream(filePath, { start, end });
      // @ts-ignore - NextResponse 支持 Web Stream
      return new NextResponse(stream as any, { status: 206, headers });
    }
  }

  headers["Content-Length"] = String(fileSize);
  const stream = createReadStream(filePath);
  // @ts-ignore
  return new NextResponse(stream as any, { status: 200, headers });
}

// 列出所有可用 PDF（用于前端选择器）
export async function POST() {
  try {
    const files = await fs.readdir(BOOK_PDF_DIR);
    const pdfs = files.filter((f) => f.toLowerCase().endsWith(".pdf"));
    return NextResponse.json({ pdfs });
  } catch {
    return NextResponse.json({ pdfs: [] });
  }
}
