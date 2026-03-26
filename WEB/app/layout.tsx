import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FindAMeal",
  description: "A simple starter app to browse places and connect to the FindAMeal API."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </body>
    </html>
  );
}

