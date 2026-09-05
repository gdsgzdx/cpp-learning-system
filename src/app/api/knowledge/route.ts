import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const {
      title, topicId, difficulty = 3, source, tags = "",
      problemSolved, corePrinciple, differences, commonMistakes,
      codeExample, interviewQs,
    } = body;

    if (!title || !topicId) {
      return NextResponse.json({ error: "title 和 topicId 必填" }, { status: 400 });
    }

    // 验证 topicId 属于当前用户
    const topic = await prisma.topic.findFirst({ where: { id: topicId, userId: user.id } });
    if (!topic) {
      return NextResponse.json({ error: "Topic 不存在" }, { status: 400 });
    }

    const card = await prisma.knowledgeCard.create({
      data: {
        userId: user.id,
        title,
        topicId,
        difficulty,
        source,
        tags,
        problemSolved,
        corePrinciple,
        differences,
        commonMistakes,
        codeExample,
        interviewQs,
      },
    });

    return NextResponse.json(card);
  } catch (error: any) {
    if (error?.status === 401) return NextResponse.json({ error: "未登录" }, { status: 401 });
    console.error("POST /api/knowledge error:", error);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await requireUser();
    const cards = await prisma.knowledgeCard.findMany({
      where: { userId: user.id },
      include: {
        topic: true,
        _count: { select: { recallQuestions: true, reviewRecords: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(cards);
  } catch (error: any) {
    if (error?.status === 401) return NextResponse.json({ error: "未登录" }, { status: 401 });
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}
