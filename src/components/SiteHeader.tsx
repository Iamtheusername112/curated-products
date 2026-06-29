import { isAdminUser, getAdminAuthContext } from "@/lib/admin";
import { getActiveFrontendCategories } from "@/lib/cms-queries";
import { SiteHeaderNav } from "./SiteHeaderNav";

export async function SiteHeader() {
  const [{ userId, sessionClaims }, categories] = await Promise.all([
    getAdminAuthContext(),
    getActiveFrontendCategories(),
  ]);

  const showAdminLink = isAdminUser(userId, sessionClaims);

  return (
    <SiteHeaderNav
      categories={categories.map((category) => ({
        slug: category.slug,
        displayName: category.displayName,
      }))}
      showAdminLink={showAdminLink}
    />
  );
}
