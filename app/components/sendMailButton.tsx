"use client"

import SendMail from "@/resend/resend";
import { text } from "stream/consumers";

export default function sendMailButton()
{
    return (
        <>
            <div className="p-5">
                <input type="text"
                    className="bg-white
                    w-50
                    h-10">

                </input>
            </div>
            

            <div className="p-5">
                <button onClick={() => SendMail()}
                className="bg-green-500 text-white w-20 py-2 rounded hover:bg-green-600 "
                >
                    Send mail
                </button>
            </div>
        </>
    )
}