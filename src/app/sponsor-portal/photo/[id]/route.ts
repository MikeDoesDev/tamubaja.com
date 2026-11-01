import { getPortalViewer } from "@/lib/portal";
import { getHeadshot } from "@/lib/portalMembers";

const PRIVATE = { "Cache-Control": "private, max-age=3600", "X-Robots-Tag": "noindex, nofollow" };

/** Individual headshot. Only signed-in team members and approved sponsors can load it. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const viewer = await getPortalViewer();
  if (viewer.state !== "approved") return new Response(null, { status: 403, headers: PRIVATE });
  const { id } = await params;
  const photo = await getHeadshot(id);
  if (!photo) return new Response(null, { status: 404, headers: PRIVATE });
  return new Response(new Blob([photo.body], { type: photo.contentType }), { headers: { ...PRIVATE, "Content-Type": photo.contentType } });
}
