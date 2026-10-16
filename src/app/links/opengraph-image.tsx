import { ogSize, renderOg } from "@/lib/og";

export const alt = "Texas A&M Baja SAE links";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOg("Texas A&M Baja SAE");
}
