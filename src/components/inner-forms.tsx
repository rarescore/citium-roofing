import { ArrowUpRight, Phone, Mail, MapPin } from "lucide-react";
import { Link } from "@/lib/citium-link";
import { Inquiry } from "@/components/site-experiences";
import { NAP } from "@/lib/site";
import { seoPage } from "@/lib/pages";

export function Intro({
  tag,
  title,
  copy,
  /** Keyword H1; when set, the stylized `title` becomes a display line (not an H1). */
  h1,
}: {
  tag: string;
  title: string;
  copy: string;
  h1?: string;
}) {
  return (
    <div className="page-intro">
      {h1 ? (
        <>
          {/* Keyword H1 takes the eyebrow slot (same look); the brand line stays as the display text. */}
          <h1 className="eyebrow seo-h1" data-tagline={tag}>
            {h1}
          </h1>
          <div className="display-line">{title}</div>
        </>
      ) : (
        <>
          <span className="eyebrow">{tag}</span>
          <h1>{title}</h1>
        </>
      )}
      <p>{copy}</p>
    </div>
  );
}

export function FormPage({ kind }: { kind: "estimate" | "financing" | "service" | "contact" }) {
  const path =
    kind === "estimate"
      ? "/estimate"
      : kind === "financing"
        ? "/financing"
        : kind === "service"
          ? "/customer-service"
          : "/contact";
  const seo = seoPage(path);
  const content = {
    estimate: [
      "YOUR ROOF STARTS HERE",
      "Let’s take a\ncloser look.",
      "Every roof is different. Share your address and contact details so Citium can help you take the next step.",
    ],
    financing: [
      "MAKE ROOM FOR YOUR NEXT CHAPTER",
      "A better roof.\nA workable plan.",
      "Citium offers financing. Start a conversation about available options for your roofing project.",
    ],
    service: [
      "HERE FOR YOUR HOME",
      "How can\nwe help?",
      "For an existing project, repair question, or warranty document request, get in touch with the Citium team.",
    ],
    contact: [
      "LET’S TALK",
      "Your home.\nOur attention.",
      "Tell us what you have in mind. We’ll help you understand the next step for your roof.",
    ],
  }[kind];
  return (
    <section className="form-page">
      <div>
        <Intro tag={content[0]} title={content[1]} copy={content[2]} h1={seo?.h1} />
        <div className="contact-details">
          <a href={NAP.tel}>
            <Phone size={18} />
            <span>{NAP.phoneDisplay.replace(/-/g, " ")}</span>
          </a>
          <a href={NAP.mailto}>
            <Mail size={18} />
            <span>{NAP.email}</span>
          </a>
          <a target="_blank" rel="noreferrer" href={NAP.mapsUrl}>
            <MapPin size={19} />
            <span>
              {NAP.street}, {NAP.unit}
              <br />
              {NAP.city}, {NAP.region} {NAP.zip}
            </span>
          </a>
        </div>
        {kind === "contact" && (
          <p className="contact-areas">
            Based in Glendale and serving Burbank, Pasadena, La Crescenta, Tujunga, Sunland and Alhambra.{" "}
            <Link href="/service-areas">See the cities we cover</Link>.
          </p>
        )}
        {kind === "financing" && (
          <div className="quiet-note">
            <h2>Information first.</h2>
            <p>
              Ask about current financing availability, terms, and the application process. Citium will
              explain the next steps. This inquiry does not make a credit decision or guarantee approval.
            </p>
          </div>
        )}
        {kind === "service" && (
          <div className="quiet-note">
            <h2>Seeing a leak?</h2>
            <p>
              Call Citium and describe what you can observe safely from inside or from the ground. Include
              the affected room and when you first noticed the issue.
            </p>
          </div>
        )}
      </div>
      <Inquiry kind={kind} />
    </section>
  );
}
