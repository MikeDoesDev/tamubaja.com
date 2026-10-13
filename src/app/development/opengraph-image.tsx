import { ogSize, renderOg } from "@/lib/og";

export const alt = "Texas A&M Baja SAE development program";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOg("Development program");
}
