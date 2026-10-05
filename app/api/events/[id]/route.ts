import { cookies } from "next/headers";

import { createClient } from "@/supabase/server";

const VALID_CATEGORIES = [
  "Sosial",
  "Aktivitet",
  "Diskusjon",
  "Annet",
];


// GET /api/events/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("eventer")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }

  if (!data) {
    return Response.json(
      { error: "Event not found" },
      { status: 404 }
    );
  }

  return Response.json(data);
}


// PATCH /api/events/[id]
// Updates an existing event.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Make sure the user is the admin.
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

  if (!VALID_CATEGORIES.includes(body.category)) {
    return Response.json(
      { error: "Ugyldig kategori" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("eventer")
    .update({
      date: body.date,
      description: body.description,
      category: body.category,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return Response.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return Response.json(data);
}


// DELETE /api/events/[id]
// Deletes an event.
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Make sure the user is the admin.
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

  const { data, error } = await supabase
    .from("eventer")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return Response.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return Response.json(data);
}
