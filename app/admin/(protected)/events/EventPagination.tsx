import Link from "next/link";

type EventPaginationProps = {
  page: number;
  pageSize: number;
  totalCount: number;
};

// Shows the current event result range and navigation between server pages.
export default function EventPagination({
  page,
  pageSize,
  totalCount,
}: EventPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const firstResult = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastResult = Math.min(page * pageSize, totalCount);

  function pageHref(targetPage: number) {
    return targetPage === 1 ? "/admin/events" : `/admin/events?page=${targetPage}`;
  }

  return (
    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[#594653]" aria-live="polite">
        {firstResult}–{lastResult} av {totalCount} arrangementer
      </p>

      {totalPages > 1 && (
        <nav aria-label="Sidenavigasjon for arrangementer" className="flex items-center justify-between gap-3 sm:justify-end">
          {page > 1 ? (
            <Link
              href={pageHref(page - 1)}
              className="rounded-lg border border-[#B8A8A0] bg-[#FFFCF7] px-4 py-2 text-sm font-semibold text-[#331F2E] hover:bg-[#F0E7DE]"
            >
              ← Forrige
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm font-medium text-[#5C3C54]">
            Side {page} av {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={pageHref(page + 1)}
              className="rounded-lg border border-[#B8A8A0] bg-[#FFFCF7] px-4 py-2 text-sm font-semibold text-[#331F2E] hover:bg-[#F0E7DE]"
            >
              Neste →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
