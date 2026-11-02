"use client"

import addReview from "../../api/bookReview/bookReview";
import StarRating from "./StarRating";
import SpiceRating from "./SpiceRating";

import { useState } from "react";

export default function AddReview() {

    const [rating, setRating] = useState(0);
    const [spice, setSpice] = useState(0);

    return (
        <form action={addReview}
            className="flex flex-col items-center p-20">
            
            <p className="p-2">
                Skriv din hva du syntes om boka her
            </p>

            <textarea
                    name="review"
                    className=
                    "bg-white w-100 h-30">
            </textarea>


            <StarRating value={rating} onChange={setRating} />
            <input type="hidden" name="rating" value={rating} />

            <SpiceRating value={spice} onChange={setSpice} />
            <input type="hidden" name="spice" value={spice} />

            <button type="submit"
                className="bg-green-500 text-white w-20 py-2 rounded hover:bg-green-600 mt-10">
                Send inn
            </button>
        </form>
    );
}