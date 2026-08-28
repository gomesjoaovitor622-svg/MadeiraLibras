import './styles.css';
import './v4.css';
import { translate } from './core/translator.js';
import { REGIONAL } from './data/lexicon.js';
import { SIGN_CATALOG, SOURCES, catalogStats } from './data/signCatalog.js';
import { ThreeAvatar } from './avatar/threeAvatar.js';
import { GestureCamera } from './vision/gestureCamera.js';
import { TemporalGestureRecognizer } from './vision/temporalRecognizer.js';
import { loadOfficialSignList, checkOfficialCoverage, officialEndpoint } from './data/vlibrasRemote.js';
import { databaseStats, listGestureTemplates, saveGestureTemplate, deleteGestureTemplate, saveTranslation } from './db/madeiraDB.js';

const $=(s)=>document.querySelector(s);
const source=$('#source'),output=$('#output');
const historyKey='madeiralibras-history-v5';
let officialCatalog=null;
let recording=false;

const avatar=new ThreeAvatar($('#avatar3d'),{
  onSignStart:(gloss,sign)=>{
    $('#signNow').textContent=gloss;
    $('#signSequence').textContent=sign?`${sign.handshape} • ${sign.palm} • ${sign.location} • ${sign.movement}`:'Sem perfil de movimento local: fallback visual.';
    const v=$('#validationTag');
    v.textContent=sign?.validated?'validado':sign?'estudo de movimento':'sem perfil local';
    v.dataset.state=sign?.validated?'validated':'study';
  }
});

const recognizer=new TemporalGestureRecognizer({
  windowMs:1800,
  minFrames:10,
  onPrediction:(p)=>{
    if(recording)return;
    $('#sequenceResult').textContent=p.confidence>=.55?p.label:'—';
    $('#sequenceDetail').textContent=p.confidence>=.55?`similaridade temporal ${Math.round(p.confidence*100)}%`:'Movimento ainda não suficientemente parecido com os exemplos gravados.';
  }
});

function renderRegional(){ $('#regionalList').innerHTML=Object.entries(REGIONAL).map(([term,d])=>`<article><strong>${term}</strong><span>${d.meaning}</span></article>`).join(''); }
function getHistory(){try{return JSON.parse(localStorage.getItem(historyKey)||'[]')}catch{return[]}}
function saveHistory(item){const h=getHistory();h.unshift(item);localStorage.setItem(historyKey,JSON.stringify(h.slice(0,12)));renderHistory();}
function renderHistory(){const h=getHistory();$('#historyList').innerHTML=h.length?h.map(i=>`<article><strong>${i.input}</strong><span>${i.glosses.join(' • ')}</span></article>`).join(''):'<p class="muted">Nenhuma tradução nesta sessão.</p>';}

async function refreshDbStats(){
  try{const s=await databaseStats();$('#dbOfficialCount').textContent=s.officialSigns.toLocaleString('pt-BR');$('#dbTemplateCount').textContent=s.gestureTemplates.toLocaleString('pt-BR');$('#dbTranslationCount').textContent=s.translations.toLocaleString('pt-BR');}catch(err){console.warn('Falha ao ler banco local',err);}
}

async function refreshTemplates(){
  const templates=await listGestureTemplates();recognizer.setTemplates(templates);
  $('#templateList').innerHTML=templates.length?templates.slice().reverse().map(t=>`<article><div><strong>${t.label}</strong><span>${t.frames?.length||0} quadros • ${t.durationMs||0} ms</span></div><button data-delete-template="${t.id}" class="icon-btn">Excluir</button></article>`).join(''):'<p class="muted">Nenhum exemplo gravado ainda.</p>';
  $('#templateList').querySelectorAll('[data-delete-template]').forEach(btn=>btn.addEventListener('click',async()=>{await deleteGestureTemplate(btn.dataset.deleteTemplate);await refreshTemplates();await refreshDbStats();}));
}

function renderLocalCatalog(filter=''){
  const q=filter.trim().toUpperCase();
  const rows=Object.values(SIGN_CATALOG).filter(s=>!q||s.gloss.includes(q)).map(sign=>`<article class="catalog-item"><div><strong>${sign.gloss}</strong><span>${sign.handshape} • ${sign.palm}</span></div><div><small>${sign.location}</small><small>${sign.movement}</small></div><span class="catalog-status ${sign.validated?'ok':'study'}">${sign.validated?'validado':'estudo'}</span><button data-play-sign="${sign.gloss}">▶ 3D</button></article>`).join('');
  $('#catalogList').innerHTML=rows||'<p class="muted">Nenhum perfil local encontrado.</p>';
  $('#catalogList').querySelectorAll('[data-play-sign]').forEach(btn=>btn.addEventListener('click',()=>avatar.playSequence([btn.dataset.playSign],'neutral')));
  const s=catalogStats();$('#catalogStats').textContent=`${s.total} perfis 3D locais • ${s.validated} validados • ${s.motionStudies} estudos de movimento`;
}

async function initOfficialCatalog(force=false){
  const badge=$('#officialCatalogBadge');
  badge.textContent=force?'sincronizando…':'consultando…';
  try{
    officialCatalog=await loadOfficialSignList({force});
    badge.textContent=`VLibras: ${officialCatalog.count.toLocaleString('pt-BR')} sinais${officialCatalog.cached?' • cache local':''}`;
    badge.dataset.state='validated';
    await refreshDbStats();
    return officialCatalog;
  }catch(err){badge.textContent='VLibras indisponível';badge.title=err.message;throw err;}
}

function searchOfficial(q){
  const box=$('#officialSearchResult');
  if(!officialCatalog||!q.trim()){box.innerHTML='';return;}
  const term=q.trim().toUpperCase();
  const found=officialCatalog.signs.filter(s=>String(s).toUpperCase().includes(term)).slice(0,40);
  box.innerHTML=found.length?`<strong>Índice VLibras carregado no banco</strong><div>${found.map(s=>`<span>${s}</span>`).join('')}</div>`:'<span class="muted">Nenhuma ocorrência no índice carregado.</span>';
}

async function renderResult(data){
  output.classList.remove('empty');
  $('#gloss').innerHTML=data.glosses.length?data.glosses.map(g=>`<span>${g}</span>`).join(''):'Sem resultado.';
  $('#context').textContent=data.contextNotes.join(' ');
  $('#emotion').textContent=`${data.nonManual.label} — ${data.nonManual.description}`;
  $('#confidence').textContent=`${Math.round(data.confidence*100)}% • cobertura léxica ${Math.round(data.coverage*100)}%`;
  $('#emotionTag').textContent=data.nonManual.label;
  avatar.setFace(data.nonManual.id);avatar.playSequence(data.glosses,data.nonManual.id);
  const coverage=await checkOfficialCoverage(data.glosses);
  if(coverage.available){const yes=coverage.items.filter(i=>i.official).length;$('#officialCoverage').textContent=`${yes}/${coverage.items.length} glosas encontradas no índice oficial (${coverage.count.toLocaleString('pt-BR')} sinais${coverage.cached?', cache local':''}).`;}
  else $('#officialCoverage').textContent='Não foi possível consultar o índice oficial agora.';
}

async function runTranslation(){
  try{
    const data=translate(source.value,{regional:$('#regionalMode').checked,context:$('#contextMode').checked});
    await renderResult(data);
    const item={input:data.input,glosses:data.glosses,time:new Date().toISOString()};
    saveHistory(item);await saveTranslation({input:data.input,glosses:data.glosses,confidence:data.confidence,coverage:data.coverage});await refreshDbStats();
  }catch(err){output.classList.remove('empty');$('#gloss').textContent=err.message;}
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
    const placeholder=document.querySelector('.camera-placeholder');if(placeholder)placeholder.style.display=hands.length?'none':'grid';
    if(!hands.length){$('#gestureResult').textContent='—';$('#gestureDetail').textContent='Nenhuma mão detectada.';return;}
    const best=hands[0];$('#gestureResult').textContent=best.gesture.label;$('#gestureDetail').textContent=`${best.handedness} • confiança heurística ${Math.round(best.gesture.confidence*100)}% • ${hands.length} mão(ões)`;
    recognizer.push(hands);
    if(recording){const r=recognizer.recording;$('#recordStatus').textContent=`Gravando ${r?.label||''} • ${r?.frames?.length||0} quadros capturados`;}
  }
});

$('#startCamera').addEventListener('click',async()=>{try{$('#startCamera').disabled=true;await camera.start();$('#stopCamera').disabled=false;}catch(err){$('#cameraStatus').textContent='Erro na câmera';alert(err.message);$('#startCamera').disabled=false;}});
$('#stopCamera').addEventListener('click',()=>{camera.stop();$('#startCamera').disabled=false;$('#stopCamera').disabled=true;});

$('#recordTemplate').addEventListener('click',()=>{
  const label=$('#templateLabel').value.trim();if(!label)return alert('Digite o nome/glosa do exemplo antes de gravar.');
  if(!camera.running)return alert('Ative a câmera primeiro.');
  recording=true;recognizer.startRecording(label);$('#recordTemplate').disabled=true;$('#stopTemplate').disabled=false;$('#recordStatus').textContent=`Gravando ${label.toUpperCase()}… faça o sinal/gesto completo.`;
});
$('#stopTemplate').addEventListener('click',async()=>{
  const tpl=recognizer.stopRecording();recording=false;$('#recordTemplate').disabled=false;$('#stopTemplate').disabled=true;
  if(!tpl){$('#recordStatus').textContent='Gravação muito curta. Tente novamente por cerca de 1–2 segundos.';return;}
  await saveGestureTemplate(tpl);$('#recordStatus').textContent=`Exemplo ${tpl.label} salvo com ${tpl.frames.length} quadros normalizados.`;await refreshTemplates();await refreshDbStats();
});

$('#syncCatalog').addEventListener('click',async()=>{try{$('#syncCatalog').disabled=true;await initOfficialCatalog(true);$('#syncCatalog').textContent='Base sincronizada';setTimeout(()=>$('#syncCatalog').textContent='Sincronizar base VLibras',1800);}catch(err){alert(`Falha ao sincronizar: ${err.message}`);}finally{$('#syncCatalog').disabled=false;}});
$('#catalogSearch').addEventListener('input',e=>{renderLocalCatalog(e.target.value);searchOfficial(e.target.value);});

const sourceInfo=$('#sourceInfo');sourceInfo.innerHTML=`Índice: <a href="${officialEndpoint()}" target="_blank" rel="noreferrer">VLibras Dictionary Repository</a> • ${Object.values(SOURCES).map(s=>`<a href="${s.url}" target="_blank" rel="noreferrer">${s.name}</a>`).join(' • ')}`;

renderRegional();renderLocalCatalog();renderHistory();refreshTemplates();refreshDbStats();initOfficialCatalog().catch(()=>{});
