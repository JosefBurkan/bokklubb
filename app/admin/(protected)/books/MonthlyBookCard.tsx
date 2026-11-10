import Link from "next/link";

import BookStatusButton from "./BookStatusButton";
import DeleteBookButton from "./DeleteBookButton";

type MonthlyBook = {
  id: number;
  name: string;
  description: string;
  cloudinaryPath: string | null;
  created_at: string;
};

type MonthlyBookCardProps = {
  book: MonthlyBook;
  registeredMonth: string;
};

// Highlights the selected book with its cover, status, and distinct admin actions.
export default function MonthlyBookCard({ book, registeredMonth }: MonthlyBookCardProps) {
  return (
    <article className="grid gap-5 rounded-2xl border border-[#D0C1B5] bg-[#F7F1E9] p-4 shadow-[0_4px_16px_rgba(51,31,46,0.06)] sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6 sm:p-5">
      {/* Keep the complete cover visible inside a consistent warm frame. */}
      <div className="mx-auto flex h-48 w-36 items-center justify-center overflow-hidden rounded-xl bg-[#E9DFD6] p-3 sm:mx-0 sm:h-56 sm:w-full">
        {book.cloudinaryPath ? (
          <img src={book.cloudinaryPath} alt={`Omslaget til ${book.name}`} className="h-full w-full object-contain" />
        ) : (
          <span className="text-center text-sm font-medium text-[#76576F]">Ingen bokomslag</span>
        )}
      </div>

      {/* Put the book identity and current status before its available actions. */}
      <div className="flex min-w-0 flex-col items-start py-1">
        <span className="rounded-full bg-[#F1E4BD] px-3 py-1 text-xs font-bold text-[#735313]">
          Månedens bok
        </span>
        <h3 className="mt-3 font-display text-2xl font-semibold text-[#331F2E]">{book.name}</h3>
        <p className="mt-2 max-w-2xl leading-6 text-[#594653]">{book.description}</p>
        <p className="mt-3 text-sm text-[#5D4B57]">Registrert i {registeredMonth}</p>

        {/* Editing is primary; status change is neutral, and deletion stays outlined red. */}
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={`/admin/books/${book.id}/edit`}
            className="inline-flex items-center rounded-lg border border-[#331F2E] bg-[#331F2E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5C3C54]"
          >
            Rediger bok
          </Link>
          <BookStatusButton bookId={book.id} active />
          <DeleteBookButton bookId={book.id} bookName={book.name} />
        </div>
      </div>
    </article>
  );
}
