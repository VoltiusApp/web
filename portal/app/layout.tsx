import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voltius — Account",
  description: "Sign up or sign in to Voltius",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
