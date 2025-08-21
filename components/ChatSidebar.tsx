"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";

type ChatItem = { id: string; title: string };

export default function ChatSidebar() {
  const { data: session } = useSession();
  const [items, setItems] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/chat");
      const data = await res.json();
      setItems(data.items || []);
      setLoading(false);
    })();
  }, []);

  return (
    <aside className="w-72 border-r border-gray-100 p-3 flex flex-col">
      <button
        className="btn-primary mb-3"
        onClick={async () => {
          const res = await fetch("/api/chat", { method: "POST" });
          const data = await res.json();
          location.href = `/chat/${data.id}`;
        }}
      >
        开启新对话
      </button>
      <div className="text-xs text-gray-500 mb-2">最近</div>
      <div className="flex-1 overflow-y-auto space-y-1">
        {loading ? (
          <div className="text-gray-400 text-sm">加载中...</div>
        ) : (
          items.map((i) => (
            <Link
              key={i.id}
              href={`/chat/${i.id}`}
              className="block rounded-md px-3 py-2 hover:bg-gray-100 text-sm"
            >
              {i.title}
            </Link>
          ))
        )}
      </div>

      {/* 用户信息区域 - 侧边栏底部 */}
      {session && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            {/* 圆形头像 */}
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
              {session.user?.name
                ? session.user.name.charAt(0).toUpperCase()
                : session.user?.phone
                ? session.user.phone.slice(-2)
                : "U"}
            </div>

            {/* 用户信息 */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {session.user?.name || session.user?.phone || "用户"}
              </div>
              <div className="text-xs text-gray-500">在线</div>
            </div>

            {/* 退出登录按钮 */}
            <button
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              title="退出登录"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
