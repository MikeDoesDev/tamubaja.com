"use client";

import { Construction, FileDown, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * Once the site notice banner scrolls out of view, a small roadblock button appears in the
 * top-right. It opens a popover repeating the notice and what to do if something doesn't work.
 */
export function NoticeButton({
  bannerId,
  title,
  message,
  email,
  packetPdf,
}: {
  bannerId: string;
  title: string;
  message: string;
  email: string;
  packetPdf: string;
}) {
  const [scrolledPast, setScrolledPast] = useState(false);

  useEffect(() => {
    const banner = document.getElementById(bannerId);
    if (!banner) return;
    const observer = new IntersectionObserver(([entry]) => {
      setScrolledPast(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(banner);
    return () => observer.disconnect();
  }, [bannerId]);

  if (!scrolledPast) return null;

  return (
    <div className="fixed right-4 top-20 z-30 animate-in fade-in zoom-in-90 duration-200 sm:right-6">
      <Popover>
        <PopoverTrigger
          aria-label={`${title}: what to do if something doesn't work`}
          className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-amber-400/50 bg-[#2b2716] text-amber-300 shadow-lg transition-colors hover:bg-[#3b3519] hover:text-amber-200"
        >
          <Construction aria-hidden="true" className="size-5" />
        </PopoverTrigger>
        <PopoverContent side="bottom" align="end" sideOffset={8} className="w-80 gap-3 p-4">
          <PopoverHeader>
            <PopoverTitle className="flex items-center gap-2 font-semibold text-amber-200">
              <Construction aria-hidden="true" className="size-4" />
              {title}
            </PopoverTitle>
            <PopoverDescription>{message}</PopoverDescription>
          </PopoverHeader>
          <div className="border-t border-line pt-3">
            <p className="text-sm font-semibold">If something doesn&apos;t work</p>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <a
                  href={`mailto:${email}?subject=${encodeURIComponent("Website issue")}`}
                  className="flex items-center gap-2 text-accent underline-offset-4 hover:underline"
                >
                  <Mail aria-hidden="true" className="size-4 shrink-0" />
                  Email us at {email}
                </a>
              </li>
              <li>
                <a
                  href={packetPdf}
                  download
                  className="flex items-center gap-2 text-accent underline-offset-4 hover:underline"
                >
                  <FileDown aria-hidden="true" className="size-4 shrink-0" />
                  Download the sponsor packet (PDF)
                </a>
              </li>
            </ul>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
