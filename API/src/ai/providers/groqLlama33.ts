import { AI_CONFIG } from "../../config/ai.config";
import { createGroqProvider } from "../groq/service";

export const groqLlama33Provider = createGroqProvider(
  AI_CONFIG.models["groq-llama-3.3-70b"]
);
