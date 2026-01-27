import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DynamicIsland from "@/components/DynamicIsland";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://qryptomarket-news.vercel.app"),
  title: "Prophet TV - Prophet Market Intelligence",
  description: "Real-time Prophet market data, news, and insights",
  openGraph: {
    images: [{ url: "/opengraph-image.png" }],
  },
};

import { Providers } from "./providers";
import { OnchainProvider } from "@/components/providers/OnchainProvider";
import { GlobalErrorBoundary } from '@/components/GlobalErrorBoundary';
import { Toaster } from "@/components/ui/toaster"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <OnchainProvider>
          <GlobalErrorBoundary>
            {children}
          </GlobalErrorBoundary>
          <FlexConsole />
          <Toaster />
        </OnchainProvider>
      </body>
    </html>
  );
}
