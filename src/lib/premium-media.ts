export type MediaTier = "mobile" | "desktop";

export type PremiumSource = {
  mp4: string;
  poster: string;
  width: number;
  height: number;
};

/** Viewport tiers so phones never download the desktop film. */
export function mediaTier(width = typeof window === "undefined" ? 1440 : window.innerWidth): MediaTier {
  return width < 900 ? "mobile" : "desktop";
}

/**
 * Tear-off → rebuild hero film.
 * Uses the existing short job encodes already in public/videos.
 * Src is assigned in JS only — never baked into SSR HTML.
 */
export const JOB_FILM: Record<MediaTier, PremiumSource> = {
  mobile: {
    mp4: "/videos/roof-job-sm.mp4",
    poster: "/images/job/poster.jpg",
    width: 854,
    height: 480,
  },
  desktop: {
    mp4: "/videos/roof-job.mp4",
    poster: "/images/job/poster.jpg",
    width: 1280,
    height: 720,
  },
};

export const JOB_POSTER_PRELOAD = JOB_FILM.desktop.poster;
