import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  axes: ["opsz"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono-source",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ProbeRoom: Rehearse UX interviews",
  description:
    "Practice UX interview questions with AI role-play participants before speaking to real users.",
};

// Applies the stored theme before hydration so dark mode never flashes light.
const THEME_SCRIPT = `try{if(localStorage.getItem("boardui:theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background-full text-text-primary">
        <Script id="proberoom-theme" strategy="beforeInteractive">
          {THEME_SCRIPT}
        </Script>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
