"use client"

import SendMail from "@/resend/resend";
import submitEmail from "@/app/api/submitEmail";

export default function sendMailButton() {
    return (
        <form action={submitEmail} >
            <div className="p-5">
                <label htmlFor="email"></label>
                <input name="email" type="text"
                    className="bg-white
                    w-50
                    h-10">

                </input>
            </div>
            

            <div className="p-5">
                <button type="submit"
                className="bg-green-500 text-white w-20 py-2 rounded hover:bg-green-600 "
                >
                    Send mail
                </button>
            </div>
        </form>
    )
}