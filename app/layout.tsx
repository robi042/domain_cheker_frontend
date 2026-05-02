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

export const metadata: Metadata = {
  title: "SSL Monitor",
  description: "Monitor TLS certificate expiry with queued checks and crt.sh discovery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="relative min-h-full flex flex-col bg-zinc-950 font-sans text-zinc-100 antialiased selection:bg-emerald-500/35 selection:text-white">
        {/* ambient */}
        <div
          className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_110%_55%_at_50%_-18%,rgba(52,211,153,0.13),transparent_52%),radial-gradient(ellipse_70%_45%_at_100%_0%,rgba(99,102,241,0.06),transparent)]"
          aria-hidden
        />
        <div
          className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(9,9,11,0)_0%,rgba(9,9,11,0.85)_55%,rgb(9,9,11)_100%)]"
          aria-hidden
        />
        {children}
      </body>
    </html>
  );
}
