import { Resend } from "resend";

const BATCH_SIZE = 100;
const SENDER = "Lesely <bokklubb@Lesely.no>";

// Sends one individually addressed newsletter email to each subscriber.
export default async function sendNewsLetter(
  recipients: string[],
  subject: string,
  html: string,
) {
  // Keep the Resend API key on the server; it must never be sent to the browser.
  const apiKey = process.env.RESEND_PASS;
  if (!apiKey) {
    throw new Error("RESEND_PASS is not configured.");
  }

  const resend = new Resend(apiKey);
  let sentCount = 0;

  // Split large lists into batches. Each message has one recipient to protect privacy.
  for (let start = 0; start < recipients.length; start += BATCH_SIZE) {
    const batch = recipients.slice(start, start + BATCH_SIZE).map((email) => ({
      from: SENDER,
      to: email,
      subject,
      html,
    }));

    // Await each batch so API errors are reported instead of silently ignored.
    const result = await resend.batch.send(batch);
    if (result.error) {
      throw new Error(result.error.message);
    }

    // Count accepted messages for the success response shown in the admin editor.
    sentCount += result.data?.length ?? batch.length;
  }

  return sentCount;
}
