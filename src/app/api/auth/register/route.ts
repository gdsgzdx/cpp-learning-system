import { NextRequest, NextResponse } from "next/server";
import { registerUser, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password, name } = await req.json();
    const result = await registerUser(username, password, name);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    await setSessionCookie(result.token);
    return NextResponse.json({ ok: true, user: result.user });
  } catch (e) {
    console.error("POST /api/auth/register error:", e);
    return NextResponse.json({ error: "注册失败" }, { status: 500 });
  }
}
