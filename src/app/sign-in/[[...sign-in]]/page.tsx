import { SignIn } from "@clerk/nextjs";
import { AdminAuthNotice } from "@/components/AdminAuthNotice";

type SignInPageProps = {
  searchParams: Promise<{ redirect_url?: string; intent?: string }>;
};

function safeRedirectPath(value: string | undefined, fallback: string): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }
  return value;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { redirect_url, intent } = await searchParams;
  const afterSignIn = safeRedirectPath(redirect_url, "/dashboard");

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-16">
      <AdminAuthNotice intent={intent} mode="sign-in" />
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl={
          intent === "admin"
            ? "/sign-up"
            : `/sign-up?redirect_url=${encodeURIComponent(afterSignIn)}`
        }
        forceRedirectUrl={afterSignIn}
        fallbackRedirectUrl={afterSignIn}
      />
    </div>
  );
}
