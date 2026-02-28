import type { Metadata } from "next";
import { Geist } from "next/font/google"
import { Analytics } from "@vercel/analytics/react";

import NavBar from "@/components/Navbar";

import "./globals.css";


const _geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "migconf.com",
    template: "%s | migconf.com",
  },
  description: "Official Website for the 2025 MIG Quant Conference",
  openGraph: {
    title: "migconf.com",
    description: "Official Website for the 2025 MIG Quant Conference",
    url: "https://migconf.com",
    siteName: "migconf.com",
    images: [
      {
        url: "https://migconf.com/favicon.ico",
        width: 1080,
        height: 1080,
      },
    ],
    locale: "en-US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${_geist.className} antialiased`}>
        <NavBar />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
