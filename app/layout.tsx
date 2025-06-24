import type { Metadata } from "next";import "./globals.css";

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
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
