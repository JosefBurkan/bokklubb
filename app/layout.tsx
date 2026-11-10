import "./globals.css";

import Footer from "./components/Footer";
import Header from "./components/Header";
import AppChrome from "./components/AppChrome";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <body className="flex min-h-screen flex-col bg-page text-gray-900">

        <AppChrome siteHeader={<Header />} siteFooter={<Footer />}>
          {children}
        </AppChrome>
      </body>
    </html>
  );
}
