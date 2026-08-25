import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

const MODEL_URL='https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);

function fingerExtended(lm,tip,pip,mcp){
  return dist(lm[tip],lm[0]) > dist(lm[pip],lm[0]) * 1.08 && dist(lm[tip],lm[mcp]) > dist(lm[pip],lm[mcp]) * .9;
}

export function classifyHandGesture(lm){
  if(!lm || lm.length<21) return {id:'unknown',label:'não detectado',confidence:0};
  const index=fingerExtended(lm,8,6,5), middle=fingerExtended(lm,12,10,9), ring=fingerExtended(lm,16,14,13), pinky=fingerExtended(lm,20,18,17);
  const thumbOpen=dist(lm[4],lm[5]) > dist(lm[3],lm[5]) * 1.15;
  const pinch=dist(lm[4],lm[8]) < .055;
  const count=[index,middle,ring,pinky].filter(Boolean).length;
  if(pinch) return {id:'pinch',label:'pinça',confidence:.88};
  if(count===4 && thumbOpen) return {id:'open',label:'mão aberta',confidence:.9};
  if(count===0 && !thumbOpen) return {id:'fist',label:'punho fechado',confidence:.86};
  if(index && !middle && !ring && !pinky) return {id:'index',label:'indicador',confidence:.9};
  if(!index && !middle && !ring && !pinky && thumbOpen) return {id:'thumb',label:'polegar',confidence:.76};
  if(index && middle && !ring && !pinky) return {id:'two',label:'dois dedos',confidence:.82};
  return {id:'mixed',label:'configuração mista',confidence:.55};
}

export class GestureCamera {
  constructor({video,canvas,status,onFrame=()=>{}}){
    this.video=video; this.canvas=canvas; this.ctx=canvas.getContext('2d'); this.status=status; this.onFrame=onFrame;
    this.running=false; this.lastVideoTime=-1; this.landmarker=null; this.stream=null;
  }

  async init(){
    if(this.landmarker) return;
    this._setStatus('Carregando MediaPipe…');
    const vision=await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm');
    this.landmarker=await HandLandmarker.createFromOptions(vision,{
      baseOptions:{modelAssetPath:MODEL_URL,delegate:'GPU'},
      runningMode:'VIDEO',
      numHands:2,
      minHandDetectionConfidence:.55,
      minHandPresenceConfidence:.55,
      minTrackingConfidence:.5
    });
  }

  async start(){
    if(!navigator.mediaDevices?.getUserMedia) throw new Error('Câmera não disponível neste navegador.');
    await this.init();
    this.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:960},height:{ideal:720}},audio:false});
    this.video.srcObject=this.stream; await this.video.play();
    this.running=true; this._setStatus('Câmera ativa • processamento local'); this._loop();
  }

  stop(){
    this.running=false; cancelAnimationFrame(this.raf); this.stream?.getTracks().forEach(t=>t.stop()); this.stream=null;
    this.video.srcObject=null; this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height); this._setStatus('Câmera desligada');
  }

  _setStatus(text){ if(this.status) this.status.textContent=text; }

  _loop(){
    if(!this.running) return;
    if(this.video.readyState>=2 && this.video.currentTime!==this.lastVideoTime){
      this.lastVideoTime=this.video.currentTime;
      const result=this.landmarker.detectForVideo(this.video,performance.now());
      this._draw(result);
      const hands=(result.landmarks||[]).map((lm,i)=>({
        landmarks:lm,
        handedness:result.handedness?.[i]?.[0]?.categoryName||'Unknown',
        gesture:classifyHandGesture(lm)
      }));
      this.onFrame(hands);
    }
    this.raf=requestAnimationFrame(()=>this._loop());
  }

  _draw(result){
    const w=this.video.videoWidth||640,h=this.video.videoHeight||480;
    if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}
    this.ctx.clearRect(0,0,w,h);
    this.ctx.lineWidth=3; this.ctx.strokeStyle='#25c2a0'; this.ctx.fillStyle='#ffffff';
    const connections=[[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];
    for(const lm of result.landmarks||[]){
      for(const [a,b] of connections){const p=lm[a],q=lm[b];this.ctx.beginPath();this.ctx.moveTo(p.x*w,p.y*h);this.ctx.lineTo(q.x*w,q.y*h);this.ctx.stroke();}
      for(const p of lm){this.ctx.beginPath();this.ctx.arc(p.x*w,p.y*h,4,0,Math.PI*2);this.ctx.fill();}
    }
  }
}
