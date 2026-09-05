import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser();
    const body = await req.json();
    // 验证所属卡片属于当前用户
    const exist = await prisma.recallQuestion.findFirst({
      where: { id: params.id, knowledgeCard: { userId: user.id } },
    });
    if (!exist) return NextResponse.json({ error: "未找到" }, { status: 404 });
    const item = await prisma.recallQuestion.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json(item);
  } catch (error: any) {
    if (error?.status === 401) return NextResponse.json({ error: "未登录" }, { status: 401 });
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser();
    const exist = await prisma.recallQuestion.findFirst({
      where: { id: params.id, knowledgeCard: { userId: user.id } },
    });
    if (!exist) return NextResponse.json({ error: "未找到" }, { status: 404 });
    await prisma.recallQuestion.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error?.status === 401) return NextResponse.json({ error: "未登录" }, { status: 401 });
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
