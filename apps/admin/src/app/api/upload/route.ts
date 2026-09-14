import { toRouteHandler } from "@better-upload/server/adapters/next";

import { createUploadRouter } from "@eshanika/storage/upload";

export const runtime = "nodejs";

let post: ReturnType<typeof toRouteHandler>["POST"] | undefined;

function getPostHandler() {
  post ??= toRouteHandler(createUploadRouter()).POST;
  return post;
}

export const POST = (request: Request) => getPostHandler()(request);
