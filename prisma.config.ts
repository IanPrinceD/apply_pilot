import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'prisma/config';

// DATABASE_URL lives in .env; .env.local holds the other keys (and may override).
loadEnv({ path: ['.env.local', '.env'], quiet: true });

// Migrations need a direct connection. On Neon, DIRECT_URL is the non-pooled URL;
// locally it's unset and DATABASE_URL is already direct.
// `prisma generate` doesn't need a URL, so it's only set when one exists.
const migrationUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  ...(migrationUrl ? { datasource: { url: migrationUrl } } : {}),
});
