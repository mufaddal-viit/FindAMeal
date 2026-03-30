import { parseGeminiResponse } from "../gemini/parser";
import type { AiParsedResponse } from "../types";
import type { GroqChatCompletionResponse } from "./client";

export function parseGroqResponse(
  response: GroqChatCompletionResponse
): AiParsedResponse {
  const content = response.choices?.[0]?.message?.content ?? "";

  return parseGeminiResponse({
    text: content,
    candidates: []
  });
}
