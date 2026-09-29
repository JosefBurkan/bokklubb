"use client"

import SendMail from "@/resend/resend";
import { text } from "stream/consumers";

export default function sendMailButton()
{
    return (
        <>
            <input type="text">

            </input>
            

            <button onClick={() => SendMail()}
             className="bg-green-500 text-white w-20 py-2 rounded hover:bg-green-600"
            >
                Send mail
            </button>
        </>
    )
}