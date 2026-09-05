import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const ALLOWED = [
  "type", "title", "url", "author", "progress",
  "chapter", "notes", "relatedCardIds",
  "pdfPath", "totalPages", "currentPage",
];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const data: Record<string, unknown> = {};
    for (const k of ALLOWED) {
      if (k in body) data[k] = body[k];
    }
    const exist = await prisma.resource.findFirst({ where: { id: params.id, userId: user.id } });
    if (!exist) return NextResponse.json({ error: "未找到" }, { status: 404 });
    const resource = await prisma.resource.update({ where: { id: params.id }, data });
    return NextResponse.json(resource);
  } catch (error: any) {
    if (error?.status === 401) return NextResponse.json({ error: "未登录" }, { status: 401 });
    console.error("PATCH /api/resources/[id] error:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser();
    const exist = await prisma.resource.findFirst({ where: { id: params.id, userId: user.id } });
    if (!exist) return NextResponse.json({ error: "未找到" }, { status: 404 });
    await prisma.resource.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error?.status === 401) return NextResponse.json({ error: "未登录" }, { status: 401 });
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
