export default function DisplayStarRating({ value }: { value: number }) {

  return (
    <div className="flex" aria-label={`${value} av 5 stjerner`}>
      {[1, 2, 3, 4, 5].map((star) => {
        // 0 = helt mørk, 1 = helt gul
        const fill = Math.max(0, Math.min(1, value - (star - 1)));

        return (
          <span key={star} className="grid text-4xl leading-none">
            <span
              className="col-start-1 row-start-1 text-gray-700 text-sm"
            >
              ★
            </span>

            <span
              className="col-start-1 row-start-1 text-yellow-400 text-sm"
              style={{ clipPath: `inset(0 ${(1 - fill) * 100}% 0 0)` }}
            >
              ★
            </span>
          </span>
        );
      })}
    </div>
  );
}