"use server"

import { Resend } from 'resend';

// For å sende epost med varierende innhold
export default async function SendNewsLetter(email: string, content: string) {

    const resend = new Resend(process.env.RESEND_PASS);
    
    resend.emails.send({
        from: 'Lesely <bokklubb@Lesely.no>',
        to: email,
        subject: 'Nyhetsbrev',
        html: content
    });

    console.log("Message sent: %s");          

}