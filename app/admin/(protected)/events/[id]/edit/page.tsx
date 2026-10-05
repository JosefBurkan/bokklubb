import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";

import { createClient } from "@/supabase/server";

type EditEventPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditEventPage({
  params,
}: EditEventPageProps) {
  const { id } = await params;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  /*
   * Check that the current user is authenticated
   * and is the configured admin.
   */
  const { data: authData, error: authError } =
    await supabase.auth.getClaims();

  if (
    authError ||
    !authData?.claims ||
    authData.claims.sub !== process.env.ADMIN_USER_ID
  ) {
    redirect("/admin/login");
  }

  /*
   * Fetch the event we want to edit.
   */
  const { data: event, error: eventError } = await supabase
    .from("eventer")
    .select("*")
    .eq("id", id)
    .single();

  if (eventError || !event) {
    return (
      <main className="min-h-screen bg-[var(--main)] px-6 py-10 text-gray-900">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold">
            Fant ikke eventet
          </h1>

          <p className="mt-3 text-gray-600">
            Eventet finnes ikke eller kunne ikke hentes.
          </p>

          <Link
            href="/admin"
            className="mt-6 inline-block rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700"
          >
            ← Tilbake til adminpanel
          </Link>
        </div>
      </main>
    );
  }

  /*
   * Server Action for updating the event.
   */
  async function updateEvent(formData: FormData) {
    "use server";

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    /*
     * IMPORTANT:
     * Verify admin again inside the Server Action.
     *
     * The protected layout protects the page,
     * but Server Actions should still verify authorization
     * themselves.
     */
    const { data: authData, error: authError } =
      await supabase.auth.getClaims();

    if (
      authError ||
      !authData?.claims ||
      authData.claims.sub !== process.env.ADMIN_USER_ID
    ) {
      redirect("/admin/login");
    }

    const description =
      String(formData.get("description") ?? "").trim();

    const category =
      String(formData.get("category") ?? "").trim();

    const date =
      String(formData.get("date") ?? "").trim();

    if (!description || !category || !date) {
      throw new Error("Alle feltene må fylles ut.");
    }

    /*
     * Update the event.
     *
     * We intentionally do NOT update listOfParticipants.
     * Existing participants should remain untouched when
     * an admin edits the event.
     */
    const { error } = await supabase
      .from("eventer")
      .update({
        description,
        category,
        date: new Date(date).toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Kunne ikke oppdatere event:", error);
      throw new Error(error.message);
    }

    /*
     * Refresh the relevant pages after the update.
     */
    revalidatePath("/admin");
    revalidatePath("/events");

    /*
     * Return to the admin panel after saving.
     */
    redirect("/admin");
  }

  /*
   * Convert Supabase timestamp into the format
   * required by <input type="datetime-local">.
   */
  const formattedDate = event.date
    ? new Date(event.date).toISOString().slice(0, 16)
    : "";

  return (
    <main className="min-h-screen bg-[var(--main)] px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← Tilbake til adminpanel
          </Link>

          <h1 className="mt-4 text-3xl font-bold">
            Rediger event
          </h1>

          <p className="mt-2 text-gray-600">
            Endre informasjonen om dette eventet.
          </p>
        </div>

        {/* Form */}
        <form
          action={updateEvent}
          className="rounded-2xl bg-white p-6 shadow-sm"
        >

          {/* Description */}
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
              defaultValue={event.description ?? ""}
              required
              rows={5}
              className="
                w-full
                rounded-lg
                border
                border-gray-300
                px-4
                py-3
                text-gray-900
                outline-none
                focus:border-orange-500
                focus:ring-2
                focus:ring-orange-200
              "
            />
          </div>

          {/* Category */}
          <div className="mb-6">
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-semibold"
            >
              Kategori
            </label>

            <select
              id="category"
              name="category"
              defaultValue={event.category ?? ""}
              required
              className="
                h-11
                w-full
                cursor-pointer
                rounded-lg
                border
                border-gray-300
                bg-white
                px-3
                text-sm
                text-gray-900
                outline-none
                focus:border-orange-500
                focus:ring-2
                focus:ring-orange-200
              "
            >
              <option value="">
                Velg kategori
              </option>

              <option value="Sosial">
                Sosial
              </option>

              <option value="Aktivitet">
                Aktivitet
              </option>

              <option value="Diskusjon">
                Diskusjon
              </option>

              <option value="Annet">
                Annet
              </option>
            </select>
          </div>

          {/* Date */}
          <div className="mb-8">
            <label
              htmlFor="date"
              className="mb-2 block text-sm font-semibold"
            >
              Dato og tidspunkt
            </label>

            <input
              id="date"
              name="date"
              type="datetime-local"
              defaultValue={formattedDate}
              required
              className="
                h-11
                w-full
                rounded-lg
                border
                border-gray-300
                bg-white
                px-3
                text-sm
                text-gray-900
                outline-none
                focus:border-orange-500
                focus:ring-2
                focus:ring-orange-200
              "
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Link
              href="/admin"
              className="
                rounded-lg
                border
                border-gray-300
                bg-white
                px-5
                py-3
                font-semibold
                text-gray-700
                hover:bg-gray-50
              "
            >
              Avbryt
            </Link>

            <button
              type="submit"
              className="
                rounded-lg
                bg-black    
                px-5
                py-3
                font-semibold
                text-white
                transition
                hover:bg-gray-700
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