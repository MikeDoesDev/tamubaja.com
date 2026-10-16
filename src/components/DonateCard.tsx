"use client";

import { useState } from "react";
import type { Site } from "@/lib/schemas";

type Giving = Site["giving"];

/** A value in a box with a Copy button (gift code, check payee). */
function CopyBox({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (old browser or insecure context): the value is still visible to copy by hand.
    }
  }
  return (
    <span className="mt-3 flex items-center justify-between gap-3 rounded-sm border border-line bg-bg/70 py-2 pl-4 pr-2">
      <code className="font-display text-2xl font-bold tracking-wide text-ink">{value}</code>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${label}`}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-sm bg-panel-2 px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-line"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
          {copied ? (
            <path d="m5 12 5 5 9-10" />
          ) : (
            <>
              <rect x="8" y="8" width="12" height="12" rx="2" />
              <path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" />
            </>
          )}
        </svg>
        {copied ? "Copied" : "Copy"}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? `${label} copied` : ""}
      </span>
    </span>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="font-display text-xl font-extrabold leading-6 text-accent">{n}</span>
      <span className="flex-1">{children}</span>
    </li>
  );
}

/** Donation instructions with Card / Check tabs and one-click copy of the details people need. */
export function DonateCard({ giving }: { giving: Giving }) {
  const [tab, setTab] = useState<"card" | "check">("card");

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
          <Step n={1}>
            Click <strong className="text-ink">Donate online</strong> below.
          </Step>
          <Step n={2}>
            Select <strong className="text-ink">&ldquo;Student Organization Gifts.&rdquo;</strong>
          </Step>
          <Step n={3}>
            In the gift notes field, enter:
            <CopyBox value={giving.accountCode} label="gift code" />
          </Step>
          <Step n={4}>Complete your payment details.</Step>
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
        <ol className="mt-4 space-y-5 text-muted">
          <Step n={1}>
            Make the check payable to:
            <CopyBox value={giving.checkPayableTo.toUpperCase()} label="check payee" />
          </Step>
          <Step n={2}>
            Mail it to:
            <address className="mt-3 rounded-sm border border-line bg-bg/70 p-4 not-italic leading-relaxed text-ink">
              {giving.checkAddress.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          </Step>
        </ol>
        <p className="mt-6 text-xs text-muted">Every donor gets a tax receipt from the Texas A&amp;M Foundation and an invite to our spring Rollout.</p>
      </div>
    </div>
  );
}
