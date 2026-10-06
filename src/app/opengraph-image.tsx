import { ogSize, renderOg } from "@/lib/og";

export const alt = "Texas A&M Baja SAE — Engineered to conquer the toughest terrain";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOg("Engineered to conquer the toughest terrain");
}
