import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicAdminRoute = createRouteMatcher([
  "/admin/forbidden",
  "/admin/not-configured",
]);

const isWebhookRoute = createRouteMatcher(["/api/webhooks/clerk"]);

const isAdminConsoleRoute = createRouteMatcher(["/admin(.*)"]);

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicAdminRoute(req) || isWebhookRoute(req)) {
    return;
  }

  if (isAdminConsoleRoute(req) || isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
