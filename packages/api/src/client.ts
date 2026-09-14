import type { RouterClient } from "@orpc/server";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";

import type { router } from "./router.ts";

export type { AppRouter } from "./router.ts";

// Browser and same-origin server calls use the relative route. An app doing
// server-side prefetching can pass its validated env URL explicitly.
export function createRpcClient(
  url: string | (() => string) = "/api/rpc",
): RouterClient<typeof router> {
  const link = new RPCLink({ url });
  return createORPCClient(link);
}

export const rpcClient: RouterClient<typeof router> = createRpcClient();
