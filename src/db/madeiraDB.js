const DB_NAME='madeiralibras-db';
const DB_VERSION=1;
const STORES={
  officialSigns:'officialSigns',
  gestureTemplates:'gestureTemplates',
  translations:'translations',
  meta:'meta'
};

function requestToPromise(req){return new Promise((resolve,reject)=>{req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}

export async function openMadeiraDB(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB_NAME,DB_VERSION);
    req.onupgradeneeded=()=>{
      const db=req.result;
      if(!db.objectStoreNames.contains(STORES.officialSigns)){
        const s=db.createObjectStore(STORES.officialSigns,{keyPath:'name'});
        s.createIndex('normalized','normalized',{unique:false});
      }
      if(!db.objectStoreNames.contains(STORES.gestureTemplates)){
        const s=db.createObjectStore(STORES.gestureTemplates,{keyPath:'id'});
        s.createIndex('label','label',{unique:false});
        s.createIndex('createdAt','createdAt',{unique:false});
      }
      if(!db.objectStoreNames.contains(STORES.translations)){
        const s=db.createObjectStore(STORES.translations,{keyPath:'id',autoIncrement:true});
        s.createIndex('createdAt','createdAt',{unique:false});
      }
      if(!db.objectStoreNames.contains(STORES.meta)) db.createObjectStore(STORES.meta,{keyPath:'key'});
    };
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}

async function withStore(name,mode,fn){
  const db=await openMadeiraDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(name,mode),store=tx.objectStore(name);
    let result;
    try{result=fn(store);}catch(err){reject(err);return;}
    tx.oncomplete=async()=>{try{resolve(result instanceof IDBRequest?await requestToPromise(result):result);}catch(err){reject(err);}finally{db.close();}};
    tx.onerror=()=>reject(tx.error);
  });
}

export async function replaceOfficialSigns(signs,{source,fetchedAt}={}){
  const db=await openMadeiraDB();
  await new Promise((resolve,reject)=>{
    const tx=db.transaction([STORES.officialSigns,STORES.meta],'readwrite');
    const store=tx.objectStore(STORES.officialSigns); store.clear();
    for(const raw of signs){const name=String(raw).trim();if(!name)continue;store.put({name,normalized:name.toUpperCase()});}
    tx.objectStore(STORES.meta).put({key:'officialCatalog',count:signs.length,source:source||'VLibras',fetchedAt:fetchedAt||new Date().toISOString()});
    tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);
  });
  db.close();
}

export async function getOfficialSigns(){
  const db=await openMadeiraDB();
  const tx=db.transaction(STORES.officialSigns,'readonly');
  const rows=await requestToPromise(tx.objectStore(STORES.officialSigns).getAll());db.close();return rows.map(r=>r.name);
}

export async function getMeta(key){return withStore(STORES.meta,'readonly',s=>s.get(key));}
export async function countOfficialSigns(){return withStore(STORES.officialSigns,'readonly',s=>s.count());}

export async function saveGestureTemplate(template){
  const row={...template,id:template.id||crypto.randomUUID(),createdAt:template.createdAt||new Date().toISOString()};
  await withStore(STORES.gestureTemplates,'readwrite',s=>s.put(row)); return row;
}
export async function listGestureTemplates(){return withStore(STORES.gestureTemplates,'readonly',s=>s.getAll());}
export async function deleteGestureTemplate(id){return withStore(STORES.gestureTemplates,'readwrite',s=>s.delete(id));}

export async function saveTranslation(entry){return withStore(STORES.translations,'readwrite',s=>s.add({...entry,createdAt:entry.createdAt||new Date().toISOString()}));}
export async function databaseStats(){
  const db=await openMadeiraDB();
  const names=[STORES.officialSigns,STORES.gestureTemplates,STORES.translations];
  const out={};
  for(const name of names){const tx=db.transaction(name,'readonly');out[name]=await requestToPromise(tx.objectStore(name).count());}
  db.close(); return out;
}

export { STORES };
