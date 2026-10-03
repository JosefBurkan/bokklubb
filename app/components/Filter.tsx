"use client";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

type FilterProps = {
  name: string;
};

export default function Filter({
}: FilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (
    key: string,
    value: string
  ) => {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(
      `/events`
    );
  };

  return (
    <div className="flex flex-col gap-4 w-50 ml-10 pb-10">

      {/* =========================
          SUBCATEGORY
      ========================= */}

      <div>
        <label
          htmlFor="sub-category"
          className="mb-2 block text-sm font-semibold"
        >
          Underkategori
        </label>

        <select
          id="sub-category"
          defaultValue={
            searchParams.get(
              "sub_category"
            ) ?? ""
          }
          onChange={(event) =>
            updateFilter(
              "sub_category",
              event.target.value
            )
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
          <option
            value=""
            className="text-black"
          >
            Alle underkategorier
          </option>

          <option
            value="Annet"
            className="text-black"
          >
            Annet
          </option>
        </select>
      </div>

    </div>
  );
}