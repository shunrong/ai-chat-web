import OpenAI from "openai";

export function createDeepseekClient() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const baseURL = process.env.DEEPSEEK_BASE_URL;
  if (!apiKey) throw new Error("Missing DEEPSEEK_API_KEY in environment");
  return new OpenAI({ apiKey, baseURL });
}

// DeepSeek 模型类型
export const DEEPSEEK_MODELS = {
  CHAT: "deepseek-chat",
  REASONING: "deepseek-reasoner", // 推理模型
} as const;

export type DeepSeekModel =
  (typeof DEEPSEEK_MODELS)[keyof typeof DEEPSEEK_MODELS];
