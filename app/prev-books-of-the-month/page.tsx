import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";
import DisplayStarRating from "../components/Reviews/DisplayStarRating";
import Link from "@/node_modules/next/link";

export default async function prevBooksOfTheMonth() {


    // Brukes til å vise datoen igjennom "created_at"-tabellen fra databasen
    const months = ["Januar", "Februar", "Mars",
                    "April", "Mai", "Juni",
                    "Juli", "August", "September",
                    "Oktober", "November", "Desember"]

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Hent alle bøker som ikke er markert som månedens bok
    const { data: books, error } = await supabase
        .from("Books")
        .select("*")
        .eq("active", false);
  
    if (error) {
      console.error(
        "Error fetching events:",
        error
      );
    }

    const { data: reviews } = await supabase
    .from("book_reviews")
    .select("*")

    if (error) {
        console.error(
            "Error fetching events:",
            error
        );
    }

    console.log(books);

    return (
        <div className="text-black">
            <h1 className="relative mx-auto flex max-w-[1340px] pt-[72px] text-4xl text-black">
                Dette har vi lest sammen
            </h1>

            <div className="grid md:grid-cols-2 sm:grid-cols-1 gap-10 p-10">
                {books?.map((book) => {
                    const bestReview = reviews
                        ?.filter((r) => r.book_id === book.id)
                        .sort((a, b) => b.rating - a.rating)[0];

                    return (
                        <div
                            key={book.id}
                            className="gap-4 rounded-2xl bg-white p-4 w-150"
                        >
                            <div className="flex items-start">
                                <img
                                    className="w-32 shrink-0 rounded-sm"
                                    src={book.cloudinaryPath}
                                    alt={book.name}
                                />

                                <div className="flex min-w-0 flex-col gap-3 ml-5">
                                    <h3 className="text-xl font-bold">{book.name}</h3>
                                    <p>{book.description}</p>
                                    {/* Bruker datoen til å hente riktig posisjon fra månedslista */}
                                    <p className="text-sm text-gray-500">
                                        Denne boka gjaldt for: {months[new Date(book.created_at).getMonth()]}
                                    </p>
                                </div>
                            </div>

                            {/* Community reviews */}
                            <div className="flex gap-63">

                                <p className="pt-5">
                                    📖 Community reviews
                                </p>

                                <Link href={`read-reviews/${book.id}`}
                                    className="pt-10 text-gray-500 text-sm underline">
                                    Les alle reviews her →
                                </Link>
                            </div>

                            <div className="mt-5 flex items-start gap-4">
                                <div className="rounded-lg bg-[#FCF3E5] p-4 w-70 h-35">
                                    <div>
                                        <p className="inline-block rounded-2xl bg-[#F6DCE8] px-3 py-1 font-bold text-[#85597A]">
                                            elsket den
                                        </p>
                                    </div>

                                    {bestReview && (
                                        <div className="pt-2 pl-1 text-black">
                                            <p className="line-clamp-2 text-[#331F2E]">
                                                {bestReview.review}
                                            </p>
                                            <div className="flex gap-20 text-sm text-gray-500">
                                                {bestReview.made_by}
                                                <DisplayStarRating value={bestReview.rating} />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-lg bg-[#FCF3E5] p-4 w-70 h-35">
                                    <p className="inline-block rounded-2xl bg-[#E9E1E5] px-3 py-1 font-bold text-[#85597A]">
                                        ikke for meg
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
  