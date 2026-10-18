"use client";

import { useState } from "react";

/**
 * A YouTube video that loads only when clicked: until then it's just the thumbnail and a play button,
 * so the page stays fast and YouTube sets no cookies for visitors who never press play.
 */
export function VideoFeature({ youtubeId, title, poster }: { youtubeId: string; title: string; poster?: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="relative aspect-video overflow-hidden rounded-3xl border border-line bg-black shadow-2xl shadow-black/40">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0 h-full w-full" aria-label={`Play video: ${title}`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- YouTube's own thumbnail CDN */}
          <img
            src={poster ?? `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`}
            alt=""
            loading="lazy"
            onError={(event) => {
              // Not every video has a max-resolution thumbnail; fall back to the standard one.
              const img = event.currentTarget;
              if (!img.src.includes("hqdefault")) img.src = `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
            }}
            className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
          />
          <span className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-maroon text-white ring-4 ring-white/20 transition group-hover:scale-110">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="ml-1 h-8 w-8" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
