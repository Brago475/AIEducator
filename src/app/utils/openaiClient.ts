/**
 * openaiClient.ts — Uses Groq's free OpenAI-compatible API.
 */
import OpenAI from "openai";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_KEY || "";

export function hasKey(): boolean {
  return GROQ_API_KEY.length > 0;
}

export function createClient(): OpenAI | null {
  if (!hasKey()) return null;
  return new OpenAI({
    apiKey: GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
    dangerouslyAllowBrowser: true,
  });
}

export function getStoredKey(): string { return GROQ_API_KEY; }
export function storeKey(_key: string): void {}
export function clearKey(): void {}
export async function testKey(_key: string): Promise<{ ok: boolean; error?: string }> {
  return { ok: hasKey() };
}