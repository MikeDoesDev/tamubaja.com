"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { MarqueeItem } from "performative-ui";

const PuiLogoMarquee = dynamic(() => import("./PuiLogoMarquee").then((m) => m.PuiLogoMarquee), {
  ssr: false,
});

/** Mounts the logo strip (library + logos) only once the footer is within reach of the viewport. */
export function PartnerLogoMarquee({ logos, speed }: { logos: MarqueeItem[]; speed: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "800px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="min-h-20">
      {near && <PuiLogoMarquee logos={logos} speed={speed} />}
    </div>
  );
}
