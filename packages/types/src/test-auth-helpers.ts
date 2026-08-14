/**
 * Shared test authentication helpers for mocking Clerk authentication and roles
 * across Express, Fastify, and Hono microservices.
 */

export interface MockAuthContext {
  userId: string;
  role?: "admin" | "user";
  email?: string;
}

export const createMockAuthHeaders = (ctx: MockAuthContext): Record<string, string> => {
  return {
    "x-test-user-id": ctx.userId,
    "x-test-role": ctx.role || "user",
    "x-test-email": ctx.email || `${ctx.userId}@example.com`,
  };
};

export const createMockClerkSession = (ctx: MockAuthContext) => {
  return {
    userId: ctx.userId,
    sessionClaims: {
      sub: ctx.userId,
      email: ctx.email || `${ctx.userId}@example.com`,
      metadata: {
        role: ctx.role || "user",
      },
    },
  };
};
