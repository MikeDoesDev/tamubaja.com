/** A racing number plate, like the one on the car. */
export function Plate({ number, className = "" }: { number: string | number; className?: string }) {
  return (
    <span className={`plate text-2xl ${className}`} aria-label={`Car number ${number}`}>
      {number}
    </span>
  );
}
