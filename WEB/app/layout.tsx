import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";

export const metadata: Metadata = {
  title: "FindAMeal",
  description: "AI-powered nearby business finder with modern design and smart filtering."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-sand text-ink transition-colors duration-300 dark:bg-slate-900 dark:text-slate-100 antialiased">
        <ThemeProvider>
          {/* <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute right-[-8rem] top-[-7rem] h-72 w-72 rounded-full bg-amber/20 blur-3xl" />
            <div className="absolute left-[-6rem] top-1/3 h-80 w-80 rounded-full bg-leaf/15 blur-3xl" />
            <div className="absolute bottom-[-10rem] right-1/4 h-72 w-72 rounded-full bg-paper blur-3xl" />
          </div> */}
          <div className="relative mx-auto min-h-screen max-w-7xl px-1 py-6 sm:px-2 lg:px-4">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
