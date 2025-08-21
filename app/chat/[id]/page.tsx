"use client";
import { useEffect, useRef, useState } from "react";

import MessageBubble from "@/components/chat/MessageBubble";
import { Textarea, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type SearchResult = {
  title: string;
  url: string;
  snippet: string;
  publishedDate?: string;
};

type SearchResponse = {
  results: SearchResult[];
  query: string;
  total: number;
};

type Message = {
  id: string;
  role: string;
  content: string;
  reasoning?: string;
  model?: string;
  searchResults?: SearchResponse;
};

export default function ChatPage({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [useReasoning, setUseReasoning] = useState(false);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);
  const [selectedSearchResults, setSelectedSearchResults] =
    useState<SearchResponse | null>(null);
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
      body: JSON.stringify({
        content: userContent,
        useReasoning,
        useWebSearch,
      }),
    });
    if (!res.ok || !res.body) return;
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let contentAcc = "";
    let reasoningAcc = "";
    let searchResults: SearchResponse | undefined = undefined;
    const tempId = `temp-${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        role: "assistant",
        content: "",
        reasoning: useReasoning ? "" : undefined,
        model: useReasoning ? "deepseek-reasoner" : "deepseek-chat",
        searchResults: undefined,
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

            if (data.type === "search_results") {
              searchResults = data.data;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === tempId ? { ...m, searchResults: searchResults } : m
                )
              );
            } else if (data.type === "reasoning") {
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

  const handleSearchResultsClick = (searchResults: SearchResponse) => {
    setSelectedSearchResults(searchResults);
    setSearchDrawerOpen(true);
  };

  return (
    <div className="h-full flex flex-col">
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-6 py-6 space-y-6 mx-auto max-w-4xl"
      >
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
              searchResults={m.searchResults}
              onSearchResultsClick={handleSearchResultsClick}
            />
          ))
        )}
      </div>
      <div className="border-t border-gray-100 p-4">
        <div className="mx-auto max-w-4xl">
          {/* 功能开关 */}
          <div className="flex items-center gap-6 mb-3">
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

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useWebSearch}
                onChange={(e) => setUseWebSearch(e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-600">🌐 联网搜索</span>
              <span className="text-xs text-gray-400">(获取实时信息)</span>
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
                useReasoning
                  ? "bg-purple-600 hover:bg-purple-700"
                  : useWebSearch
                  ? "bg-green-600 hover:bg-green-700"
                  : ""
              }
            >
              <div className="min-w-20 min-h-20 flex items-center justify-center">
                {useReasoning ? "🧠 思考" : useWebSearch ? "🌐 搜索" : "发送"}
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* 搜索结果抽屉 */}
      {searchDrawerOpen && selectedSearchResults && (
        <div className="fixed inset-0 z-50">
          {/* 背景遮罩 */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setSearchDrawerOpen(false)}
          />

          {/* 抽屉内容 */}
          <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl">
            <div className="flex flex-col h-full">
              {/* 头部 */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    搜索结果
                  </h3>
                  <p className="text-sm text-gray-500">
                    为「{selectedSearchResults.query}」找到{" "}
                    {selectedSearchResults.total} 条结果
                  </p>
                </div>
                <button
                  onClick={() => setSearchDrawerOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* 搜索结果列表 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedSearchResults.results.map((result, index) => (
                  <div
                    key={index}
                    className="group border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => window.open(result.url, "_blank")}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {result.title}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-3">
                          {result.snippet}
                        </p>
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                            {new URL(result.url).hostname}
                          </span>
                          {result.publishedDate && (
                            <span className="text-xs text-gray-400 ml-2">
                              {result.publishedDate}
                            </span>
                          )}
                        </div>
                      </div>
                      <svg
                        className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors ml-2 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
