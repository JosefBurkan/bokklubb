
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

type RouteContext = {
  params: Promise<{ id: string }>;
};

function uploadImage(buffer: Buffer): Promise<{
  secure_url: string;
  public_id: string;
}> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
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
      )
      .end(buffer);
  });
}

export async PATCH(
  request: Request,
  context: RouteContext,
) {
  const { id } = await context.params;

  if (!/^\d+$/.test(id)) {
    return NextResponse.json(
      { error: "Ugyldig bok-ID." },
      { status: 400 },
    );
  }

  // Verify administrator session.
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (
    claimsError ||
    !claimsData?.claims ||
    claimsData.claims.sub !== process.env.ADMIN_USER_ID
  ) {
    return NextResponse.json(
      { error: "Du har ikke tilgang." },
      { status: 403 },
    );
  }

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
  const imageEntry = formData.get("image");

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

  let image: File | null = null;

  if (imageEntry !== null) {
    if (!(imageEntry instanceof File) || imageEntry.size === 0) {
      return NextResponse.json(
        { error: "Ugyldig bildefil." },
        { status: 400 },
      );
    }

    if (
      !ALLOWED_TYPES.has(imageEntry.type) ||
      imageEntry.size > MAX_IMAGE_SIZE
    ) {
      return NextResponse.json(
        { error: "Bruk JPG, PNG eller WebP på maksimalt 5 MB." },
        { status: 400 },
      );
    }

    image = imageEntry;
  }

  if (image && !process.env.CLOUDINARY_URL) {
    return NextResponse.json(
      { error: "Cloudinary er ikke konfigurert på serveren." },
      { status: 500 },
    );
  }

  let uploadedPublicId: string | undefined;

  try {
    const updates: {
      name: string;
      description: string;
      cloudinaryPath?: string;
    } = {
      name: name.trim(),
      description: description.trim(),
    };

    // Only upload a replacement if the admin selected an image.
    if (image) {
      const buffer = Buffer.from(await image.arrayBuffer());
      const uploaded = await uploadImage(buffer);

      uploadedPublicId = uploaded.public_id;
      updates.cloudinaryPath = uploaded.secure_url;
    }

    const { data: book, error: updateError } = await supabase
      .from("Books")
      .update(updates)
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (updateError || !book) {
      // Remove the newly uploaded image if the database update failed.
      if (uploadedPublicId) {
        try {
          await cloudinary.uploader.destroy(uploadedPublicId);
        } catch (cleanupError) {
          console.error("Cloudinary cleanup failed:", cleanupError);
        }
      }

      console.error("Could not update book:", updateError?.message);

      return NextResponse.json(
        {
          error: updateError
            ? "Kunne ikke oppdatere boka. Kontroller Supabase-policyene."
            : "Fant ikke boka, eller du har ikke tilgang til å oppdatere den.",
        },
        { status: updateError ? 500 : 404 },
      );
    }

    return NextResponse.json({ success: true, id: book.id });
  } catch (updateError) {
    console.error("Book update failed:", updateError);

    if (uploadedPublicId) {
      try {
        await cloudinary.uploader.destroy(uploadedPublicId);
      } catch (cleanupError) {
        console.error("Cloudinary cleanup failed:", cleanupError);
      }
    }

    return NextResponse.json(
      { error: "Kunne ikke oppdatere boka." },
      { status: 500 },
    );
  }
}
