"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import LogoutButton from "@/app/components/LogoutButton";

const ADMIN_LINKS = [
  { href: "/admin", label: "Oversikt", number: "01" },
  { href: "/admin/events", label: "Arrangementer", number: "02" },
  { href: "/admin/books", label: "Bøker", number: "03" },
  { href: "/admin/news-letter", label: "Nyhetsbrev", number: "04" },
];

// Persistent sidebar for the protected admin workspace.
export default function AdminNavigation() {
  const pathname = usePathname();

  function isActive(href: string) {
    return href === "/admin"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside className="z-40 flex w-full shrink-0 flex-col border-b border-[#5B4353] bg-[#3D2A39] text-[#F8EEE5] md:sticky md:top-0 md:h-screen md:w-64 md:border-b-0 md:border-r">
      {/* Brand and admin label. */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 md:block md:px-6 md:pb-7 md:pt-8">
        <Link href="/admin" className="inline-flex items-baseline gap-3">
          <span className="font-display text-2xl font-bold tracking-tight">Lesely</span>
          <span className="rounded-full bg-[#F2C676] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#331F2E]">
            Admin
          </span>
        </Link>
        <p className="mt-1 hidden text-[10px] font-semibold uppercase tracking-[0.22em] text-[#D7C1D2] md:block">
          Administrasjon
        </p>
      </div>

      {/* Keep navigation horizontal on small screens and vertical in the sidebar. */}
      <nav aria-label="Administrasjon" className="px-3 py-3 md:flex-1 md:px-4 md:py-7">
        <p className="mb-3 hidden px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C4AFC0] md:block">
          Arbeidsområde
        </p>
        <div className="flex gap-1 overflow-x-auto md:flex-col">
          {ADMIN_LINKS.map((link) => {
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-w-max items-center gap-3 rounded-lg border-b-2 px-3 py-2.5 text-sm font-semibold transition md:w-full md:border-b-0 md:border-l-2 ${
                  active
                    ? "border-[#F2C676] bg-[#694F64] text-white shadow-sm shadow-black/10"
                    : "border-transparent text-[#E5D7E2]/85 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="text-[10px] font-bold tracking-[0.12em] text-[#E7B5A8]/85">
                  {link.number}
                </span>
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Website link, administrator identity, and sign-out action. */}
      <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3 md:block md:px-5 md:py-5">
        <Link
          href="/"
          className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-[#F1E5EE] transition hover:border-white/30 hover:bg-white/5 sm:text-sm md:mb-5 md:block"
        >
          Vis nettsiden
        </Link>
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#E7B5C9] font-display text-sm font-bold text-[#3D2A39]">
            A
          </span>
          <div className="hidden min-w-0 md:block">
            <p className="truncate text-xs font-semibold">Administrator</p>
            <p className="mt-0.5 text-[11px] text-[#D7C1D2]">Lesely</p>
          </div>
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
