import { Construction } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getSite } from "@/lib/content";
import { NoticeButton } from "./NoticeButton";

const BANNER_ID = "site-notice";

/**
 * Site-wide banner above the header, driven by `notice` in content/site.yaml. Once it scrolls
 * away, NoticeButton keeps a small roadblock button in the top-right with the same notice.
 */
export function SiteNotice() {
  const { notice, email, packetPdf } = getSite();
  if (!notice?.show) return null;
  return (
    <>
      <div id={BANNER_ID} className="border-b border-amber-400/30 bg-amber-400/10">
        <Alert
          variant="warning"
          // shadcn's Alert is role="alert", which would interrupt screen readers on every page load;
          // a labelled region keeps the notice findable without announcing it.
          role="region"
          aria-label="Site notice"
          className="mx-auto max-w-6xl rounded-none border-0 bg-transparent px-4 py-2.5 sm:px-6"
        >
          <Construction aria-hidden="true" />
          <AlertTitle className="font-semibold">{notice.title}</AlertTitle>
          <AlertDescription>
            {notice.message} Questions? Email <a href={`mailto:${email}`}>{email}</a>.
          </AlertDescription>
        </Alert>
      </div>
      <NoticeButton
        bannerId={BANNER_ID}
        title={notice.title}
        message={notice.message}
        email={email}
        packetPdf={packetPdf}
      />
    </>
  );
}
