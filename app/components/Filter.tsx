"use client";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

export default function Filter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (value: string) => {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    if (value) {
      params.set("category", value);
    } else {
      params.delete("category");
    }

    const queryString = params.toString();

    router.push(
      queryString
        ? `/events?${queryString}`
        : "/events"
    );
  };

  return (
    <div className="ml-10 w-50 pb-10">
      {/* Event category filter */}
      <div>
        <label
          htmlFor="category"
          className="mb-2 block text-sm font-semibold"
        >
          Kategori
        </label>

        <select
          id="category"
          value={searchParams.get("category") ?? ""}
          onChange={(event) =>
            updateFilter(event.target.value)
          }
          className="
            h-11
            w-full
            cursor-pointer
            rounded-lg
            border
            border-white/20
            bg-white
            px-3
            text-sm
            text-black
            outline-none
            transition

            focus:border-white
            focus:ring-2
            focus:ring-white/40
          "
        >
          <option value="">
            Alle kategorier
          </option>

          <option value="Sosial">
            Sosial
          </option>

          <option value="Aktivitet">
            Aktivitet
          </option>

          <option value="Diskusjon">
            Diskusjon
          </option>

          <option value="Annet">
            Annet
          </option>
        </select>
      </div>
    </div>
  );
}