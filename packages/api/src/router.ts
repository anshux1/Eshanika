import { ORPCError, os } from "@orpc/server";
import type { RequestHeadersPluginContext } from "@orpc/server/plugins";

import { getAuth } from "@eshanika/auth/server";

interface ApiContext extends RequestHeadersPluginContext {}

const base = os.$context<ApiContext>();

const authenticated = base.middleware(async ({ context, next }) => {
  const session = await getAuth().api.getSession({
    headers: context.reqHeaders ?? new Headers(),
  });

  if (!session) {
    throw new ORPCError("UNAUTHORIZED");
  }

  return next({ context: { session } });
});

const protectedProcedure = base.use(authenticated);

export const router = {
  health: {
    ping: base.handler(() => ({ status: "ok" as const })),
  },
  account: {
    me: protectedProcedure.handler(({ context }) => ({
      id: context.session.user.id,
      name: context.session.user.name,
      email: context.session.user.email,
    })),
  },
};

export type AppRouter = typeof router;
