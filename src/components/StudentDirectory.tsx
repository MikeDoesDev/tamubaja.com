"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { DirectoryPerson } from "@/lib/directory";
import { initials } from "@/lib/format";

const SELECT =
  "select-chevron w-full rounded-sm border border-line bg-bg/70 px-4 py-3 text-sm text-ink transition-colors hover:border-muted/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

const uniqueSorted = (values: (string | undefined)[]) =>
  [...new Set(values.filter((value): value is string => Boolean(value)))].sort();

/** Searchable, filterable grid of every student on the team. */
export function StudentDirectory({ people, subteams }: { people: DirectoryPerson[]; subteams: string[] }) {
  const [query, setQuery] = useState("");
  const [subteam, setSubteam] = useState("");
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("");

  const majors = useMemo(() => uniqueSorted(people.map((p) => p.major)), [people]);
  const years = useMemo(() => uniqueSorted(people.map((p) => p.classYear)), [people]);

  const shown = people.filter((person) => {
    const q = query.trim().toLowerCase();
    if (q && !`${person.name} ${person.major ?? ""} ${person.titles.join(" ")}`.toLowerCase().includes(q)) return false;
    if (subteam && !person.subteams.includes(subteam) && !(subteam === "Leadership" && person.titles.length)) return false;
    if (major && person.major !== major) return false;
    if (year && person.classYear !== year) return false;
    return true;
  });

  const filtered = Boolean(query || subteam || major || year);

  return (
    <div>
      <div className="grid gap-4 rounded-sm border border-line bg-panel p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-muted">Search</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, major, or role…"
            className="w-full rounded-sm border border-line bg-bg/70 px-4 py-3 text-sm text-ink placeholder:text-muted/60 transition-colors hover:border-muted/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-muted">Subteam</span>
          <select value={subteam} onChange={(event) => setSubteam(event.target.value)} className={SELECT}>
            <option value="">Any</option>
            <option value="Leadership">Leadership</option>
            {subteams.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-muted">Major</span>
          <select value={major} onChange={(event) => setMajor(event.target.value)} className={SELECT}>
            <option value="">Any</option>
            {majors.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-muted">Graduating</span>
          <select value={year} onChange={(event) => setYear(event.target.value)} className={SELECT}>
            <option value="">Any</option>
            {years.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 flex items-center justify-between text-sm text-muted" aria-live="polite">
        <p>
          Showing <strong className="text-ink">{shown.length}</strong> of {people.length} students
        </p>
        {filtered && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSubteam("");
              setMajor("");
              setYear("");
            }}
            className="font-semibold text-accent underline underline-offset-4 hover:text-ink"
          >
            Clear filters
          </button>
        )}
      </div>

      {shown.length === 0 ? (
        <p className="mt-6 rounded-sm border border-dashed border-line p-10 text-center text-muted">No one matches those filters.</p>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {shown.map((person) => (
            <li key={person.name} className="group overflow-hidden rounded-sm border border-line bg-panel transition-colors hover:border-accent/60">
              <div className="relative aspect-square bg-linear-to-br from-maroon to-panel-2">
                {person.photo ? (
                  <Image
                    src={person.photo}
                    alt={`Headshot of ${person.name}`}
                    fill
                    sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <span aria-hidden="true" className="flex h-full w-full items-center justify-center font-display text-5xl font-extrabold text-white/80">
                    {initials(person.name)}
                  </span>
                )}
                {person.titles.length > 0 && (
                  <span className="absolute left-2 top-2 rounded-sm bg-bg/85 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-accent">
                    {person.titles[0]}
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="font-display text-xl font-extrabold uppercase leading-tight">{person.name}</p>
                {person.major && <p className="mt-1 text-sm text-muted">{person.major}</p>}
                {person.classYear && <p className="text-sm text-muted">Class of {person.classYear}</p>}
                {person.subteams.length > 0 && (
                  <p className="mt-3 flex flex-wrap gap-1.5">
                    {person.subteams.map((name) => (
                      <span key={name} className="rounded-sm bg-panel-2 px-2 py-0.5 text-xs text-ink/80">
                        {name}
                      </span>
                    ))}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
