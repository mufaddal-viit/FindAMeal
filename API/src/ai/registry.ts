import { HttpError } from "../utils/httpError";
import { geminiFlashProvider } from "./providers/geminiFlash";
import { geminiProProvider } from "./providers/geminiPro";
import { groqLlama33Provider } from "./providers/groqLlama33";
import type { AiProviderId, AiSearchProvider } from "./types";

const aiProviders: Record<AiProviderId, AiSearchProvider> = {
  "gemini-flash": geminiFlashProvider,
  "gemini-pro": geminiProProvider,
  "groq-llama-3.3-70b": groqLlama33Provider
};

export function getAiProvider(providerId: AiProviderId) {
  const provider = aiProviders[providerId];

  if (!provider) {
    throw new HttpError(500, `Unknown AI provider: ${providerId}`);
  }

  return provider;
}
