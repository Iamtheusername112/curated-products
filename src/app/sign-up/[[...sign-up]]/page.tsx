import { SignUp } from "@clerk/nextjs";
import { AdminAuthNotice } from "@/components/AdminAuthNotice";

type SignUpPageProps = {
  searchParams: Promise<{ redirect_url?: string; intent?: string }>;
};

function safeRedirectPath(value: string | undefined, fallback: string): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }
  return value;
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const { redirect_url, intent } = await searchParams;

  // Never send new sign-ups to /admin — admin is env-locked to one owner ID.
  const requested = safeRedirectPath(redirect_url, "/dashboard");
  const afterSignUp = requested.startsWith("/admin") ? "/dashboard" : requested;

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-16">
      <AdminAuthNotice intent={intent ?? (requested.startsWith("/admin") ? "admin" : undefined)} mode="sign-up" />
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        forceRedirectUrl={afterSignUp}
        fallbackRedirectUrl={afterSignUp}
      />
    </div>
  );
}
