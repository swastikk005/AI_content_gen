import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/landing/Navbar";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://swastik-contentforge.vercel.app"),
  title: "ContentForge AI — Write Better Content 10x Faster",
  description: "AI-powered blog post and YouTube script generator. Research, write, and export in 60 seconds. Built for creator-first workflows.",
  keywords: ["AI content generator", "blog writer", "YouTube script AI", "content automation", "SaaS", "Next.js"],
  authors: [{ name: "Swastik" }],
  openGraph: {
    title: "ContentForge AI — AI-Powered Content Engine",
    description: "Generate high-ranking blog posts and engaging YouTube scripts with integrated research features.",
    url: "https://swastik-contentforge.vercel.app",
    siteName: "ContentForge AI",
    images: [
      {
        url: "/og-image.png", // User would need to add this, but we define it
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ContentForge AI — Research, Write, Export in 60s",
    description: "The ultimate tool for creators who want to scale their content production.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-[#0a0a0f] text-white antialiased`}>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
