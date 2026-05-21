import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/lib/lang-context";
import { ProfileProvider } from "@/lib/profile-context";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LehrstellenSniper",
  description: "Finde offene Lehrstellen in der Schweiz und bewirb dich mit personalisierten Schreiben.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            var t = localStorage.getItem('ls_theme') || 'ocean';
            var m = localStorage.getItem('ls_mode') || 'dark';
            document.documentElement.setAttribute('data-theme', t);
            document.documentElement.setAttribute('data-mode', m);
          } catch(e) {}
        ` }} />
      </head>
      <body className="h-full antialiased">
        <LangProvider><ProfileProvider>{children}</ProfileProvider></LangProvider>
      </body>
    </html>
  );
}