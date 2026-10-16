/** Stand-in until headshots arrive: the car's topo livery with a simple helmeted-driver silhouette. */
export function PersonPlaceholder({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`topo-bg flex h-full w-full items-end justify-center bg-[#101214] ${className}`}>
      <svg viewBox="0 0 100 100" className="h-[72%] w-[72%] text-white/15" fill="currentColor">
        <path d="M50 14c-14 0-24 10-24 24v6c0 6 4 10 10 10h28c6 0 10-4 10-10v-6c0-14-10-24-24-24zm-14 26c0-3 2-5 5-5h18c3 0 5 2 5 5v2c0 2-2 4-4 4H40c-2 0-4-2-4-4v-2z" />
        <path d="M22 100c0-17 12-30 28-30s28 13 28 30z" />
      </svg>
    </span>
  );
}
