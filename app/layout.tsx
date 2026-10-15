import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFrame } from "@/components/SiteFrame";
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
  title: {
    default: "ModPlays — Download Android Apps & Games",
    template: "%s | ModPlays",
  },
  description:
    "Discover Android apps and games, view version history, and download sample catalog packages. A Next.js APK store demo.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteFrame>{children}</SiteFrame>
      </body>
    </html>
  );
}
