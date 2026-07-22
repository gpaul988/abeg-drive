import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AbegDrive | Designated Driver Service — Port Harcourt",
  description:
    "Book a professional driver to safely drive your own vehicle home. Verified drivers, live tracking, panic button.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
