import { ogSize, renderOg } from "@/lib/og";

export const alt = "Texas A&M Baja SAE student directory";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOg("Student directory");
}
