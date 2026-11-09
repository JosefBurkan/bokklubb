"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type AppChromeProps = {
  children: ReactNode;
  siteHeader: ReactNode;
  siteFooter: ReactNode;
};

// Public pages keep the club header and footer; admin pages use their own shell.
export default function AppChrome({
  children,
  siteHeader,
  siteFooter,
}: AppChromeProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && siteHeader}
      <div className="flex flex-1 flex-col bg-page-gradient">{children}</div>
      {!isAdminRoute && siteFooter}
    </>
  );
}
