"use server"

import { Resend } from 'resend';

// For å sende samme velkommstepost
export default async function SendMail(email: string) {

    const resend = new Resend(process.env.RESEND_PASS);

    resend.emails.send({
        from: 'Lesely <bokklubb@Lesely.no>',
        to: email,
        subject: 'Velkommen!',
        html: '<p>Hei på deg</p>'
    });

    console.log("Message sent: %s");          

}