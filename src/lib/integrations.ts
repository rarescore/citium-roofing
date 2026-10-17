export type LeadKind='estimate'|'financing'|'service'|'contact';
/** Optional service picked on the lead form (prefilled from ?service=). Values are an allow-list. */
export const LEAD_SERVICES=[['repair','Roof repair'],['replacement','Roof replacement'],['installation','New roof installation'],['inspection','Roof inspection'],['tile-repair','Tile roof repair'],['flat-repair','Flat roof repair'],['residential','Residential roofing'],['commercial','Commercial roofing'],['other','Something else']] as const;
export type LeadService=typeof LEAD_SERVICES[number][0];
export function isLeadService(v:unknown):v is LeadService{return typeof v==='string'&&LEAD_SERVICES.some(([k])=>k===v);}
export function serviceLabel(v?:string){return LEAD_SERVICES.find(([k])=>k===v)?.[1]||'';}
export type Lead={kind:LeadKind;name:string;email:string;phone:string;address:string;message?:string;design?:string;service?:LeadService;consent:boolean;website?:string;elapsedMs?:number};
export type MeasurementResult={status:'needs-assessment';address:string;message:string}|{status:'measured';address:string;areaSqFt:number;source:string;measuredAt:string};
// Replace this adapter when legitimate measurement provider credentials are available.
// Never derive roof area or pricing from an address string.
export async function requestMeasurement(address:string):Promise<MeasurementResult>{return {status:'needs-assessment',address,message:'A roof assessment is needed to confirm measurements and pricing.'};}
export function validateLead(value:unknown):Lead{if(!value||typeof value!=='object')throw Error('Please complete your contact details.');const l=value as Lead;if(!['estimate','financing','service','contact'].includes(l.kind))throw Error('Invalid request type.');for(const k of ['name','email','phone','address'] as const){if(typeof l[k]!=='string'||l[k].trim().length<2||l[k].length>300)throw Error('Please complete all required contact details.');}if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(l.email))throw Error('Enter a valid email address.');if(l.phone.replace(/\D/g,'').length<10)throw Error('Enter a valid phone number.');if(!l.consent)throw Error('Please allow Citium to follow up about this request.');if((l.message?.length??0)>3000||(l.design?.length??0)>1000)throw Error('Your message is too long.');if(l.service!==undefined&&l.service!==null&&(l.service as string)!==''&&!isLeadService(l.service))throw Error('Choose a service from the list.');if(!isLeadService(l.service))delete l.service;if(typeof l.website==='string'&&l.website.trim())throw Error('Request could not be sent.');if(typeof l.elapsedMs!=='number'||!Number.isFinite(l.elapsedMs)||l.elapsedMs<1200)throw Error('Please take a moment and try again.');return l;}
export function emailHandoff(l:Lead){const body=`Name: ${l.name}\nPhone: ${l.phone}\nEmail: ${l.email}\nProperty: ${l.address}\nRequest: ${l.kind}\n${l.service?`Service: ${serviceLabel(l.service)}\n`:''}${l.design?`Roof design: ${l.design}\n`:''}\n${l.message||''}\n\nI agree to be contacted about this request.`;return `mailto:citiuminc@gmail.com?subject=${encodeURIComponent('Website '+l.kind+' inquiry')}&body=${encodeURIComponent(body)}`;}

/** Sends the inquiry from the visitor's browser so it is not blocked with the preview server. */
export async function emailLeadDirect(lead: Lead): Promise<{ ok: boolean; message: string }> {
  const payload = {
    _subject: `Citium website · ${lead.kind} · ${lead.name}`,
    _template: "table",
    _captcha: "false",
    _replyto: lead.email,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    address: lead.address,
    kind: lead.kind,
    service: serviceLabel(lead.service),
    design: lead.design || "",
    message: lead.message || "",
  };
  try {
    const res = await fetch("https://formsubmit.co/ajax/citiuminc@gmail.com", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    const raw = await res.text();
    let data: { success?: boolean | string; message?: string } = {};
    try {
      data = JSON.parse(raw) as { success?: boolean | string; message?: string };
    } catch {
      data = { message: raw.slice(0, 180) };
    }
    const ok = res.ok && (data.success === true || data.success === "true");
    return { ok, message: data.message || (res.ok ? "" : `Mail service returned ${res.status}`) };
  } catch {
    return { ok: false, message: "The mail service could not be reached from this page." };
  }
}
