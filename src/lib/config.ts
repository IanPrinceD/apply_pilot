// src\lib\config.ts
export const publicConfig = {};

// Server/worker-only
export const config = {
  databaseUrl: process.env.DATABASE_URL!,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY!,
  llmModel: process.env.LLM_MODEL!,
  googleSheetsId: process.env.GOOGLE_SHEETS_ID!,
  googleServiceAccountJsonPath: process.env.GOOGLE_SERVICE_ACCOUNT_JSON_PATH!,
  isProduction: process.env.NODE_ENV === 'production',
};
