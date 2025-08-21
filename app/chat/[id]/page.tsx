"use client";
import { useEffect, useRef, useState } from "react";
import MessageBubble from "@/components/chat/MessageBubble";
import { Textarea, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type Message = {
  id: string;
  role: string;
  content: string;
  reasoning?: string;
  model?: string;
};

export default function ChatPage({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [useReasoning, setUseReasoning] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/chat/${params.id}`);
      const data = await res.json();
      setMessages(data.messages || []);
    })();
  }, [params.id]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  async function send() {
    if (!input.trim()) return;
    const userContent = input;
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: Math.random().toString(), role: "user", content: userContent },
    ]);
    const res = await fetch(`/api/chat/${params.id}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: userContent, useReasoning }),
    });
    if (!res.ok || !res.body) return;
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let contentAcc = "";
    let reasoningAcc = "";
    const tempId = `temp-${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        role: "assistant",
        content: "",
        reasoning: useReasoning ? "" : undefined,
        model: useReasoning ? "deepseek-reasoner" : "deepseek-chat",
      },
    ]);

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));

            if (data.type === "reasoning") {
              reasoningAcc += data.content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === tempId ? { ...m, reasoning: reasoningAcc } : m
                )
              );
            } else if (data.type === "content") {
              contentAcc += data.content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === tempId ? { ...m, content: contentAcc } : m
                )
              );
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div ref={listRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500">开始你的第一条对话吧~</div>
        ) : (
          messages.map((m) => (
            <MessageBubble
              key={m.id}
              role={m.role as any}
              content={m.content}
              reasoning={m.reasoning}
              model={m.model}
            />
          ))
        )}
      </div>
      <div className="border-t border-gray-100 p-4">
        <div className="mx-auto max-w-3xl">
          {/* 深度思考开关 */}
          <div className="flex items-center mb-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useReasoning}
                onChange={(e) => setUseReasoning(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">🧠 深度思考</span>
              <span className="text-xs text-gray-400">(使用推理模型)</span>
            </label>
          </div>

          {/* 消息输入区 */}
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={3}
              placeholder={
                useReasoning
                  ? "问一个需要深度思考的问题..."
                  : "给 DeepSeek 发送消息"
              }
              className="resize-none"
            />
            <Button
              onClick={send}
              className={
                useReasoning ? "bg-purple-600 hover:bg-purple-700" : ""
              }
            >
              {useReasoning ? "🧠 思考" : "发送"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
