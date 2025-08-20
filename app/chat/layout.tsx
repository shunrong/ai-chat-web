import { ReactNode } from "react";
import ChatSidebar from "@/components/ChatSidebar";

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen grid grid-cols-[18rem_1fr]">
      <ChatSidebar />
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}
