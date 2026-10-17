import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Phone, ArrowUpRight } from "lucide-react";
import { Link } from "@/lib/citium-link";
import { NAP } from "@/lib/site";

const FORM = "form.inquiry-form";

/**
 * Sticky mobile CTA: CALL + Request Inspection (/estimate?service=inspection). Hidden at ≥768px
 * and not rendered on /estimate itself.
 * "Free Inspection" is unverified, so the label is Request Inspection.
 * Positioned as a floating bar that does not cover content (body padding
 * is reserved in styles.css). It slides away while a lead form's submit
 * button is on screen or a form field has focus, so it never sits on top of
 * the submit button or the field being typed in.
 */
export function MobileCta() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [submitInView, setSubmitInView] = useState(false);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    setSubmitInView(false);
    setTyping(false);
    if (typeof IntersectionObserver === "undefined") return;
    let io: IntersectionObserver | undefined;
    const visible = new Set<Element>();
    const attach = () => {
      const buttons = document.querySelectorAll(`${FORM} button[type=submit]`);
      if (!buttons.length) return false;
      io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target);
          else visible.delete(e.target);
        }
        setSubmitInView(visible.size > 0);
      });
      buttons.forEach((b) => io!.observe(b));
      return true;
    };
    // Forms render after hydration / route change; retry briefly until present.
    let tries = 0;
    const timer = window.setInterval(() => {
      if (attach() || ++tries > 20) window.clearInterval(timer);
    }, 250);
    if (attach()) window.clearInterval(timer);
    const onFocus = (e: FocusEvent) => {
      const t = e.target as Element | null;
      setTyping(Boolean(t?.closest?.(FORM)));
    };
    const onBlur = (e: FocusEvent) => {
      const next = e.relatedTarget as Element | null;
      if (!next?.closest?.(FORM)) setTyping(false);
    };
    document.addEventListener("focusin", onFocus);
    document.addEventListener("focusout", onBlur);
    return () => {
      window.clearInterval(timer);
      io?.disconnect();
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("focusout", onBlur);
    };
  }, [pathname]);

  const hidden = submitInView || typing;
  // On /estimate the bar would link to the page itself, and the form is the page's CTA.
  if (pathname === "/estimate" || pathname === "/estimate/") return null;
  return (
    <div
      className={hidden ? "mobile-cta is-hidden" : "mobile-cta"}
      role="region"
      aria-label="Quick contact"
      aria-hidden={hidden || undefined}
    >
      <a className="cta-call" href={NAP.tel} data-analytics="phone" tabIndex={hidden ? -1 : undefined}>
        <Phone size={16} aria-hidden="true" /> CALL
      </a>
      <Link
        className="cta-estimate"
        href="/estimate?service=inspection"
        data-analytics="inspection"
        tabIndex={hidden ? -1 : undefined}
      >
        Request Inspection <ArrowUpRight size={16} aria-hidden="true" />
      </Link>
    </div>
  );
}
