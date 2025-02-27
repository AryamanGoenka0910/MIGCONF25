import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/Navbar";

export const metadata: Metadata = {
  title: {
    default: "migconf-25.vercel.app",
    template: "%s | migconf-25.vercel.app",
  },
  description: "Official Website for the 2025 MIG Quant Conference",
  openGraph: {
    title: "migconf-25.vercel.app",
    description:
      "Official Website for the 2025 MIG Quant Conference",
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

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({ 
  subsets: ['latin'], 
  weight: ['700'] 
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${montserrat.className} antialiased`}
      >
         <NavBar />
        {children}
      </body>
    </html>
  );
}



