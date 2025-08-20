"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type ChatItem = { id: string; title: string };

export default function ChatSidebar() {
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
    </aside>
  );
}
