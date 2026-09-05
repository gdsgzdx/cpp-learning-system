import { NextRequest, NextResponse } from "next/server";
import { loginUser, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "用户名和密码不能为空" }, { status: 400 });
    }
    const result = await loginUser(username, password);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }
    await setSessionCookie(result.token);
    return NextResponse.json({ ok: true, user: result.user });
  } catch (e) {
    console.error("POST /api/auth/login error:", e);
    return NextResponse.json({ error: "登录失败" }, { status: 500 });
  }
}
