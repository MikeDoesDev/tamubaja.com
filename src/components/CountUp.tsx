"use client";

import { useEffect, useRef, useState } from "react";
import { easeOutExpo, formatCount, parseCountable } from "@/lib/countup";

export function CountUp({ value, durationMs = 1800 }: { value: string; durationMs?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const countable = parseCountable(value);
    const element = ref.current;
    if (!countable || !element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / durationMs, 1);
          setDisplay(formatCount(countable, countable.target * easeOutExpo(t)));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        setDisplay(formatCount(countable, 0));
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, durationMs]);

  return (
    <>
      <span ref={ref} aria-hidden="true" data-countup>
        {display}
      </span>
      <span className="sr-only">{value}</span>
    </>
  );
}
