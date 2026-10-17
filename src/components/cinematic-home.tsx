/* Roof state synchronizes with external GSAP timelines and asynchronous image loading. */
/* oxlint-disable react/react-compiler */
import {useEffect,useRef,useState,lazy,Suspense} from 'react';
import {Link} from '@/lib/citium-link';
import {ArrowDown,ArrowUpRight,Move,MapPin,Plus,Minus,Pause,Play} from 'lucide-react';
import {Slider} from '@/components/ui/slider';
import {Tabs,TabsList,TabsTrigger,TabsContent} from '@/components/ui/tabs';
import {articles} from '@/lib/content';
import {ClothesLine} from './clothes-line';
import {layers} from '@/lib/roof-layers';
import {MeasureHero} from './measure-roof';
import {JobHero} from './job-hero';
import {VisitBooking} from './visit-booking';
import type {gsap as GsapNS} from 'gsap';
type GsapMatchMedia=ReturnType<typeof GsapNS.matchMedia>;
const PhysicalRoof=lazy(()=>import('./physical-roof'));
async function loadGsap(){const[{gsap},{ScrollTrigger}]=await Promise.all([import('gsap'),import('gsap/ScrollTrigger')]);gsap.registerPlugin(ScrollTrigger);return gsap;}
const RoofStudio=lazy(()=>import('./roof-studio'));
const states=['Surface','Accessories','Underlayment','Flashing','Decking','Structure'];
export function RoofJourney(){const root=useRef<HTMLDivElement>(null);const[active,setActive]=useState(0);const[separation,setSeparation]=useState(0);const[detail,setDetail]=useState(false);const[load3d,setLoad3d]=useState(false);const[progress,setProgress]=useState(0);const[reduced,setReduced]=useState(false);const[paused,setPaused]=useState(false);useEffect(()=>{const el=root.current;if(!el)return;const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){setLoad3d(true);observer.disconnect()}},{rootMargin:'200px'});observer.observe(el);let media: GsapMatchMedia|undefined;let cancelled=false;(async()=>{const gsap=await loadGsap();if(cancelled||!el)return;media=gsap.matchMedia();media.add('(prefers-reduced-motion: no-preference)',()=>{setReduced(false);const timeline=gsap.timeline({scrollTrigger:{trigger:el,start:'top top',end:'bottom bottom',scrub:.7,onUpdate:self=>{const p=self.progress;setProgress(p);setSeparation(Math.round(gsap.utils.clamp(0,1,(p-.4)/.35)*100)/100);}}});timeline.to('.hero-editorial',{y:-90,opacity:0,duration:.17},.02).to('.hero-inquiry',{y:70,opacity:0,duration:.15},.03).to('.hero-frame',{visibility:'hidden',duration:.01},.46).fromTo('.anatomy-frame',{autoAlpha:0},{autoAlpha:1,duration:.16},.25).fromTo('.anatomy-title',{clipPath:'inset(100% 0 0 0)',y:35},{clipPath:'inset(0% 0 0 0)',y:0,duration:.2},.3).to('.journey-chapter-home',{opacity:0,duration:.08},.2).fromTo('.journey-chapter-roof',{opacity:0},{opacity:1,duration:.08},.25).to({}, {duration:.35},.65);return()=>timeline.kill()});media.add('(prefers-reduced-motion: reduce)',()=>{setReduced(true);setSeparation(.8);setLoad3d(true)})})();return()=>{cancelled=true;media?.revert();observer.disconnect()}},[]);const l=layers[active];return <div className="roof-journey" ref={root}><div className="anatomy-anchor" id="roof-anatomy"/><div className="journey-stage"><div className="shared-physical-stage">{load3d&&<Suspense fallback={<span className="physical-loading">Building the view…</span>}><PhysicalRoof separation={reduced?0:separation} active={active} onSelect={setActive} progress={reduced?0:progress} reduced={reduced} paused={paused}/></Suspense>}</div><div className="hero-frame"><div className="hero-toning"/>{!reduced&&<button className="hero-motion-toggle" aria-pressed={paused} onClick={()=>setPaused(!paused)}>{paused?<Play size={13}/>:<Pause size={13}/>} {paused?"Resume motion":"Pause motion"}</button>}<div className="hero-editorial"><span className="micro-label">DURATION® COOL · GLENDALE, CA</span><h1>Above<br/><span>all.</span></h1><p>Duration® COOL shingles, installed layer by layer.</p></div><MeasureHero /></div><div className="anatomy-frame">{reduced&&<div className="reduced-anatomy-model"><Suspense fallback={null}><PhysicalRoof separation={separation} active={active} onSelect={setActive} progress={1} reduced/></Suspense></div>}<div className="anatomy-title"><span className="micro-label">02 / HOW A DURATION® ROOF GOES ON</span><h2>Installed<br/><span>layer by layer.</span></h2></div><span className="orbit-hint"><Move size={15}/> Drag to turn. Select a layer.</span><div className="assembly-interaction"><div className="assembly-slider"><span id="physical-separation" className="separation-label">{separation<.25?'ASSEMBLED':'SEPARATED'} <span>{Math.round(separation*100)}%</span></span><Slider value={[separation*100]} min={0} max={100} aria-labelledby="physical-separation" onValueChange={v=>{setSeparation((Array.isArray(v)?v[0]:v)/100);}}/></div><div className="assembly-layer-copy"><span className="micro-label">0{active+1} / {l.material}</span><h3>{l.what}</h3><p>{l.why}</p><button className="detail-trigger" aria-expanded={detail} onClick={()=>setDetail(!detail)}>Why the installation matters {detail?<Minus size={15}/>:<Plus size={15}/>}</button>{detail&&<p className="detail-failure">{l.failure}</p>}</div></div><div className="physical-layer-nav" aria-label="Inspect roof layers">{states.map((name,i)=><button key={name} className={active===i?'selected':''} aria-pressed={active===i} onClick={()=>{setActive(i);if(separation<.4)setSeparation(.75)}}><span>0{i+1}</span>{name}<span className="layer-dot"/></button>)}</div><p className="physical-disclaimer">Illustrative assembly. Your specified system determines the details.</p></div><div className="journey-footnote"><span className="journey-chapter-home">01 / A PLACE TO CALL HOME</span><span className="journey-chapter-roof">BUILT LAYER BY LAYER</span><a href={separation>.5?"#design-your-roof":"#roof-anatomy"}>{separation>.5?"DESIGN YOUR ROOF":"SCROLL TO LOOK CLOSER"} <ArrowDown size={16}/></a></div></div></div>}
const families={Shingles:{product:'TruDefinition® Duration®',colors:['Onyx Black','Estate Gray','Brownwood']},Tile:{product:'Clay barrel tile',colors:['Terracotta']}};
const keyOf=(s:string)=>s.toLowerCase().replaceAll(' ','-');
function configImage(home:string,color:string){return '/images/config-'+(home==='Hillside ranch'?'ranch':'craftsman')+'-'+keyOf(color)+'.webp'}
export function CinematicConfigurator(){const[home,setHome]=useState('Hillside ranch');const[material,setMaterial]=useState<'Shingles'|'Tile'>('Shingles');const[color,setColor]=useState('Onyx Black');const[step,setStep]=useState('home');const[visible,setVisible]=useState(configImage(home,color));const[loading,setLoading]=useState(false);const[failed,setFailed]=useState(false);const[original,setOriginal]=useState(false);const family=families[material];const root=useRef<HTMLElement>(null);useEffect(()=>{let cancelled=false;setLoading(true);setFailed(false);const img=new Image();const src=configImage(home,original?'Onyx Black':color);img.onload=()=>{if(!cancelled){setVisible(src);setLoading(false)}};img.onerror=()=>{if(!cancelled){setFailed(true);setLoading(false)}};img.src=src;return()=>{cancelled=true}},[home,color,original]);useEffect(()=>{let media:GsapMatchMedia|undefined;let cancelled=false;(async()=>{const gsap=await loadGsap();if(cancelled)return;media=gsap.matchMedia();media.add('(prefers-reduced-motion: no-preference)',()=>{gsap.fromTo('.config-photograph',{scale:1.12},{scale:1,ease:'none',scrollTrigger:{trigger:root.current,start:'top bottom',end:'top top',scrub:true}})})})();return()=>{cancelled=true;media?.revert()}},[]);
useEffect(()=>{const ctx=(document as Document&{modelContext?:{registerTool:(t:unknown,o:unknown)=>unknown}}).modelContext;if(!ctx)return;const control=new AbortController();void Promise.resolve(ctx.registerTool({name:'configure_roof_preview',description:'Configure the visible photographic roof study. Does not submit a lead.',inputSchema:{type:'object',properties:{home:{enum:['Hillside ranch','Coastal craftsman']},material:{enum:['Shingles','Tile']},color:{enum:['Onyx Black','Estate Gray','Brownwood','Terracotta']}},required:['home','material','color'],additionalProperties:false},annotations:{readOnlyHint:false},execute:(v:unknown)=>{const x=v as {home:string;material:'Shingles'|'Tile';color:string};if(!x||!['Hillside ranch','Coastal craftsman'].includes(x.home)||!families[x.material]||!(families[x.material].colors as string[]).includes(x.color))throw Error('Unsupported roof combination');setHome(x.home);setMaterial(x.material);setColor(x.color);setOriginal(false);return {status:'configured',...x}}},{signal:control.signal})).catch(()=>{});return()=>control.abort()},[]);
return <section className="cinematic-config" id="photographic-study" ref={root}><div className="config-photo-stage"><img className="config-photograph" src={visible} alt={`${home} architectural visualization with ${color} ${material.toLowerCase()}`} width="1600" height="900" loading="lazy"/><div className="config-topline"><span className="micro-label">03 / A ROOF THAT FEELS LIKE YOU</span><span className="micro-label">DESIGN YOUR ROOF</span></div><h2 className="config-statement">Now make<br/><span>it yours.</span></h2><div className="config-selection"><span>{home}</span><strong>{original?'Original roof':color}</strong><span>{family.product}</span></div><button className="config-compare" aria-pressed={original} onClick={()=>setOriginal(!original)}>{original?'Show your selection':'Compare with original'} <span>↔</span></button><output className="config-loading">{loading?'Developing your selection…':failed?'This study could not load. Please select another finish.':'PHOTOGRAPHIC DESIGN STUDY · APPROXIMATE PRODUCT APPEARANCE'}</output></div><div className="config-workbench"><Tabs value={step} onValueChange={v=>setStep(String(v))}><div className="config-steps"><TabsList variant="line"><TabsTrigger value="home">01 <span>Home</span></TabsTrigger><TabsTrigger value="roof">02 <span>Roofing</span></TabsTrigger><TabsTrigger value="product">03 <span>Product</span></TabsTrigger><TabsTrigger value="color">04 <span>Color</span></TabsTrigger></TabsList><Link className="config-estimate" href={'/estimate?design='+encodeURIComponent(`${home} / ${material} / ${family.product} / ${color}`)}>Make this roof yours <ArrowUpRight size={20}/></Link></div><TabsContent value="home"><div className="config-options">{['Hillside ranch','Coastal craftsman'].map((x,i)=><button key={x} aria-pressed={home===x} className={home===x?'selected':''} onClick={()=>{setHome(x);setOriginal(false)}}><span className="option-index">0{i+1}</span><span>{x}</span><ArrowUpRight size={24}/></button>)}<p>Start with an architectural style.<br/>Then explore the surface.</p></div></TabsContent><TabsContent value="roof"><div className="config-options material-options">{(['Shingles','Tile'] as const).map((x,i)=><button key={x} aria-pressed={material===x} className={material===x?'selected':''} onClick={()=>{setMaterial(x);setColor(families[x].colors[0]);setOriginal(false)}}><span className="option-index">0{i+1}</span><span>{x}</span><ArrowUpRight size={24}/></button>)}<p>{material==='Shingles'?'Layered granules. Architectural depth.':'Curved clay. A sun-warmed silhouette.'}<br/>Suitability confirmed with your roof assessment.</p></div></TabsContent><TabsContent value="product"><div className="config-product"><span className="micro-label">{material==='Shingles'?'OWENS CORNING':'ILLUSTRATIVE TILE PROFILE'}</span><h3>{family.product}</h3><p>{material==='Shingles'?'Dimensional shingles with SureNail® Technology. Confirm colors and availability for your address.':'A classic curved clay profile. Product selection and structural suitability are confirmed with Citium.'}</p><button onClick={()=>setStep('color')}>Explore the finishes <ArrowUpRight size={18}/></button></div></TabsContent><TabsContent value="color"><div className="config-colors">{family.colors.map(x=><button key={x} aria-pressed={color===x} className={color===x?'selected':''} onClick={()=>{setColor(x);setOriginal(false)}}><span className={'finish-dot '+keyOf(x)}/><span>{x}</span><span className="finish-check">{color===x?'SELECTED':'SELECT'}</span></button>)}<p>Light changes a roof.<br/>Always confirm with a physical sample.</p></div></TabsContent></Tabs></div></section>}
function DeferredStudio(){const ref=useRef<HTMLDivElement>(null);const[show,setShow]=useState(false);useEffect(()=>{const el=ref.current;if(!el)return;const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){setShow(true);io.disconnect()}},{rootMargin:'400px'});io.observe(el);return()=>io.disconnect()},[]);return <div ref={ref}>{show?<Suspense fallback={null}><RoofStudio/></Suspense>:<div className="roof-studio-placeholder" aria-hidden="true"/>}</div>}
export default function CinematicHome(){return <><JobHero/><VisitBooking/><DeferredStudio/><WhyCitium/><HomeServices/><section className="material-index"><div className="material-index-heading"><span className="micro-label">ROOFS ARE NOT ALL THE SAME</span><h2>Different materials.<br/>Same attention.</h2><Link href="/roofing-systems">Explore our systems <ArrowUpRight size={19}/></Link></div><div className="material-ribbons">{[['Shingles','A dimensional surface.','shingles'],['Tile','Shaped by light.','tile'],['TPO','Continuous. Precise.','tpo'],['Modified bitumen','Protection in layers.','modified-bitumen']].map(([n,d,s])=><Link key={s} className={'material-ribbon ribbon-'+s} href={'/'+s}><span>{n}</span><p>{d}</p><ArrowUpRight size={24}/></Link>)}</div></section><HomeArticles/><section className="cinematic-trust"><div className="preferred"><img src="/images/oc-preferred.png" alt="Owens Corning Preferred Contractor" width="240" height="74" loading="lazy" decoding="async"/></div><p>Rooted in Glendale.<br/>Here for Southern California.</p><a href="tel:+18185311277">Let’s talk about your roof. <ArrowUpRight size={20}/></a></section></>}

function HomeArticles(){
  return (
    <section className="home-articles" id="resources">
      <div className="home-articles-head">
        <span className="micro-label">FROM THE RESOURCE LIBRARY</span>
        <h2>What Los Angeles roofs<br/>actually need.</h2>
        <Link href="/articles">All guides <ArrowUpRight size={19}/></Link>
      </div>
      <ClothesLine items={articles.map((a)=>({href:"/articles/"+a.slug,title:a.title,src:a.image?.src,alt:a.image?.alt}))}/>
    </section>
  );
}

/** Crawlable services row (Day 5 L01-L07): plain links from the home body to the money pages. */
const HOME_SERVICES:[string,string,string][]=[
  ['/roof-repair-glendale-ca','Roof repair','Fixing a leak or storm damage'],
  ['/roof-replacement-glendale-ca','Roof replacement','Replacing a worn-out roof'],
  ['/residential-roofing-glendale-ca','Residential roofing','Choosing a roof for your home'],
  ['/roof-inspection-glendale-ca','Roof inspection','Not sure what the roof needs? Start with an inspection'],
  ['/commercial-roofing-glendale-ca','Commercial roofing','Low-slope TPO and torch-down roofs for commercial properties'],
  ['/roofing-contractor-glendale-ca','All services','Every roofing service we offer in Glendale'],
  ['/service-areas','Service areas','The seven cities we serve'],
  ['/contact','Contact','Contact Citium'],
];
function HomeServices(){
  return (
    <section className="home-services" id="home-services" aria-labelledby="home-services-title">
      <div className="home-services-head">
        <span className="micro-label">ROOFING SERVICES · GLENDALE &amp; NEARBY CITIES</span>
        <h2 id="home-services-title">Start with what<br/>your roof needs.</h2>
        <p>Based in Glendale. Roof repair, replacement and new roofs for homes and commercial properties in Glendale, Burbank, Pasadena, La Crescenta, Tujunga, Sunland and Alhambra.</p>
      </div>
      <ul className="home-services-list">
        {HOME_SERVICES.map(([href,label,line],i)=>(
          <li key={href}>
            <Link className="home-service-row" href={href}>
              <span className="hs-num">{String(i+1).padStart(2,'0')}</span>
              <span className="hs-label">{label}</span>
              <span className="hs-line">{line}</span>
              <ArrowUpRight className="hs-arrow" size={22} aria-hidden="true"/>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function WhyCitium(){
  return (
    <section className="why-citium" id="why-citium">
      <div className="why-citium-head">
        <span className="micro-label">WHY HOMEOWNERS CALL CITIUM</span>
        <h2>A roof is a system.<br/>We install all of it.</h2>
      </div>
      <div className="why-citium-grid">
        {[
          ['01','Owens Corning Preferred','Duration® COOL specified and installed as a complete steep-slope system — not a shingle-only bid.'],
          ['02','Tear-off to ridge cap','Decking, underlayment, ice-and-water, flashing, ventilation, and field shingles in one scope.'],
          ['03','Cool Roof, for this climate','Sierra Gray and the COOL line bounce sunlight. We confirm SRI and CRRC for your address.'],
          ['04','Local, warranty-backed','Glendale crew. Manufacturer coverage plus workmanship you can call.'],
        ].map(([n,t,p])=>(
          <article key={n}>
            <span>{n}</span>
            <h3>{t}</h3>
            <p>{p}</p>
          </article>
        ))}
      </div>
      <Link className="button" href="/estimate">Get a FREE estimate <ArrowUpRight size={18}/></Link>
    </section>
  );
}
