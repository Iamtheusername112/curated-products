import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { NextRequest } from "next/server";
import {
  clerkUserFromWebhook,
  deleteUserByClerkId,
  upsertUserFromClerk,
} from "@/lib/user-sync";

export async function POST(req: NextRequest) {
  let event;

  try {
    event = await verifyWebhook(req);
  } catch (error) {
    console.error("[clerk webhook] verification failed:", error);
    return new Response("Webhook verification failed", { status: 400 });
  }

  try {
    switch (event.type) {
      case "user.created":
      case "user.updated": {
        await upsertUserFromClerk(clerkUserFromWebhook(event.data));
        break;
      }
      case "user.deleted": {
        if (event.data.id) {
          await deleteUserByClerkId(event.data.id);
        }
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error(`[clerk webhook] failed handling ${event.type}:`, error);
    return new Response("Webhook handler failed", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
