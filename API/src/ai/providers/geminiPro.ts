import { AI_CONFIG } from "../../config/ai.config";
import { createGeminiProvider } from "../gemini/service";

export const geminiProProvider = createGeminiProvider(
  AI_CONFIG.models["gemini-pro"]
);
