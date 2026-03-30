export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:3001",
  databaseUrl: process.env.DATABASE_URL ?? "",
  geminiApiKey: process.env.GEMINI_API_KEY ?? ""
};
