import './styles.css';
import { translate } from './core/translator.js';
import { REGIONAL } from './data/lexicon.js';

const $ = (s) => document.querySelector(s);
const source = $('#source');
const output = $('#output');
const historyKey = 'madeiralibras-history-v2';

const FACE_CLASSES = ['neutral','question','negative','surprise','positive','intense'];
function setFace(face='neutral') {
  const avatar = $('#avatar');
  avatar.classList.remove(...FACE_CLASSES, 'signing');
  avatar.classList.add(face);
  void avatar.offsetWidth;
  avatar.classList.add('signing');
}

function renderRegional() {
  $('#regionalList').innerHTML = Object.entries(REGIONAL).map(([term,d]) => `<article><strong>${term}</strong><span>${d.meaning}</span></article>`).join('');
}

function getHistory(){ try { return JSON.parse(localStorage.getItem(historyKey) || '[]'); } catch { return []; } }
function saveHistory(item){ const items=getHistory(); items.unshift(item); localStorage.setItem(historyKey, JSON.stringify(items.slice(0,12))); renderHistory(); }
function renderHistory(){
  const items=getHistory();
  $('#historyList').innerHTML = items.length ? items.map(i => `<article><strong>${i.input}</strong><span>${i.glosses.join(' • ')}</span></article>`).join('') : '<p class="muted">Nenhuma tradução nesta sessão.</p>';
}

function renderResult(data){
  output.classList.remove('empty');
  $('#gloss').innerHTML = data.glosses.length ? data.glosses.map(g=>`<span>${g}</span>`).join('') : 'Sem resultado.';
  $('#context').textContent = data.contextNotes.join(' ');
  $('#emotion').textContent = `${data.nonManual.label} — ${data.nonManual.description}`;
  $('#confidence').textContent = `${Math.round(data.confidence*100)}% (cobertura léxica ${Math.round(data.coverage*100)}%)`;
  $('#fallback').textContent = data.unknown.length ? `Datilologia textual: ${data.unknown.join(', ')}` : 'Nenhum termo desconhecido.';
  $('#emotionTag').textContent = data.nonManual.label;
  $('#signNow').textContent = data.glosses.slice(0,4).join(' • ') || 'Sem saída';
  $('#signSequence').textContent = data.pipeline.join(' → ');
  setFace(data.nonManual.id);
}

function runTranslation(){
  try {
    const data = translate(source.value, { regional: $('#regionalMode').checked, context: $('#contextMode').checked });
    renderResult(data);
    saveHistory({ input:data.input, glosses:data.glosses, time:new Date().toISOString() });
  } catch (err) {
    output.classList.remove('empty');
    $('#gloss').textContent = err.message;
  }
}

$('#translate').addEventListener('click', runTranslation);
$('#clear').addEventListener('click', () => { source.value=''; $('#counter').textContent='0/500'; source.focus(); });
$('#copy').addEventListener('click', () => navigator.clipboard?.writeText($('#gloss').innerText));
$('#clearHistory').addEventListener('click', () => { localStorage.removeItem(historyKey); renderHistory(); });
source.addEventListener('input', () => $('#counter').textContent = `${source.value.length}/500`);
source.addEventListener('keydown', e => { if ((e.ctrlKey||e.metaKey) && e.key==='Enter') runTranslation(); });
document.querySelectorAll('[data-text]').forEach(btn => btn.addEventListener('click', () => { source.value=btn.dataset.text; source.dispatchEvent(new Event('input')); runTranslation(); }));
document.querySelectorAll('[data-face]').forEach(btn => btn.addEventListener('click', () => setFace(btn.dataset.face)));

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
$('#mic').addEventListener('click', () => {
  if (!SpeechRecognition) return alert('Ditado por voz não é suportado neste navegador.');
  const rec = new SpeechRecognition();
  rec.lang='pt-BR'; rec.interimResults=false;
  rec.onresult = e => { source.value=e.results[0][0].transcript; source.dispatchEvent(new Event('input')); runTranslation(); };
  rec.start();
});

renderRegional();
renderHistory();
