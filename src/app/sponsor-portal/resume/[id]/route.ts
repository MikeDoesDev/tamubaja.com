import { canDownloadResumes, getPortalViewer } from "@/lib/portal";
import { getResume } from "@/lib/portalMembers";

const PRIVATE = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };

/** Resume download. Served only to the team and to sponsors at the resume-bank tier; never from public/. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const viewer = await getPortalViewer();
  if (viewer.state === "signed-out") return Response.redirect(new URL("/sponsor-portal", request.url), 303);
  if (viewer.state !== "approved") return new Response("This file is for Texas A&M Baja sponsors.", { status: 403, headers: PRIVATE });
  if (!canDownloadResumes(viewer)) return new Response("Resume access is part of a higher sponsorship tier.", { status: 403, headers: PRIVATE });

  const { id } = await params;
  const resume = await getResume(id);
  if (!resume) return new Response("Resume not found.", { status: 404, headers: PRIVATE });

  return new Response(new Blob([resume.body as BlobPart], { type: resume.contentType }), {
    headers: { ...PRIVATE, "Content-Type": resume.contentType, "Content-Disposition": `attachment; filename="${resume.filename}"` },
  });
}
