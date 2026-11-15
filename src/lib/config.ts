// src\lib\config.ts
// The only place that reads process.env. Driver settings default to local values,
// so running on your PC needs only DATABASE_URL (+ the AI keys for LLM features).
import { z } from 'zod';

export const publicConfig = {};

/** Empty strings in .env files count as "not set". */
const optional = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined);

/** "true"/"1" → true; anything else (or unset) → false. */
const flag = z
  .string()
  .optional()
  .transform((value) => value === 'true' || value === '1');

const envSchema = z
  .object({
    DATABASE_URL: z.string().trim().min(1, 'DATABASE_URL is not set — add it to .env'),
    ANTHROPIC_API_KEY: optional,
    LLM_MODEL: optional,
    APP_URL: z.url().default('http://localhost:3000'),
    STORAGE_DRIVER: z.enum(['local', 'r2']).default('local'),
    EMAIL_DRIVER: z.enum(['console']).default('console'),
    BILLING_ENABLED: flag,
    CRON_SECRET: optional,
    R2_ACCOUNT_ID: optional,
    R2_ACCESS_KEY_ID: optional,
    R2_SECRET_ACCESS_KEY: optional,
    R2_BUCKET: optional,
    GOOGLE_SHEETS_ID: optional,
    GOOGLE_SERVICE_ACCOUNT_JSON_PATH: optional,
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  })
  .superRefine((env, ctx) => {
    if (env.STORAGE_DRIVER !== 'r2') return;
    const r2Keys = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET'] as const;
    for (const key of r2Keys) {
      if (!env[key]) ctx.addIssue({ code: 'custom', path: [key], message: `${key} is required when STORAGE_DRIVER=r2` });
    }
  });

/** Parses process.env once and fails fast with a readable list of problems. */
const loadEnv = () => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`);
    throw new Error(`Invalid environment variables:\n${problems.join('\n')}`);
  }
  return parsed.data;
};

const env = loadEnv();

// Server-only
export const config = {
  databaseUrl: env.DATABASE_URL,
  anthropicApiKey: env.ANTHROPIC_API_KEY,
  llmModel: env.LLM_MODEL ?? 'claude-opus-5-5',
  /** Public base URL of the site — never hard-code localhost or a domain. */
  appUrl: env.APP_URL.replace(/\/+$/, ''),
  storageDriver: env.STORAGE_DRIVER,
  emailDriver: env.EMAIL_DRIVER,
  billingEnabled: env.BILLING_ENABLED,
  cronSecret: env.CRON_SECRET,
  r2: {
    accountId: env.R2_ACCOUNT_ID,
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    bucket: env.R2_BUCKET,
  },
  googleSheetsId: env.GOOGLE_SHEETS_ID,
  googleServiceAccountJsonPath: env.GOOGLE_SERVICE_ACCOUNT_JSON_PATH,
  isProduction: env.NODE_ENV === 'production',
};
