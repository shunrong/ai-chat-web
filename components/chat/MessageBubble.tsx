import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { memo } from "react";

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
    const match = /language-(\w+)/.exec(className || "");
    return !inline ? (
      <pre className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto my-4">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    ) : (
      <code
        className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono"
        {...props}
      >
        {children}
      </code>
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
}: {
  role: "user" | "assistant" | "system";
  content: string;
}) {
  const isAssistant = role === "assistant";

  return (
    <div className="flex gap-3">
      <div className="max-w-3xl prose prose-slate dark:prose-invert">
        <div className="text-sm text-gray-500 mb-1">
          {isAssistant ? "DeepSeek" : "你"}
        </div>
        <ReactMarkdown
          remarkPlugins={remarkPlugins}
          rehypePlugins={rehypePlugins}
          components={components}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
});

export default MessageBubble;
