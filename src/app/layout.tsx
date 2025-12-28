import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AuroraBackground } from "@/components/ui/AuroraBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VIB3 - Your Ultimate Social Video Experience",
  description: "Create, share, and connect with amazing content creators on VIB3. The next-generation social video platform.",
  keywords: ["VIB3", "social video", "short videos", "content creation", "live streaming"],
  openGraph: {
    title: "VIB3 - Your Ultimate Social Video Experience",
    description: "Create, share, and connect with amazing content creators on VIB3.",
    type: "website",
    siteName: "VIB3",
  },
  twitter: {
    card: "summary_large_image",
    title: "VIB3 - Your Ultimate Social Video Experience",
    description: "Create, share, and connect with amazing content creators on VIB3.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-neutral-950`}
      >
        <AuroraBackground />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
