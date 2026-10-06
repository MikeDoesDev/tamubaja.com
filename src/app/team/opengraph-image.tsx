import { ogSize, renderOg } from "@/lib/og";

export const alt = "The Texas A&M Baja SAE team";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOg("The team behind car #51");
}
