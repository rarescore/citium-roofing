import type React from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/lib/citium-link";
import { company } from "@/lib/content";
import { Intro } from "@/components/inner-forms";
import { seoPage } from "@/lib/pages";
import { SCHEMA_EXCLUDE } from "@/lib/site";

export function Process() {
  const steps: [string, string, string, React.ReactNode?][] = [
    [
      "Your roof, understood",
      "Start with your address, concerns, and goals. Ask for an assessment of the existing covering, visible damage, drainage, and accessible conditions.",
      "Share your concerns and any safely taken photos.",
      <>
        Read what happens during <Link href="/roof-inspection-glendale-ca">the assessment visit</Link>.
      </>,
    ],
    [
      "A scope you can read",
      "Review the proposed materials, preparation, flashing, disposal, and any allowances for concealed damage. Ask what is included and how changes are approved.",
      "Keep a copy of the written proposal.",
    ],
    [
      "Prepare for the work",
      "Discuss access, protection of surrounding areas, scheduling, and any project-specific permits or requirements before work starts.",
      "Confirm your point of contact.",
      <>
        On a re-roof, here is{" "}
        <Link href="/articles/what-actually-happens-when-they-tear-your-roof-off">what tear-off day looks like</Link>.
      </>,
    ],
    [
      "Build the system",
      "The installation sequence depends on the specified assembly. Preparation and decking come before water-shedding layers, details, and the final covering.",
      "Ask how progress and unexpected findings will be communicated.",
      <>
        See <Link href="/roof-replacement-glendale-ca">what a full replacement includes</Link>, or{" "}
        <Link href="/roof-installation-glendale-ca">roofs on new additions and ADUs</Link>.
      </>,
    ],
    [
      "Review every detail",
      "Walk through the completed scope, cleanup, and any remaining questions with the team. Gather product and workmanship documentation.",
      "Save your contract, warranty documents, and maintenance guidance.",
    ],
  ];
  return (
    <>
      <Intro
        tag="THE INSTALLATION PROCESS"
        title={"A clear path.\nA considered result."}
        copy="Know what to discuss at each stage of your roofing project. Your signed scope determines the specific work and sequence."
        h1={seoPage("/installation-process")?.h1}
      />
      <section className="process-list">
        {steps.map(([h, p, n, more], i) => (
          <article key={h}>
            <span className="step-number">0{i + 1}</span>
            <div>
              <h2>{h}</h2>
              <p>
                {p}
                {more && <> {more}</>}
              </p>
              <span className="step-note">YOUR CHECKPOINT · {n}</span>
            </div>
          </article>
        ))}
      </section>
      <div className="section process-end">
        <h2>Start with a conversation.</h2>
        <Link href="/estimate" className="button">
          Request an assessment <ArrowUpRight size={17} />
        </Link>
      </div>
    </>
  );
}

export function Warranty() {
  return (
    <>
      <Intro
        tag="UNDERSTAND YOUR PROTECTION"
        title={"Confidence,\nin writing."}
        copy="A warranty is only useful when you understand what it covers. Review the documents for your selected materials and installation before work begins."
      />
      <section className="warranty-layout">
        <div className="warranty-statement">
          <div className="preferred">
            <span>OWENS CORNING</span>
            <strong>Preferred Contractor</strong>
          </div>
          <h2>
            Good products.
            <br />
            Clear expectations.
          </h2>
          <p>
            Citium’s Owens Corning Preferred status is part of the conversation. Ask which warranty options
            apply to your exact roofing system.
          </p>
          <a
            className="text-link"
            href="https://www.owenscorning.com/en-us/roofing/warranty"
            target="_blank"
            rel="noreferrer"
          >
            Manufacturer warranty information <ArrowUpRight size={17} />
          </a>
        </div>
        <div className="warranty-questions">
          {[
            [
              "Product coverage",
              "Ask which product warranty applies, how claims are handled, and whether registration is required.",
            ],
            [
              "Workmanship coverage",
              "Ask Citium to identify any installation coverage, its duration, exclusions, and the process for requesting service in writing.",
            ],
            [
              "System eligibility",
              "Enhanced coverage may depend on the products and installation requirements. Never assume a particular warranty applies to every roof.",
            ],
            [
              "Keep your documents",
              "Save the contract, material selections, warranty certificate, and maintenance information together.",
            ],
          ].map(([h, p]) => (
            <article key={h}>
              <h3>{h}</h3>
              <p>{p}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="related-links">
        <span>Need help with an existing roof?</span>
        <Link href="/customer-service">Contact customer service ↗</Link>
      </section>
    </>
  );
}

export function About() {
  return (
    <>
      <section className="about-hero">
        <Intro
          tag="CITIUM ROOFING SOLUTIONS"
          title={"Close to home.\nCareful by nature."}
          copy="Based in Glendale, Citium provides roof repair, installation, and replacement for residential and commercial properties across Southern California."
          h1={seoPage("/about")?.h1}
        />
        <div className="about-place">
          <span>GLENDALE, CA</span>
          <strong>
            From here.
            <br />
            For your home.
          </strong>
        </div>
      </section>
      <section className="about-copy">
        <h2>
          The roof protects
          <br />
          what matters below.
        </h2>
        <div>
          <p>
            That is where the conversation begins: your property, your concerns, and the work it actually
            needs. From a leak to a planned roof replacement, Citium helps homeowners and property owners take
            the next step. Start with <Link href="/roofing-contractor-glendale-ca">our Glendale roofing services</Link>
            , including <Link href="/commercial-roofing-glendale-ca">commercial roofing</Link>.
          </p>
          <p>
            Explore the materials, understand the assembly, and ask for a written scope. A clear project starts
            with clear information. Here is <Link href="/installation-process">how a Citium project runs</Link>.
          </p>
          <Link href="/contact" className="text-link">
            Talk with Citium <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
      <section className="service-area">
        <span className="eyebrow">BASED IN GLENDALE / SERVING SOUTHERN CALIFORNIA</span>
        <h2>
          Local knowledge.
          <br />
          Personal attention.
        </h2>
        <div>
          {company.area.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
        <p>
          Outside these communities? <Link href="/contact">Ask about your address.</Link> Or read about{" "}
          <Link href="/service-areas">the seven cities we work in</Link>.
        </p>
      </section>
    </>
  );
}

export function Faq() {
  // [question, answer, optional linked follow-up shown after the answer]
  const items: [string, string, React.ReactNode?][] = [
    ["How much does a new roof cost in Los Angeles?", "Most 2026 homeowner replacements land in a wide band by size, material, and tear-off. Citium prices after seeing the roof — not from a phone square-foot guess. Read the 2026 cost guide, then request an assessment.", <>Here is <Link href="/articles/roof-replacement-cost-los-angeles">the 2026 cost guide</Link>.</>],
    ["Do I need a Cool Roof in L.A.?", "Title 24 and LADWP rebates push high-SRI products on many reroofs. Duration® COOL colors such as Sierra Gray are specified for this climate. We confirm CRRC values for your address."],
    ["Can you repair instead of replace?", "Yes, when the leak is local, the product is still in warranty, and the deck is sound. Widespread curl, granule loss, two layers, or soft sheathing usually means replacement.", <>Here is <Link href="/articles/roof-repair-vs-replacement">how to weigh repair against replacement</Link>.</>],
    ["Do you install tile, TPO, and torch-down?", "Yes. Steep-slope shingles and tile, low-slope TPO, and modified bitumen. The written scope names the assembly.", <><Link href="/roofing-systems">Compare the roof systems we install</Link>.</>],
    ["Are you an Owens Corning Preferred contractor?", "Yes. Duration® COOL is specified as a complete system — starter, field, ridge, ventilation — not a shingle-only bid."],
    ["Do you pull permits?", "Reroofs in Los Angeles require a permit. Citium includes permit and inspection steps in the project plan.", <>In Glendale, see <Link href="/roof-replacement-glendale-ca">what a Glendale re-roof involves</Link>.</>],
    ["What areas do you serve?", "Based in Glendale. We work Glendale, Burbank, Pasadena, La Crescenta, Tujunga, Sunland and Alhambra.", <>See <Link href="/service-areas">our service-area pages</Link>.</>],
    ["How do I get an estimate?", "Start with your address on this site or call 818-531-1277. A visit confirms measurements, condition, and a written scope."],
  ];
  return (
    <>
      <Intro tag="QUESTIONS" title={"Straight answers.\nBefore you sign."} copy="The questions Glendale and Los Angeles homeowners actually ask. Call if yours is not here." h1={seoPage("/faq")?.h1} />
      <section className="faq-section">
        <div>
          {items.map(([q, a, more]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>
                {a}
                {more && <> {more}</>}
              </p>
            </details>
          ))}
        </div>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            // Schema skips answers with claims the live site doesn't make
            // (SCHEMA_EXCLUDE); the visible FAQ is unchanged.
            mainEntity: items
              .filter(([q, a]) => !SCHEMA_EXCLUDE.test(q + " " + a))
              .map(([q, a]) => ({
              "@type": "Question",
              name: q,
              acceptedAnswer: { "@type": "Answer", text: a },
            })),
          }).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}

export function Terms() {
  return (
    <>
      <Intro tag="TERMS OF USE" title={"Using this site."} copy="These terms cover the Citium Roofing Solutions website." h1={seoPage("/terms")?.h1} />
      <div className="prose">
        <h2>Estimates</h2>
        <p>Information on this site is educational. A price is not final until Citium inspects the roof and you receive a written scope. Cost ranges in articles are 2026 market bands, not quotes.</p>
        <h2>Content</h2>
        <p>You may share pages with attribution. Do not scrape, republish, or present Citium content as your own.</p>
        <h2>Liability</h2>
        <p>Workmanship and product warranties are stated in the contract for a specific job. This website does not create a contract.</p>
        <p>Questions: <a href="mailto:citiuminc@gmail.com">citiuminc@gmail.com</a> or 818-531-1277.</p>
      </div>
    </>
  );
}

export function Privacy() {
  return (
    <>
      <Intro
        tag="YOUR INFORMATION"
        title={"A simple request.\nHandled with care."}
        copy="This page explains the inquiry flow on this website."
        h1={seoPage("/privacy")?.h1}
      />
      <div className="prose">
        <h2>What you provide</h2>
        <p>
          The inquiry forms request your name, property address, email, and phone number. You may also provide
          project information. Do not submit financial account details, identification numbers, or sensitive
          documents.
        </p>
        <h2>Where it goes</h2>
        <p>
          Contact, estimate, financing, customer-service, and roof-measurement forms email
          citiuminc@gmail.com in the background as soon as you submit. Citium uses that message to follow
          up about your roof. Do not include financial account numbers or sensitive documents.
        </p>
        <h2>In this website</h2>
        <p>
          The form does not save your inquiry in browser storage. Your entries remain in the page while it is
          open. The project map loads OpenStreetMap when you open the map view; that provider receives standard
          connection information.
        </p>
        <h2>Site analytics</h2>
        <p>
          This website may use Google Analytics to count visits and interactions such as calls, email links, and form
          submissions. Google Analytics uses cookies and receives standard connection information; it does not
          receive the contents of your inquiry. You can opt out with your browser settings or the Google Analytics
          opt-out browser add-on.
        </p>
        <h2>Questions or corrections</h2>
        <p>
          Contact Citium at <a href="mailto:citiuminc@gmail.com">citiuminc@gmail.com</a> or{" "}
          <a href="tel:+18185311277">818-531-1277</a> about information you have submitted.
        </p>
      </div>
    </>
  );
}
