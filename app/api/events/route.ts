import { cookies } from "next/headers";

import { createClient } from "@/supabase/server";

const VALID_CATEGORIES = [
  "Sosial",
  "Aktivitet",
  "Diskusjon",
  "Annet",
];

// GET /api/events
// Returns all events.
export async function GET() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("eventer")
    .select("*")
    .order("date", { ascending: true });

  if (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return Response.json(data);
}


// POST /api/events
// Creates a new event.
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Check that the current user is the admin.
  const { data: authData, error: authError } =
    await supabase.auth.getClaims();

  if (
    authError ||
    !authData?.claims ||
    authData.claims.sub !== process.env.ADMIN_USER_ID
  ) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.json();

  // Validate required fields.
  if (
    !body.date ||
    !body.description ||
    !body.category
  ) {
    return Response.json(
      {
        error:
          "Dato, beskrivelse og kategori er påkrevd",
      },
      { status: 400 }
    );
  }

  // Make sure the category is one of our allowed categories.
  if (!VALID_CATEGORIES.includes(body.category)) {
    return Response.json(
      { error: "Ugyldig kategori" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("eventer")
    .insert({
      date: body.date,
      description: body.description,
      category: body.category,
      listOfParticipants: [],
    })
    .select()
    .single();

  if (error) {
    return Response.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return Response.json(data, { status: 201 });
}
