"use server"

import { Resend } from 'resend';

export default async function SendMail( email: string ) {

    const resend = new Resend(process.env.RESEND_PASS);

    resend.emails.send({
        from: 'Test <bokklubb@Lesely.no>',
        to: email,
        subject: 'Fra domenet',
        html: '<p>BÆSJ</p>'
    });

    console.log("Message sent: %s");        

}