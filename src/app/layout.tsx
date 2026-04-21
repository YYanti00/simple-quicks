import type { Metadata } from "next";
import "./globals.css";
import { Lato } from "next/font/google";
import { SearchIcon, MenuIcon } from "lucide-react";

const LatoFont = Lato({
  weight: ["400", "700"],
  variable: "--font-lato",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Simple Quicks",
  description: "Simple Quicks - A simple quicks app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${LatoFont.variable} h-full antialiased`}>
      <body className="min-h-full flex bg-(--color-bg-dark-1)">
        <aside className="hidden md:flex w-64 flex-col border-r border-(--color-border-1)">
          <div className="p-4"></div>
        </aside>

        <main className="flex-1 flex flex-col bg-(--color-bg-dark) w-full">
          <div className="bg-(--color-bg-dark-2) px-4 py-3 md:px-6 md:py-4">
            <SearchIcon size={20} className="text-white" />
          </div>
          <div className="flex flex-1 justify-end">{children}</div>
        </main>
      </body>
    </html>
  );
}
