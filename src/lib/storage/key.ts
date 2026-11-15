// src\lib\storage\key.ts

const KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*(\/[A-Za-z0-9][A-Za-z0-9._-]*)*$/;

/** Rejects keys that could escape the storage root (`..`, absolute paths, odd characters). */
export const assertValidKey = (key: string): string => {
  if (key.length > 512 || !KEY_PATTERN.test(key) || key.split('/').includes('..')) {
    throw Object.assign(new Error(`Invalid storage key: ${key}`), { status: 400 });
  }
  return key;
};
