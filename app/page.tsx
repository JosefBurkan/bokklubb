import Link from "next/link";
import { transporter } from "@/nodemailer/nodemailer";

export default async function Home() {

  try {
    const info = await transporter.sendMail({
      from: '"Bokklubben" <TheMagicalShelfSociety@gmail.com>', // sender address
      to: "josefpus@outlook.com", // list of recipients
      subject: "Hello", // subject line
      text: "Hello world?", // plain text body
      html: "<b>Hello world?</b>", // HTML body
    });
  
    console.log("Message sent: %s", info.messageId);
  } catch (err) {
    console.error("Error while sending mail:", err);
  }

  return (
    <div>
      <div>Velkommen til Kamilla sin bokklubb</div>

      <div className="flex flex-col items-center gap-4">

        <Link href="/manedens_bok">Månedens bok</Link>

        <Link href="/eventer">Eventer</Link>

      </div>

    </div>
  );
}
