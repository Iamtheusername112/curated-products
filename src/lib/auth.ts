import { auth } from "@clerk/nextjs/server";

export {
  AdminForbiddenError,
  isAdmin,
  isAdminUser,
  requireAdmin,
} from "@/lib/admin";

export async function requireAuth() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return userId;
}
