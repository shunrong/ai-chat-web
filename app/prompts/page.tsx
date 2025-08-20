"use client";
import { useEffect, useState } from "react";

type Prompt = { id: string; title: string; content: string };

export default function PromptsPage() {
  const [items, setItems] = useState<Prompt[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/prompts");
      const data = await res.json();
      setItems(data.items || []);
    })();
  }, []);

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">提示词工程</h1>
        <p className="text-gray-500">管理常用提示词，快速插入到聊天。</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 card p-4">
          <div className="grid gap-3">
            <input
              className="input"
              placeholder="标题，如：深思考模式"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              rows={6}
              className="input"
              placeholder="提示词内容"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button
              className="btn-primary self-start"
              onClick={async () => {
                const res = await fetch("/api/prompts", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ title, content }),
                });
                if (res.ok) {
                  const data = await res.json();
                  setItems([data.item, ...items]);
                  setTitle("");
                  setContent("");
                } else {
                  alert("保存失败");
                }
              }}
            >
              保存
            </button>
          </div>
        </div>
        <div className="card p-4 max-h-[70vh] overflow-y-auto">
          <div className="text-sm text-gray-500 mb-2">我的提示词</div>
          <div className="space-y-3">
            {items.map((p) => (
              <div key={p.id} className="rounded-lg border border-gray-200 p-3">
                <div className="font-medium mb-1">{p.title}</div>
                <div className="text-sm text-gray-600 whitespace-pre-wrap">
                  {p.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
