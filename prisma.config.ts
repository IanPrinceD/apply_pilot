import { config as loadEnv } from 'dotenv';
import { defineConfig, env } from 'prisma/config';

// DATABASE_URL lives in .env; .env.local holds the other keys (and may override).
loadEnv({ path: ['.env.local', '.env'], quiet: true });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
