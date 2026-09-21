import Link from "next/link";
import { transporter } from "@/nodemailer/nodemailer";

export default async function Home() {

  // Denne funksjonen fungerer ikke akkurat nå, fordi epostene den var avhengige av blir blokkert
  // Må finne en annen løsning, som feks SendGrid
  const sendMail = async () => {
    try {
      const info = await transporter.sendMail({
        from: '"Bokklubben" <magicalshelfsociety@outlook.com>', // sender address
        to: "josefpus@outlook.com", // list of recipients
        subject: "Hello", // subject line
        text: "Test! ", // plain text body
        html: "<b>Hello world?</b>", // HTML body
      });
  
      console.log("Message sent: %s", info.messageId);
    } catch (err) {
      console.error("Error while sending mail:", err);
    }
  }

  return (
    <div>
      <div></div>

      <div className="flex flex-col items-center gap-4">

        <p>Velkommen til Kamilla sin bokklubb. Her kan du finne både månedens bok, og kommende eventer</p>
        <br />
        
        

        <Link href="/manedens_bok">Månedens bok</Link>

        <Link href="/eventer">Eventer</Link>

      </div>

    </div>
  );
}
