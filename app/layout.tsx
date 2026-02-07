import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YouTube Multi-Video Downloader",
  description: "Download multiple YouTube videos as MP4 or MP3",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-900 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
