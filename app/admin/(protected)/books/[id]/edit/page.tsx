
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";

import { createClient } from "@/supabase/server";

type EditBookPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

// Server page: loads the selected book, protects the update action, and renders its form.
export default async function EditBookPage({
  params,
}: EditBookPageProps) {
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    notFound();
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Verify that the current user is the configured admin.
  const { data: authData, error: authError } =
    await supabase.auth.getClaims();

  if (
    authError ||
    !authData?.claims ||
    authData.claims.sub !== process.env.ADMIN_USER_ID
  ) {
    redirect("/admin/login");
  }

  // Fetch the book being edited.
  const { data: book, error: bookError } = await supabase
    .from("Books")
    .select("id, name, author, description, cloudinaryPath, active")
    .eq("id", id)
    .maybeSingle();

  if (bookError) {
    console.error("Could not fetch book:", bookError.message);

    return (
      <main className="min-h-full flex-1 bg-[#E2D9D0] px-6 py-10 text-[#331F2E] sm:py-14">
        <div className="mx-auto max-w-3xl rounded-2xl border border-[#D0C1B5] bg-[#F7F1E9] p-6 shadow-[0_4px_16px_rgba(51,31,46,0.06)]">
          {/* Explain the load failure and offer a way back to the book list. */}
          <h1 className="font-display text-2xl font-semibold text-[#331F2E]">
            Kunne ikke hente boka
          </h1>

          <p className="mt-3 text-[#5C3C54]">
            {bookError.message}
          </p>

          <Link
            href="/admin/books"
            className="mt-6 inline-block font-semibold text-[#A9533D] underline"
          >
            ← Tilbake til bokadministrasjon
          </Link>
        </div>
      </main>
    );
  }

  if (!book) {
    notFound();
  }

  // Server Action for updating the book.
  async function updateBook(formData: FormData) {
    "use server";

    // Verify admin again inside the Server Action.
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: authData, error: authError } =
      await supabase.auth.getClaims();

    if (
      authError ||
      !authData?.claims ||
      authData.claims.sub !== process.env.ADMIN_USER_ID
    ) {
      redirect("/admin/login");
    }

    const name = String(formData.get("name") ?? "").trim();
    const author = String(formData.get("author") ?? "").trim();
    const description = String(
      formData.get("description") ?? "",
    ).trim();

    const imageEntry = formData.get("image");

    if (!name || name.length > 200) {
      throw new Error("Boktittelen må være mellom 1 og 200 tegn.");
    }

    if (author.length > 200) {
      throw new Error("Forfatternavnet kan ikke være lengre enn 200 tegn.");
    }

    if (!description || description.length > 10000) {
      throw new Error(
        "Beskrivelsen må være mellom 1 og 10 000 tegn.",
      );
    }

    let image: File | null = null;

    if (imageEntry instanceof File && imageEntry.size > 0) {
      if (
        !ALLOWED_TYPES.has(imageEntry.type) ||
        imageEntry.size > MAX_IMAGE_SIZE
      ) {
        throw new Error(
          "Bruk JPG, PNG eller WebP på maksimalt 5 MB.",
        );
      }

      image = imageEntry;
    } else if (imageEntry !== null && !(imageEntry instanceof File)) {
      throw new Error("Ugyldig bildefil.");
    }

    const updates: {
      name: string;
      author: string | null;
      description: string;
      cloudinaryPath?: string;
    } = {
      name,
      author: author || null,
      description,
    };

    let uploadedPublicId: string | undefined;

    try {
      // Upload a replacement cover only when one was selected.
      if (image) {
        if (!process.env.CLOUDINARY_URL) {
          throw new Error(
            "Cloudinary er ikke konfigurert på serveren.",
          );
        }

        const buffer = Buffer.from(await image.arrayBuffer());

        const uploaded = await new Promise<{
          secure_url: string;
          public_id: string;
        }>((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: "bokklubb/manedens-boker",
                resource_type: "image",
                allowed_formats: ["jpg", "jpeg", "png", "webp"],
              },
              (error, result) => {
                if (error || !result) {
                  reject(
                    error ?? new Error("Cloudinary-opplasting feilet."),
                  );
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

        uploadedPublicId = uploaded.public_id;
        updates.cloudinaryPath = uploaded.secure_url;
      }

      const { data: updatedBook, error: updateError } =
        await supabase
          .from("Books")
          .update(updates)
          .eq("id", id)
          .select("id")
          .maybeSingle();

      if (updateError || !updatedBook) {
        if (uploadedPublicId) {
          try {
            await cloudinary.uploader.destroy(uploadedPublicId);
          } catch (cleanupError) {
            console.error(
              "Could not remove replacement image:",
              cleanupError,
            );
          }
        }

        console.error("Could not update book:", updateError?.message);

        throw new Error(
          updateError
            ? "Kunne ikke oppdatere boka. Kontroller Supabase-policyene."
            : "Boka finnes ikke, eller du har ikke tilgang til å oppdatere den.",
        );
      }
    } catch (error) {
      if (uploadedPublicId) {
        try {
          await cloudinary.uploader.destroy(uploadedPublicId);
        } catch (cleanupError) {
          console.error("Cloudinary cleanup failed:", cleanupError);
        }
      }

      throw error;
    }

    revalidatePath("/admin/books");
    revalidatePath("/book_of_the_month");
    revalidatePath("/prev-books-of-the-month");

    redirect("/admin/books");
  }

  return (
    <main className="min-h-full flex-1 bg-[#E2D9D0] px-6 py-10 text-[#331F2E] sm:py-14">
      <div className="mx-auto max-w-3xl">

        {/* Back link and title for the edit page. */}
        <div className="mb-8">
          <Link
            href="/admin/books"
            className="text-sm font-semibold text-[#6A465E] underline decoration-[#C99B72] underline-offset-4 hover:text-[#A9533D]"
          >
            ← Tilbake til bokadministrasjon
          </Link>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-[#A9533D]">Boksamlingen</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-[#331F2E] sm:text-4xl">
            Rediger bok
          </h1>

          <p className="mt-2 text-[#5C3C54]">
            Endre bokinformasjonen eller bytt omslagsbilde.
          </p>
        </div>

        {/* Server Action submits the edited fields and optional replacement cover. */}
        <form
  action={updateBook}
  className="rounded-2xl border border-[#D0C1B5] bg-[#F7F1E9] p-6 shadow-[0_4px_16px_rgba(51,31,46,0.06)] sm:p-8"
>
          {/* Book title field. */}
          <div className="mb-6">
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-semibold"
            >
              Boktittel
            </label>

            <input
              id="name"
              name="name"
              type="text"
              defaultValue={book.name ?? ""}
              required
              maxLength={200}
              className="
                h-11
                w-full
                rounded-lg
                border
                border-[#B8A8A0]
                bg-[#FFFCF7]
                px-4
                text-[#331F2E]
                outline-none
                placeholder:text-[#75636F]
                focus:border-[#A9533D]
                focus:ring-2
                focus:ring-[#A9533D]/20
              "
            />
          </div>

          {/* Author is optional because older books may not have this information. */}
          <div className="mb-6">
            <label htmlFor="author" className="mb-2 block text-sm font-semibold">
              Forfatter <span className="font-normal text-[#5D4B57]">(valgfritt)</span>
            </label>
            <input
              id="author"
              name="author"
              type="text"
              defaultValue={book.author ?? ""}
              maxLength={200}
              placeholder="Skriv inn forfatterens navn"
              className="h-11 w-full rounded-lg border border-[#B8A8A0] bg-[#FFFCF7] px-4 text-[#331F2E] outline-none placeholder:text-[#75636F] focus:border-[#A9533D] focus:ring-2 focus:ring-[#A9533D]/20"
            />
          </div>

          {/* Book description field. */}
          <div className="mb-6">
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-semibold"
            >
              Beskrivelse
            </label>

            <textarea
              id="description"
              name="description"
              defaultValue={book.description ?? ""}
              required
              maxLength={10000}
              rows={5}
              className="
                w-full
                rounded-lg
                border
                border-[#B8A8A0]
                bg-[#FFFCF7]
                px-4
                py-3
                text-[#331F2E]
                outline-none
                placeholder:text-[#75636F]
                focus:border-[#A9533D]
                focus:ring-2
                focus:ring-[#A9533D]/20
              "
            />
          </div>

          {/* Current cover preview and optional replacement upload. */}
          <div className="mb-6">
            <p className="mb-2 block text-sm font-semibold">
              Nåværende omslagsbilde
            </p>

            {book.cloudinaryPath ? (
              <img
                src={book.cloudinaryPath}
                alt={book.name ?? "Bokomslag"}
                className="mb-4 max-h-64 w-40 rounded-lg object-contain"
              />
            ) : (
              <p className="mb-4 text-sm text-[#5D4B57]">
                Ingen omslagsbilde er registrert.
              </p>
            )}

            <label
              htmlFor="image"
              className="mb-2 block text-sm font-semibold"
            >
              Bytt omslagsbilde (valgfritt)
            </label>

            <input
              id="image"
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="
                block
                w-full
                rounded-lg
                border
                border-[#B8A8A0]
                bg-[#FFFCF7]
                p-3
                text-sm
                text-[#331F2E]
              "
            />

            <p className="mt-2 text-sm text-[#5D4B57]">
              JPG, PNG eller WebP. Maksimalt 5 MB.
              La feltet stå tomt for å beholde bildet.
            </p>
          </div>

          {/* Cancel without saving or submit the changes. */}
          <div className="flex gap-3">
            <Link
              href="/admin/books"
              className="
                rounded-lg
                border
                border-[#B8A8A0]
                bg-[#FFFCF7]
                px-5
                py-3
                font-semibold
                font-semibold
                text-[#331F2E]
                hover:bg-[#F0E7DE]
              "
            >
              Avbryt
            </Link>

            <button
              type="submit"
              className="
                rounded-lg
                bg-[#331F2E]
                px-5
                py-3
                font-semibold
                text-white
                transition
                hover:bg-[#5C3C54]
              "
            >
              Lagre endringer
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
