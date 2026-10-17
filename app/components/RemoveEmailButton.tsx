"use client"

import removeEmail from "@/app/api/emailRegistration/removeEmail";

export default function removeEmailButton() {
    return (
        <form action={removeEmail} >
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
                className="bg-red-500 text-white w-25 py-2 rounded hover:bg-red-600 "
                >
                    Fjern epost
                </button>
            </div>
        </form>
    )
}