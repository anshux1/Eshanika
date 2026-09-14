import "server-only";

import { RejectUpload, route, type Router } from "@better-upload/server";
import { cloudflare } from "@better-upload/server/clients";

import { getAuth } from "@eshanika/auth/server";
import { getServerEnv } from "@eshanika/env/server";

import { createObjectKey } from "./object-keys.ts";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const IMAGE_EXTENSIONS = [".jpeg", ".jpg", ".png", ".webp"];
const DOCUMENT_TYPES = ["application/pdf"];
const DOCUMENT_EXTENSIONS = [".pdf"];

function required(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

async function requireUploadUser(request: Request) {
  const session = await getAuth().api.getSession({ headers: request.headers });

  if (!session) {
    throw new RejectUpload("Authentication required");
  }

  // Role checks will be added with the admin-role/domain phase.
  return session.user.id;
}

function requireFileExtension(filename: string, extensions: string[]) {
  const basename = filename.replace(/\\/g, "/").split("/").pop() ?? "";
  const extension = basename.slice(basename.lastIndexOf(".")).toLowerCase();

  if (!extensions.includes(extension)) {
    throw new RejectUpload("File extension does not match the upload route");
  }
}

async function createUserObjectKey(
  request: Request,
  filename: string,
  prefix: string,
  extensions: string[],
) {
  const userId = await requireUploadUser(request);
  requireFileExtension(filename, extensions);

  return createObjectKey(`${prefix}/${userId}`, filename);
}

export function createUploadRouter(): Router {
  const env = getServerEnv();
  const publicBucket = required(env.R2_PUBLIC_BUCKET, "R2_PUBLIC_BUCKET");
  const privateBucket = required(env.R2_PRIVATE_BUCKET, "R2_PRIVATE_BUCKET");

  const client = cloudflare({
    accountId: required(env.R2_ACCOUNT_ID, "R2_ACCOUNT_ID"),
    accessKeyId: required(env.R2_ACCESS_KEY_ID, "R2_ACCESS_KEY_ID"),
    secretAccessKey: required(env.R2_SECRET_ACCESS_KEY, "R2_SECRET_ACCESS_KEY"),
  });

  return {
    client,
    bucketName: publicBucket,
    routes: {
      media: route({
        multipleFiles: false,
        fileTypes: IMAGE_TYPES,
        maxFileSize: MAX_IMAGE_SIZE,
        signedUrlExpiresIn: 120,
        onBeforeUpload: async ({ req, file }) => ({
          bucketName: publicBucket,
          objectInfo: {
            key: await createUserObjectKey(
              req,
              file.name,
              "media",
              IMAGE_EXTENSIONS,
            ),
            cacheControl: "public, max-age=31536000, immutable",
          },
        }),
      }),
      document: route({
        multipleFiles: false,
        fileTypes: DOCUMENT_TYPES,
        maxFileSize: MAX_DOCUMENT_SIZE,
        signedUrlExpiresIn: 120,
        onBeforeUpload: async ({ req, file }) => ({
          bucketName: privateBucket,
          objectInfo: {
            key: await createUserObjectKey(
              req,
              file.name,
              "documents",
              DOCUMENT_EXTENSIONS,
            ),
            cacheControl: "private, no-store",
          },
        }),
      }),
    },
  };
}
