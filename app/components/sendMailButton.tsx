"use client"

import submitEmail from "@/app/api/emailRegistration/submitEmail";

export default function sendMailButton() {
    return (
        <form action={submitEmail}>
            <div className="p-5">
                <label htmlFor="email" className="sr-only">Epost</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="din@epost.no"
                    className="h-10 w-full max-w-xs rounded border border-[#EFE2CF] bg-white px-3
                               text-[#331F2E] placeholder:text-[#5C5057]/60
                               focus:border-[#85597A] focus:outline-none focus:ring-2 focus:ring-[#CC9EC0]"
                />
            </div>

            <div className="flex justify-center p-5">
                <button
                    type="submit"
                    className="rounded bg-[#5C3C54] px-5 py-2 text-[#FCF3E5] transition-colors
                               hover:bg-[#331F2E] focus:outline-none focus:ring-2 focus:ring-[#CC9EC0]"
                >
                    Send mail
                </button>
            </div>
        </form>
    )
}