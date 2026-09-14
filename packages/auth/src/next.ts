import "server-only";

import { toNextJsHandler } from "better-auth/next-js";

import { getAuth } from "./auth.ts";

type AuthHandlers = ReturnType<typeof toNextJsHandler>;

let handlers: AuthHandlers | undefined;

function getHandlers() {
  handlers ??= toNextJsHandler(getAuth());
  return handlers;
}

export const GET = (request: Request) => getHandlers().GET(request);
export const POST = (request: Request) => getHandlers().POST(request);
