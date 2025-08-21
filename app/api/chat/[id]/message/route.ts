import { dataSource } from "@/lib/data-source";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import {
  createDeepseekClient,
  DEEPSEEK_MODELS,
  type DeepSeekModel,
} from "@/lib/deepseek";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return new NextResponse("Unauthorized", { status: 401 });
  const { content, useReasoning = false } = await req.json();
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
        const model: DeepSeekModel = useReasoning
          ? DEEPSEEK_MODELS.REASONING
          : DEEPSEEK_MODELS.CHAT;

        console.log(`[DEBUG] 使用模型: ${model}`);

        const completion = await client.chat.completions.create({
          model,
          messages: history as any,
          stream: true,
        });
        let reasoningText = "";

        for await (const part of completion) {
          // 处理推理过程（仅推理模型有）
          if (
            useReasoning &&
            (part.choices?.[0]?.delta as any)?.reasoning_content
          ) {
            const reasoning =
              (part.choices?.[0]?.delta as any)?.reasoning_content || "";
            if (reasoning) {
              reasoningText += reasoning;
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "reasoning",
                    content: reasoning,
                  })}\n\n`
                )
              );
            }
          }

          // 处理正常回答内容
          const delta = part.choices?.[0]?.delta?.content || "";
          if (delta) {
            assistantText += delta;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "content",
                  content: delta,
                })}\n\n`
              )
            );
          }
        }
        await dataSource.createAssistantMessage(
          session.user.id as string,
          params.id,
          assistantText,
          reasoningText || undefined,
          model
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
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
