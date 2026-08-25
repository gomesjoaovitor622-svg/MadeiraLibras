import * as THREE from 'three';
import { findSign } from '../data/signCatalog.js';

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const lerp = (a,b,t) => a + (b-a)*t;

function skinMaterial(){ return new THREE.MeshStandardMaterial({color:0xd3a07f,roughness:.72,metalness:0}); }
function clothMaterial(){ return new THREE.MeshStandardMaterial({color:0x0e6d73,roughness:.8}); }
function darkMaterial(){ return new THREE.MeshStandardMaterial({color:0x26383a,roughness:.9}); }

function capsule(radius, length, material){
  const g = new THREE.CapsuleGeometry(radius,length,6,12);
  return new THREE.Mesh(g,material);
}

function createFinger(material, scale=1){
  const group = new THREE.Group();
  const lengths=[.22,.18,.14];
  let y=0;
  lengths.forEach((len,i)=>{
    const joint=new THREE.Group();
    joint.position.y=y;
    const mesh=capsule(.035*scale,len*scale,material);
    mesh.position.y=len*scale*.5;
    joint.add(mesh);
    group.add(joint);
    y += len*scale*.82;
  });
  return group;
}

function createHand(material, side=1){
  const hand=new THREE.Group();
  const palm=new THREE.Mesh(new THREE.BoxGeometry(.34,.42,.13),material);
  palm.position.y=.04;
  hand.add(palm);
  const xs=[-.14,-.05,.04,.13];
  const fingerScales=[.82,1, .95,.78];
  const fingers=[];
  xs.forEach((x,i)=>{
    const f=createFinger(material,fingerScales[i]);
    f.position.set(x,.23,0);
    hand.add(f); fingers.push(f);
  });
  const thumb=createFinger(material,.7);
  thumb.position.set(.21*side,.02,0);
  thumb.rotation.z=-1.05*side;
  hand.add(thumb); fingers.push(thumb);
  hand.userData.fingers=fingers;
  hand.scale.setScalar(.72);
  return hand;
}

function createArm(material, hand, side=1){
  const shoulder=new THREE.Group();
  const upper=capsule(.10,.72,material); upper.position.y=-.42;
  const elbow=new THREE.Group(); elbow.position.y=-.86;
  const lower=capsule(.09,.65,material); lower.position.y=-.38;
  const wrist=new THREE.Group(); wrist.position.y=-.78;
  wrist.add(hand); hand.position.y=-.08;
  elbow.add(lower,wrist); shoulder.add(upper,elbow);
  shoulder.userData={elbow,wrist,hand,side};
  return shoulder;
}

function setHandShape(hand,shape='open'){
  const fingers=hand.userData.fingers||[];
  const curl = (f,amount)=>{ [...f.children].forEach((joint,i)=> joint.rotation.x = -amount*(.55+i*.22)); };
  fingers.forEach(f=>curl(f,0));
  if(shape==='fist') fingers.forEach(f=>curl(f,1.25));
  if(shape==='index') fingers.forEach((f,i)=>curl(f,i===1?0:1.2));
  if(shape==='pinch') fingers.forEach((f,i)=>curl(f,(i===1||i===4)?.55:1.0));
  if(shape==='flat') fingers.forEach(f=>curl(f,.1));
}

function mapFrame(p, side){
  if(!p) return null;
  return {
    x:(p.x-50)/18,
    y:2.25-(p.y-40)/18,
    z:.55,
    rot:THREE.MathUtils.degToRad(p.rot||0),
    shape:p.shape||'open',
    side
  };
}

export class ThreeAvatar {
  constructor(container,{onSignStart=()=>{},onSignEnd=()=>{}}={}){
    this.container=container; this.onSignStart=onSignStart; this.onSignEnd=onSignEnd;
    this.abortId=0; this.face='neutral'; this._init();
  }

  _init(){
    this.container.innerHTML='';
    this.scene=new THREE.Scene();
    this.scene.background=new THREE.Color(0xf1f7f5);
    this.camera=new THREE.PerspectiveCamera(32,1,.1,100); this.camera.position.set(0,1.65,7.3);
    this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    this.renderer.shadowMap.enabled=true;
    this.container.appendChild(this.renderer.domElement);
    this.scene.add(new THREE.HemisphereLight(0xffffff,0x8aa19a,2.0));
    const key=new THREE.DirectionalLight(0xffffff,2.4); key.position.set(3,5,5); this.scene.add(key);
    const fill=new THREE.DirectionalLight(0xbdeae0,1.0); fill.position.set(-4,2,2); this.scene.add(fill);
    this.root=new THREE.Group(); this.root.position.y=-1.05; this.scene.add(this.root);
    const skin=skinMaterial(),cloth=clothMaterial(),dark=darkMaterial();

    const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.72,1.2,8,16),cloth); torso.scale.set(1.15,1,.58); torso.position.y=1.35; this.root.add(torso);
    const neck=new THREE.Mesh(new THREE.CylinderGeometry(.19,.22,.34,20),skin); neck.position.y=2.25; this.root.add(neck);
    this.head=new THREE.Mesh(new THREE.SphereGeometry(.58,32,24),skin); this.head.scale.set(.88,1.05,.86); this.head.position.y=2.85; this.root.add(this.head);
    const hair=new THREE.Mesh(new THREE.SphereGeometry(.59,28,18,0,Math.PI*2,0,Math.PI*.52),dark); hair.position.y=2.98; hair.scale.set(.9,1,.88); this.root.add(hair);

    this.eyeL=new THREE.Mesh(new THREE.SphereGeometry(.045,12,8),dark); this.eyeR=this.eyeL.clone();
    this.eyeL.position.set(-.19,2.91,.49); this.eyeR.position.set(.19,2.91,.49); this.root.add(this.eyeL,this.eyeR);
    this.browL=new THREE.Mesh(new THREE.BoxGeometry(.25,.035,.035),dark); this.browR=this.browL.clone();
    this.browL.position.set(-.19,3.09,.50); this.browR.position.set(.19,3.09,.50); this.root.add(this.browL,this.browR);
    this.mouth=new THREE.Mesh(new THREE.TorusGeometry(.13,.025,8,24,Math.PI),new THREE.MeshStandardMaterial({color:0x7f4741})); this.mouth.rotation.z=Math.PI; this.mouth.position.set(0,2.65,.51); this.root.add(this.mouth);

    this.leftHand=createHand(skin,-1); this.rightHand=createHand(skin,1);
    this.leftArm=createArm(skin,this.leftHand,-1); this.rightArm=createArm(skin,this.rightHand,1);
    this.leftArm.position.set(-.86,1.98,0); this.rightArm.position.set(.86,1.98,0);
    this.leftArm.rotation.z=-.18; this.rightArm.rotation.z=.18;
    this.root.add(this.leftArm,this.rightArm);

    const floor=new THREE.Mesh(new THREE.CircleGeometry(2.2,48),new THREE.MeshStandardMaterial({color:0xdde9e5,roughness:1})); floor.rotation.x=-Math.PI/2; floor.position.y=-.03; this.scene.add(floor);
    this._resize(); this._ro=new ResizeObserver(()=>this._resize()); this._ro.observe(this.container);
    this._animate(); this.setFace('neutral'); this.resetPose();
  }

  _resize(){ const w=Math.max(280,this.container.clientWidth),h=Math.max(420,this.container.clientHeight||460); this.renderer.setSize(w,h,false); this.camera.aspect=w/h; this.camera.updateProjectionMatrix(); }
  _animate(){ this._raf=requestAnimationFrame(()=>this._animate()); this.renderer.render(this.scene,this.camera); }
  destroy(){ cancelAnimationFrame(this._raf); this._ro?.disconnect(); this.renderer?.dispose(); }
  stop(){ this.abortId++; }

  resetPose(){
    this.leftArm.rotation.set(0,0,-.28); this.rightArm.rotation.set(0,0,.28);
    this.leftArm.userData.elbow.rotation.set(0,0,.18); this.rightArm.userData.elbow.rotation.set(0,0,-.18);
    this.leftHand.position.set(0,-.08,0); this.rightHand.position.set(0,-.08,0);
    this.leftHand.rotation.set(0,0,0); this.rightHand.rotation.set(0,0,0);
    setHandShape(this.leftHand,'open'); setHandShape(this.rightHand,'open');
  }

  setFace(face='neutral'){
    this.face=face; this.browL.rotation.z=0; this.browR.rotation.z=0; this.browL.position.y=3.09; this.browR.position.y=3.09; this.eyeL.scale.y=1; this.eyeR.scale.y=1; this.mouth.scale.set(1,1,1); this.mouth.rotation.z=Math.PI;
    if(face==='question'){ this.browL.position.y=3.17; this.browR.position.y=3.17; }
    if(face==='negative'){ this.browL.rotation.z=-.22; this.browR.rotation.z=.22; this.mouth.rotation.z=0; }
    if(face==='surprise'){ this.eyeL.scale.y=1.6; this.eyeR.scale.y=1.6; this.mouth.scale.set(.7,1.35,.7); }
    if(face==='positive'){ this.mouth.rotation.z=Math.PI; this.mouth.scale.x=1.25; }
    if(face==='intense'){ this.browL.position.y=3.03; this.browR.position.y=3.03; this.eyeL.scale.y=.65; this.eyeR.scale.y=.65; }
  }

  _applyTarget(hand,arm,frame){
    const p=mapFrame(frame,arm.userData.side); if(!p) return;
    setHandShape(hand,p.shape);
    const side=arm.userData.side;
    arm.rotation.z=side*(.35 + p.x*.18);
    arm.rotation.x=-(p.y-1.4)*.2;
    arm.userData.elbow.rotation.z=-side*(.45 + p.x*.22);
    arm.userData.elbow.rotation.x=(p.y-1.25)*.22;
    hand.rotation.z=p.rot; hand.rotation.y=side*.18;
  }

  async playSign(gloss,face='neutral'){
    const sign=findSign(gloss); this.setFace(face); this.onSignStart(gloss,sign);
    if(!sign){ await this._fallback(); this.onSignEnd(gloss,null); return; }
    const frames=sign.frames||[]; if(!frames.length){ await wait(sign.duration||700); return; }
    const start=performance.now(),duration=sign.duration||850;
    await new Promise(resolve=>{
      const tick=(now)=>{
        const t=Math.min(1,(now-start)/duration);
        const scaled=t*(frames.length-1),i=Math.min(frames.length-2,Math.floor(scaled)),u=scaled-i;
        const a=frames[i]||frames[0],b=frames[i+1]||frames[frames.length-1];
        const mix=(pa,pb)=>{ if(!pa&&!pb)return null; pa=pa||pb; pb=pb||pa; return {x:lerp(pa.x,pb.x,u),y:lerp(pa.y,pb.y,u),rot:lerp(pa.rot||0,pb.rot||0,u),shape:u<.5?(pa.shape||'open'):(pb.shape||'open')}; };
        this._applyTarget(this.leftHand,this.leftArm,mix(a.l,b.l)); this._applyTarget(this.rightHand,this.rightArm,mix(a.r,b.r));
        if(t<1) requestAnimationFrame(tick); else resolve();
      }; requestAnimationFrame(tick);
    });
    this.onSignEnd(gloss,sign);
  }

  async playSequence(glosses,face='neutral'){
    this.stop(); const run=this.abortId;
    for(const gloss of glosses){ if(run!==this.abortId) break; await this.playSign(gloss,face); await wait(110); }
  }

  async _fallback(){
    setHandShape(this.rightHand,'index');
    const start=performance.now(); await new Promise(resolve=>{ const tick=(now)=>{ const t=Math.min(1,(now-start)/650); this.rightArm.rotation.z=.25+Math.sin(t*Math.PI*2)*.28; if(t<1) requestAnimationFrame(tick); else resolve(); }; requestAnimationFrame(tick); });
  }
}
