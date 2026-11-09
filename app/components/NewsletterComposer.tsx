"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

// Match these browser-side checks with the API's stricter validation.
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const ACCENT_COLORS = [
  { label: "Bokklubb-lilla", value: "#5b1b75" },
  { label: "Skoggrønn", value: "#176b57" },
  { label: "Varm terrakotta", value: "#a34b32" },
];

// Admin editor for the newsletter content, visual theme, and optional image.
export default function NewsletterComposer() {
  // These values drive both the live preview and the request sent to the server.
  const [subject, setSubject] = useState("");
  const [heading, setHeading] = useState("");
  const [message, setMessage] = useState("");
  const [accentColor, setAccentColor] = useState(ACCENT_COLORS[0].value);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  // Create a temporary local URL so the chosen image appears in the preview.
  useEffect(() => {
    if (!image) {
      setImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(image);
    setImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [image]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setStatus("");
    setError("");

    // FormData carries both text fields and the optional binary image file.
    const formData = new FormData();
    formData.set("subject", subject.trim());
    formData.set("heading", heading.trim());
    formData.set("message", message.trim());
    formData.set("accentColor", accentColor);
    if (image) formData.set("image", image);

    try {
      // The server handles admin checks, Cloudinary upload, recipient lookup, and delivery.
      const response = await fetch("/api/emailRegistration/newsletter", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Kunne ikke sende nyhetsbrevet.");
        return;
      }

      // Clear the editor after success so a previous newsletter is not sent twice by mistake.
      setStatus(`Nyhetsbrevet ble sendt til ${result.sent} medlemmer.`);
      setSubject("");
      setHeading("");
      setMessage("");
      setImage(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
    } catch {
      setError("Kunne ikke kontakte serveren. Prøv igjen.");
    } finally {
      setSending(false);
    }
  }

  function handleImageChange(file: File | undefined) {
    setError("");
    setImage(null);

    if (!file) return;
    // Reject unsupported images early; the API repeats these checks for security.
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setError("Velg et bilde i JPG-, PNG- eller WebP-format.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError("Bildet kan maksimalt være 5 MB.");
      return;
    }

    setImage(file);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Newsletter content and design controls. */}
      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-[#331F2E]/10 bg-white p-6 shadow-sm sm:p-8">
        {/* Subject is the text shown in the recipient's inbox. */}
        <div>
          <label htmlFor="newsletter-subject" className="mb-2 block text-sm font-semibold">
            E-postemne
          </label>
          <input
            id="newsletter-subject"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            required
            maxLength={180}
            placeholder="For eksempel: Nytt fra bokklubben"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#5b1b75] focus:ring-2 focus:ring-[#5b1b75]/20"
          />
        </div>

        {/* Heading is the large title inside the email itself. */}
        <div>
          <label htmlFor="newsletter-heading" className="mb-2 block text-sm font-semibold">
            Overskrift i e-posten
          </label>
          <input
            id="newsletter-heading"
            value={heading}
            onChange={(event) => setHeading(event.target.value)}
            required
            maxLength={180}
            placeholder="Hei, bokvenner!"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#5b1b75] focus:ring-2 focus:ring-[#5b1b75]/20"
          />
        </div>

        {/* Plain text body; the server escapes it and keeps line breaks in the email. */}
        <div>
          <label htmlFor="newsletter-message" className="mb-2 block text-sm font-semibold">
            Innhold
          </label>
          <textarea
            id="newsletter-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            required
            maxLength={12000}
            rows={9}
            placeholder="Skriv nyhetsbrevet her. Linjeskift blir tatt vare på i e-posten."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#5b1b75] focus:ring-2 focus:ring-[#5b1b75]/20"
          />
        </div>

        {/* Choose from the same fixed colors accepted by the API. */}
        <div>
          <label htmlFor="newsletter-accent" className="mb-2 block text-sm font-semibold">
            Farge på e-postdesignet
          </label>
          <select
            id="newsletter-accent"
            value={accentColor}
            onChange={(event) => setAccentColor(event.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3"
          >
            {ACCENT_COLORS.map((color) => (
              <option key={color.value} value={color.value}>{color.label}</option>
            ))}
          </select>
        </div>

        {/* Optional image: previewed locally, then uploaded by the server on send. */}
        <div>
          <label htmlFor="newsletter-image" className="mb-2 block text-sm font-semibold">
            Bilde (valgfritt)
          </label>
          <input
            id="newsletter-image"
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => handleImageChange(event.target.files?.[0])}
            className="block w-full rounded-lg border border-gray-300 p-3 text-sm"
          />
          <p className="mt-2 text-sm text-gray-500">JPG, PNG eller WebP. Maksimalt 5 MB.</p>
          {image && (
            <button
              type="button"
              onClick={() => {
                setImage(null);
                if (imageInputRef.current) imageInputRef.current.value = "";
              }}
              className="mt-2 text-sm font-medium text-red-700 underline"
            >
              Fjern bilde
            </button>
          )}
        </div>

        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {status && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{status}</p>}

        {/* The send button submits the finished design to the protected API route. */}
        <button
          type="submit"
          disabled={sending}
          className="rounded-lg bg-[#331F2E] px-5 py-3 font-semibold text-white transition hover:bg-[#5C3C54] disabled:cursor-wait disabled:opacity-60"
        >
          {sending ? "Sender til medlemmene..." : "Send nyhetsbrev"}
        </button>
        <p className="text-sm text-gray-500">
          E-posten sendes til alle unike e-postadresser i medlemslisten.
        </p>
      </form>

      {/* Live preview of the email layout. */}
      <section aria-label="Forhåndsvisning av nyhetsbrev">
        <h2 className="mb-3 font-display text-lg font-semibold text-[#331F2E]">Forhåndsvisning</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-[#f4f1f6] p-4 sm:p-8">
          <div className="mx-auto max-w-xl overflow-hidden rounded-lg bg-white shadow-sm">
            <div className="h-2" style={{ backgroundColor: accentColor }} />
            <div className="p-6 sm:p-8">
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                Bokklubben Lesely
              </p>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Forhåndsvisning av nyhetsbrevbildet"
                  className="mb-6 max-h-72 w-full rounded-lg object-cover"
                />
              )}
              <h3 className="text-2xl font-bold text-gray-900">
                {heading || "Overskriften vises her"}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Emne: {subject || "E-postemnet vises her"}
              </p>
              <p className="mt-6 whitespace-pre-wrap break-words text-base leading-7 text-gray-700">
                {message || "Innholdet i nyhetsbrevet vises her mens du skriver."}
              </p>
              <div className="mt-8 border-t border-gray-200 pt-5 text-sm text-gray-500">
                En hilsen fra bokklubben Lesely
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
