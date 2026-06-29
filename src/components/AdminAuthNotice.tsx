type AdminAuthNoticeProps = {
  intent?: string;
  mode: "sign-in" | "sign-up";
};

export function AdminAuthNotice({ intent, mode }: AdminAuthNoticeProps) {
  if (intent !== "admin") return null;

  if (mode === "sign-in") {
    return (
      <div className="mx-auto mb-6 max-w-md rounded-2xl border border-border bg-neutral-50 px-5 py-4 text-center text-sm text-muted">
        <p className="font-medium text-foreground">Owner admin sign in</p>
        <p className="mt-2">
          Use the single authorized owner account. Other accounts cannot access the
          admin dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto mb-6 max-w-md rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-center text-sm text-amber-950">
      <p className="font-medium">Creating a shopper account</p>
      <p className="mt-2">
        Sign up here for watchlist access only. It does{" "}
        <strong>not</strong> create admin access. After signing up you&apos;ll go
        to your watchlist, not the admin dashboard.
      </p>
    </div>
  );
}
