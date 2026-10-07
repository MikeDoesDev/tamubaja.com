import { Construction } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getSite } from "@/lib/content";

/** Site-wide banner above the header, driven by `notice` in content/site.yaml. */
export function SiteNotice() {
  const { notice } = getSite();
  if (!notice?.show) return null;
  return (
    <div className="border-b border-amber-400/30 bg-amber-400/10">
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
        <AlertDescription>{notice.message}</AlertDescription>
      </Alert>
    </div>
  );
}
