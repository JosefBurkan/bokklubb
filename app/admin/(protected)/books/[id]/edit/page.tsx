
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { createClient } from "@/supabase/server";
import EditBookForm from "./EditBookForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditBookPage({ params }: Props) {
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    notFound();
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: book, error } = await supabase
    .from("Books")
    .select("id, name, description, cloudinaryPath, active")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Could not load book for editing:", error.message);
    throw new Error("Kunne ikke hente boka for redigering.");
  }

  if (!book) {
    notFound();
  }

  return <EditBookForm book={book} />;
}
