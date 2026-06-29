import { auth, clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { userWatchlist, users } from "@/db/schema";

export type ClerkUserSnapshot = {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
};

function pickPrimaryEmail(
  emailAddresses: Array<{ id: string; email_address: string }> | undefined,
  primaryEmailAddressId: string | null | undefined
): string | null {
  if (!emailAddresses?.length) return null;

  if (primaryEmailAddressId) {
    const primary = emailAddresses.find(
      (entry) => entry.id === primaryEmailAddressId
    );
    if (primary?.email_address) return primary.email_address;
  }

  return emailAddresses[0]?.email_address ?? null;
}

export function clerkUserFromWebhook(data: {
  id: string;
  email_addresses?: Array<{ id: string; email_address: string }>;
  primary_email_address_id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string | null;
}): ClerkUserSnapshot {
  return {
    id: data.id,
    email: pickPrimaryEmail(
      data.email_addresses,
      data.primary_email_address_id
    ),
    firstName: data.first_name ?? null,
    lastName: data.last_name ?? null,
    imageUrl: data.image_url ?? null,
  };
}

export async function upsertUserFromClerk(snapshot: ClerkUserSnapshot) {
  const [user] = await db
    .insert(users)
    .values({
      clerkUserId: snapshot.id,
      email: snapshot.email,
      firstName: snapshot.firstName,
      lastName: snapshot.lastName,
      imageUrl: snapshot.imageUrl,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: users.clerkUserId,
      set: {
        email: snapshot.email,
        firstName: snapshot.firstName,
        lastName: snapshot.lastName,
        imageUrl: snapshot.imageUrl,
        updatedAt: new Date(),
      },
    })
    .returning();

  return user;
}

export async function deleteUserByClerkId(clerkUserId: string) {
  await db.delete(userWatchlist).where(eq(userWatchlist.userId, clerkUserId));
  await db.delete(users).where(eq(users.clerkUserId, clerkUserId));
}

export async function ensureCurrentUserSynced() {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await db.query.users.findFirst({
    where: eq(users.clerkUserId, userId),
  });

  if (existing) return existing;

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);

  return upsertUserFromClerk({
    id: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress ?? null,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    imageUrl: clerkUser.imageUrl,
  });
}
