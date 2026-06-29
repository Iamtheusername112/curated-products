import { ensureCurrentUserSynced } from "@/lib/user-sync";

export async function AuthUserSync() {
  await ensureCurrentUserSynced();
  return null;
}
