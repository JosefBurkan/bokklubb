
export default function DisplaySpiceRating({ value }: { value: number }) {

    return (
      <div className="flex" aria-label={`${value} av 5 stjerner`}>
        {[1, 2, 3, 4, 5].map((star) => {
          // 0 = helt mørk, 1 = helt gul
          const fill = Math.max(0, Math.min(1, value - (star - 1)));
  
          return (
            <span key={star} className="grid text-4xl leading-none">
                <span
                className="col-start-1 row-start-1 text-sm"
                style={{ filter: "grayscale(1) brightness(0.5)" }}
                >
                🌶️
                </span>
                <span
                className="col-start-1 row-start-1 text-sm"
                style={{ clipPath: `inset(0 ${(1 - fill) * 100}% 0 0)` }}
                >
                🌶️
                </span>
            </span>
          );
        })}
      </div>
    );
  }