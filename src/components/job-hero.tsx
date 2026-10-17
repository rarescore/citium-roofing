import { useEffect, useRef, useState } from "react";
import { MeasureHero } from "./measure-roof";
import { JOB_FILM, mediaTier, type PremiumSource } from "@/lib/premium-media";
import { seoPage } from "@/lib/pages";

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function pickSource(): PremiumSource {
  return JOB_FILM[mediaTier()];
}

export function JobHero() {
  const root = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [source, setSource] = useState<PremiumSource | null>(null);
  const [ready, setReady] = useState(false);
  const h1 = seoPage("/")?.h1 ?? "Roof Repair & Replacement in Glendale and Nearby Cities";

  useEffect(() => {
    setSource(pickSource());
    const mq = window.matchMedia("(min-width: 900px)");
    const onChange = () => setSource(pickSource());
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const el = root.current;
    const vid = videoRef.current;
    if (!el || !vid || !source) return;

    let attached = false;
    let near = false;
    let visible = false;
    let raf = 0;
    let shown = 0;
    let running = true;
    setReady(false);

    const detach = () => {
      attached = false;
      vid.pause();
      vid.removeAttribute("src");
      while (vid.firstChild) vid.removeChild(vid.firstChild);
      vid.load();
      setReady(false);
    };

    const attach = () => {
      if (attached || reducedMotion()) return;
      const mp4 = document.createElement("source");
      mp4.src = source.mp4;
      mp4.type = "video/mp4";
      vid.appendChild(mp4);
      vid.preload = "auto";
      vid.load();
      attached = true;
    };

    const progress = () => {
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = -el.getBoundingClientRect().top;
      return Math.min(1, Math.max(0, scrolled / Math.max(1, total)));
    };

    const seek = (amount: number) => {
      if (!attached || vid.seeking || vid.readyState < 2 || !Number.isFinite(vid.duration)) return;
      const last = Math.max(0, vid.duration - 1 / 24);
      const time = Math.min(last, Math.round(amount * last * 24) / 24);
      if (Math.abs(vid.currentTime - time) < 1 / 48) return;
      const fast = (vid as HTMLVideoElement & { fastSeek?: (t: number) => void }).fastSeek;
      if (typeof fast === "function") {
        try {
          fast.call(vid, time);
          return;
        } catch {
          /* fall through */
        }
      }
      vid.currentTime = time;
    };

    const tick = () => {
      raf = 0;
      if (!running || document.hidden || reducedMotion()) return;
      const next = progress();
      shown += (next - shown) * 0.22;
      if (Math.abs(next - shown) < 0.001) shown = next;
      el.style.setProperty("--job-p", shown.toFixed(4));
      if (visible) seek(shown);
      if (visible && shown !== next) raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (!running || document.hidden || raf) return;
      raf = requestAnimationFrame(tick);
    };

    const onReady = () => setReady(true);

    const io = new IntersectionObserver(
      (entries) => {
        near = entries.some((e) => e.isIntersecting);
        const rect = el.getBoundingClientRect();
        visible = rect.bottom > 0 && rect.top < window.innerHeight;
        if (reducedMotion()) {
          detach();
          return;
        }
        if (near) attach();
        else if (attached && !visible) vid.pause();
        if (visible) wake();
      },
      { rootMargin: "280px 0px" },
    );

    io.observe(el);
    vid.muted = true;
    vid.playsInline = true;
    vid.addEventListener("loadeddata", onReady);
    vid.addEventListener("seeked", wake);

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      visible = rect.bottom > 0 && rect.top < window.innerHeight;
      if (visible && !attached && !reducedMotion()) attach();
      wake();
    };

    const onVis = () => {
      if (document.hidden) {
        vid.pause();
        cancelAnimationFrame(raf);
        raf = 0;
      } else wake();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVis);

    return () => {
      running = false;
      io.disconnect();
      cancelAnimationFrame(raf);
      vid.removeEventListener("loadeddata", onReady);
      vid.removeEventListener("seeked", wake);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("visibilitychange", onVis);
      detach();
    };
  }, [source]);

  const poster = source?.poster ?? JOB_FILM.desktop.poster;

  return (
    <div className="job-hero" ref={root} style={{ ["--job-p" as string]: "0" }}>
      <div className="job-stage">
        <picture className="job-poster">
          <img
            src={poster}
            alt=""
            width={1600}
            height={900}
            fetchPriority="high"
            decoding="async"
          />
        </picture>
        <video
          ref={videoRef}
          className={"job-video" + (ready ? " is-ready" : "")}
          muted
          playsInline
          preload="none"
          poster={poster}
          width={source?.width ?? 1280}
          height={source?.height ?? 720}
        />
        <div className="job-veil" />
        <div className="job-copy">
          <h1 className="seo-h1">{h1}</h1>
          <div className="display-line">
            <span className="job-line job-line-tear">Tear-off.</span>
            <span className="job-line job-line-rebuild">Rebuild.</span>
          </div>
          <p>Let us Build Your Lifetime Roof</p>
          <p className="job-measure-line">Get my roof measurement</p>
        </div>
        <MeasureHero />
      </div>
    </div>
  );
}
