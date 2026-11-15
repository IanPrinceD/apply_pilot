// src\lib\storage\r2Driver.ts
import { DeleteObjectCommand, GetObjectCommand, NoSuchKey, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { assertValidKey } from '@/lib/storage/key';
import type { StorageDriver } from '@/lib/storage/types';

export interface R2Settings {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
}

const DEFAULT_URL_TTL_SECONDS = 300;

/** Stores files in a Cloudflare R2 bucket (S3-compatible API). */
export const createR2Driver = ({ accountId, accessKeyId, secretAccessKey, bucket }: R2Settings): StorageDriver => {
  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  return {
    name: 'r2',
    put: async (key, body, options) => {
      await client.send(
        new PutObjectCommand({ Bucket: bucket, Key: assertValidKey(key), Body: body, ContentType: options?.contentType }),
      );
    },
    get: async (key) => {
      try {
        const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key: assertValidKey(key) }));
        return result.Body ? await result.Body.transformToByteArray() : null;
      } catch (err) {
        if (err instanceof NoSuchKey) return null;
        throw err;
      }
    },
    delete: async (key) => {
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: assertValidKey(key) }));
    },
    getUrl: (key, expiresInSeconds = DEFAULT_URL_TTL_SECONDS) =>
      getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: assertValidKey(key) }), {
        expiresIn: expiresInSeconds,
      }),
  };
};
