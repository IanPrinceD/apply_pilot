// src\lib\anthropic.ts
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import type { z } from 'zod';
import { config } from '@/lib/config';

let client: Anthropic | undefined;

/** Lazily creates the Anthropic client so a missing key only fails LLM calls, not app boot. */
const getClient = (): Anthropic => {
  if (!config.anthropicApiKey) {
    throw Object.assign(new Error('ANTHROPIC_API_KEY is not set in .env.local'), { status: 500 });
  }
  client ??= new Anthropic({ apiKey: config.anthropicApiKey });
  return client;
};

interface GenerateJsonOptions<T extends z.ZodType> {
  schema: T;
  system: string;
  prompt: string;
  maxTokens?: number;
}

/** Calls the LLM with structured output, validates with zod, and retries once on failure. */
export const generateJson = async <T extends z.ZodType>({
  schema,
  system,
  prompt,
  maxTokens = 16000,
}: GenerateJsonOptions<T>): Promise<z.infer<T>> => {
  const anthropic = getClient();
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await anthropic.messages.parse({
        model: config.llmModel,
        max_tokens: maxTokens,
        system,
        messages: [{ role: 'user', content: prompt }],
        output_config: { format: zodOutputFormat(schema) },
      });

      if (response.stop_reason === 'refusal') {
        throw Object.assign(new Error('The model declined this request.'), { status: 422 });
      }
      if (response.stop_reason === 'max_tokens') {
        throw new Error('LLM output was cut off (max_tokens).');
      }

      const parsed = schema.safeParse(response.parsed_output);
      if (parsed.success) return parsed.data;
      lastError = parsed.error;
    } catch (err) {
      // Auth/bad-request errors won't fix themselves on retry.
      if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.BadRequestError) {
        throw Object.assign(new Error(`LLM request failed: ${err.message}`), { status: 502 });
      }
      if ((err as { status?: number }).status === 422) throw err;
      lastError = err;
    }
  }

  const message = lastError instanceof Error ? lastError.message : 'invalid output';
  throw Object.assign(new Error(`LLM returned invalid JSON after retry: ${message}`), { status: 502 });
};
