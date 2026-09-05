import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const { sessionType, topics, reviewCount, newTopicCount, leetcodeCount, reflection } = body;

    const session = await prisma.learningSession.create({
      data: {
        userId: user.id,
        sessionType: sessionType ?? "PRACTICE",
        topics: topics ?? "",
        reviewCount: reviewCount ?? 0,
        newTopicCount: newTopicCount ?? 0,
        leetcodeCount: leetcodeCount ?? 0,
        reflection,
        endTime: new Date(),
        duration: body.duration ?? 0,
      },
    });
    return NextResponse.json(session);
  } catch (error: any) {
    if (error?.status === 401) return NextResponse.json({ error: "未登录" }, { status: 401 });
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const { id, endTime, duration, reflection } = body;

    // 验证归属
    const exist = await prisma.learningSession.findFirst({ where: { id, userId: user.id } });
    if (!exist) return NextResponse.json({ error: "未找到" }, { status: 404 });

    const session = await prisma.learningSession.update({
      where: { id },
      data: {
        endTime: endTime ? new Date(endTime) : new Date(),
        duration,
        reflection,
      },
    });
    return NextResponse.json(session);
  } catch (error: any) {
    if (error?.status === 401) return NextResponse.json({ error: "未登录" }, { status: 401 });
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}
