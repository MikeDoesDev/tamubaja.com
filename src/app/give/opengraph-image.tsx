import { ogSize, renderOg } from "@/lib/og";

export const alt = "Give to Texas A&M Baja SAE";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOg("Support the team");
}
