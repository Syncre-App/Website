import type { Metadata } from "next"; import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "Syncre",
  description: "A modern, open-source, and self-hosted alternative to Notion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Analytics />
      <html lang="en">
        <body>
          {children}
        </body>
      </html>
    </>
  );
}
