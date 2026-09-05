import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const { name, reviewRatio, dailyGoalMinutes, theme } = body;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(name !== undefined && { name }),
      ...(reviewRatio !== undefined && { reviewRatio }),
      ...(dailyGoalMinutes !== undefined && { dailyGoalMinutes }),
      ...(theme !== undefined && { theme }),
    },
  });
    return NextResponse.json({
      id: updated.id,
      username: updated.username,
      name: updated.name,
      reviewRatio: updated.reviewRatio,
      dailyGoalMinutes: updated.dailyGoalMinutes,
      theme: updated.theme,
    });
  } catch (error: any) {
    if (error?.status === 401) return NextResponse.json({ error: "未登录" }, { status: 401 });
    console.error("PATCH /api/user/settings error:", error);
    return NextResponse.json({ error: "更新失败", detail: error?.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await requireUser();
    return NextResponse.json({
      id: user.id,
      username: user.username,
      name: user.name,
      reviewRatio: user.reviewRatio,
      dailyGoalMinutes: user.dailyGoalMinutes,
      theme: user.theme,
    });
  } catch (error: any) {
    if (error?.status === 401) return NextResponse.json({ error: "未登录" }, { status: 401 });
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
