import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LenisProvider from "./components/LenisProvider";
import { SITE_NAME, SITE_URL } from "./lib/site";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Voltius - Local-First SSH & SFTP Client",
    template: `%s - ${SITE_NAME}`,
  },
  description:
    "A blazing fast, local-first SSH & SFTP client built with Rust and Tauri. E2EE sync, SFTP drag & drop, Docker, plugins, and more. Free forever.",
  applicationName: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Voltius - Local-First SSH & SFTP Client",
    description:
      "A blazing fast, local-first SSH & SFTP client built with Rust and Tauri. E2EE sync, SFTP drag & drop, Docker, plugins, and more. Free forever.",
    url: "/",
    siteName: SITE_NAME,
    images: ["/opengraph-image"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@VoltiusApp",
    creator: "@VoltiusApp",
    title: "Voltius - Local-First SSH & SFTP Client",
    description:
      "A blazing fast, local-first SSH & SFTP client built with Rust and Tauri. E2EE sync, SFTP drag & drop, Docker, plugins, and more. Free forever.",
    images: ["/twitter-image"],
  },
  icons: { icon: "/logo.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen flex flex-col">
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
