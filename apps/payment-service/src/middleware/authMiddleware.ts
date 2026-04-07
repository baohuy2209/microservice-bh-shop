import type { CustomJwtSessionClaims } from "@repo/types";
import { getAuth } from "@clerk/hono";
import { createMiddleware } from "hono/factory";
export const shouldBeAdmin = createMiddleware<{
  Variables: { userId: string };
}>(async (c, next) => {
  const auth = getAuth(c);
  if (!auth.userId) {
    return c.json({ message: "You are not logged in" }, 401);
  }
  const claims = auth.sessionClaims as CustomJwtSessionClaims;
  if (claims.metadata?.role !== "admin") {
    return c.json({ message: "Unauthorized" }, 401);
  }
  c.set("userId", auth.userId);
  await next();
});
export const shouldBeUser = createMiddleware<{
  Variables: { userId: string };
}>(async (c, next) => {
  const auth = getAuth(c);
  if (!auth.userId) {
    return c.json({ message: "You are not logged in" }, 401);
  }
  c.set("userId", auth.userId);
  await next();
});
