import './styles.css';
import './v4.css';
import { translate } from './core/translator.js';
import { REGIONAL } from './data/lexicon.js';
import { SIGN_CATALOG, SOURCES, catalogStats } from './data/signCatalog.js';
import { ThreeAvatar } from './avatar/threeAvatar.js';
import { GestureCamera } from './vision/gestureCamera.js';
import { loadOfficialSignList, checkOfficialCoverage, officialEndpoint } from './data/vlibrasRemote.js';

const $=(s)=>document.querySelector(s);
const source=$('#source'),output=$('#output');
const historyKey='madeiralibras-history-v4';
let officialCatalog=null;

const avatar=new ThreeAvatar($('#avatar3d'),{
  onSignStart:(gloss,sign)=>{
    $('#signNow').textContent=gloss;
    $('#signSequence').textContent=sign?`${sign.handshape} • ${sign.palm} • ${sign.location} • ${sign.movement}`:'Sem perfil de movimento local: fallback visual.';
    const v=$('#validationTag');
    v.textContent=sign?.validated?'validado':sign?'estudo de movimento':'sem perfil local';
    v.dataset.state=sign?.validated?'validated':'study';
  }
});

function renderRegional(){ $('#regionalList').innerHTML=Object.entries(REGIONAL).map(([term,d])=>`<article><strong>${term}</strong><span>${d.meaning}</span></article>`).join(''); }
function getHistory(){try{return JSON.parse(localStorage.getItem(historyKey)||'[]')}catch{return[]}}
function saveHistory(item){const h=getHistory();h.unshift(item);localStorage.setItem(historyKey,JSON.stringify(h.slice(0,12)));renderHistory();}
function renderHistory(){const h=getHistory();$('#historyList').innerHTML=h.length?h.map(i=>`<article><strong>${i.input}</strong><span>${i.glosses.join(' • ')}</span></article>`).join(''):'<p class="muted">Nenhuma tradução nesta sessão.</p>';}

function renderLocalCatalog(filter=''){
  const q=filter.trim().toUpperCase();
  const rows=Object.values(SIGN_CATALOG).filter(s=>!q||s.gloss.includes(q)).map(sign=>`<article class="catalog-item"><div><strong>${sign.gloss}</strong><span>${sign.handshape} • ${sign.palm}</span></div><div><small>${sign.location}</small><small>${sign.movement}</small></div><span class="catalog-status ${sign.validated?'ok':'study'}">${sign.validated?'validado':'estudo'}</span><button data-play-sign="${sign.gloss}">▶ 3D</button></article>`).join('');
  $('#catalogList').innerHTML=rows||'<p class="muted">Nenhum perfil local encontrado.</p>';
  $('#catalogList').querySelectorAll('[data-play-sign]').forEach(btn=>btn.addEventListener('click',()=>avatar.playSequence([btn.dataset.playSign],'neutral')));
  const s=catalogStats(); $('#catalogStats').textContent=`${s.total} perfis locais • ${s.validated} validados • ${s.motionStudies} estudos de movimento`;
}

async function initOfficialCatalog(){
  const badge=$('#officialCatalogBadge');
  try{
    officialCatalog=await loadOfficialSignList();
    badge.textContent=`VLibras: ${officialCatalog.count.toLocaleString('pt-BR')} sinais`;
    badge.dataset.state='validated';
  }catch(err){badge.textContent='VLibras indisponível';badge.title=err.message;}
}

function searchOfficial(q){
  const box=$('#officialSearchResult');
  if(!officialCatalog||!q.trim()){box.innerHTML='';return;}
  const term=q.trim().toUpperCase();
  const found=officialCatalog.signs.filter(s=>String(s).toUpperCase().includes(term)).slice(0,30);
  box.innerHTML=found.length?`<strong>Índice oficial VLibras</strong><div>${found.map(s=>`<span>${s}</span>`).join('')}</div>`:'<span class="muted">Nenhuma ocorrência no índice oficial carregado.</span>';
}

async function renderResult(data){
  output.classList.remove('empty');
  $('#gloss').innerHTML=data.glosses.length?data.glosses.map(g=>`<span>${g}</span>`).join(''):'Sem resultado.';
  $('#context').textContent=data.contextNotes.join(' ');
  $('#emotion').textContent=`${data.nonManual.label} — ${data.nonManual.description}`;
  $('#confidence').textContent=`${Math.round(data.confidence*100)}% • cobertura léxica ${Math.round(data.coverage*100)}%`;
  $('#emotionTag').textContent=data.nonManual.label;
  avatar.setFace(data.nonManual.id); avatar.playSequence(data.glosses,data.nonManual.id);
  const coverage=await checkOfficialCoverage(data.glosses);
  if(coverage.available){const yes=coverage.items.filter(i=>i.official).length;$('#officialCoverage').textContent=`${yes}/${coverage.items.length} glosas encontradas no índice oficial (${coverage.count.toLocaleString('pt-BR')} sinais carregados).`;}
  else $('#officialCoverage').textContent='Não foi possível consultar o índice oficial agora.';
}

async function runTranslation(){
  try{const data=translate(source.value,{regional:$('#regionalMode').checked,context:$('#contextMode').checked});await renderResult(data);saveHistory({input:data.input,glosses:data.glosses,time:new Date().toISOString()});}
  catch(err){output.classList.remove('empty');$('#gloss').textContent=err.message;}
}

$('#translate').addEventListener('click',runTranslation);
$('#clear').addEventListener('click',()=>{source.value='';$('#counter').textContent='0/500';source.focus();avatar.stop();});
$('#copy').addEventListener('click',()=>navigator.clipboard?.writeText($('#gloss').innerText));
$('#clearHistory').addEventListener('click',()=>{localStorage.removeItem(historyKey);renderHistory();});
source.addEventListener('input',()=>$('#counter').textContent=`${source.value.length}/500`);
source.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter')runTranslation();});
document.querySelectorAll('[data-text]').forEach(btn=>btn.addEventListener('click',()=>{source.value=btn.dataset.text;source.dispatchEvent(new Event('input'));runTranslation();}));
document.querySelectorAll('[data-face]').forEach(btn=>btn.addEventListener('click',()=>avatar.setFace(btn.dataset.face)));

const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
$('#mic').addEventListener('click',()=>{if(!SpeechRecognition)return alert('Ditado por voz não é suportado neste navegador.');const rec=new SpeechRecognition();rec.lang='pt-BR';rec.interimResults=false;rec.onresult=e=>{source.value=e.results[0][0].transcript;source.dispatchEvent(new Event('input'));runTranslation();};rec.start();});

const camera=new GestureCamera({
  video:$('#cameraVideo'),canvas:$('#cameraOverlay'),status:$('#cameraStatus'),
  onFrame:(hands)=>{
    const placeholder=document.querySelector('.camera-placeholder');
    if(placeholder)placeholder.style.display=hands.length?'none':'grid';
    if(!hands.length){$('#gestureResult').textContent='—';$('#gestureDetail').textContent='Nenhuma mão detectada.';return;}
    const best=hands[0];$('#gestureResult').textContent=best.gesture.label;$('#gestureDetail').textContent=`${best.handedness} • confiança heurística ${Math.round(best.gesture.confidence*100)}% • ${hands.length} mão(ões)`;
  }
});
$('#startCamera').addEventListener('click',async()=>{try{$('#startCamera').disabled=true;await camera.start();$('#stopCamera').disabled=false;}catch(err){$('#cameraStatus').textContent='Erro na câmera';alert(err.message);$('#startCamera').disabled=false;}});
$('#stopCamera').addEventListener('click',()=>{camera.stop();$('#startCamera').disabled=false;$('#stopCamera').disabled=true;});

$('#catalogSearch').addEventListener('input',e=>{renderLocalCatalog(e.target.value);searchOfficial(e.target.value);});
const sourceInfo=$('#sourceInfo');sourceInfo.innerHTML=`Fonte do índice: <a href="${officialEndpoint()}" target="_blank" rel="noreferrer">VLibras Dictionary Repository</a> • ${Object.values(SOURCES).map(s=>`<a href="${s.url}" target="_blank" rel="noreferrer">${s.name}</a>`).join(' • ')}`;

renderRegional();renderLocalCatalog();renderHistory();initOfficialCatalog();
