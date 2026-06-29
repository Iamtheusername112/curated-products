import { AccountNav } from "@/components/account/AccountNav";
import { PAGE_CONTAINER } from "@/lib/layout-classes";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-neutral-50">
      <div className={`${PAGE_CONTAINER} py-10 md:py-12`}>
        <AccountNav />
        {children}
      </div>
    </div>
  );
}
