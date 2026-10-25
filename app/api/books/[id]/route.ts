
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@/supabase/server";

export const runtime = "nodejs";

// Cover uploads are limited to 5 MB and common web image formats.
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

// Existing rows store the Cloudinary URL instead of its public_id. Extract the
// public_id from the URL so the associated cover can also be deleted.
function getCloudinaryPublicId(imageUrl: string | null): string | null {
  if (!imageUrl) return null;

  try {
    const url = new URL(imageUrl);
    if (url.hostname !== "res.cloudinary.com") return null;

    const pathParts = url.pathname.split("/").filter(Boolean);
    const uploadIndex = pathParts.indexOf("upload");
    if (uploadIndex < 0) return null;

    const assetParts = pathParts.slice(uploadIndex + 1);
    if (assetParts[0]?.match(/^v\d+$/)) assetParts.shift();
    if (assetParts.length === 0) return null;

    const lastPartIndex = assetParts.length - 1;
    assetParts[lastPartIndex] = assetParts[lastPartIndex].replace(/\.[^.]+$/, "");

    return assetParts.map(decodeURIComponent).join("/");
  } catch {
    return null;
  }
}

// PATCH /api/books/:id
// JSON body { "active": true|false } changes whether this book is the book of the month.
// Multipart form data { name, description, image? } edits the book's details and optional cover.
export async function PATCH(
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

  // Protect every kind of book change, including requests made directly to this API.
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

  // The JSON form is reserved for changing the active status only.
  if (request.headers.get("content-type")?.includes("application/json")) {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Ugyldig JSON-data." },
        { status: 400 },
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      !("active" in body) ||
      typeof body.active !== "boolean"
    ) {
      return NextResponse.json(
        { error: "Oppgi active som true eller false." },
        { status: 400 },
      );
    }

    const { data: targetBook, error: targetError } = await supabase
      .from("Books")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (targetError) {
      return NextResponse.json(
        { error: "Kunne ikke hente boka fra databasen." },
        { status: 500 },
      );
    }

    if (!targetBook) {
      return NextResponse.json(
        { error: "Fant ikke boka." },
        { status: 404 },
      );
    }

    if (body.active) {
      // Remember the current selection so it can be restored if activating the new
      // book fails after the old one has been deactivated.
      const { data: activeBooks, error: activeBooksError } = await supabase
        .from("Books")
        .select("id")
        .eq("active", true);

      if (activeBooksError) {
        return NextResponse.json(
          { error: "Kunne ikke hente den aktive boka." },
          { status: 500 },
        );
      }

      const previousActiveIds = (activeBooks ?? [])
        .map((book) => book.id)
        .filter((activeId) => activeId !== targetBook.id);

      // Keep at most one selected book by clearing the active flag before setting it
      // on the requested book.
      const { error: deactivateError } = await supabase
        .from("Books")
        .update({ active: false })
        .eq("active", true);

      if (deactivateError) {
        return NextResponse.json(
          { error: "Kunne ikke deaktivere den nåværende boka." },
          { status: 500 },
        );
      }

      // Activate the requested book. If this update fails, restore the old selection.
      const { data: activatedBook, error: activateError } = await supabase
        .from("Books")
        .update({ active: true })
        .eq("id", id)
        .select("id")
        .maybeSingle();

      if (activateError || !activatedBook) {
        // Restore the previous selection if activating the new book fails.
        if (previousActiveIds.length > 0) {
          const { error: restoreError } = await supabase
            .from("Books")
            .update({ active: true })
            .in("id", previousActiveIds);

          if (restoreError) {
            console.error("Could not restore active book:", restoreError.message);
          }
        }

        return NextResponse.json(
          { error: "Kunne ikke aktivere boka." },
          { status: 500 },
        );
      }

      return NextResponse.json({ success: true, id: activatedBook.id, active: true });
    }

    // Deactivating a book is allowed to leave no active book selected.
    const { data: deactivatedBook, error: deactivateError } = await supabase
      .from("Books")
      .update({ active: false })
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (deactivateError || !deactivatedBook) {
      return NextResponse.json(
        { error: "Kunne ikke deaktivere boka." },
        { status: deactivateError ? 500 : 404 },
      );
    }

    return NextResponse.json({ success: true, id: deactivatedBook.id, active: false });
  }

  // Non-JSON PATCH requests edit book details using multipart form data so covers
  // can be uploaded without exposing Cloudinary credentials to the browser.
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

  // Keep the Cloudinary ID so an uploaded image can be removed if the database
  // update fails, avoiding an orphaned file.
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

// DELETE /api/books/:id
// Removes the book for the configured admin and then best-effort deletes its cover.
export async function DELETE(
  _request: Request,
  context: RouteContext,
) {
  const { id } = await context.params;

  if (!/^\d+$/.test(id)) {
    return NextResponse.json(
      { error: "Ugyldig bok-ID." },
      { status: 400 },
    );
  }

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

  const { data: existingBook, error: fetchError } = await supabase
    .from("Books")
    .select("id, cloudinaryPath")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    console.error("Could not fetch book before deletion:", fetchError.message);
    return NextResponse.json(
      { error: "Kunne ikke hente boka fra databasen." },
      { status: 500 },
    );
  }

  if (!existingBook) {
    return NextResponse.json(
      { error: "Fant ikke boka." },
      { status: 404 },
    );
  }

  const { data: deletedBook, error: deleteError } = await supabase
    .from("Books")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (deleteError || !deletedBook) {
    console.error("Could not delete book:", deleteError?.message);
    return NextResponse.json(
      { error: "Kunne ikke slette boka. Kontroller Supabase-policyene." },
      { status: deleteError ? 500 : 404 },
    );
  }

  const publicId = getCloudinaryPublicId(existingBook.cloudinaryPath);
  if (publicId && process.env.CLOUDINARY_URL) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (cleanupError) {
      // The database deletion has succeeded. Log cleanup failures for follow-up.
      console.error("Could not delete the book cover from Cloudinary:", cleanupError);
    }
  } else if (existingBook.cloudinaryPath) {
    console.warn("Book removed but its Cloudinary cover could not be cleaned up.");
  }

  return NextResponse.json({ success: true, id: deletedBook.id });
}
