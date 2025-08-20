import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

export default function MessageBubble({
  role,
  content,
}: {
  role: "user" | "assistant" | "system";
  content: string;
}) {
  const isAssistant = role === "assistant";
  return (
    <div className="flex gap-3">
      <div
        className={`h-8 w-8 rounded-full ${
          isAssistant ? "bg-blue-500" : "bg-gray-300"
        }`}
      />
      <div className="max-w-3xl prose prose-slate dark:prose-invert">
        <div className="text-sm text-gray-500 mb-1">
          {isAssistant ? "DeepSeek" : "你"}
        </div>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
