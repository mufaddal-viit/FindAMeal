import { env } from "../../config/env";
import { HttpError } from "../../utils/httpError";
import type { AiModelConfig } from "../types";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

export interface GroqChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
}

export function getGroqGenerateConfigForModel(modelConfig: AiModelConfig) {
  return {
    temperature: modelConfig.temperature,
    top_p: modelConfig.topP,
    max_completion_tokens: modelConfig.maxOutputTokens
  };
}

export async function createGroqChatCompletion(
  modelConfig: AiModelConfig,
  prompt: string
) {
  if (!env.groqApiKey) {
    throw new HttpError(500, "GROQ_API_KEY is not configured.");
  }

  const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.groqApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: modelConfig.modelName,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      ...getGroqGenerateConfigForModel(modelConfig)
    })
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new HttpError(
      response.status,
      `Groq API call failed: ${errorText || response.statusText}`
    );
  }

  return (await response.json()) as GroqChatCompletionResponse;
}
