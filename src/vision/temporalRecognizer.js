const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);

function handFeature(hand){
  const lm=hand?.landmarks;if(!lm||lm.length<21)return null;
  const wrist=lm[0],scale=Math.max(.001,dist(lm[0],lm[9]));
  const ids=[4,8,12,16,20];
  const tips=ids.flatMap(i=>[(lm[i].x-wrist.x)/scale,(lm[i].y-wrist.y)/scale,(lm[i].z-wrist.z)/scale]);
  return [hand.handedness==='Left'?-1:1,...tips];
}

export function frameFeature(hands){
  const sorted=[...hands].sort((a,b)=>String(a.handedness).localeCompare(String(b.handedness)));
  const out=[];
  for(let i=0;i<2;i++){
    const f=handFeature(sorted[i]);
    if(f)out.push(...f);else out.push(...Array(16).fill(0));
  }
  return out;
}

function vectorDistance(a,b){
  const n=Math.min(a.length,b.length);let sum=0;
  for(let i=0;i<n;i++){const d=a[i]-b[i];sum+=d*d;}
  return Math.sqrt(sum/Math.max(1,n));
}

export function resample(sequence,target=24){
  if(!sequence.length)return [];
  if(sequence.length===1)return Array.from({length:target},()=>[...sequence[0]]);
  const result=[];
  for(let i=0;i<target;i++){
    const p=i*(sequence.length-1)/(target-1),a=Math.floor(p),b=Math.min(sequence.length-1,a+1),u=p-a;
    result.push(sequence[a].map((v,j)=>v+(sequence[b][j]-v)*u));
  }
  return result;
}

export function sequenceDistance(a,b){
  const A=resample(a),B=resample(b); if(!A.length||!B.length)return Infinity;
  return A.reduce((s,v,i)=>s+vectorDistance(v,B[i]),0)/A.length;
}

export class TemporalGestureRecognizer{
  constructor({windowMs=1800,minFrames=8,onPrediction=()=>{}}={}){
    this.windowMs=windowMs;this.minFrames=minFrames;this.onPrediction=onPrediction;this.buffer=[];this.templates=[];this.recording=null;
  }
  setTemplates(templates){this.templates=templates||[];}
  startRecording(label){this.recording={label:label.trim().toUpperCase(),frames:[],startedAt:performance.now()};return this.recording;}
  stopRecording(){const r=this.recording;this.recording=null;if(!r||r.frames.length<this.minFrames)return null;return {label:r.label,frames:resample(r.frames),durationMs:Math.round(performance.now()-r.startedAt)};}
  push(hands,now=performance.now()){
    const feature=frameFeature(hands); if(!feature.some(v=>v!==0))return null;
    if(this.recording)this.recording.frames.push(feature);
    this.buffer.push({t:now,f:feature});
    this.buffer=this.buffer.filter(x=>now-x.t<=this.windowMs);
    if(this.buffer.length<this.minFrames||!this.templates.length)return null;
    const seq=this.buffer.map(x=>x.f);let best=null;
    for(const template of this.templates){const d=sequenceDistance(seq,template.frames||[]);if(!best||d<best.distance)best={label:template.label,distance:d,id:template.id};}
    if(!best)return null;
    const confidence=clamp(1-best.distance/1.4,0,1);const pred={...best,confidence};this.onPrediction(pred);return pred;
  }
}
