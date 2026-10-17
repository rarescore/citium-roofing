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
          project information. The homepage visit form asks for your name, phone, property address, and the day and
          time you want the visit. An email address is requested only if you check the box to receive email
          promotions. Do not submit financial account details, identification numbers, or sensitive documents.
        </p>
        <h2>Where it goes</h2>
        <p>
          Contact, estimate, financing, customer-service, roof-measurement, and visit-booking forms email
          citiuminc@gmail.com in the background as soon as you submit. Citium uses that message to follow
          up about your roof. The inquiry itself is not stored in a cookie.
        </p>
        <h2>In this website</h2>
        <p>
          The form does not save your inquiry in browser storage. Your entries remain in the page while it is
          open. The project map loads OpenStreetMap when you open the map view; that provider receives standard
          connection information. Address suggestions send the text you type to the site so it can offer matching
          addresses. That request is part of the form, not advertising.
        </p>
        <h2>Cookies</h2>
        <p>
          An essential first-party cookie, citium_consent, remembers whether you allowed analytics or marketing
          cookies, and which version of this notice you saw. It lasts about six months. The site also keeps the
          same choice in this browser's local storage. You can change it any time from Cookie settings in the
          footer. Rejecting optional cookies does not block booking, calling, browsing, or sending a form.
        </p>
        <p>
          If your browser sends Global Privacy Control, marketing stays off unless you later turn it on yourself.
          See the <a href="/cookie-policy">cookie policy</a> for the categories.
        </p>
        <h2>Site analytics</h2>
        <p>
          Analytics stays off until you allow it. Google Analytics 4, Google Tag Manager, and Microsoft Clarity
          each load only when that product's ID is configured and you have allowed analytics. If an ID is not set,
          allowing analytics does not contact that product. When a product is both configured and allowed, it may
          receive the page path, the campaign parameters in the link you clicked, the kind of device, and events
          such as a phone click or the fact that a form was submitted. It does not receive your name, phone number,
          email address, or the address you typed. Google Analytics is asked to anonymize IP addresses. Clarity
          session recordings mask every form field. No analytics script is added before consent. After analytics
          cookies are allowed, the server may count an estimated city, region, and country from the connection
          toward service-area totals. That estimate is not a street address, and the raw IP address is not stored.
          The ZIP you type on the estimate form is the property ZIP you choose to give us. Photos you attach stay
          with the office lead record. They are not sent to an advertising or analytics service.
        </p>
        <h2>Advertising</h2>
        <p>
          Marketing stays off until you allow it. A Meta pixel and Google Ads conversion tag load only when their
          IDs are configured and you have allowed marketing. If those IDs are not set, allowing marketing does not
          contact an ad network. When they are set, a successful booking or estimate can be counted as one
          conversion. The conversion does not include your name, phone, email, or property address. If Google Tag
          Manager is configured, it is the only loader for Google and Meta tags, so the same conversion is not
          sent twice.
        </p>
        <h2>Questions or corrections</h2>
        <p>
          Contact Citium at <a href="mailto:citiuminc@gmail.com">citiuminc@gmail.com</a> or{" "}
          <a href="tel:+18185311277">818-531-1277</a> about information you have submitted. This page describes how
          the site behaves. It is not a legal opinion that every privacy law has been satisfied.
        </p>
      </div>
    </>
  );
}

export function CookiePolicy() {
  return (
    <>
      <Intro
        tag="COOKIES"
        title={"Your choice.\nNothing extra until then."}
        copy="This page lists the cookies this site uses and the ones it does not."
        h1={seoPage("/cookie-policy")?.h1}
      />
      <div className="prose">
        <h2>Essential</h2>
        <p>
          citium_consent is a first-party cookie. It stores your analytics and marketing choice, the date of that
          choice, and the version of this policy. The same record is kept in local storage under citium.consent.
          It is kept for about six months. The site needs it to remember that you rejected or accepted optional
          cookies. Booking, phone calls, and forms do not depend on analytics or marketing cookies.
        </p>
        <p>
          If you sign in to a site tool, the site may also set a session cookie so the sign-in stays in place.
          The public estimate and visit forms do not require an account.
        </p>
        <h2>Analytics</h2>
        <p>
          Off until you allow it. Google Analytics 4, Google Tag Manager, and Microsoft Clarity load only when
          that product's ID is configured. If no ID is set, the choice does not start the product. A configured
          tag may store its own cookies and receive the page path, campaign parameters, device category, and
          events for calls and forms. Names, phone numbers, email addresses, and property addresses are not
          included. Form fields are masked in Clarity recordings.
        </p>
        <h2>Marketing</h2>
        <p>
          Off until you allow it. Meta and Google Ads load only when their IDs are configured. Allowing marketing
          without those IDs does not contact an advertising network. A successful lead can count as one conversion,
          without the personal details from the form.
        </p>
        <h2>Global Privacy Control</h2>
        <p>
          If the browser sends Global Privacy Control, marketing remains off unless you explicitly turn marketing
          on after that signal. You can review the choice from Cookie settings in the footer.
        </p>
        <h2>Change your mind</h2>
        <p>
          Use Cookie settings in the footer, or choose again the next time the banner appears after a policy
          update. You can also clear this site's cookies in the browser. Questions:{" "}
          <a href="mailto:citiuminc@gmail.com">citiuminc@gmail.com</a> or <a href="tel:+18185311277">818-531-1277</a>.
        </p>
      </div>
    </>
  );
}
