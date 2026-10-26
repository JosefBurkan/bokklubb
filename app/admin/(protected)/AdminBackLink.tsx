import Link from "next/link";

export default function AdminBackLink() {
  return (
    <Link
      href="/admin"
      className="text-sm text-white/80 underline hover:text-white"
    >
      ← Tilbake til adminpanelet
    </Link>
  );
}
