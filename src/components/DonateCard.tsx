"use client";

import { useState } from "react";
import type { Site } from "@/lib/schemas";

type Giving = Site["giving"];

/** Donation instructions with Card / Check tabs and a one-click copy of the gift code. */
export function DonateCard({ giving }: { giving: Giving }) {
  const [tab, setTab] = useState<"card" | "check">("card");
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(giving.accountCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (old browser or insecure context): the code is still visible to copy by hand.
    }
  }

  const tabClass = (active: boolean) =>
    `flex flex-1 items-center justify-center gap-2 rounded-sm px-4 py-2.5 text-sm font-semibold transition-colors ${
      active ? "bg-panel-2 text-ink shadow-sm" : "text-muted hover:text-ink"
    }`;

  return (
    <div className="rounded-sm border border-line bg-panel p-6 sm:p-8">
      <div className="flex items-center gap-3 border-b border-line pb-5">
        <span aria-hidden="true" className="h-8 w-1.5 rounded-full bg-maroon" />
        <p className="font-display text-3xl font-extrabold uppercase">Give to Texas A&amp;M Baja</p>
      </div>

      <div role="tablist" aria-label="How to give" className="mt-6 flex gap-1 rounded-sm bg-bg/70 p-1">
        <button type="button" role="tab" id="tab-card" aria-selected={tab === "card"} aria-controls="panel-card" onClick={() => setTab("card")} className={tabClass(tab === "card")}>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
            <rect x="2.5" y="5" width="19" height="14" rx="2" />
            <path d="M2.5 10h19" />
          </svg>
          Credit / debit card
        </button>
        <button type="button" role="tab" id="tab-check" aria-selected={tab === "check"} aria-controls="panel-check" onClick={() => setTab("check")} className={tabClass(tab === "check")}>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
            <rect x="2.5" y="6" width="19" height="12" rx="2" />
            <path d="M6 14h6M15 10h3" />
          </svg>
          Check
        </button>
      </div>

      <div role="tabpanel" id="panel-card" aria-labelledby="tab-card" hidden={tab !== "card"} className="mt-6">
        <p className="font-semibold">How to donate online</p>
        <ol className="mt-4 space-y-4 text-muted">
          <li className="flex gap-3">
            <span className="font-display text-xl font-extrabold leading-6 text-accent">1</span>
            <span>
              Click <strong className="text-ink">Donate online</strong> below.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-display text-xl font-extrabold leading-6 text-accent">2</span>
            <span>
              Select <strong className="text-ink">&ldquo;Student Organization Gifts.&rdquo;</strong>
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-display text-xl font-extrabold leading-6 text-accent">3</span>
            <span className="flex-1">
              In the gift notes field, enter:
              <span className="mt-3 flex items-center justify-between gap-3 rounded-sm border border-line bg-bg/70 py-2 pl-4 pr-2">
                <code className="font-display text-2xl font-bold tracking-wide text-ink">{giving.accountCode}</code>
                <button
                  type="button"
                  onClick={copyCode}
                  className="inline-flex items-center gap-1.5 rounded-sm bg-panel-2 px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-line"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                    {copied ? <path d="m5 12 5 5 9-10" /> : <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" /></>}
                  </svg>
                  {copied ? "Copied" : "Copy"}
                </button>
              </span>
              <span className="sr-only" aria-live="polite">
                {copied ? "Gift code copied" : ""}
              </span>
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-display text-xl font-extrabold leading-6 text-accent">4</span>
            <span>Complete your payment details.</span>
          </li>
        </ol>
        <a
          href={giving.foundationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-sm bg-maroon px-6 py-4 font-display text-xl font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#6b0000]"
        >
          Donate online <span aria-hidden="true">→</span>
        </a>
        <p className="mt-3 text-center text-xs text-muted">Opens the Texas A&amp;M Foundation. Gifts are tax-deductible.</p>
      </div>

      <div role="tabpanel" id="panel-check" aria-labelledby="tab-check" hidden={tab !== "check"} className="mt-6">
        <p className="font-semibold">How to give by check</p>
        <p className="mt-4 text-muted">
          Make checks payable to <strong className="text-ink">{giving.checkPayableTo}</strong> and mail to:
        </p>
        <address className="mt-4 rounded-sm border border-line bg-bg/70 p-4 not-italic leading-relaxed">
          {giving.checkAddress.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </address>
      </div>
    </div>
  );
}
