import Link from "next/link";

import BookStatusButton from "./BookStatusButton";
import DeleteBookButton from "./DeleteBookButton";

type CollectionBook = {
  id: number;
  name: string;
  description: string;
  cloudinaryPath: string | null;
  active: boolean;
  created_at: string;
};

type BookCollectionCardProps = {
  book: CollectionBook;
  registeredMonth: string;
};

// Stacked book record for narrow screens where the desktop table is too wide.
export default function BookCollectionCard({ book, registeredMonth }: BookCollectionCardProps) {
  return (
    <article className="rounded-2xl border border-[#D0C1B5] bg-[#F7F1E9] p-4 shadow-[0_4px_16px_rgba(51,31,46,0.06)]">
      <div className="flex min-w-0 items-start gap-3">
        {book.cloudinaryPath ? (
          <img src={book.cloudinaryPath} alt={`Omslaget til ${book.name}`} className="h-20 w-14 shrink-0 rounded-md object-cover" />
        ) : (
          <div aria-hidden="true" className="h-20 w-14 shrink-0 rounded-md bg-[#E4D9CF]" />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-[#331F2E]">{book.name}</h3>
          <p className="mt-1 line-clamp-3 text-sm leading-5 text-[#594653]">{book.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#5D4B57]">
            <span>Registrert i {registeredMonth}</span>
            <span aria-hidden="true">·</span>
            {book.active ? (
              <span className="rounded-full bg-[#F1E4BD] px-2 py-1 font-semibold text-[#735313]">Månedens bok</span>
            ) : (
              <span>Arkivert</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-[#E1D6CC] pt-4">
        <Link
          href={`/admin/books/${book.id}/edit`}
          className="inline-flex items-center rounded-lg border border-[#B8A8A0] bg-[#FFFCF7] px-3 py-2 text-sm font-semibold text-[#331F2E] hover:bg-[#F0E7DE]"
        >
          Rediger bok
        </Link>
        <BookStatusButton bookId={book.id} active={book.active} />
        <DeleteBookButton bookId={book.id} bookName={book.name} />
      </div>
    </article>
  );
}
