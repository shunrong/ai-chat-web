import OpenAI from "openai";

export function createDeepseekClient() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const baseURL = process.env.DEEPSEEK_BASE_URL;
  if (!apiKey) throw new Error("Missing DEEPSEEK_API_KEY in environment");
  return new OpenAI({ apiKey, baseURL });
}
