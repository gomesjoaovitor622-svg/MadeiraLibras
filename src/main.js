import './styles.css';
import './rig.css';
import { translate } from './core/translator.js';
import { REGIONAL } from './data/lexicon.js';
import { SIGN_CATALOG, SOURCES, catalogStats } from './data/signCatalog.js';
import { SignPlayer } from './avatar/player.js';

const $ = (s) => document.querySelector(s);
const source = $('#source');
const output = $('#output');
const historyKey = 'madeiralibras-history-v3';

const player = new SignPlayer($('#avatar'), {
  onSignStart: (gloss, sign) => {
    $('#signNow').textContent = gloss;
    $('#signSequence').textContent = sign
      ? `${sign.handshape} • ${sign.palm} • ${sign.location} • ${sign.movement}`
      : 'Sem perfil no catálogo: usando movimento de fallback.';
    const validation = $('#validationTag');
    if (validation) {
      validation.textContent = sign?.validated ? 'validado' : sign ? 'estudo de movimento' : 'sem catálogo';
      validation.dataset.state = sign?.validated ? 'validated' : 'study';
    }
  },
  onSignEnd: () => {}
});

function renderRegional() {
  $('#regionalList').innerHTML = Object.entries(REGIONAL)
    .map(([term,d]) => `<article><strong>${term}</strong><span>${d.meaning}</span></article>`)
    .join('');
}

function renderCatalog() {
  const target = $('#catalogList');
  if (!target) return;
  const rows = Object.values(SIGN_CATALOG).map(sign => `
    <article class="catalog-item">
      <div><strong>${sign.gloss}</strong><span>${sign.handshape} • ${sign.palm}</span></div>
      <div><small>${sign.location}</small><small>${sign.movement}</small></div>
      <span class="catalog-status ${sign.validated ? 'ok' : 'study'}">${sign.validated ? 'validado' : 'estudo'}</span>
      <button data-play-sign="${sign.gloss}">▶ testar</button>
    </article>
  `).join('');
  target.innerHTML = rows;
  target.querySelectorAll('[data-play-sign]').forEach(btn => btn.addEventListener('click', () => {
    player.playSequence([btn.dataset.playSign], 'neutral');
  }));

  const stats = catalogStats();
  const statsEl = $('#catalogStats');
  if (statsEl) statsEl.textContent = `${stats.total} perfis • ${stats.validated} validados • ${stats.motionStudies} estudos de movimento`;
}

function getHistory(){
  try { return JSON.parse(localStorage.getItem(historyKey) || '[]'); }
  catch { return []; }
}

function saveHistory(item){
  const items=getHistory();
  items.unshift(item);
  localStorage.setItem(historyKey, JSON.stringify(items.slice(0,12)));
  renderHistory();
}

function renderHistory(){
  const items=getHistory();
  $('#historyList').innerHTML = items.length
    ? items.map(i => `<article><strong>${i.input}</strong><span>${i.glosses.join(' • ')}</span></article>`).join('')
    : '<p class="muted">Nenhuma tradução nesta sessão.</p>';
}

function renderResult(data){
  output.classList.remove('empty');
  $('#gloss').innerHTML = data.glosses.length ? data.glosses.map(g=>`<span>${g}</span>`).join('') : 'Sem resultado.';
  $('#context').textContent = data.contextNotes.join(' ');
  $('#emotion').textContent = `${data.nonManual.label} — ${data.nonManual.description}`;
  $('#confidence').textContent = `${Math.round(data.confidence*100)}% (cobertura léxica ${Math.round(data.coverage*100)}%)`;
  $('#fallback').textContent = data.unknown.length ? `Datilologia textual: ${data.unknown.join(', ')}` : 'Nenhum termo desconhecido.';
  $('#emotionTag').textContent = data.nonManual.label;
  $('#signSequence').textContent = `${data.glosses.length} unidades na sequência • ${data.pipeline.join(' → ')}`;
  player.setFace(data.nonManual.id);
  player.playSequence(data.glosses, data.nonManual.id);
}

function runTranslation(){
  try {
    const data = translate(source.value, {
      regional: $('#regionalMode').checked,
      context: $('#contextMode').checked
    });
    renderResult(data);
    saveHistory({ input:data.input, glosses:data.glosses, time:new Date().toISOString() });
  } catch (err) {
    output.classList.remove('empty');
    $('#gloss').textContent = err.message;
  }
}

$('#translate').addEventListener('click', runTranslation);
$('#clear').addEventListener('click', () => {
  source.value='';
  $('#counter').textContent='0/500';
  source.focus();
  player.stop();
});
$('#copy').addEventListener('click', () => navigator.clipboard?.writeText($('#gloss').innerText));
$('#clearHistory').addEventListener('click', () => {
  localStorage.removeItem(historyKey);
  renderHistory();
});
source.addEventListener('input', () => $('#counter').textContent = `${source.value.length}/500`);
source.addEventListener('keydown', e => {
  if ((e.ctrlKey||e.metaKey) && e.key==='Enter') runTranslation();
});
document.querySelectorAll('[data-text]').forEach(btn => btn.addEventListener('click', () => {
  source.value=btn.dataset.text;
  source.dispatchEvent(new Event('input'));
  runTranslation();
}));
document.querySelectorAll('[data-face]').forEach(btn => btn.addEventListener('click', () => player.setFace(btn.dataset.face)));

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
$('#mic').addEventListener('click', () => {
  if (!SpeechRecognition) return alert('Ditado por voz não é suportado neste navegador.');
  const rec = new SpeechRecognition();
  rec.lang='pt-BR';
  rec.interimResults=false;
  rec.onresult = e => {
    source.value=e.results[0][0].transcript;
    source.dispatchEvent(new Event('input'));
    runTranslation();
  };
  rec.start();
});

const sourceInfo = $('#sourceInfo');
if (sourceInfo) {
  sourceInfo.innerHTML = Object.values(SOURCES).map(s => `<a href="${s.url}" target="_blank" rel="noreferrer">${s.name}</a> — ${s.license}`).join(' • ');
}

renderRegional();
renderCatalog();
renderHistory();
