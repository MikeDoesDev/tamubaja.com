"use client";

// performative-ui creates React context at import time, so it has to live in a client component.
// This module is loaded lazily (see PartnerLogoMarquee) so the library's JS and CSS stay off the
// critical path of every page.
import { LogoMarquee, type MarqueeItem } from "performative-ui";
import "performative-ui/styles.css";

export function PuiLogoMarquee({ logos, speed }: { logos: MarqueeItem[]; speed: number }) {
  return (
    <LogoMarquee
      logos={logos}
      speed={speed}
      gap={56}
      fade
      pauseOnHover
      // The library labels a plain <div> "Trusted by", which ARIA doesn't allow; drop it.
      aria-label={undefined}
      className="partner-marquee"
    />
  );
}
