// 列出 book_pdf 目录下的所有 PDF
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    const dir = path.join(process.cwd(), "book_pdf");
    const files = await fs.readdir(dir);
    const pdfs = files.filter((f) => f.toLowerCase().endsWith(".pdf"));
    return NextResponse.json({ pdfs });
  } catch (e: any) {
    return NextResponse.json({ pdfs: [], error: e.message }, { status: 500 });
  }
}
