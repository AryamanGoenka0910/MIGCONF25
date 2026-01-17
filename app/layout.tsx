import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/Navbar";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: {
    default: "migconf-25.vercel.app",
    template: "%s | migconf-25.vercel.app",
  },
  description: "Official Website for the 2025 MIG Quant Conference",
  openGraph: {
    title: "migconf-25.vercel.app",
    description: "Official Website for the 2025 MIG Quant Conference",
    url: "https://migconf-25.vercel.app",
    siteName: "migconf-25.vercel.app",
    images: [
      {
        url: "https://migconf-25.vercel.app/favicon.ico",
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
      <body className={`antialiased`}>
        {/* <NavBar /> */}
        {children}
        <Analytics />
      </body>
    </html>
  );
}
