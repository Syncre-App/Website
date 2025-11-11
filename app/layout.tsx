import type { Metadata } from "next"; 
import "./globals.css";
import "./polyfills";
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "Syncre",
  description: "Syncre is a secure, cross-platform mobile communication application built with React Native and Expo. It focuses on privacy and security through end-to-end encryption for all communications.",
  authors: [
    {
      name: "Syncre Team",
      url: "https://github.com/Syncre-App",
    },
  ],
  keywords: [
    "Syncre",
    "Chat",
    "Open Source",
    "Cross Platform",
    "Modern Chat Application",
  ]
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
          <div className="app-bg" aria-hidden="true" />
          {children}
        </body>
      </html>
    </>
  );
}
