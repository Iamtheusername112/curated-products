import Link from "next/link";

export function MaintenanceScreen() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-sm tracking-[0.25em] text-muted uppercase">
          Maintenance
        </p>
        <h1 className="mt-4 text-3xl font-light tracking-tight">
          We&apos;ll be back shortly
        </h1>
        <p className="mt-4 text-muted">
          The storefront is temporarily offline while we refresh the catalog.
        </p>
        <Link
          href="/sign-in"
          className="mt-8 inline-flex h-11 items-center rounded-full bg-foreground px-6 text-sm text-background"
        >
          Admin sign in
        </Link>
      </div>
    </div>
  );
}
