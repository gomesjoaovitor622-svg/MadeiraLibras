import { getOfficialSigns, getMeta, replaceOfficialSigns } from '../db/madeiraDB.js';

const OFFICIAL_SIGNS_URL='https://repository-dth.vlibras.gov.br/api/signs';
let memoryCache=null;

function buildCatalog(signs,{source='VLibras Dictionary Repository',fetchedAt=new Date().toISOString(),cached=false}={}){
  const clean=[...new Set((signs||[]).map(String).map(s=>s.trim()).filter(Boolean))];
  return {source,endpoint:OFFICIAL_SIGNS_URL,fetchedAt,count:clean.length,signs:clean,set:new Set(clean.map(s=>s.toUpperCase())),cached};
}

export async function loadOfficialSignList({timeout=9000,force=false}={}){
  if(memoryCache&&!force)return memoryCache;
  if(!force){
    try{
      const meta=await getMeta('officialCatalog');
      const age=meta?.fetchedAt?Date.now()-new Date(meta.fetchedAt).getTime():Infinity;
      if(age<24*60*60*1000){
        const cachedSigns=await getOfficialSigns();
        if(cachedSigns.length){memoryCache=buildCatalog(cachedSigns,{source:meta.source,fetchedAt:meta.fetchedAt,cached:true});return memoryCache;}
      }
    }catch{}
  }
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout);
  try{
    const response=await fetch(OFFICIAL_SIGNS_URL,{signal:controller.signal});
    if(!response.ok)throw new Error(`VLibras respondeu HTTP ${response.status}`);
    const data=await response.json();
    const signs=Array.isArray(data)?data:[];
    memoryCache=buildCatalog(signs);
    try{await replaceOfficialSigns(memoryCache.signs,{source:memoryCache.source,fetchedAt:memoryCache.fetchedAt});}catch(err){console.warn('Falha ao persistir catálogo oficial',err);}
    return memoryCache;
  }catch(error){
    try{
      const cachedSigns=await getOfficialSigns(),meta=await getMeta('officialCatalog');
      if(cachedSigns.length){memoryCache=buildCatalog(cachedSigns,{source:meta?.source||'VLibras Dictionary Repository',fetchedAt:meta?.fetchedAt,cached:true});return memoryCache;}
    }catch{}
    throw error;
  }finally{clearTimeout(timer);}
}

export function officialEndpoint(){return OFFICIAL_SIGNS_URL;}

export async function checkOfficialCoverage(glosses){
  try{
    const catalog=await loadOfficialSignList();
    const items=glosses.map(gloss=>{const base=String(gloss).replace(/-(PASSADO|FUTURO)$/,'').toUpperCase();return {gloss,official:catalog.set.has(String(gloss).toUpperCase())||catalog.set.has(base)};});
    return {available:true,count:catalog.count,cached:catalog.cached,items};
  }catch(error){return {available:false,count:0,cached:false,items:glosses.map(gloss=>({gloss,official:false})),error:error.message};}
}
