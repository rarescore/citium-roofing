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
import {emailHandoff,validateLead,isLeadService,LEAD_SERVICES,type Lead,type LeadKind} from '@/lib/integrations';
import {trackLead} from '@/lib/analytics';
export function Choice({label,value,options,onChange}:{label:string;value:string;options:string[];onChange:(v:string)=>void}){return <div className="choice"><span id={'label-'+label.replaceAll(' ','-')}>{label}</span><Select value={value} onValueChange={v=>v&&onChange(v)}><SelectTrigger aria-labelledby={'label-'+label.replaceAll(' ','-')}><SelectValue/></SelectTrigger><SelectContent>{options.map(o=><SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>}
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
    const fd=new FormData(e.currentTarget);
    let data:Lead;
    try{
      data=validateLead({
        kind,
        name:fd.get('name'),
        email:fd.get('email'),
        phone:fd.get('phone'),
        address,
        message:fd.get('message')||'',
        website:String(fd.get('citium_hp')||fd.get('website')||''),
        consent,
        design,
        service: service||undefined,
        elapsedMs: Date.now()-started.current,
      });
    }catch(err){setError((err as Error).message);setStatus('error');return;}
    setLead(data);setError('');setStatus('sending');
    try{
      const response=await fetch('/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      const result=await response.json() as {status?:string;message?:string;error?:string};
      if(response.ok&&result.status==='sent'){setStatus('sent');trackLead(kind,data.service);return;}
      setError(result.error||result.message||'We could not send that just now. Please call 818-531-1277.');
      setStatus('error');
    }catch{
      setError('We could not send that just now. Please call 818-531-1277.');
      setStatus('error');
    }
  }
  if(status==='sent')return <div className="inquiry-result" aria-live="polite"><Check size={32}/><h2>Thank you. Your message has been sent.</h2><p>One of our team members will reach out to you shortly.</p><Link href="/" className="text-link">Return home <ArrowUpRight size={18}/></Link></div>;
  if(status==='handoff'&&lead)return <div className="inquiry-result" aria-live="polite"><Check size={32}/><h2>Thank you. Your message has been sent.</h2><p>One of our team members will reach out to you shortly.</p><Link href="/" className="text-link">Return home <ArrowUpRight size={18}/></Link></div>;
  return <form className="inquiry-form" onSubmit={submit} noValidate={false}><span className="eyebrow">{kind==='financing'?'FINANCING INQUIRY':'LET’S START WITH YOUR HOME'}</span>{kind==='estimate'&&<div className="assessment-note"><MapPin size={20}/><p>Start your estimate request instantly. Citium will assess your roof to confirm measurements, condition, and pricing.</p></div>}<div className="form-grid"><label>Full name<input name="name" autoComplete="name" required maxLength={200} placeholder="Your name" defaultValue={lead?.name}/></label><label>Phone<input name="phone" type="tel" autoComplete="tel" required minLength={10} maxLength={30} placeholder="(818) 555-0123" defaultValue={lead?.phone}/></label><label className="wide">Email<input name="email" type="email" autoComplete="email" required maxLength={200} placeholder="you@example.com" defaultValue={lead?.email}/></label><label className="wide">Property address<input name="address" autoComplete="street-address" required maxLength={300} value={address} onChange={e=>setAddress(e.target.value)} placeholder="Street address, city, ZIP"/></label>{kind!=='financing'&&<label className="wide">What do you need? <span>(optional)</span><select name="service" value={service} onChange={e=>setService(e.target.value)}><option value="">Not sure yet</option>{LEAD_SERVICES.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>}{kind!=='financing'&&<label className="wide">How can we help? <span>(optional)</span><textarea name="message" rows={3} maxLength={3000} placeholder="Tell us about your roof or project." defaultValue={lead?.message}/></label>}<label className="honeypot" aria-hidden="true">Company<input name="citium_hp" tabIndex={-1} autoComplete="off" defaultValue=""/></label></div>{design&&<p className="selected-design">Your roof selection: {design}</p>}<label className="consent" htmlFor={"contact-consent-"+kind}><Checkbox id={"contact-consent-"+kind} checked={consent} onCheckedChange={(v)=>setConsent(v===true)} required aria-label="Allow Citium to contact me about this request"/><span>I agree that Citium may contact me about this request. <Link href="/privacy">How we use your information</Link>.</span></label>{kind==='financing'&&<p className="fineprint">This is an inquiry, not a credit application. Do not include financial account numbers or sensitive documents.</p>}{error&&<p className="form-error" role="alert">{error}{lead&&<> <a href={emailHandoff(lead)}>Email citiuminc@gmail.com directly.</a></>}</p>}<button className="button" type="submit" disabled={status==='sending'}>{status==='sending'?'Sending…':kind==='financing'?'Request financing information':'Send my request'} <ArrowUpRight size={18}/></button><p className="fineprint">A team member will reply shortly. Call 818-531-1277 if you prefer to talk now.</p></form>
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
export function ArticleIndex(){const[category,setCategory]=useState('All resources');const[query,setQuery]=useState('');const results=articles.filter(a=>(category==='All resources'||a.category===category)&&(`${a.title} ${a.description}`.toLowerCase().includes(query.toLowerCase())));return <section className="resource-index"><div className="resource-toolbar"><div className="resource-search"><Search size={18}/><input aria-label="Search roofing resources" placeholder="Search resources" value={query} onChange={e=>setQuery(e.target.value)}/></div><Choice label="Category" value={category} options={articleCategories} onChange={setCategory}/></div>{results.length?<div className="article-grid">{results.map(a=><Link href={'/articles/'+a.slug} key={a.slug}>{a.image&&<img src={a.image.src} alt={a.image.alt} width="700" height="450" loading="lazy" decoding="async"/>}<span>{a.category}</span><h2>{a.title}</h2><p>{a.description}</p><p>{a.author.name} · {new Date(a.publishedAt).toLocaleDateString('en-US',{timeZone:'UTC'})}</p></Link>)}</div>:<div className="resource-empty"><span className="eyebrow">THE CITIUM RESOURCE LIBRARY</span><h2>{query||category!=='All resources'?'No matching resources yet.':'Good information starts\nwith the right questions.'}</h2><p>Our homeowner articles are being prepared. In the meantime, explore roofing systems or ask Citium about your home.</p>{(query||category!=='All resources')&&<button className="plain-button" onClick={()=>{setQuery('');setCategory('All resources')}}>Clear filters <RotateCcw size={15}/></button>}<div><Link className="button" href="/roofing-systems">Explore roofing systems <ArrowUpRight size={17}/></Link><Link className="text-link" href="/contact">Ask a roofing question <ArrowUpRight size={17}/></Link></div></div>}</section>}
