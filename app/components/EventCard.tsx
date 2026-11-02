"use client"

import { useRouter } from 'next/navigation';

type Props = { id: number; title: string; category: string; description: string };


export default function EventCard({ id, title, category, description }: Props) {

    const router = useRouter();

    const goToEvent = (event_id: number) => {
      router.push(`/events/${event_id}`);
    };

    return (
        <>
            <div className="relative h-40 overflow-hidden rounded-t-lg">
                <img
                    src="lesetreff-kort.jpg"
                    alt="lesetreff"
                    className="absolute inset-0 h-full w-full object-cover"
                />

                <p className="absolute top-5 left-5 w-25 p-1 rounded-2xl bg-[#FCF3E5] text-[#85597A] font-bold text-center">
                    {category}
                </p>
            </div>

            <div className="flex h-50 flex-col rounded-b-lg bg-white p-4">
                <h3 className="text-xl">{title}</h3>
                <p>{description}</p>

            <button
                onClick={() => goToEvent(id)}
                className="mt-auto cursor-pointer self-start text-[#85597A] underline"
                >
                    Meld deg på →
                </button>
            </div>
        </>
    );
}