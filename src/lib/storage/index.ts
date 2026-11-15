// src\lib\storage\index.ts
// Use `storage` for every file read/write. STORAGE_DRIVER picks local disk or R2.
import { config } from '@/lib/config';
import { createLocalDriver } from '@/lib/storage/localDriver';
import { createR2Driver } from '@/lib/storage/r2Driver';
import type { StorageDriver } from '@/lib/storage/types';

/** Builds the driver selected in config (R2 keys are validated by config.ts). */
const createStorage = (): StorageDriver => {
  if (config.storageDriver === 'r2') {
    const { accountId, accessKeyId, secretAccessKey, bucket } = config.r2;
    if (!accountId || !accessKeyId || !secretAccessKey || !bucket) throw new Error('R2 settings are incomplete');
    return createR2Driver({ accountId, accessKeyId, secretAccessKey, bucket });
  }
  return createLocalDriver(config.appUrl);
};

export const storage = createStorage();
export { assertValidKey } from '@/lib/storage/key';
export type { PutOptions, StorageDriver } from '@/lib/storage/types';
