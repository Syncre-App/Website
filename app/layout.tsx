import type { Metadata } from "next";
import "./globals.css";
import "./polyfills";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "./chat/AuthProvider";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: "Syncre",
  description: "Syncre is a secure, cross-platform messaging application with end-to-end encryption.",
  authors: [
    {
      name: "Syncre Team",
      url: "https://github.com/Syncre-App",
    },
  ],
  keywords: [
    "Syncre",
    "Chat",
    "Messaging",
    "End-to-end encryption",
    "Secure messaging",
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
        <body className="bg-black">
          <AuthProvider>
            <Navbar />
            {children}
          </AuthProvider>
        </body>
      </html>
    </>
  );
}
