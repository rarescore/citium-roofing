import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, MapPin } from "lucide-react";
import { validateLead, emailLeadDirect } from "@/lib/integrations";
import { trackLead } from "@/lib/analytics";

type Suggest = { text: string; magicKey: string };

function todayIso() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function parseIso(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function formatDay(iso: string) {
  const date = parseIso(iso);
  if (!date) return iso;
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

const TIMES = [
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
];

const OFFER = "0% Financing Offering";

export function VisitBooking() {
  const started = useRef(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [promo, setPromo] = useState(false);
  const [email, setEmail] = useState("");
  const [hints, setHints] = useState<Suggest[]>([]);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const [when, setWhen] = useState("");
  const minDay = todayIso();

  useEffect(() => {
    started.current = Date.now();
  }, []);

  useEffect(() => {
    const q = address.trim();
    if (q.length < 3) {
      setHints([]);
      setOpen(false);
      return;
    }
    const t = window.setTimeout(async () => {
      try {
        const res = await fetch("/api/address-suggest?q=" + encodeURIComponent(q));
        const data = (await res.json()) as { suggestions?: Suggest[] };
        const next = data.suggestions ?? [];
        setHints(next);
        setOpen(next.length > 0);
      } catch {
        setHints([]);
        setOpen(false);
      }
    }, 220);
    return () => window.clearTimeout(t);
  }, [address]);

  function pick(s: Suggest) {
    setAddress(s.text);
    setHints([]);
    setOpen(false);
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    form.querySelectorAll(".field-missing").forEach((el) => el.classList.remove("field-missing"));
    const missing: string[] = [];
    const mark = (name: string, label: string, bad: boolean) => {
      const field = form.elements.namedItem(name);
      if (!(field instanceof HTMLElement)) return;
      if (!bad) {
        field.removeAttribute("aria-invalid");
        return;
      }
      field.setAttribute("aria-invalid", "true");
      field.closest("label")?.classList.add("field-missing");
      missing.push(label);
    };
    const picked = parseIso(date);
    mark("name", "your name", name.trim().length < 2);
    mark("phone", "a phone number", phone.replace(/\D/g, "").length < 10);
    mark("address", "the address", address.trim().length < 2);
    mark("visit-date", "a weekday from today on", !picked || date < minDay || picked.getDay() === 0);
    mark("visit-time", "a time", !TIMES.includes(time));
    if (promo) mark("email", "an email for the promotions", !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()));
    if (missing.length) {
      form.querySelector(".field-missing")?.scrollIntoView({ block: "center", behavior: "smooth" });
      setError(
        missing.length === 1
          ? `Please fill in ${missing[0]}.`
          : `Please fill in ${missing.slice(0, -1).join(", ")} and ${missing.at(-1)}.`,
      );
      return;
    }
    setError("");
    const hpInput = e.currentTarget.elements.namedItem("citium_hp");
    const hp = hpInput instanceof HTMLInputElement && !hpInput.readOnly ? hpInput.value : "";
    const dayLabel = formatDay(date);
    let lead;
    try {
      lead = validateLead({
        kind: "contact",
        name,
        email: promo ? email.trim() : "visit-request@citiumroofing.com",
        phone,
        address,
        service: "inspection",
        consent: true,
        website: String(hp || ""),
        elapsedMs: Date.now() - started.current,
        message: [
          "Free home visit",
          `Preferred day: ${dayLabel} (${date})`,
          `Preferred time: ${time}`,
          "Offer on the booking card: 0% financing. Payments as low as $75 monthly for a new roof.",
          `Email promotions: ${promo ? "yes" : "no"}`,
          promo ? `Email: ${email.trim()}` : "No email on file. Call or text this number.",
        ].join("\n"),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Check the form and try again.");
      return;
    }
    setStatus("sending");
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });
      const result = (await response.json()) as { status?: string; error?: string; message?: string };
      const delivered = response.ok && result.status === "sent";
      if (!delivered && response.status !== 400) {
        const direct = await emailLeadDirect(lead);
        if (direct.ok) {
          trackLead("contact", "inspection");
          setWhen(`${dayLabel} at ${time}`);
          setStatus("sent");
          return;
        }
      }
      if (!delivered) {
        setStatus("idle");
        setError(result.error || result.message || "We could not book that just now. Call 818-531-1277.");
        return;
      }
      trackLead("contact", "inspection");
      setWhen(`${dayLabel} at ${time}`);
      setStatus("sent");
    } catch {
      try {
        const direct = await emailLeadDirect(lead);
        if (direct.ok) {
          trackLead("contact", "inspection");
          setWhen(`${dayLabel} at ${time}`);
          setStatus("sent");
          return;
        }
      } catch {
        /* the mail endpoint was unreachable */
      }
      setStatus("idle");
      setError("We could not book that just now. Call 818-531-1277.");
    }
  }

  return (
    <section className="visit-page" id="book-a-visit" aria-labelledby="visit-title">
      <div className="visit-frame">
        <div className="visit-offer">
          <p className="visit-offer-financing">{OFFER}</p>
          <p className="visit-pay">Payments as low as $75 monthly for a new roof.</p>
        </div>
        <div className="visit-card">
          {status === "sent" ? (
            <div className="visit-done" aria-live="polite">
              <Check size={28} />
              <h2 id="visit-title">You have been scheduled, see you soon!</h2>
              <p>
                {when}
                {address ? ` · ${address}` : ""}
              </p>
            </div>
          ) : (
            <form
              className="visit-form"
              onSubmit={submit}
              noValidate
              autoComplete="on"
              onInput={(ev) => {
                const t = ev.target;
                if (!(t instanceof HTMLElement)) return;
                t.closest("label")?.classList.remove("field-missing");
                if (t instanceof HTMLInputElement || t instanceof HTMLSelectElement) t.removeAttribute("aria-invalid");
              }}
            >
              <h2 id="visit-title">Book a free visit.</h2>
              <p className="visit-es">Visita a su casa, sin costo. Usted elige el día y la hora.</p>
              <div className="visit-row">
                <label>
                  Name
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    maxLength={200}
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <label>
                  Phone
                  <input
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    required
                    maxLength={30}
                    placeholder="(818) 555-0123"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </label>
              </div>
              <label className="visit-address">
                Address
                <span className="visit-address-field">
                  <MapPin size={16} aria-hidden="true" />
                  <input
                    name="address"
                    autoComplete="off"
                    required
                    maxLength={300}
                    placeholder="Start typing your address"
                    value={address}
                    role="combobox"
                    aria-expanded={open}
                    aria-autocomplete="list"
                    aria-controls="visit-address-list"
                    onChange={(e) => setAddress(e.target.value)}
                    onFocus={() => hints.length && setOpen(true)}
                    onBlur={() => window.setTimeout(() => setOpen(false), 160)}
                  />
                  {open && hints.length > 0 && (
                    <ul className="address-suggest" id="visit-address-list" role="listbox">
                      {hints.map((s) => (
                        <li key={s.magicKey} role="option">
                          <button type="button" onMouseDown={(ev) => ev.preventDefault()} onClick={() => pick(s)}>
                            {s.text}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </span>
              </label>
              <div className="visit-when">
                <label>
                  When should we come
                  <input
                    name="visit-date"
                    type="date"
                    required
                    min={minDay}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </label>
                <label>
                  Time
                  <select name="visit-time" required value={time} onChange={(e) => setTime(e.target.value)}>
                    <option value="">Choose</option>
                    {TIMES.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="visit-check">
                <input type="checkbox" checked={promo} onChange={(e) => setPromo(e.target.checked)} />
                <span>I agree to receive email promotions</span>
              </label>
              {promo && (
                <label>
                  Email
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={200}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
              )}
              <label className="honeypot" aria-hidden="true">
                <input name="citium_hp" tabIndex={-1} autoComplete="off" readOnly defaultValue="" data-1p-ignore="true" data-lpignore="true" />
              </label>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <button className="button" type="submit" disabled={status === "sending"}>
                {status === "sending" ? "Scheduling…" : "Schedule my visit"} <ArrowUpRight size={18} />
              </button>
              <p className="visit-note">Monday through Saturday, 8 to 4. Call 818-531-1277 if you’d rather talk now.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
