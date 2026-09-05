import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

/** 返回当前登录用户（供前端 Header 显示），未登录返回 null */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
    },
  });
}
