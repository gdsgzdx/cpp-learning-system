import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const { question, answer, difficulty = 3 } = body;
    if (!question || !answer) {
      return NextResponse.json({ error: "question 和 answer 必填" }, { status: 400 });
    }
    const card = await prisma.knowledgeCard.findFirst({ where: { id: params.id, userId: user.id } });
    if (!card) return NextResponse.json({ error: "卡片不存在" }, { status: 404 });
    const item = await prisma.recallQuestion.create({
      data: {
        knowledgeCardId: params.id,
        question,
        answer,
        difficulty,
      },
    });
    return NextResponse.json(item);
  } catch (error: any) {
    if (error?.status === 401) return NextResponse.json({ error: "未登录" }, { status: 401 });
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser();
    const card = await prisma.knowledgeCard.findFirst({ where: { id: params.id, userId: user.id } });
    if (!card) return NextResponse.json({ error: "卡片不存在" }, { status: 404 });
    const items = await prisma.recallQuestion.findMany({
      where: { knowledgeCardId: params.id },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(items);
  } catch (error: any) {
    if (error?.status === 401) return NextResponse.json({ error: "未登录" }, { status: 401 });
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}
