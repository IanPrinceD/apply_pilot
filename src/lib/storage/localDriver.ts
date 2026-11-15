// src\lib\storage\localDriver.ts
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { assertValidKey } from '@/lib/storage/key';
import type { StorageDriver } from '@/lib/storage/types';

/** Root folder for local files (gitignored with the rest of `data/`). */
const LOCAL_ROOT = resolve(process.cwd(), 'data', 'uploads');

/** Absolute path for a key, guaranteed to stay inside LOCAL_ROOT. */
const pathFor = (key: string): string => join(LOCAL_ROOT, ...assertValidKey(key).split('/'));

/** True for Node's "file not found" error. */
const isNotFound = (err: unknown): boolean => (err as { code?: string }).code === 'ENOENT';

/** Stores files on disk under `data/uploads/`. */
export const createLocalDriver = (appUrl: string): StorageDriver => ({
  name: 'local',
  put: async (key, body) => {
    const filePath = pathFor(key);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, body);
  },
  get: async (key) => {
    try {
      return new Uint8Array(await readFile(pathFor(key)));
    } catch (err) {
      if (isNotFound(err)) return null;
      throw err;
    }
  },
  delete: async (key) => {
    await rm(pathFor(key), { force: true });
  },
  getUrl: async (key) => `${appUrl}/api/files/${assertValidKey(key)}`,
});
