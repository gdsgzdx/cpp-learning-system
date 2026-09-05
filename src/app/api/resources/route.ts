import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const ALLOWED = [
  "type", "title", "url", "author", "progress",
  "chapter", "notes", "relatedCardIds",
  "pdfPath", "totalPages", "currentPage",
];

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const data: Record<string, unknown> = { userId: user.id };
    for (const k of ALLOWED) {
      if (k in body) data[k] = body[k];
    }
    const resource = await prisma.resource.create({ data: data as any });
    return NextResponse.json(resource);
  } catch (error: any) {
    if (error?.status === 401) return NextResponse.json({ error: "未登录" }, { status: 401 });
    console.error("POST /api/resources error:", error);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await requireUser();
    const list = await prisma.resource.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(list);
  } catch (error: any) {
    if (error?.status === 401) return NextResponse.json({ error: "未登录" }, { status: 401 });
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}
