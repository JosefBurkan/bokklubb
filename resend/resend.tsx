"use server"

import { Resend } from 'resend';

export default async function SendMail() {

    const resend = new Resend(process.env.RESEND_PASS);

    resend.emails.send({
        from: 'onboarding@resend.dev',
        to: process.env.RESEND_EMAIL,
        subject: 'Hello World',
        html: '<p>Resend er op!</p>'
    });

    console.log("Message sent: %s");        

}