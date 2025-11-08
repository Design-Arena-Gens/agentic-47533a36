import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Naruto vs Sasuke - 2D Fighting Game",
  description: "Play a browser-based Naruto vs Sasuke 2D fighting game built with Next.js"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
