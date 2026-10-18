
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@/supabase/server";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function uploadImage(buffer: Buffer): Promise<{
  secure_url: string;
  public_id: string;
}> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: "bokklubb/manedens-boker",
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary-opplasting feilet."));
          return;
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      },
    ).end(buffer);
  });
}

export async function POST(request: Request) {
  // 1. Verify the logged-in administrator.
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.auth.getClaims();

  if (
    error ||
    !data?.claims ||
    data.claims.sub !== process.env.ADMIN_USER_ID
  ) {
    return NextResponse.json(
      { error: "Du har ikke tilgang." },
      { status: 403 },
    );
  }

  // 2. Read and validate the form.
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Ugyldig skjemadata." },
      { status: 400 },
    );
  }

  const name = formData.get("name");
  const description = formData.get("description");
  const image = formData.get("image");

  if (
    typeof name !== "string" ||
    !name.trim() ||
    name.trim().length > 200
  ) {
    return NextResponse.json(
      { error: "Oppgi en boktittel på maks 200 tegn." },
      { status: 400 },
    );
  }

  if (
    typeof description !== "string" ||
    !description.trim() ||
    description.trim().length > 10000
  ) {
    return NextResponse.json(
      { error: "Oppgi en beskrivelse på maks 10 000 tegn." },
      { status: 400 },
    );
  }

  if (!(image instanceof File) || image.size === 0) {
    return NextResponse.json(
      { error: "Velg et omslagsbilde." },
      { status: 400 },
    );
  }

  if (
    !ALLOWED_TYPES.has(image.type) ||
    image.size > MAX_IMAGE_SIZE
  ) {
    return NextResponse.json(
      { error: "Bruk JPG, PNG eller WebP på maksimalt 5 MB." },
      { status: 400 },
    );
  }

  if (!process.env.CLOUDINARY_URL) {
    return NextResponse.json(
      { error: "Cloudinary er ikke konfigurert på serveren." },
      { status: 500 },
    );
  }

  // 3. Upload the image, then save its URL in Supabase.
  let uploadedPublicId: string | undefined;

  try {
    const buffer = Buffer.from(await image.arrayBuffer());
    const uploaded = await uploadImage(buffer);
    uploadedPublicId = uploaded.public_id;

    const { data: book, error: insertError } = await supabase
      .from("manedens_Bok")
      .insert({
        name: name.trim(),
        description: description.trim(),
        cloudinaryPath: uploaded.secure_url,
        active: false,
      })
      .select("id")
      .single();

    if (insertError) {
      // Avoid leaving an orphaned image if the database insert fails.
      try {
        await cloudinary.uploader.destroy(uploadedPublicId);
      } catch (cleanupError) {
        console.error("Cloudinary cleanup failed:", cleanupError);
      }

      console.error("Could not save book:", insertError.message);

      return NextResponse.json(
        { error: "Boka ble lastet opp, men kunne ikke lagres i databasen. Kontroller Supabase-policyene." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, id: book.id },
      { status: 201 },
    );
  } catch (uploadError) {
    console.error("Book upload failed:", uploadError);

    if (uploadedPublicId) {
      try {
        await cloudinary.uploader.destroy(uploadedPublicId);
      } catch (cleanupError) {
        console.error("Cloudinary cleanup failed:", cleanupError);
      }
    }

    return NextResponse.json(
      { error: "Kunne ikke laste opp eller lagre boka." },
      { status: 500 },
    );
  }
}
