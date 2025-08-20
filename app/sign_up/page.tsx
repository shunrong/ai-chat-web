"use client";
import Link from "next/link";
import { useState } from "react";
import AuthCard from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SignUpPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) return alert("两次输入的密码不一致");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password, code }),
      });
      if (!res.ok) throw new Error(await res.text());
      location.href = "/sign_in";
    } catch (e: any) {
      alert(e.message || "注册失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center px-4">
      <AuthCard
        title="注册 Deepseek"
        footer={
          <>
            已有账号？
            <Link className="text-blue-600" href="/sign_in">
              {" "}
              返回登录{" "}
            </Link>
          </>
        }
      >
        <form onSubmit={onSubmit} className="space-y-4">
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
          <Input
            type="password"
            placeholder="请再次输入密码"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
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
              className="whitespace-nowrap"
              onClick={async () => {
                const ok = await fetch("/api/auth/send-otp", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ phone }),
                });
                alert(ok.ok ? "验证码已发送(开发环境Mock)" : "发送失败");
              }}
            >
              发送验证码
            </Button>
          </div>
          <Button className="w-full" disabled={loading}>
            {loading ? "注册中..." : "注册"}
          </Button>
        </form>
      </AuthCard>
    </main>
  );
}
