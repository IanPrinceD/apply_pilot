// src\lib\storage\types.ts

export interface PutOptions {
  /** MIME type, e.g. "application/pdf". */
  contentType?: string;
}

/** A file store. Local disk now, Cloudflare R2 when deployed — callers never know which. */
export interface StorageDriver {
  readonly name: 'local' | 'r2';
  /** Saves (or overwrites) a file under `key`. */
  put: (key: string, body: Uint8Array, options?: PutOptions) => Promise<void>;
  /** Reads a file, or null if it doesn't exist. */
  get: (key: string) => Promise<Uint8Array | null>;
  /** Deletes a file; no error if it's already gone. */
  delete: (key: string) => Promise<void>;
  /** A URL the browser can download the file from (time-limited on R2). */
  getUrl: (key: string, expiresInSeconds?: number) => Promise<string>;
}
