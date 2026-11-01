"use client";

import { useRef, useState } from "react";
import type { Subteam } from "@/lib/schemas";
import Link from "next/link";
import { directoryHref } from "@/lib/directory";
import { LeadCard, MemberRow } from "./MemberCard";
import { PersonPlaceholder } from "./PersonPlaceholder";

const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/**
 * Subteam tiles. Clicking a tile opens its roster below the grid: leads first, then members.
 * Every roster is rendered in the HTML (just hidden), so search engines and no-JS visitors still get the names.
 */
export function SubteamExplorer({ subteams }: { subteams: Subteam[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const toggle = (name: string) => {
    const next = open === name ? null : name;
    setOpen(next);
    if (next) {
      // On phones the panel sits below all the tiles; bring it into view.
      requestAnimationFrame(() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
    }
  };

  return (
    <div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subteams.map((subteam) => {
          const isOpen = open === subteam.name;
          const count = subteam.leads.length + subteam.members.length;
          return (
            <li key={subteam.name}>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`subteam-${slug(subteam.name)}`}
                onClick={() => toggle(subteam.name)}
                className={`group flex h-full w-full flex-col items-start rounded-2xl p-7 text-left transition-colors ${
                  isOpen ? "bg-maroon" : "border border-line bg-panel hover:bg-panel-2"
                }`}
              >
                <span className="flex w-full items-center justify-between gap-4">
                  <span className="font-display text-4xl font-extrabold uppercase leading-none">{subteam.name}</span>
                  <span
                    aria-hidden="true"
                    className={`font-display text-2xl leading-none transition-transform ${isOpen ? "rotate-45" : "text-accent"}`}
                  >
                    +
                  </span>
                </span>
                <span className={`mt-1 text-sm ${isOpen ? "text-white/85" : "text-muted"}`}>{subteam.description}</span>
                {subteam.leads.length > 0 && (
                  <span className={`mt-5 flex w-full items-center gap-3 border-t pt-4 ${isOpen ? "border-white/20" : "border-line"}`}>
                    <span className="flex -space-x-2">
                      {subteam.leads.slice(0, 3).map((lead) => (
                        <span key={lead.name} className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-panel bg-[#101214]">
                          <PersonPlaceholder />
                        </span>
                      ))}
                    </span>
                    <span className="min-w-0">
                      <span className={`block text-[11px] font-semibold uppercase tracking-[0.2em] ${isOpen ? "text-white/75" : "text-accent"}`}>
                        {subteam.leads.length === 1 ? "Led by" : "Leads"}
                      </span>
                      <span className="block truncate font-display text-lg font-bold uppercase leading-tight">
                        {subteam.leads[0].name}
                        {subteam.leads.length > 1 ? ` +${subteam.leads.length - 1}` : ""}
                      </span>
                    </span>
                  </span>
                )}
                {count > 0 && (
                  <span className={`mt-4 text-xs font-semibold uppercase tracking-[0.2em] ${isOpen ? "text-white/85" : "text-accent"}`}>
                    {count} {count === 1 ? "member" : "members"} · {isOpen ? "Hide" : "Meet them"}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <div ref={panelRef} className="scroll-mt-24">
        {subteams.map((subteam) => (
          <section
            key={subteam.name}
            id={`subteam-${slug(subteam.name)}`}
            aria-label={`${subteam.name} subteam`}
            hidden={open !== subteam.name}
            className="mt-6 rounded-2xl border border-line bg-panel/80 p-6 sm:p-8"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <h3 className="font-display text-4xl font-extrabold uppercase">{subteam.name}</h3>
                {subteam.details && <p className="mt-3 text-lg text-muted">{subteam.details}</p>}
              </div>
              <Link
                href={directoryHref({ subteam: subteam.name })}
                className="inline-flex items-center gap-2 rounded-sm border border-line px-4 py-2 font-display text-base font-bold uppercase tracking-wide transition-colors hover:border-accent hover:text-accent"
              >
                Open in the directory →
              </Link>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_2fr]">
              {subteam.leads.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                    {subteam.leads.length === 1 ? "Lead" : "Leads"}
                  </p>
                  <ul className="mt-3 space-y-3">
                    {subteam.leads.map((lead) => (
                      <LeadCard key={lead.name} member={lead} subteam={subteam.name} />
                    ))}
                  </ul>
                </div>
              )}
              {subteam.members.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                    Members · {subteam.members.length}
                  </p>
                  <ul className="mt-2 grid gap-x-2 sm:grid-cols-2">
                    {subteam.members.map((member) => (
                      <MemberRow key={member.name} member={member} subteam={subteam.name} />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
