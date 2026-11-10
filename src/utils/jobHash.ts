// src\utils\jobHash.ts
// Server/worker only (uses node:crypto).
import { createHash } from 'node:crypto';

/** Lowercases, strips punctuation and collapses whitespace so small formatting changes don't matter. */
const normalize = (value: string | null | undefined): string =>
  (value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

/** Secondary dedupe key: sha256 of normalized company | title | location. */
export const jobDedupeHash = (company: string, title: string, location: string | null | undefined): string =>
  createHash('sha256')
    .update([normalize(company), normalize(title), normalize(location)].join('|'))
    .digest('hex');
