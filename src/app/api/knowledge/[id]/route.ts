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
    const allowed = [
      "title", "topicId", "difficulty", "source", "tags",
      "problemSolved", "corePrinciple", "differences",
      "commonMistakes", "codeExample", "interviewQs",
      "pdfPath", "pdfPage",
    ];
    const data: Record<string, unknown> = {};
    for (const k of allowed) {
      if (k in body) data[k] = body[k];
    }
    // 防御：先查确认属于当前用户，再更新
    const exist = await prisma.knowledgeCard.findFirst({ where: { id: params.id, userId: user.id } });
    if (!exist) return NextResponse.json({ error: "未找到" }, { status: 404 });

    // 若修改 topicId，验证新 topic 属于当前用户
    if (data.topicId) {
      const topic = await prisma.topic.findFirst({ where: { id: data.topicId as string, userId: user.id } });
      if (!topic) return NextResponse.json({ error: "Topic 不存在" }, { status: 400 });
    }

    const card = await prisma.knowledgeCard.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(card);
  } catch (error: any) {
    if (error?.status === 401) return NextResponse.json({ error: "未登录" }, { status: 401 });
    console.error("PATCH /api/knowledge/[id] error:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser();
    const card = await prisma.knowledgeCard.findFirst({ where: { id: params.id, userId: user.id } });
    if (!card) return NextResponse.json({ error: "未找到" }, { status: 404 });
    await prisma.knowledgeCard.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error?.status === 401) return NextResponse.json({ error: "未登录" }, { status: 401 });
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser();
    const card = await prisma.knowledgeCard.findFirst({
      where: { id: params.id, userId: user.id },
      include: {
        topic: true,
        recallQuestions: true,
        reviewRecords: { orderBy: { reviewedAt: "desc" }, take: 20 },
      },
    });
    if (!card) return NextResponse.json({ error: "未找到" }, { status: 404 });
    return NextResponse.json(card);
  } catch (error: any) {
    if (error?.status === 401) return NextResponse.json({ error: "未登录" }, { status: 401 });
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}
