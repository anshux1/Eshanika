import "server-only";

import { RPCHandler } from "@orpc/server/fetch";
import { RequestHeadersPlugin } from "@orpc/server/plugins";

import { router } from "./router.ts";

const handler = new RPCHandler(router, {
  plugins: [new RequestHeadersPlugin()],
});

export async function handleRpcRequest(request: Request) {
  const { matched, response } = await handler.handle(request, {
    prefix: "/api/rpc",
    context: {},
  });

  if (!matched) {
    return new Response("Not found", { status: 404 });
  }

  return response ?? new Response("No response", { status: 500 });
}
