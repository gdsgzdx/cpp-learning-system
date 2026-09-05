import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const {
      leetcodeNumber, title, difficulty, url, pattern,
      status = "NotStarted",
      source, chapter, isHot = false,
      pdfPath, pdfPage,
    } = body;

    if (!leetcodeNumber || !title || !pattern || !difficulty) {
      return NextResponse.json({ error: "必填字段缺失" }, { status: 400 });
    }

    const problem = await prisma.leetcodeProblem.create({
      data: {
        userId: user.id,
        leetcodeNumber: parseInt(leetcodeNumber),
        title,
        difficulty,
        url,
        pattern,
        status,
        source,
        chapter,
        isHot,
        pdfPath,
        pdfPage: pdfPage ? parseInt(pdfPage) : null,
      },
    });
    return NextResponse.json(problem);
  } catch (error: any) {
    if (error?.status === 401) return NextResponse.json({ error: "未登录" }, { status: 401 });
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "题号已存在" }, { status: 409 });
    }
    console.error("POST /api/leetcode error:", error);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const pattern = searchParams.get("pattern") ?? undefined;
    const difficulty = searchParams.get("difficulty") ?? undefined;
    const status = searchParams.get("status") ?? undefined;
    const source = searchParams.get("source") ?? undefined;

    const problems = await prisma.leetcodeProblem.findMany({
      where: {
        userId: user.id,
        pattern: pattern && pattern !== "all" ? pattern : undefined,
        difficulty: difficulty && difficulty !== "all" ? difficulty : undefined,
        status: status && status !== "all" ? status : undefined,
        source: source && source !== "all" ? source : undefined,
      },
      orderBy: [{ isHot: "desc" }, { source: "asc" }, { leetcodeNumber: "asc" }],
    });
    return NextResponse.json(problems);
  } catch (error: any) {
    if (error?.status === 401) return NextResponse.json({ error: "未登录" }, { status: 401 });
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}
