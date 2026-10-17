import { useEffect, useId, useRef, useState } from "react";
import { Link } from "@/lib/citium-link";
import { syncAnalytics } from "@/lib/analytics";
import {
  OPEN_CONSENT_EVENT,
  effectiveConsent,
  gpcActive,
  isCurrentConsent,
  makeConsent,
  readConsent,
  writeConsent,
  type ConsentRecord,
} from "@/lib/consent";

type Draft = { analytics: boolean; marketing: boolean };

function apply(record: ConsentRecord | null) {
  syncAnalytics(effectiveConsent(record, gpcActive()));
}

export function CookieConsent() {
  const titleId = useId();
  const dialogTitleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [record, setRecord] = useState<ConsentRecord | null>(null);
  const [banner, setBanner] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [draft, setDraft] = useState<Draft>({ analytics: false, marketing: false });
  const [gpc, setGpc] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const gpcNow = gpcActive();
    const savedRecord = readConsent();
    const effect = effectiveConsent(savedRecord, gpcNow);
    setGpc(gpcNow);
    setRecord(savedRecord);
    setDraft({ analytics: effect.analytics, marketing: effect.marketing });
    setBanner(!isCurrentConsent(savedRecord));
    setReady(true);
    const open = () => {
      const latest = readConsent();
      const next = effectiveConsent(latest, gpcActive());
      setRecord(latest);
      setGpc(gpcActive());
      setDraft({ analytics: next.analytics, marketing: next.marketing });
      setDialog(true);
      setSaved(false);
    };
    window.addEventListener(OPEN_CONSENT_EVENT, open);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, open);
  }, []);

  useEffect(() => {
    if (!dialog) return;
    const root = dialogRef.current;
    const previous = document.activeElement as HTMLElement | null;
    const items = () =>
      [...(root?.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], input:not([disabled])") ?? [])];
    items()[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDialog();
        return;
      }
      if (event.key !== "Tab" || !root) return;
      const list = items();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
    // closeDialog is stable enough for the open/close cycle of this dialog.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialog]);

  function commit(choice: Draft, source: "accept" | "reject" | "custom") {
    const next = makeConsent({ ...choice, source }, gpcActive());
    writeConsent(next);
    setRecord(next);
    setDraft({ analytics: next.analytics, marketing: next.marketing && !(gpcActive() && !next.gpcOverride) });
    apply(next);
    setBanner(false);
    setDialog(false);
    setSaved(true);
  }

  function closeDialog() {
    setDialog(false);
    if (!isCurrentConsent(record)) setBanner(true);
  }

  if (!ready) return null;

  return (
    <>
      <p className="sr-only" aria-live="polite">
        {saved ? "Cookie preferences saved." : ""}
      </p>
      {banner && !dialog ? (
        <section className="consent-banner" data-consent="banner" aria-labelledby={titleId}>
          <h2 id={titleId}>Cookies on this site</h2>
          <p className="consent-copy-full">
            Essential cookies keep booking, calls, and this choice working. Analytics and marketing stay off until you
            allow them.
          </p>
          <p className="consent-copy-short">Essential cookies only, until you allow more.</p>
          {gpc ? (
            <p className="consent-note">
              Your browser sent Global Privacy Control. Marketing stays off unless you choose otherwise.
            </p>
          ) : null}
          <div className="consent-actions">
            <button type="button" className="consent-accept" onClick={() => commit({ analytics: true, marketing: true }, "accept")}>
              Accept all
            </button>
            <button type="button" className="consent-reject" onClick={() => commit({ analytics: false, marketing: false }, "reject")}>
              Reject optional
            </button>
            <button
              type="button"
              className="consent-custom"
              onClick={() => {
                setDialog(true);
                setSaved(false);
              }}
            >
              Customize
            </button>
          </div>
          <p className="consent-links">
            <Link href="/cookie-policy">Cookie policy</Link>
            <Link href="/privacy">Privacy</Link>
          </p>
        </section>
      ) : null}
      {dialog ? (
        <div className="consent-dialog">
          <div
            ref={dialogRef}
            className="consent-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            data-consent="dialog"
          >
            <h2 id={dialogTitleId}>Cookie settings</h2>
            <p>Essential cookies are always on. Analytics and marketing are off until you turn them on.</p>
            {gpc ? (
              <p className="consent-note">
                Global Privacy Control is on. Saving marketing as on is an explicit choice for this browser.
              </p>
            ) : null}
            <fieldset>
              <legend className="sr-only">Cookie categories</legend>
              <label className="consent-row">
                <span>
                  <strong>Essential</strong>
                  <small>Required for the site, your booking, and remembering this setting.</small>
                </span>
                <input type="checkbox" checked disabled readOnly />
              </label>
              <label className="consent-row">
                <span>
                  <strong>Analytics</strong>
                  <small>Visits and clicks if an analytics ID is set. Estimated city counts use the connection, not your street. Form fields are masked.</small>
                </span>
                <input
                  type="checkbox"
                  checked={draft.analytics}
                  onChange={(event) => setDraft((d) => ({ ...d, analytics: event.target.checked }))}
                />
              </label>
              <label className="consent-row">
                <span>
                  <strong>Marketing</strong>
                  <small>Ads tags load only if you allow this and an ad ID is configured.</small>
                </span>
                <input
                  type="checkbox"
                  checked={draft.marketing}
                  onChange={(event) => setDraft((d) => ({ ...d, marketing: event.target.checked }))}
                />
              </label>
            </fieldset>
            <div className="consent-actions">
              <button type="button" className="consent-accept" onClick={() => commit(draft, "custom")}>
                Save preferences
              </button>
              <button type="button" className="consent-reject" onClick={() => commit({ analytics: false, marketing: false }, "reject")}>
                Reject optional
              </button>
              <button type="button" className="consent-custom" onClick={closeDialog}>
                {isCurrentConsent(record) ? "Close" : "Back"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
