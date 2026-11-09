// src\lib\prisma.ts
import { PrismaClient } from '@/generated/prisma/client';
import { config } from '@/lib/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

/** Creates the SQLite file's parent folder (e.g. `data/`) — better-sqlite3 won't. */
const ensureDbDir = (url: string): void => {
  const filePath = url.replace(/^file:/, '');
  mkdirSync(dirname(filePath), { recursive: true });
};

/** Builds the single PrismaClient for this process. */
const createPrismaClient = (): PrismaClient => {
  ensureDbDir(config.databaseUrl);
  const adapter = new PrismaBetterSqlite3({ url: config.databaseUrl });
  return new PrismaClient({ adapter });
};

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Reuse across dev hot reloads so we don't open a new DB handle on every edit.
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (!config.isProduction) globalForPrisma.prisma = prisma;
