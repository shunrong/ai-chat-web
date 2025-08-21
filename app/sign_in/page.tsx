"use client";
import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import AuthCard from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SignInPage() {
  const [tab, setTab] = useState<"otp" | "password">("otp");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", {
      phone,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.ok) {
      location.href = "/chat";
    } else {
      alert(res?.error || "登录失败");
    }
  }

  async function submitOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("otp", { phone, code, redirect: false });
    setLoading(false);
    if (res?.ok) {
      location.href = "/chat";
    } else {
      // 提示具体错误，便于定位 401 的原因
      alert(res?.error || "登录失败，请检查手机号与验证码是否正确/未过期");
    }
  }

  return (
    <main className="min-h-screen grid place-items-center px-4">
      <AuthCard
        title="登录 Deepseek"
        footer={
          <>
            没有账号？
            <Link className="text-blue-600" href="/sign_up">
              {" "}
              立即注册{" "}
            </Link>
          </>
        }
      >
        <div className="flex justify-center gap-6 mb-6 text-sm">
          <button
            className={
              tab === "otp" ? "text-blue-600 font-medium" : "text-gray-500"
            }
            onClick={() => setTab("otp")}
          >
            验证码登录
          </button>
          <button
            className={
              tab === "password" ? "text-blue-600 font-medium" : "text-gray-500"
            }
            onClick={() => setTab("password")}
          >
            密码登录
          </button>
        </div>
        {tab === "otp" ? (
          <form onSubmit={submitOtp} className="space-y-4">
            <Input
              placeholder="请输入手机号"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <div className="flex gap-2">
              <Input
                className="flex-1"
                placeholder="请输入验证码"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <Button
                type="button"
                onClick={async () => {
                  const res = await fetch("/api/auth/send-otp", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ phone }),
                  });
                  if (!res.ok) return alert("发送失败");
                  const data = await res.json();
                  alert("验证码已发送");
                }}
              >
                发送验证码
              </Button>
            </div>
            <Button className="w-full" disabled={loading}>
              {loading ? "登录中..." : "登录"}
            </Button>
          </form>
        ) : (
          <form onSubmit={submitPassword} className="space-y-4">
            <Input
              placeholder="请输入手机号"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button className="w-full" disabled={loading}>
              {loading ? "登录中..." : "登录"}
            </Button>
          </form>
        )}
      </AuthCard>
    </main>
  );
}
