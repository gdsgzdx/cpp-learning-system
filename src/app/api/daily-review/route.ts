import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const { date, totalStudyTime, topThree, stuckAt, biggestMistake, tomorrowFocus } = body;

    const dateObj = date ? new Date(date) : new Date();
    dateObj.setHours(0, 0, 0, 0);

    const review = await prisma.dailyReview.upsert({
      where: { userId_date: { userId: user.id, date: dateObj } },
      update: {
        totalStudyTime: totalStudyTime ?? 0,
        topThree,
        stuckAt,
        biggestMistake,
        tomorrowFocus,
      },
      create: {
        userId: user.id,
        date: dateObj,
        totalStudyTime: totalStudyTime ?? 0,
        topThree,
        stuckAt,
        biggestMistake,
        tomorrowFocus,
      },
    });
    return NextResponse.json(review);
  } catch (error: any) {
    if (error?.status === 401) return NextResponse.json({ error: "未登录" }, { status: 401 });
    console.error("POST /api/daily-review error:", error);
    return NextResponse.json({ error: "保存失败" }, { status: 500 });
  }
}
