import { auth } from "@clerk/nextjs/server";

export class AdminForbiddenError extends Error {
  readonly status = 403;

  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AdminForbiddenError";
  }
}

const SOLE_ADMIN_ENV_KEYS = ["ALLOWED_ADMIN_IDS", "ADMIN_USER_IDS"] as const;

/**
 * Returns the single admin Clerk user ID from env, or null if unset.
 * Only the first ID is used if multiple are comma-separated (extra IDs are ignored).
 */
export function getSoleAdminUserId(): string | null {
  for (const envKey of SOLE_ADMIN_ENV_KEYS) {
    const raw = process.env[envKey]?.trim();
    if (!raw) continue;

    const ids = raw
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (ids.length === 0) continue;

    if (ids.length > 1 && process.env.NODE_ENV === "development") {
      console.warn(
        `[admin] Only one admin account is supported. Using "${ids[0]}" and ignoring ${ids.length - 1} other ID(s) in ${envKey}.`
      );
    }

    return ids[0] ?? null;
  }

  return null;
}

/**
 * Admin access is granted only when the signed-in Clerk user ID exactly matches
 * the sole ID in ALLOWED_ADMIN_IDS (or legacy ADMIN_USER_IDS).
 *
 * There is no UI to create admins, no metadata role bypass, and no dev fallback.
 */
export function isAdminUser(
  userId: string | null | undefined,
  _sessionClaims?: Record<string, unknown> | null | undefined
): boolean {
  if (!userId) return false;

  const soleAdminId = getSoleAdminUserId();
  if (!soleAdminId) return false;

  return userId === soleAdminId;
}

export async function getAdminAuthContext() {
  const { userId, sessionClaims } = await auth();
  return { userId, sessionClaims };
}

export async function isAdmin(): Promise<boolean> {
  const { userId, sessionClaims } = await getAdminAuthContext();
  return isAdminUser(userId, sessionClaims);
}

export async function requireAdmin(): Promise<string> {
  const { userId, sessionClaims } = await getAdminAuthContext();

  if (!userId) {
    throw new AdminForbiddenError("Sign in required");
  }

  const soleAdminId = getSoleAdminUserId();
  if (!soleAdminId) {
    throw new AdminForbiddenError(
      "Admin access is not configured. Set ALLOWED_ADMIN_IDS in .env.local to your Clerk user ID."
    );
  }

  if (!isAdminUser(userId, sessionClaims)) {
    throw new AdminForbiddenError("Admin access required");
  }

  return userId;
}
