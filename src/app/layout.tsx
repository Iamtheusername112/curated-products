import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { StorefrontGate } from "@/components/StorefrontGate";
import { AuthUserSync } from "@/components/AuthUserSync";
import { ClerkProvider } from "@clerk/nextjs";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
      >
        <ClerkProvider dynamic>
          <AuthUserSync />
          <SiteHeader />
          <StorefrontGate>
            <main className="flex-grow">{children}</main>
          </StorefrontGate>
          <Footer />
        </ClerkProvider>
      </body>
    </html>
  );
}
