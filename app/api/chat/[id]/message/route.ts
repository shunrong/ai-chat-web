import { dataSource } from "@/lib/data-source";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { createDeepseekClient } from "@/lib/deepseek";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return new NextResponse("Unauthorized", { status: 401 });
  const { content } = await req.json();
  if (!content) return new NextResponse("Bad Request", { status: 400 });

  try {
    await dataSource.createUserMessage(
      session.user.id as string,
      params.id,
      content
    );
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let assistantText = "";
      try {
        const client = createDeepseekClient();
        const messages = await dataSource.getChatMessages(
          session.user.id as string,
          params.id
        );
        const history = messages.map((m) => ({
          role: m.role as any,
          content: m.content,
        }));
        history.push({ role: "user" as const, content });
        const completion = await client.chat.completions.create({
          model: "deepseek-chat",
          messages: history as any,
          stream: true,
        });
        for await (const part of completion) {
          const delta = part.choices?.[0]?.delta?.content || "";
          if (delta) {
            assistantText += delta;
            controller.enqueue(encoder.encode(delta));
          }
        }
        await dataSource.createAssistantMessage(
          session.user.id as string,
          params.id,
          assistantText
        );
      } catch (e) {
        controller.error(e);
        return;
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
