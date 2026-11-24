import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";

// Search the public book collection so members can find books for their shelf.
export async function GET(request: Request) {
  const search = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (search.length < 2) return Response.json([]);

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const safeSearch = search.replace(/[(),."\\]/g, " ").slice(0, 80);
  const { data, error } = await supabase
    .from("Books")
    .select("id, name, author")
    .or(`name.ilike.%${safeSearch}%,author.ilike.%${safeSearch}%`)
    .order("name", { ascending: true })
    .limit(12);

  if (error) return Response.json({ error: "Kunne ikke søke i bokhyllen." }, { status: 500 });
  return Response.json(data ?? []);
}

// Add a book association for the authenticated member without creating a review.
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json({ error: "Du må logge inn for å legge til bøker." }, { status: 401 });
  }

  let body: { bookId?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Ugyldig forespørsel." }, { status: 400 });
  }

  const bookId = Number(body.bookId);
  if (!Number.isSafeInteger(bookId) || bookId <= 0) {
    return Response.json({ error: "Velg en gyldig bok." }, { status: 400 });
  }

  const [{ data: existingShelfBook, error: shelfLookupError }, { data: existingReview, error: reviewLookupError }] = await Promise.all([
    supabase
      .from("profile_books")
      .select("book_id")
      .eq("profile_id", user.id)
      .eq("book_id", bookId)
      .maybeSingle(),
    supabase
      .from("book_reviews")
      .select("id")
      .eq("user_id", user.id)
      .eq("book_id", bookId)
      .not("review", "is", null)
      .limit(1)
      .maybeSingle(),
  ]);

  if (shelfLookupError || reviewLookupError) {
    return Response.json({ error: "Kunne ikke kontrollere bokhyllen din." }, { status: 500 });
  }
  if (existingShelfBook || existingReview) {
    return Response.json({ error: "Denne boka ligger allerede på profilen din." }, { status: 409 });
  }

  const { data: profile, error: profileLookupError } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();
  if (profileLookupError) {
    return Response.json({ error: "Kunne ikke hente profilen din." }, { status: 500 });
  }
  const displayName = profile?.display_name
    || user.user_metadata?.preferred_username
    || user.user_metadata?.user_name
    || user.user_metadata?.username
    || user.user_metadata?.global_name
    || user.user_metadata?.name
    || user.user_metadata?.full_name
    || "Bokklubbmedlem";

  // Create the profile on first use so the profile_books foreign key can resolve.
  if (!profile) {
    const { error: profileInsertError } = await supabase.from("profiles").insert({
      id: user.id,
      display_name: displayName,
      bio: "",
    });

    if (profileInsertError) {
      return Response.json({ error: "Kunne ikke opprette profilen din." }, { status: 500 });
    }
  }

  const { error } = await supabase.from("profile_books").insert({
    profile_id: user.id,
    book_id: bookId,
  });

  if (error?.code === "23505") {
    return Response.json({ error: "Denne boka ligger allerede på profilen din." }, { status: 409 });
  }
  if (error) {
    console.error("Could not add book to community profile:", error.message);
    return Response.json({ error: "Kunne ikke legge boka til i profilen." }, { status: 500 });
  }

  return Response.json({ success: true }, { status: 201 });
}

// Remove a book from the authenticated member's read shelf.
export async function DELETE(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json({ error: "Du må logge inn for å endre bokhyllen." }, { status: 401 });
  }

  let body: { bookId?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Ugyldig forespørsel." }, { status: 400 });
  }

  const bookId = Number(body.bookId);
  if (!Number.isSafeInteger(bookId) || bookId <= 0) {
    return Response.json({ error: "Ugyldig bok." }, { status: 400 });
  }

  const { data: removed, error } = await supabase
    .from("profile_books")
    .delete()
    .eq("profile_id", user.id)
    .eq("book_id", bookId)
    .select("book_id")
    .maybeSingle();

  if (error) {
    console.error("Could not remove book from community profile:", error.message);
    return Response.json({ error: "Kunne ikke fjerne boka fra leselisten." }, { status: 500 });
  }
  if (!removed) {
    return Response.json({ error: "Fant ikke boka på leselisten din." }, { status: 404 });
  }

  return Response.json({ success: true });
}
