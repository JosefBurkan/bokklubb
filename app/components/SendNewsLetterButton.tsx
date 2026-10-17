"use client"

import sendNewsLetter from "@/app/api/emailRegistration/sendNewsLetter";

export default function sendNewsLetterButton() {
    return (
        <form action={sendNewsLetter} >
            <div className="p-5">
                <label htmlFor="newsLetter"></label>
                <textarea name="newsLetter" type="text"
                    className="bg-white
                    w-100
                    h-20">

                </textarea>
            </div>
            

            <div className="p-5">
                <button type="submit"
                className="bg-green-500 text-white w-50 py-2 rounded hover:bg-green-600 "
                >
                    Send ut nyhetsbrev
                </button>
            </div>
        </form>
    )
}