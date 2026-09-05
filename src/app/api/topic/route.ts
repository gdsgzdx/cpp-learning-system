import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireUser();
    const topics = await prisma.topic.findMany({
      where: { userId: user.id },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    });
    return NextResponse.json(topics);
  } catch (e: any) {
    if (e?.status === 401) return NextResponse.json({ error: "未登录" }, { status: 401 });
    console.error("GET /api/topic error:", e);
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const { name, icon, description, parentId, order } = body;
    if (!name) return NextResponse.json({ error: "name 必填" }, { status: 400 });

    const topic = await prisma.topic.create({
      data: {
        userId: user.id,
        name,
        icon: icon ?? null,
        description: description ?? null,
        parentId: parentId ?? null,
        order: order ?? 0,
      },
    });
    return NextResponse.json(topic);
  } catch (e: any) {
    if (e?.status === 401) return NextResponse.json({ error: "未登录" }, { status: 401 });
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
