import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import SessionProvider from "@/components/providers/SessionProvider";

export const metadata: Metadata = {
  title: "Deepseek Chat - Web",
  description: "Deepseek-like AI chat app",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
