import { auth } from "@clerk/nextjs/server";

export async function requireAuth() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return userId;
}

export async function requireAdmin() {
  const userId = await requireAuth();
  const adminIds =
    process.env.ADMIN_USER_IDS?.split(",").map((id) => id.trim()).filter(Boolean) ??
    [];

  if (adminIds.length > 0 && !adminIds.includes(userId)) {
    throw new Error("Forbidden");
  }

  return userId;
}
