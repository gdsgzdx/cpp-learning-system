import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { RegisterForm } from "@/components/auth/register-form";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <div className="min-h-screen flex items-center justify-center p-4 hero-gradient relative overflow-hidden">
      <div className="hero-blob hero-blob-1" />
      <div className="hero-blob hero-blob-2" />
      <div className="w-full max-w-sm space-y-6 relative">
        <div className="text-center space-y-3">
          <div className="sticker sticker-xl">🌟</div>
          <h1 className="text-2xl font-bold tracking-tight">加入我们</h1>
          <p className="text-sm text-muted-foreground">
            创建你的学习账号
          </p>
        </div>
        <RegisterForm />
        <p className="text-center text-xs text-muted-foreground">
          已有账号？{" "}
          <Link href="/login" className="text-primary hover:underline">
            去登录
          </Link>
        </p>
      </div>
    </div>
  );
}
