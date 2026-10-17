import { useState } from "react";
import { ArrowUpRight, Phone, Menu, X, ChevronDown } from "lucide-react";
import { Link } from "@/lib/citium-link";
import { NAP } from "@/lib/site";
import { CITY_CARDS, SERVICE_NAV } from "@/lib/local-pages";

type NavItem = {
  href: string;
  label: string;
  /** Sub-links render as a dropdown on desktop and a collapsible list in the mobile menu. */
  children?: { href: string; label: string }[];
};

const SYSTEMS_NAV = [
  { href: "/roofing-systems", label: "All roofing systems" },
  { href: "/shingles", label: "Shingles" },
  { href: "/tile", label: "Tile" },
  { href: "/tpo", label: "TPO & flat" },
  { href: "/modified-bitumen", label: "Modified bitumen" },
];

const AREAS_NAV = [
  { href: "/service-areas", label: "All service areas" },
  ...CITY_CARDS.map((c) => ({ href: `/service-areas/${c.slug}`, label: `${c.city}, CA` })),
];

const NAV: NavItem[] = [
  {
    href: "/roofing-contractor-glendale-ca",
    label: "Services",
    children: SERVICE_NAV.map((l) => ({ href: l.href, label: l.anchor })),
  },
  { href: "/roofing-systems", label: "Roofing systems", children: SYSTEMS_NAV },
  { href: "/service-areas", label: "Service areas", children: AREAS_NAV },
  { href: "/projects", label: "Design examples" },
  { href: "/articles", label: "Resources" },
  { href: "/about", label: "Why Citium" },
  { href: "/financing", label: "Financing" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState<string | null>(null);
  const close = () => {
    setOpen(false);
    setSub(null);
  };
  return (
    <header className="header">
      <Link className="brand" href="/" aria-label="Citium Roofing Solutions home">
        <picture>
          <source type="image/webp" srcSet="/images/logo.webp 1x, /images/logo@2x.webp 2x" />
          <img
            src="/images/logo-small.png"
            alt="Citium Roofing Solutions"
            width="75"
            height="80"
            decoding="async"
          />
        </picture>
      </Link>
      <nav className={open ? "nav open" : "nav"} aria-label="Main navigation">
        {NAV.map((n) =>
          n.children ? (
            <div key={n.href} className={"nav-group" + (sub === n.label ? " sub-open" : "")}>
              <Link className="nav-top" href={n.href} onClick={close}>
                {n.label}
              </Link>
              <button
                type="button"
                className="nav-caret"
                aria-expanded={sub === n.label}
                aria-controls={"nav-sub-" + n.label.replace(/\s+/g, "-").toLowerCase()}
                aria-label={`${sub === n.label ? "Hide" : "Show"} ${n.label.toLowerCase()} links`}
                onClick={() => setSub(sub === n.label ? null : n.label)}
              >
                <ChevronDown size={14} aria-hidden="true" />
              </button>
              <div className="nav-sub" id={"nav-sub-" + n.label.replace(/\s+/g, "-").toLowerCase()}>
                {n.children.map((c) => (
                  <Link key={c.href} href={c.href} onClick={close}>
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <Link key={n.href} href={n.href} onClick={close}>
              {n.label}
            </Link>
          ),
        )}
        <Link className="nav-estimate" href="/estimate" onClick={close}>
          Get estimate
        </Link>
        <a className="nav-call" href={NAP.tel} onClick={close}>
          Call {NAP.phoneDisplay}
        </a>
      </nav>
      <a className="header-call" aria-label={`Call Citium at ${NAP.phoneDisplay}`} href={NAP.tel}>
        <Phone size={15} /> <span>Call Now</span>
      </a>
      <Link className="button small" href="/estimate">
        Get Estimate <ArrowUpRight size={16} />
      </Link>
      <button
        className="menu"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
      >
        {open ? <X /> : <Menu />}
      </button>
    </header>
  );
}

export function Footer() {
  return (
    <footer>
      <div className="footer-top">
        <p>
          A better roof.
          <br />
          A better place to come home.
        </p>
        <Link className="button light" href="/estimate">
          Let’s start with your home <ArrowUpRight size={18} />
        </Link>
      </div>
      <div className="footer-grid">
        <div>
          <strong>CITIUM</strong>
          <p>
            Roofing Solutions
            <br />
            Southern California
          </p>
          <a href={NAP.tel}>{NAP.phoneDisplay.replace(/-/g, " ")}</a>
          <br />
          <a href={NAP.mailto}>{NAP.email}</a>
        </div>
        <div>
          <span>ROOFING SYSTEMS</span>
          {[
            ["Shingles", "/shingles"],
            ["Tile", "/tile"],
            ["TPO", "/tpo"],
            ["Modified bitumen", "/modified-bitumen"],
            ["All systems", "/roofing-systems"],
          ].map(([n, p]) => (
            <Link key={p} href={p}>
              {n}
            </Link>
          ))}
        </div>
        <div>
          <span>HERE TO HELP</span>
          {[
            ["Request an estimate", "/estimate"],
            ["Installation process", "/installation-process"],
            ["Warranty", "/warranty"],
            ["Financing", "/financing"],
            ["Resources", "/articles"],
            ["FAQ", "/faq"],
            ["Contact", "/contact"],
            ["Customer service", "/customer-service"],
          ].map(([n, p]) => (
            <Link key={p} href={p}>
              {n}
            </Link>
          ))}
        </div>
        <div>
          <span>SERVICES</span>
          {SERVICE_NAV.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.anchor}
            </Link>
          ))}
        </div>
        <div>
          <span>AREAS WE SERVE</span>
          {CITY_CARDS.map((c) => (
            <Link key={c.slug} href={`/service-areas/${c.slug}`}>
              {c.city}
            </Link>
          ))}
          <Link href="/service-areas">All service areas</Link>
          <p>
            {NAP.street}
            <br />
            {NAP.unit}
            <br />
            {NAP.city}, {NAP.region} {NAP.zip}
          </p>
          <Link href="/about">
            Meet Citium <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Citium Roofing Solutions</span>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/faq">FAQ</Link>
        <span>Built layer by layer.</span>
      </div>
    </footer>
  );
}
