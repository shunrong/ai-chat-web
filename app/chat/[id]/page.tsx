"use client";
import { useEffect, useRef, useState } from "react";
import MessageBubble from "@/components/chat/MessageBubble";
import { Textarea, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type Message = { id: string; role: string; content: string };

export default function ChatPage({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
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
      body: JSON.stringify({ content: userContent }),
    });
    if (!res.ok || !res.body) return;
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let acc = "";
    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: tempId, role: "assistant", content: "" },
    ]);
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      acc += decoder.decode(value, { stream: true });
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, content: acc } : m))
      );
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
            />
          ))
        )}
      </div>
      <div className="border-t border-gray-100 p-4">
        <div className="mx-auto max-w-3xl flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={3}
            placeholder="给 DeepSeek 发送消息"
            className="resize-none"
          />
          <Button onClick={send}>发送</Button>
        </div>
      </div>
    </div>
  );
}
