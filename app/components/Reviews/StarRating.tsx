"use client";

import { useState } from "react";

type Props = {
  value: number;
  onChange: (value: number) => void;
};

export default function StarRating({ value, onChange }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value;

  // Venstre halvdel = x.5, høyre halvdel = hel stjerne
  function valueFromEvent(e: React.MouseEvent<HTMLButtonElement>, star: number) {
    const rect = e.currentTarget.getBoundingClientRect();
    const isLeftHalf = e.clientX - rect.left < rect.width / 2;
    return isLeftHalf ? star - 0.5 : star;
  }

  return (
    <div className="flex" onMouseLeave={() => setHover(null)}>
      {[1, 2, 3, 4, 5].map((star) => {
        // 0 = helt mørk, 1 = helt gul
        const fill = Math.max(0, Math.min(1, shown - (star - 1)));

        return (
          <button
            key={star}
            type="button"
            className="grid cursor-pointer text-4xl leading-none"
            aria-label={`${star} stjerner`}
            onMouseMove={(e) => setHover(valueFromEvent(e, star))}
            onClick={(e) => onChange(valueFromEvent(e, star))}
          >
            {/* Begge ligger i samme celle, så den gule dekker den mørke */}
            <span className="col-start-1 row-start-1 text-gray-700">★</span>
            <span
              className="col-start-1 row-start-1 text-yellow-400"
              style={{ clipPath: `inset(0 ${(1 - fill) * 100}% 0 0)` }}
            >
              ★
            </span>
          </button>
        );
      })}
    </div>
  );
}