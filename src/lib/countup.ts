export interface Countable {
  prefix: string;
  target: number;
  suffix: string;
}

export function parseCountable(value: string): Countable | null {
  const match = /^(\$?)(\d{1,3}(?:,\d{3})+|\d+)(\+?)$/.exec(value.trim());
  if (!match) return null;
  return { prefix: match[1], target: Number(match[2].replace(/,/g, "")), suffix: match[3] };
}

export function formatCount(countable: Countable, current: number): string {
  return `${countable.prefix}${Math.round(current).toLocaleString("en-US")}${countable.suffix}`;
}

export function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}
