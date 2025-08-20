"use client";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="card w-full max-w-2xl p-10 text-center">
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="h-10 w-10 rounded-full bg-blue-500" />
          <span className="text-2xl font-semibold">deepseek</span>
        </div>
        <p className="text-gray-600 mb-8">我是 DeepSeek，很高兴见到你！</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/chat" className="btn-primary">
            进入聊天
          </Link>
          <Link href="/prompts" className="btn-primary">
            提示词工程
          </Link>
        </div>
        <div className="mt-6 text-sm text-gray-500">
          还没有账号？
          <Link className="text-blue-600 ml-1" href="/sign_up">
            注册
          </Link>
          ，或
          <Link className="text-blue-600 ml-1" href="/sign_in">
            登录
          </Link>
        </div>
      </div>
    </main>
  );
}
