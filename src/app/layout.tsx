import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Federal Signal — Government R&D as Venture Signal",
  description: "An evidence-backed ranking of five young technology companies surfaced through recent federal awards, scored for venture readiness and Microsoft relevance.",
  openGraph: {
    title: "Federal Signal",
    description: "Five young companies surfaced through government R&D signal.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Federal Signal",
    description: "Government R&D is an underpriced venture signal.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
