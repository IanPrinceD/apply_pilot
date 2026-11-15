// src\lib\prisma.ts
import { PrismaClient } from '@/generated/prisma/client';
import { config } from '@/lib/config';
import { PrismaPg } from '@prisma/adapter-pg';

/** Builds the single PrismaClient for this process (local Postgres or Neon's pooled URL). */
const createPrismaClient = (): PrismaClient => {
  const adapter = new PrismaPg({ connectionString: config.databaseUrl });
  return new PrismaClient({ adapter });
};

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Reuse across dev hot reloads so we don't open a new connection pool on every edit.
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (!config.isProduction) globalForPrisma.prisma = prisma;
