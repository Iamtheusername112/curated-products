import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSoleAdminUserId, isAdminUser } from "@/lib/admin";

export default async function AdminConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=/admin&intent=admin");
  }

  const soleAdminId = getSoleAdminUserId();
  if (!soleAdminId) {
    redirect("/admin/not-configured");
  }

  if (!isAdminUser(userId, sessionClaims)) {
    redirect("/admin/forbidden");
  }

  return children;
}
