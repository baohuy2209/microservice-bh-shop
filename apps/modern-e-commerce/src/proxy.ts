import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { CustomJwtSessionClaims } from "@repo/types";
import { NextResponse } from "next/server";
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/admin/sign-in(.*)",
  "/admin/unauthorized(.*)",
  "/",
  "/products(.*)",
]);
export default clerkMiddleware(async (auth, req) => {
  // const claims = sessionClaims as CustomJwtSessionClaims;
  // if (!claims) {
  //   return NextResponse.redirect(new URL("/", req.url));
  // }
  // const role = claims.metadata?.role;
  // const { pathname } = req.nextUrl;

  // Nếu đã login + là admin + đang ở trang "/" thì redirect về /admin
  // if (userId && role === "admin" && pathname === "/") {
  //   return NextResponse.redirect(new URL("/admin", req.url));
  // }
  if (!isPublicRoute(req)) {
    await auth.protect();
    const { userId, sessionClaims } = await auth();
    if (userId && sessionClaims) {
      const userRole = (sessionClaims as CustomJwtSessionClaims).metadata?.role;
      if (userRole !== "admin") {
        return NextResponse.redirect(new URL("/admin/unauthorized", req.url));
      }
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
