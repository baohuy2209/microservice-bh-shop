import { getAuth } from "@clerk/fastify";
import { FastifyReply, FastifyRequest } from "fastify";
import type { CustomJwtSessionClaims } from "@repo/types";
declare module "fastify" {
  interface FastifyRequest {
    userId?: string;
  }
}
export const shouldBeUser = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { userId } = getAuth(request);
  if (!userId) {
    return reply.code(401).send({ message: "Unauthorized" });
  }
  (request as any).userId = userId;
};
export const shouldBeAdmin = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const auth = getAuth(request);
  if (!auth.userId) {
    return reply.code(401).send({ message: "You are not logged in" });
  }
  const claims = auth.sessionClaims as CustomJwtSessionClaims;
  if (claims.metadata?.role !== "admin") {
    return reply.code(401).send({ message: "Unauthorized" });
  }
  (request as any).userId = auth.userId;
};
