import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mediator.uriv.me"),
  title: {
    default: "Mediator — Talk it out, settle it fair",
    template: "%s | Mediator",
  },
  description:
    "An impartial AI mediator that puts both sides in one room, pins down the facts you agree on, and helps you land a settlement.",
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
    url: "https://mediator.uriv.me",
    siteName: "Mediator",
    title: "Mediator — Talk it out, settle it fair",
    description:
      "An impartial AI mediator that puts both sides in one room, pins down the facts you agree on, and helps you land a settlement.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mediator — Talk it out, settle it fair",
    description:
      "An impartial AI mediator that puts both sides in one room, pins down the facts you agree on, and helps you land a settlement.",
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
      className={`${dmSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
