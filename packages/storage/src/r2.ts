import "server-only";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import type { PutObjectCommandInput } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { getServerEnv } from "@eshanika/env/server";

export interface R2Config {
  readonly accountId: string;
  readonly accessKeyId: string;
  readonly secretAccessKey: string;
}

export interface PutObjectInput {
  readonly bucket: string;
  readonly key: string;
  readonly body: NonNullable<PutObjectCommandInput["Body"]>;
  readonly contentType?: string;
  readonly cacheControl?: string;
  readonly metadata?: Record<string, string>;
}

export interface ObjectMetadata {
  readonly size?: number;
  readonly contentType?: string;
  readonly cacheControl?: string;
  readonly etag?: string;
  readonly lastModified?: Date;
}

const DEFAULT_SIGNED_URL_EXPIRY_SECONDS = 900;
const MAX_SIGNED_URL_EXPIRY_SECONDS = 3600;

function requiredText(value: string | undefined, name: string) {
  const normalized = value?.trim();

  if (!normalized) {
    throw new Error(`${name} is required`);
  }

  return normalized;
}

function requiredObjectPart(value: string, name: string) {
  return requiredText(value, name);
}

function signedUrlExpiry(expiresIn: number) {
  if (
    !Number.isInteger(expiresIn) ||
    expiresIn < 1 ||
    expiresIn > MAX_SIGNED_URL_EXPIRY_SECONDS
  ) {
    throw new Error(
      `Signed URL expiry must be an integer between 1 and ${MAX_SIGNED_URL_EXPIRY_SECONDS} seconds`,
    );
  }

  return expiresIn;
}

function resolveConfig(config?: Partial<R2Config>): R2Config {
  const env = getServerEnv();

  return {
    accountId: requiredText(
      config?.accountId ?? env.R2_ACCOUNT_ID,
      "R2_ACCOUNT_ID",
    ),
    accessKeyId: requiredText(
      config?.accessKeyId ?? env.R2_ACCESS_KEY_ID,
      "R2_ACCESS_KEY_ID",
    ),
    secretAccessKey: requiredText(
      config?.secretAccessKey ?? env.R2_SECRET_ACCESS_KEY,
      "R2_SECRET_ACCESS_KEY",
    ),
  };
}

function createClient(config: R2Config) {
  return new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

let defaultClient: S3Client | undefined;

/** Returns the process-local default client, or a fresh client for overrides. */
export function createR2Client(config?: Partial<R2Config>) {
  if (!config && defaultClient) {
    return defaultClient;
  }

  const client = createClient(resolveConfig(config));

  if (!config) {
    defaultClient = client;
  }

  return client;
}

export function createPublicObjectUrl(key: string) {
  const baseUrl = requiredText(
    getServerEnv().R2_PUBLIC_BASE_URL,
    "R2_PUBLIC_BASE_URL",
  ).replace(/\/+$/, "");
  const objectKey = requiredObjectPart(key, "Object key");
  const keyParts = objectKey.split("/").filter(Boolean);

  if (keyParts.length === 0) {
    throw new Error("Object key is required");
  }

  const encodedKey = keyParts.map(encodeURIComponent).join("/");

  return `${baseUrl}/${encodedKey}`;
}

export function createUploadUrl(
  client: S3Client,
  bucket: string,
  key: string,
  expiresIn = DEFAULT_SIGNED_URL_EXPIRY_SECONDS,
) {
  const validBucket = requiredObjectPart(bucket, "Bucket");
  const validKey = requiredObjectPart(key, "Object key");

  return getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: validBucket, Key: validKey }),
    { expiresIn: signedUrlExpiry(expiresIn) },
  );
}

export function createDownloadUrl(
  client: S3Client,
  bucket: string,
  key: string,
  expiresIn = DEFAULT_SIGNED_URL_EXPIRY_SECONDS,
) {
  const validBucket = requiredObjectPart(bucket, "Bucket");
  const validKey = requiredObjectPart(key, "Object key");

  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: validBucket, Key: validKey }),
    { expiresIn: signedUrlExpiry(expiresIn) },
  );
}

export async function putObject(client: S3Client, input: PutObjectInput) {
  await client.send(
    new PutObjectCommand({
      Bucket: requiredObjectPart(input.bucket, "Bucket"),
      Key: requiredObjectPart(input.key, "Object key"),
      Body: input.body,
      ...(input.contentType ? { ContentType: input.contentType } : {}),
      ...(input.cacheControl ? { CacheControl: input.cacheControl } : {}),
      ...(input.metadata ? { Metadata: input.metadata } : {}),
    }),
  );
}

export async function getObjectMetadata(
  client: S3Client,
  bucket: string,
  key: string,
): Promise<ObjectMetadata> {
  const result = await client.send(
    new HeadObjectCommand({
      Bucket: requiredObjectPart(bucket, "Bucket"),
      Key: requiredObjectPart(key, "Object key"),
    }),
  );

  return {
    ...(result.ContentLength === undefined
      ? {}
      : { size: result.ContentLength }),
    ...(result.ContentType ? { contentType: result.ContentType } : {}),
    ...(result.CacheControl ? { cacheControl: result.CacheControl } : {}),
    ...(result.ETag ? { etag: result.ETag } : {}),
    ...(result.LastModified ? { lastModified: result.LastModified } : {}),
  };
}

export async function deleteObject(
  client: S3Client,
  bucket: string,
  key: string,
) {
  await client.send(
    new DeleteObjectCommand({
      Bucket: requiredObjectPart(bucket, "Bucket"),
      Key: requiredObjectPart(key, "Object key"),
    }),
  );
}
