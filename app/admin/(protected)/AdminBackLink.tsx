import Link from "next/link";

export default function AdminBackLink() {
  return (
    <Link
      href="/admin"
      className="inline-flex items-center gap-2 text-sm font-semibold text-[#6A465E] underline decoration-[#C99B72] underline-offset-4 transition hover:text-[#A9533D]"
    >
      ← Tilbake til adminpanelet
    </Link>
  );
}
