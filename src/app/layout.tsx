import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Curated SHEIN Finds | Premium Lookbooks",
    template: "%s | Curated SHEIN",
  },
  description:
    "Hand-picked SHEIN fashion curated into premium lookbooks. Track prices, discover trending styles, and shop smarter.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Curated SHEIN",
  },
};

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-sm font-medium tracking-[0.2em] uppercase">
          Curated
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/lookbook/y2k-aesthetic"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            Lookbooks
          </Link>
          <SignedIn>
            <Link
              href="/dashboard"
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              Watchlist
            </Link>
          </SignedIn>
        </nav>

        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm text-muted transition-colors hover:text-foreground">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded-full bg-foreground px-4 py-2 text-sm text-background transition-opacity hover:opacity-90">
                Join
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <ClerkProvider dynamic>
          <Header />
          <main>{children}</main>
          <footer className="mt-24 border-t border-border">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-12 text-sm text-muted md:flex-row md:items-center md:justify-between">
              <p>Curated SHEIN — affiliate links may earn commission.</p>
              <p>Prices updated regularly. Always verify on SHEIN.</p>
            </div>
          </footer>
        </ClerkProvider>
      </body>
    </html>
  );
}
