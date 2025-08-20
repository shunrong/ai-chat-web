import Link from "next/link";

export default function ChatIndexPage() {
  return (
    <div className="h-full grid place-items-center">
      <div className="text-center px-6">
        <div className="mb-4 text-2xl font-semibold">
          我是 DeepSeek，很高兴见到你！
        </div>
        <Link href="/chat/new" className="btn-primary">
          新建对话
        </Link>
      </div>
    </div>
  );
}
