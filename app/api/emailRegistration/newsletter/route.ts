import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { v2 as cloudinary } from "cloudinary";

import { createClient } from "@/supabase/server";
import sendNewsLetter from "@/resend/sendNewsLetter";

// Cloudinary's Node SDK needs the Node runtime rather than the Edge runtime.
export const runtime = "nodejs";

// Keep the server-side limits and allowed design choices in sync with the editor.
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ACCENT_COLORS = new Set(["#5b1b75", "#176b57", "#a34b32"]);

function escapeHtml(value: string) {
  // Treat admin-entered text as text, not as executable markup in the email.
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function createEmailHtml({
  heading,
  message,
  accentColor,
  imageUrl,
}: {
  heading: string;
  message: string;
  accentColor: string;
  imageUrl?: string;
}) {
  // Escape text before inserting it into HTML, then preserve typed line breaks.
  const safeHeading = escapeHtml(heading);
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, "<br>");
  // If no image was uploaded, this becomes an empty string and no image row is rendered.
  const imageBlock = imageUrl
    ? `<tr><td style="padding:0 32px 24px"><img src="${escapeHtml(imageUrl)}" alt="" style="display:block;width:100%;height:auto;border:0;border-radius:8px"></td></tr>`
    : "";

  // Email clients work best with a simple table layout and inline CSS.
  return `<!doctype html>
<html lang="no"><body style="margin:0;padding:0;background:#f4f1f6;font-family:Arial,Helvetica,sans-serif;color:#1f2937">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f1f6;padding:32px 12px"><tr><td align="center">
    <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden">
      <tr><td style="height:8px;background:${accentColor};font-size:0;line-height:0">&nbsp;</td></tr>
      <tr><td style="padding:28px 32px 18px;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:#6b7280">Bokklubben Lesely</td></tr>
      ${imageBlock}
      <tr><td style="padding:0 32px 12px"><h1 style="margin:0;font-size:28px;line-height:1.25;color:#111827">${safeHeading}</h1></td></tr>
      <tr><td style="padding:0 32px 32px;font-size:16px;line-height:1.7;color:#374151">${safeMessage}</td></tr>
      <tr><td style="padding:18px 32px;border-top:1px solid #e5e7eb;font-size:13px;line-height:1.5;color:#6b7280">En hilsen fra bokklubben Lesely</td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

async function uploadNewsletterImage(image: File) {
  // Cloudinary's stream API accepts bytes, so convert the web File to a Node Buffer.
  const buffer = Buffer.from(await image.arrayBuffer());

  return new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    // upload_stream sends the image to Cloudinary without exposing credentials to the browser.
    cloudinary.uploader.upload_stream(
      {
        // Uploaded newsletter images are grouped in this Cloudinary folder.
        folder: "bokklubb/nyhetsbrev",
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
      },
      (error, result) => {
        if (error || !result) {
          // Reject so the API can return a useful upload error to the editor.
          reject(error ?? new Error("Cloudinary-opplasting feilet."));
          return;
        }
        // secure_url is embedded in the email so recipients can load the image.
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      },
    ).end(buffer);
  });
}

export async function POST(request: Request) {
  // Verify the signed-in user before allowing a bulk email to be sent.
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: authData, error: authError } = await supabase.auth.getClaims();

  if (
    authError ||
    !authData?.claims ||
    authData.claims.sub !== process.env.ADMIN_USER_ID
  ) {
    return NextResponse.json({ error: "Du har ikke tilgang." }, { status: 403 });
  }

  // Read multipart form data because it may contain an uploaded image file.
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Ugyldige skjemadata." }, { status: 400 });
  }

  // Pull the submitted fields out of the form before validating them.
  const subject = formData.get("subject");
  const heading = formData.get("heading");
  const message = formData.get("message");
  const accentColor = formData.get("accentColor");
  const image = formData.get("image");

  // Validate all user-provided values on the server; browser validation is not enough.
  if (typeof subject !== "string" || !subject.trim() || subject.trim().length > 180) {
    return NextResponse.json({ error: "Skriv inn et emne på maks 180 tegn." }, { status: 400 });
  }
  if (typeof heading !== "string" || !heading.trim() || heading.trim().length > 180) {
    return NextResponse.json({ error: "Skriv inn en overskrift på maks 180 tegn." }, { status: 400 });
  }
  if (typeof message !== "string" || !message.trim() || message.trim().length > 12000) {
    return NextResponse.json({ error: "Skriv inn innhold på maks 12 000 tegn." }, { status: 400 });
  }
  if (typeof accentColor !== "string" || !ACCENT_COLORS.has(accentColor)) {
    return NextResponse.json({ error: "Velg en gyldig designfarge." }, { status: 400 });
  }
  if (image !== null && !(image instanceof File)) {
    return NextResponse.json({ error: "Ugyldig bildefil." }, { status: 400 });
  }
  if (image instanceof File && image.size > 0 && (
    !ALLOWED_IMAGE_TYPES.has(image.type) || image.size > MAX_IMAGE_SIZE
  )) {
    return NextResponse.json(
      { error: "Bruk JPG, PNG eller WebP på maksimalt 5 MB." },
      { status: 400 },
    );
  }
  if (image instanceof File && image.size > 0 && !process.env.CLOUDINARY_URL) {
    return NextResponse.json({ error: "Cloudinary er ikke konfigurert på serveren." }, { status: 500 });
  }
  if (!process.env.RESEND_PASS) {
    return NextResponse.json({ error: "Resend er ikke konfigurert på serveren." }, { status: 500 });
  }

  // Load subscribed member addresses and send one private email per unique address.
  const { data: members, error: membersError } = await supabase
    .from("listOfMembers")
    .select("email");

  if (membersError) {
    console.error("Could not load newsletter subscribers:", membersError.message);
    return NextResponse.json({ error: "Kunne ikke hente medlemslisten." }, { status: 500 });
  }

  // Normalize and deduplicate addresses, and skip entries that are not email-shaped.
  const recipients = Array.from(new Set(
    (members ?? [])
      .map((member) => member.email?.trim().toLowerCase())
      .filter((email): email is string =>
        Boolean(email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)),
      ),
  ));

  if (recipients.length === 0) {
    return NextResponse.json({ error: "Det finnes ingen e-postadresser i medlemslisten." }, { status: 400 });
  }

  // Upload only when the admin selected a real image; the image itself is optional.
  let imageUrl: string | undefined;
  if (image instanceof File && image.size > 0) {
    try {
      const uploaded = await uploadNewsletterImage(image);
      imageUrl = uploaded.secure_url;
    } catch (uploadError) {
      console.error("Newsletter image upload failed:", uploadError);
      return NextResponse.json({ error: "Kunne ikke laste opp bildet til Cloudinary." }, { status: 500 });
    }
  }

  // Build one HTML template, reused for each recipient.
  const html = createEmailHtml({
    heading: heading.trim(),
    message: message.trim(),
    accentColor,
    imageUrl,
  });

  try {
    // Wait for Resend so the response reports success or an error to the editor.
    const sent = await sendNewsLetter(recipients, subject.trim(), html);
    return NextResponse.json({ success: true, sent });
  } catch (sendError) {
    console.error("Newsletter send failed:", sendError);
    return NextResponse.json({ error: "Kunne ikke sende nyhetsbrevet. Kontroller Resend-konfigurasjonen." }, { status: 502 });
  }
}
