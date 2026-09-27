import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Newsreader } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mediator.uriva.deno.net"),
  title: {
    default: "Mediator — Serene AI Dispute Resolution",
    template: "%s | Mediator",
  },
  description:
    "Transform conflict into harmony. An impartial, calm AI mediator that guides disputing parties into structured group dialogue, establishes undisputed facts, and achieves lasting resolution.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mediator.uriva.deno.net",
    siteName: "Mediator",
    title: "Mediator — Serene AI Dispute Resolution",
    description:
      "Transform conflict into harmony. An impartial, calm AI mediator that guides disputing parties into structured group dialogue, establishes undisputed facts, and achieves lasting resolution.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mediator — Serene AI Dispute Resolution",
    description:
      "Transform conflict into harmony. An impartial, calm AI mediator that guides disputing parties into structured group dialogue, establishes undisputed facts, and achieves lasting resolution.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${jakartaSans.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
