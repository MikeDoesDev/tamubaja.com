"use client";

import { useSyncExternalStore } from "react";

const MINUTE = 60_000;

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, MINUTE);
  return () => window.clearInterval(id);
}

/** Rounded to the minute so React sees a stable value between ticks. */
function getSnapshot() {
  return Math.floor(Date.now() / MINUTE) * MINUTE;
}

/**
 * The current time, kept fresh in the visitor's browser.
 *
 * Pages are built ahead of time, so anything computed from `new Date()` on the server is frozen at
 * the last deploy. The server HTML (and hydration) use the build time; the browser then switches to
 * its own clock and rechecks every minute, so countdowns roll over at midnight without a redeploy.
 */
export function useToday(builtAt: string): Date {
  const time = useSyncExternalStore(subscribe, getSnapshot, () => Date.parse(builtAt));
  return new Date(time);
}
