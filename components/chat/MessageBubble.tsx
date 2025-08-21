import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { memo, useState } from "react";

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

// 预定义插件，避免每次渲染都创建新数组
const remarkPlugins = [remarkGfm];
const rehypePlugins = [rehypeHighlight];

// 自定义组件，确保标题样式正确渲染
const components = {
  // 标题组件 - 对应 Markdown 的 # ## ### #### ##### ######
  h1: ({ children }: any) => (
    <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-xl font-semibold mt-5 mb-3 text-gray-900 dark:text-gray-100">
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-lg font-medium mt-4 mb-2 text-gray-900 dark:text-gray-100">
      {children}
    </h3>
  ),
  h4: ({ children }: any) => (
    <h4 className="text-base font-medium mt-3 mb-2 text-gray-900 dark:text-gray-100">
      {children}
    </h4>
  ),
  h5: ({ children }: any) => (
    <h5 className="text-sm font-medium mt-3 mb-1 text-gray-900 dark:text-gray-100">
      {children}
    </h5>
  ),
  h6: ({ children }: any) => (
    <h6 className="text-xs font-medium mt-2 mb-1 text-gray-700 dark:text-gray-300">
      {children}
    </h6>
  ),

  // 代码块组件
  code: ({ node, inline, className, children, ...props }: any) => {
    return className ? (
      <pre className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto my-4">
        <code {...props}>{children}</code>
      </pre>
    ) : (
      <span
        className=" bg-gray-100 dark:bg-gray-800  p-2 rounded-md overflow-x-auto text-sm"
        {...props}
      >
        {children}
      </span>
    );
  },

  // 段落组件
  p: ({ children }: any) => (
    <p className="my-3 text-gray-700 dark:text-gray-300 leading-relaxed">
      {children}
    </p>
  ),

  // 列表组件
  ul: ({ children }: any) => (
    <ul className="list-disc pl-6 my-4 space-y-1">{children}</ul>
  ),
  ol: ({ children }: any) => (
    <ol className="list-decimal pl-6 my-4 space-y-1">{children}</ol>
  ),
  li: ({ children }: any) => (
    <li className="text-gray-700 dark:text-gray-300">{children}</li>
  ),

  // 引用块
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-gray-50 dark:bg-gray-800 italic">
      {children}
    </blockquote>
  ),

  // 表格组件
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
        {children}
      </table>
    </div>
  ),
  th: ({ children }: any) => (
    <th className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 font-semibold text-left">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
      {children}
    </td>
  ),

  // 链接组件
  a: ({ children, href }: any) => (
    <a
      href={href}
      className="text-blue-600 dark:text-blue-400 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),

  // 强调组件
  strong: ({ children }: any) => (
    <strong className="font-bold text-gray-900 dark:text-gray-100">
      {children}
    </strong>
  ),
  em: ({ children }: any) => (
    <em className="italic text-gray-800 dark:text-gray-200">{children}</em>
  ),
};

const MessageBubble = memo(function MessageBubble({
  role,
  content,
  reasoning,
  model,
  searchResults,
  onSearchResultsClick,
}: {
  role: "user" | "assistant" | "system";
  content: string;
  reasoning?: string;
  model?: string;
  searchResults?: SearchResponse;
  onSearchResultsClick?: (searchResults: SearchResponse) => void;
}) {
  // 简化逻辑：有 reasoning 但没有 content 就是正在思考
  const isThinking = Boolean(reasoning !== undefined && !content);
  const isAssistant = role === "assistant";
  const [showReasoning, setShowReasoning] = useState(isThinking);

  return (
    <div className="flex gap-3">
      <div className="flex-1 max-w-none">
        {/* 标题栏 */}
        <div className="text-sm text-gray-500 mb-2 flex items-center gap-2">
          <span>{isAssistant ? "DeepSeek" : "你"}</span>
          {model === "deepseek-reasoner" && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              🧠 推理模式
            </span>
          )}
        </div>

        {/* 搜索结果展示 */}
        {isAssistant && searchResults && searchResults.results.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => onSearchResultsClick?.(searchResults)}
              className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors cursor-pointer group w-full text-left"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      🌐 已搜索 {searchResults.total} 条结果
                    </span>
                    <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded">
                      点击查看详情
                    </span>
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                    查询：「{searchResults.query}」
                  </div>
                </div>
              </div>
              <svg
                className="w-4 h-4 text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        )}

        {/* 思考过程 */}
        {isAssistant && reasoning !== undefined && (
          <div className="mb-4">
            {isThinking ? (
              // 正在思考中的状态
              <div
                className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400"
                onClick={() => setShowReasoning(!showReasoning)}
              >
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-base">🧐</span>
                </div>
                <span className="font-medium">正在深度思考中...</span>
                <div className="flex gap-1">
                  <div
                    className="w-1 h-1 bg-purple-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-1 h-1 bg-purple-600 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-1 h-1 bg-purple-600 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            ) : (
              // 思考完成，显示可切换的按钮
              <>
                <button
                  onClick={() => setShowReasoning(!showReasoning)}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  <span className="text-base">🧐</span>
                  <span>{showReasoning ? "隐藏思考过程" : "查看思考过程"}</span>
                  <span
                    className={`transform transition-transform ${
                      showReasoning ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>
              </>
            )}
            {isAssistant && showReasoning && (
              <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="text-sm text-blue-700 dark:text-blue-300 mb-2 font-medium">
                  🧐 AI 的思考过程：
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={remarkPlugins}
                    rehypePlugins={rehypePlugins}
                    components={components}
                  >
                    {reasoning}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 最终回答 */}
        {content && (
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={remarkPlugins}
              rehypePlugins={rehypePlugins}
              components={components}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
});

export default MessageBubble;
