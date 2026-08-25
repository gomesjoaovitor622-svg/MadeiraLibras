import { findSign } from '../data/signCatalog.js';

const NS = 'http://www.w3.org/2000/svg';
const wait = (ms) => new Promise(r => setTimeout(r, ms));
const clamp = (n,min,max) => Math.max(min,Math.min(max,n));

function svg(tag, attrs={}) {
  const el = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k, v));
  return el;
}

function handMarkup(side) {
  const group = svg('g', { class:`rig-hand rig-${side}`, 'data-side':side });
  const palm = svg('rect', { x:-10, y:-13, width:20, height:27, rx:8, class:'rig-skin palm' });
  group.appendChild(palm);

  const fingerData = [
    {name:'thumb',x:-12,y:-3,w:6,h:17,rot:-42},
    {name:'index',x:-8,y:-27,w:5,h:20,rot:-4},
    {name:'middle',x:-2,y:-31,w:5,h:23,rot:0},
    {name:'ring',x:4,y:-28,w:5,h:20,rot:4},
    {name:'pinky',x:9,y:-23,w:5,h:16,rot:8}
  ];
  for (const f of fingerData) {
    const finger = svg('rect', {
      x:f.x, y:f.y, width:f.w, height:f.h, rx:3,
      class:`rig-skin finger finger-${f.name}`,
      transform:`rotate(${f.rot} ${f.x+f.w/2} ${f.y+f.h})`
    });
    group.appendChild(finger);
  }
  const wrist = svg('rect', {x:-6,y:12,width:12,height:18,rx:5,class:'rig-skin'});
  group.appendChild(wrist);
  return group;
}

function buildRig(container) {
  container.innerHTML = '';
  container.classList.add('rig-avatar');
  const stage = svg('svg', { viewBox:'0 0 420 420', class:'rig-stage', role:'img', 'aria-label':'Avatar articulado experimental do MadeiraLibras' });

  const bg = svg('circle', {cx:210,cy:175,r:142,class:'rig-halo'});
  stage.appendChild(bg);

  const torso = svg('path', {d:'M135 405 Q145 270 210 250 Q275 270 285 405 Z',class:'rig-shirt'});
  const neck = svg('rect', {x:193,y:224,width:34,height:42,rx:12,class:'rig-skin'});
  const head = svg('ellipse', {cx:210,cy:158,rx:70,ry:82,class:'rig-skin'});
  const hair = svg('path', {d:'M146 139 Q147 77 211 72 Q278 80 275 140 Q250 105 212 103 Q177 104 146 139Z',class:'rig-hair'});
  stage.append(torso, neck, head, hair);

  const face = svg('g', {class:'rig-face'});
  const browL = svg('path',{d:'M170 143 Q184 136 195 142',class:'rig-brow brow-l'});
  const browR = svg('path',{d:'M225 142 Q237 136 251 143',class:'rig-brow brow-r'});
  const eyeL = svg('ellipse',{cx:184,cy:160,rx:5,ry:7,class:'rig-eye eye-l'});
  const eyeR = svg('ellipse',{cx:237,cy:160,rx:5,ry:7,class:'rig-eye eye-r'});
  const nose = svg('path',{d:'M211 163 L207 184 L216 184',class:'rig-nose'});
  const mouth = svg('path',{d:'M187 202 Q210 214 233 202',class:'rig-mouth'});
  face.append(browL,browR,eyeL,eyeR,nose,mouth);
  stage.appendChild(face);

  const armL = svg('line',{x1:159,y1:286,x2:126,y2:354,class:'rig-arm arm-l'});
  const armR = svg('line',{x1:261,y1:286,x2:294,y2:354,class:'rig-arm arm-r'});
  stage.append(armL,armR);

  const handL = handMarkup('left');
  const handR = handMarkup('right');
  stage.append(handL,handR);

  container.appendChild(stage);

  const info = document.createElement('div');
  info.className = 'rig-readout';
  info.innerHTML = '<span data-rig="shape">configuração: —</span><span data-rig="palm">orientação: —</span><span data-rig="location">localização: —</span><span data-rig="movement">movimento: —</span>';
  container.appendChild(info);

  return { stage, handL, handR, armL, armR, face, mouth, eyeL, eyeR, browL, browR, info };
}

function shapeStyle(hand, shape='open') {
  const fingers = [...hand.querySelectorAll('.finger')];
  fingers.forEach(f => { f.style.opacity='1'; f.style.transform=''; });
  hand.classList.remove('shape-open','shape-flat','shape-fist','shape-index','shape-pinch');
  hand.classList.add(`shape-${shape}`);

  if (shape === 'fist') {
    fingers.forEach((f,i) => f.style.transform = `translateY(${13 + i%2*2}px) scaleY(.45)`);
  } else if (shape === 'index') {
    fingers.filter(f => !f.classList.contains('finger-index')).forEach(f => f.style.transform='translateY(13px) scaleY(.42)');
  } else if (shape === 'pinch') {
    fingers.forEach(f => {
      if (f.classList.contains('finger-thumb')) f.style.transform='translate(7px,-5px) rotate(28deg)';
      else if (f.classList.contains('finger-index')) f.style.transform='translate(-2px,5px) rotate(-16deg)';
      else f.style.transform='translateY(10px) scaleY(.55)';
    });
  } else if (shape === 'flat') {
    fingers.forEach(f => f.style.transform='scaleX(1.08)');
  }
}

function pointToSvg(frame={x:50,y:65,rot:0,shape:'open'}) {
  return {
    x: clamp(frame.x,8,92) * 4.2,
    y: clamp(frame.y,10,90) * 4.2,
    rot: frame.rot || 0,
    shape: frame.shape || 'open'
  };
}

function handTransform(p) {
  return `translate(${p.x} ${p.y}) rotate(${p.rot})`;
}

function setPose(hand, pose) {
  if (!pose) { hand.style.opacity='0'; return; }
  hand.style.opacity='1';
  const p = pointToSvg(pose);
  hand.setAttribute('transform', handTransform(p));
  shapeStyle(hand, p.shape);
}

function animateHand(hand, frames, side, duration) {
  const usable = frames.map(f => f[side]).filter(Boolean);
  if (!usable.length) { hand.style.opacity='0'; return Promise.resolve(); }
  hand.style.opacity='1';
  const keyframes = usable.map(p => {
    const s = pointToSvg(p);
    return { transform:`translate(${s.x}px, ${s.y}px) rotate(${s.rot}deg)` };
  });
  usable.forEach((p,i) => setTimeout(() => shapeStyle(hand,p.shape||'open'), Math.round((i/Math.max(1,usable.length-1))*duration)));
  const anim = hand.animate(keyframes, {duration,iterations:1,easing:'ease-in-out',fill:'forwards'});
  return anim.finished.catch(()=>{});
}

function setFace(rig, face='neutral') {
  const { browL,browR,eyeL,eyeR,mouth } = rig;
  browL.setAttribute('transform',''); browR.setAttribute('transform','');
  eyeL.setAttribute('ry','7'); eyeR.setAttribute('ry','7');
  mouth.setAttribute('d','M187 202 Q210 214 233 202');
  if (face === 'question') {
    browL.setAttribute('transform','translate(0 -8)'); browR.setAttribute('transform','translate(0 -8)');
  } else if (face === 'negative') {
    browL.setAttribute('transform','rotate(10 184 142)'); browR.setAttribute('transform','rotate(-10 238 142)');
    mouth.setAttribute('d','M187 208 Q210 194 233 208');
  } else if (face === 'surprise') {
    eyeL.setAttribute('ry','12'); eyeR.setAttribute('ry','12');
    mouth.setAttribute('d','M199 201 Q210 188 221 201 Q210 219 199 201');
  } else if (face === 'positive') {
    mouth.setAttribute('d','M185 198 Q210 222 235 198');
  } else if (face === 'intense') {
    eyeL.setAttribute('ry','4'); eyeR.setAttribute('ry','4');
    browL.setAttribute('transform','translate(0 4)'); browR.setAttribute('transform','translate(0 4)');
  }
}

export class SignPlayer {
  constructor(container, { onSignStart=()=>{}, onSignEnd=()=>{} }={}) {
    this.container = container;
    this.rig = buildRig(container);
    this.onSignStart = onSignStart;
    this.onSignEnd = onSignEnd;
    this.abortId = 0;
    setPose(this.rig.handL,{x:38,y:77,rot:18,shape:'open'});
    setPose(this.rig.handR,{x:62,y:77,rot:-18,shape:'open'});
  }

  setFace(face) { setFace(this.rig, face); }

  stop() { this.abortId += 1; this.rig.handL.getAnimations().forEach(a=>a.cancel()); this.rig.handR.getAnimations().forEach(a=>a.cancel()); }

  describe(sign) {
    const readout = this.rig.info;
    readout.querySelector('[data-rig="shape"]').textContent = `configuração: ${sign?.handshape || 'fallback'}`;
    readout.querySelector('[data-rig="palm"]').textContent = `orientação: ${sign?.palm || '—'}`;
    readout.querySelector('[data-rig="location"]').textContent = `localização: ${sign?.location || '—'}`;
    readout.querySelector('[data-rig="movement"]').textContent = `movimento: ${sign?.movement || 'datilologia/sem perfil'}`;
  }

  async playSign(gloss, face='neutral') {
    const sign = findSign(gloss);
    this.setFace(face);
    this.describe(sign);
    this.onSignStart(gloss, sign);

    if (!sign) {
      await this.playFallback(gloss);
      this.onSignEnd(gloss, null);
      return;
    }

    if (sign.mediaUrl) {
      await this.playMedia(sign);
      this.onSignEnd(gloss, sign);
      return;
    }

    await Promise.all([
      animateHand(this.rig.handL, sign.frames, 'l', sign.duration),
      animateHand(this.rig.handR, sign.frames, 'r', sign.duration)
    ]);
    await wait(120);
    this.onSignEnd(gloss, sign);
  }

  async playSequence(glosses, face='neutral') {
    this.stop();
    const run = this.abortId;
    for (const gloss of glosses) {
      if (run !== this.abortId) break;
      await this.playSign(gloss, face);
      await wait(140);
    }
  }

  async playFallback(gloss) {
    this.rig.handL.style.opacity='0';
    const base = {x:58,y:58,rot:0,shape:'open'};
    setPose(this.rig.handR,base);
    const anim = this.rig.handR.animate([
      {transform:'translate(244px, 244px) rotate(-10deg)'},
      {transform:'translate(278px, 220px) rotate(12deg)'},
      {transform:'translate(244px, 244px) rotate(-10deg)'}
    ], {duration:700,easing:'ease-in-out'});
    await anim.finished.catch(()=>{});
  }

  async playMedia(sign) {
    // Ponto de extensão: sinais validados podem usar vídeo/WebM/GLB no futuro.
    // O player mantém a mesma API, permitindo trocar o rig por mídia real sem alterar o tradutor.
    await wait(sign.duration || 900);
  }
}
