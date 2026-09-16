import type { Metadata } from "next";
import "./globals.css";

import Footer from "./components/Footer";
import Header from "./components/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <body className="flex min-h-screen flex-col bg-page text-gray-900">

        <Header />
        
        <div className="flex flex-1 flex-col">
          {children}
        </div>

        <Footer />
      </body>
    </html>
  );
}
