import Link from "next/link";

export default function LookbookNotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <p className="text-sm tracking-[0.25em] text-muted uppercase">404</p>
      <h1 className="mt-4 text-3xl font-light tracking-tight">Lookbook not found</h1>
      <p className="mt-4 text-muted">
        This category doesn&apos;t exist yet. Browse our curated collections instead.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-11 items-center rounded-full bg-foreground px-6 text-sm text-background"
      >
        Back home
      </Link>
    </div>
  );
}
