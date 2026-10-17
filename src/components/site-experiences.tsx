/* Query parameters are read after hydration so server and initial client markup agree. */
/* oxlint-disable react/react-compiler */
import {useEffect,useRef,useState} from 'react';
import {Link} from '@/lib/citium-link';
import {ArrowUpRight,Check,Mail,Phone,MapPin,Search,RotateCcw} from 'lucide-react';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from '@/components/ui/select';
import {Slider} from '@/components/ui/slider';
import {Checkbox} from '@/components/ui/checkbox';
import {Tabs,TabsList,TabsTrigger,TabsContent} from '@/components/ui/tabs';
import {articleCategories,articles} from '@/lib/content';
import {projects as neighborhoodProjects} from '@/lib/projects';
import {emailHandoff,emailLeadDirect,validateLead,isLeadService,LEAD_SERVICES,type Lead,type LeadKind} from '@/lib/integrations';
import {ClothesLine} from '@/components/clothes-line';
import {trackLead, leadAttribution} from '@/lib/analytics';
export function Choice({label,value,options,onChange}:{label:string;value:string;options:string[];onChange:(v:string)=>void}){return <div className="choice"><span id={'label-'+label.replaceAll(' ','-')}>{label}</span><Select value={value} onValueChange={v=>v&&onChange(v)}><SelectTrigger aria-labelledby={'label-'+label.replaceAll(' ','-')}><SelectValue/></SelectTrigger><SelectContent>{options.map(o=><SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>}
function trapValue(form: HTMLFormElement) {
  const input = form.elements.namedItem("citium_hp");
  if (!(input instanceof HTMLInputElement) || input.readOnly) return "";
  return input.value.trim();
}
function markMissing(form: HTMLFormElement, consentOk: boolean): string | null {
  form.querySelectorAll(".field-missing").forEach((el) => el.classList.remove("field-missing"));
  const labels: string[] = [];
  const text = (name: string) => {
    const field = form.elements.namedItem(name);
    return field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement ? field.value.trim() : "";
  };
  const mark = (name: string, label: string, bad: boolean) => {
    const field = form.elements.namedItem(name);
    if (!(field instanceof HTMLElement)) return;
    if (!bad) {
      field.removeAttribute("aria-invalid");
      return;
    }
    field.setAttribute("aria-invalid", "true");
    field.closest("label")?.classList.add("field-missing");
    labels.push(label);
  };
  mark("name", "your name", text("name").length < 2);
  mark("phone", "a phone number", text("phone").replace(/\D/g, "").length < 10);
  mark("email", "a valid email", !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text("email")));
  mark("address", "the property address", text("address").length < 2);
  const zip = text("zip");
  if (form.elements.namedItem("zip")) mark("zip", "a 5-digit ZIP, or leave it blank", zip.length > 0 && !/^\d{5}(?:-\d{4})?$/.test(zip));
  const consentLabel = form.querySelector("label.consent");
  if (!consentOk && consentLabel) {
    consentLabel.classList.add("field-missing");
    labels.push("the agreement to be contacted");
  }
  if (!labels.length) return null;
  form.querySelector(".field-missing")?.scrollIntoView({ block: "center", behavior: "smooth" });
  if (labels.length === 1) return `Please fill in ${labels[0]}.`;
  return `Please fill in ${labels.slice(0, -1).join(", ")} and ${labels.at(-1)}.`;
}
export function Inquiry({kind='estimate',presetAddress,presetDesign,presetService}:{kind?:LeadKind;presetAddress?:string;presetDesign?:string;presetService?:string}){
  const[address,setAddress]=useState(presetAddress||'');
  const[service,setService]=useState(isLeadService(presetService)?presetService:'');
  const[design,setDesign]=useState(presetDesign||'');
  const[consent,setConsent]=useState(false);
  const[status,setStatus]=useState<'idle'|'sending'|'sent'|'handoff'|'error'>('idle');
  const[error,setError]=useState('');
  const[lead,setLead]=useState<Lead|null>(null);
  const started=useRef(Date.now());
  useEffect(()=>{const q=new URLSearchParams(window.location.search);setAddress(presetAddress||q.get('address')||'');setDesign(presetDesign||q.get('design')||'');const sv=presetService||q.get('service');if(isLeadService(sv))setService(sv);started.current=Date.now();},[presetAddress,presetDesign,presetService]);
  async function submit(e:React.SyntheticEvent<HTMLFormElement>){
    e.preventDefault();
    const missing = markMissing(e.currentTarget, consent);
    if (missing) { setError(missing); setStatus('error'); return; }
    const fd=new FormData(e.currentTarget);
    let data:Lead;
    try{
      data=validateLead({
        kind,
        name:fd.get('name'),
        email:fd.get('email'),
        phone:fd.get('phone'),
        address,
        zip:String(fd.get('zip')||''),
        message:fd.get('message')||'',
        website:trapValue(e.currentTarget),
        consent,
        design,
        service: service||undefined,
        elapsedMs: Date.now()-started.current,
        urgency: fd.get('urgency')||undefined,
        contactMethod: fd.get('contactMethod')||undefined,
        ...leadAttribution(),
      });
    }catch(err){setError((err as Error).message);setStatus('error');return;}
    setLead(data);setError('');setStatus('sending');
    try{
      let response: Response;
      if(kind==='estimate'){
        const body=new FormData();
        body.set('kind', data.kind);
        body.set('name', data.name);
        body.set('email', data.email);
        body.set('phone', data.phone);
        body.set('address', data.address);
        body.set('zip', data.zip||'');
        body.set('message', data.message||'');
        body.set('design', data.design||'');
        body.set('service', data.service||'');
        body.set('citium_hp', trapValue(e.currentTarget));
        body.set('consent', '1');
        body.set('elapsedMs', String(data.elapsedMs||0));
        body.set('urgency', data.urgency||'standard');
        body.set('contactMethod', data.contactMethod||'phone');
        body.set('landingPage', data.landingPage||'');
        body.set('trafficSource', data.trafficSource||'');
        body.set('campaign', data.campaign||'');
        body.set('utmMedium', data.utmMedium||'');
        for(const file of fd.getAll('photos')){
          if(file instanceof File && file.size>0) body.append('photos', file);
        }
        response=await fetch('/api/leads',{method:'POST',body});
      }else{
        response=await fetch('/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      }
      const result=await response.json() as {status?:string;message?:string;error?:string};
      if(response.ok&&result.status==='sent'){setStatus('sent');trackLead(kind,data.service);return;}
      if(response.status!==400){
        const direct=await emailLeadDirect(data);
        if(direct.ok){setStatus('sent');trackLead(kind,data.service);return;}
      }
      setError(result.error||result.message||'We could not send that just now. Please call 818-531-1277.');
      setStatus('error');
    }catch{
      setError('We could not send that just now. Please call 818-531-1277.');
      setStatus('error');
    }
  }
  if(status==='sent')return <div className="inquiry-result" aria-live="polite"><Check size={32}/><h2>Thank you. Your message has been sent.</h2><p>One of our team members will reach out to you shortly.</p>{lead?.urgency==='emergency'&&<p>If water is coming in now, call 818-531-1277.</p>}<Link href="/" className="text-link">Return home <ArrowUpRight size={18}/></Link></div>;
  if(status==='handoff'&&lead)return <div className="inquiry-result" aria-live="polite"><Check size={32}/><h2>Thank you. Your message has been sent.</h2><p>One of our team members will reach out to you shortly.</p><Link href="/" className="text-link">Return home <ArrowUpRight size={18}/></Link></div>;
  return <form className="inquiry-form" onSubmit={submit} noValidate onInput={(ev)=>{const t=ev.target;if(t instanceof HTMLElement){t.closest('label')?.classList.remove('field-missing');if(t instanceof HTMLInputElement||t instanceof HTMLTextAreaElement||t instanceof HTMLSelectElement)t.removeAttribute('aria-invalid');}}}><span className="eyebrow">{kind==='financing'?'FINANCING INQUIRY':'LET’S START WITH YOUR HOME'}</span>{kind==='estimate'&&<div className="assessment-note"><MapPin size={20}/><p>Start your estimate request instantly. Citium will assess your roof to confirm measurements, condition, and pricing.</p></div>}<div className="form-grid"><label>Full name<input name="name" autoComplete="name" required maxLength={200} placeholder="Your name" defaultValue={lead?.name}/></label><label>Phone<input name="phone" type="tel" autoComplete="tel" required minLength={10} maxLength={30} placeholder="(818) 555-0123" defaultValue={lead?.phone}/></label><label className="wide">Email<input name="email" type="email" autoComplete="email" required maxLength={200} placeholder="you@example.com" defaultValue={lead?.email}/></label><label className="wide">Property address<input name="address" autoComplete="street-address" required maxLength={300} value={address} onChange={e=>setAddress(e.target.value)} placeholder="Street address, city, ZIP"/></label>{kind==='estimate'&&<label>ZIP code <span>(you can correct this)</span><input name="zip" inputMode="numeric" autoComplete="postal-code" maxLength={10} placeholder="91203" defaultValue={lead?.zip||''}/></label>}{kind==='estimate'&&<label>Request<select name="urgency" defaultValue="standard"><option value="standard">Standard request</option><option value="emergency">Emergency leak</option></select></label>}{kind==='estimate'&&<label>Preferred contact<select name="contactMethod" defaultValue="phone"><option value="phone">Phone</option><option value="email">Email</option><option value="text">Text</option></select></label>}{kind!=='financing'&&<label className="wide">{kind==='estimate'?'Requested service':'What do you need?'} <span>(optional)</span><select name="service" value={service} onChange={e=>setService(e.target.value)}><option value="">Not sure yet</option>{LEAD_SERVICES.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>}{kind!=='financing'&&<label className="wide">How can we help? <span>(optional)</span><textarea name="message" rows={3} maxLength={3000} placeholder="Tell us about your roof or project." defaultValue={lead?.message}/></label>}{kind==='estimate'&&<label className="wide">Photos of the damage <span>(optional, up to 3)</span><input name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple/></label>}<label className="honeypot" aria-hidden="true"><input name="citium_hp" tabIndex={-1} autoComplete="off" readOnly defaultValue="" data-1p-ignore="true" data-lpignore="true"/></label></div>{design&&<p className="selected-design">Your roof selection: {design}</p>}<label className="consent" htmlFor={"contact-consent-"+kind}><Checkbox id={"contact-consent-"+kind} checked={consent} onCheckedChange={(v)=>{setConsent(v===true);if(v===true)document.getElementById('contact-consent-'+kind)?.closest('label')?.classList.remove('field-missing');}} required aria-label="Allow Citium to contact me about this request"/><span>I agree that Citium may contact me about this request. <Link href="/privacy">How we use your information</Link>.</span></label>{kind==='financing'&&<p className="fineprint">This is an inquiry, not a credit application. Do not include financial account numbers or sensitive documents.</p>}{error&&<p className="form-error" role="alert">{error}{lead&&<> <a href={emailHandoff(lead)}>Email citiuminc@gmail.com directly.</a></>}</p>}<button className="button" type="submit" disabled={status==='sending'}>{status==='sending'?'Sending…':kind==='financing'?'Request financing information':'Send my request'} <ArrowUpRight size={18}/></button><p className="fineprint">A team member will reply shortly. Call 818-531-1277 if you prefer to talk now.</p></form>
}
const familyLabel: Record<string, string> = {
  shingles: "Shingles",
  tile: "Tile",
  tpo: "TPO",
  torch: "Torch-down",
};

export function Projects() {
  const [selected, setSelected] = useState(0);
  const [amount, setAmount] = useState(52);
  const [family, setFamily] = useState("All systems");
  const [dragging, setDragging] = useState(false);
  const compareRef = useRef<HTMLDivElement>(null);
  const systems = ["All systems", "Shingles", "Tile", "TPO", "Torch-down"];
  const visible = neighborhoodProjects.filter((p) => family === "All systems" || familyLabel[p.family] === family);
  const project = visible[Math.min(selected, Math.max(visible.length - 1, 0))] ?? neighborhoodProjects[0];

  function setFromClientX(clientX: number) {
    const el = compareRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    setAmount(Math.min(100, Math.max(0, x)));
  }

  return (
    <>
      <section className="project-experience">
        <div className="project-sidebar">
          <div className="project-filters" role="tablist" aria-label="Roof system">
            {systems.map((s) => (
              <button
                key={s}
                className={family === s ? "selected" : ""}
                aria-pressed={family === s}
                onClick={() => {
                  setFamily(s);
                  setSelected(0);
                }}
              >
                {s}
              </button>
            ))}
          </div>
          {visible.map((p, i) => (
            <button
              key={p.id}
              className={"project-item " + (project.id === p.id ? "selected" : "")}
              onClick={() => setSelected(i)}
            >
              <span className="eyebrow">{p.city} · {familyLabel[p.family].toUpperCase()}</span>
              <strong>{p.title}</strong>
              <span>
                {p.system} · {p.finish} <ArrowUpRight size={16} />
              </span>
            </button>
          ))}
        </div>
        <div>
          <div
            className="comparison"
            ref={compareRef}
            onPointerDown={(e) => {
              setDragging(true);
              (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
              setFromClientX(e.clientX);
            }}
            onPointerMove={(e) => {
              if (dragging) setFromClientX(e.clientX);
            }}
            onPointerUp={() => setDragging(false)}
            onPointerCancel={() => setDragging(false)}
          >
            <img src={project.after} alt={`Illustrative visualization: ${project.title} style home with ${project.finish}`} width="1600" height="900" loading="lazy" decoding="async" />
            <img
              style={{ clipPath: `inset(0 ${100 - amount}% 0 0)` }}
              className="before"
              src={project.before}
              alt={`Illustrative weathered roof on a ${project.title.toLowerCase()} style home`}
              width="1600" height="900" loading="lazy" decoding="async" />
            <span className="before-label">BEFORE</span>
            <span className="after-label">VISUALIZED</span>
            <div className="compare-rule" style={{ left: amount + "%" }}>
              <span>↔</span>
            </div>
          </div>
          <p className="comparison-hint">Swipe or drag the photo to compare.</p>
          <div className="project-caption">
            <div>
              <span className="eyebrow">
                ILLUSTRATIVE · {project.city.toUpperCase()} AREA / {project.system.toUpperCase()}
              </span>
              <h2>{project.title}</h2>
              <p>{project.blurb}</p>
            </div>
            <Link className="text-link" href="/estimate">
              Talk about your roof <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function pSystem(p: { family: string; system: string }) {
  return p.system;
}
export function ArticleIndex(){const[category,setCategory]=useState('All resources');const[query,setQuery]=useState('');const results=articles.filter(a=>(category==='All resources'||a.category===category)&&(`${a.title} ${a.description}`.toLowerCase().includes(query.toLowerCase())));return <section className="resource-index"><div className="resource-toolbar"><div className="resource-search"><Search size={18}/><input aria-label="Search roofing resources" placeholder="Search resources" value={query} onChange={e=>setQuery(e.target.value)}/></div><Choice label="Category" value={category} options={articleCategories} onChange={setCategory}/></div>{results.length?<ClothesLine items={results.map(a=>({href:'/articles/'+a.slug,title:a.title,src:a.image?.src,alt:a.image?.alt}))}/>:<div className="resource-empty"><span className="eyebrow">THE CITIUM RESOURCE LIBRARY</span><h2>{query||category!=='All resources'?'No matching resources yet.':'Good information starts\nwith the right questions.'}</h2><p>Our homeowner articles are being prepared. In the meantime, explore roofing systems or ask Citium about your home.</p>{(query||category!=='All resources')&&<button className="plain-button" onClick={()=>{setQuery('');setCategory('All resources')}}>Clear filters <RotateCcw size={15}/></button>}<div><Link className="button" href="/roofing-systems">Explore roofing systems <ArrowUpRight size={17}/></Link><Link className="text-link" href="/contact">Ask a roofing question <ArrowUpRight size={17}/></Link></div></div>}</section>}
