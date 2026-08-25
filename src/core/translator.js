import { LEXICON, PHRASES, REGIONAL, STOPWORDS } from '../data/lexicon.js';
import { detectContext } from './context.js';
import { detectNonManual } from './emotion.js';

const stripAccents = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const escapeRx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function consumeMultiword(text, regionalEnabled) {
  let work = ` ${text.toLowerCase()} `;
  const placeholders = new Map();
  const regionalHits = [];
  let id = 0;
  const groups = regionalEnabled ? [{ source: REGIONAL, regional: true }, { source: PHRASES, regional: false }] : [{ source: PHRASES, regional: false }];

  for (const group of groups) {
    for (const phrase of Object.keys(group.source).sort((a,b) => b.length - a.length)) {
      const rx = new RegExp(`(^|\\s|[,.!?;:])${escapeRx(phrase)}(?=$|\\s|[,.!?;:])`, 'giu');
      work = work.replace(rx, (match, prefix) => {
        const key = `__ML${id++}__`;
        const value = group.source[phrase];
        placeholders.set(key.toLowerCase(), group.regional ? value.gloss : value);
        if (group.regional) regionalHits.push({ term: phrase, ...value });
        return `${prefix}${key}`;
      });
    }
  }
  return { work, placeholders, regionalHits };
}

function fingerspell(token) {
  const letters = stripAccents(token).replace(/[^a-z0-9]/gi, '').toUpperCase().split('');
  return letters.length ? `[DATILOLOGIA ${letters.join('-')}]` : '';
}

function reorder(glosses) {
  const timeMarkers = new Set(['HOJE','ONTEM','AMANHÃ','AGORA','DEPOIS','ANTES']);
  const negatives = new Set(['NÃO','NUNCA']);
  const time = glosses.filter(g => timeMarkers.has(g));
  const body = glosses.filter(g => !timeMarkers.has(g) && !negatives.has(g));
  const neg = glosses.filter(g => negatives.has(g));
  return [...time, ...body, ...neg];
}

export function translate(text, { regional = true, context = true } = {}) {
  const input = text.trim();
  if (!input) throw new Error('Informe uma frase para traduzir.');

  const contextInfo = context ? detectContext(input) : { replacements:{}, notes:['Análise contextual desativada.'], confidence:0.50 };
  const { work, placeholders, regionalHits } = consumeMultiword(input, regional);
  const rawTokens = work.replace(/[“”"'(),.!?;:]/g, ' ').split(/\s+/).filter(Boolean);
  const glosses = [];
  const unknown = [];

  for (const token of rawTokens) {
    const low = token.toLowerCase();
    const ascii = stripAccents(low);
    if (placeholders.has(low)) { glosses.push(placeholders.get(low)); continue; }
    if (STOPWORDS.has(low) || STOPWORDS.has(ascii)) continue;
    if (contextInfo.replacements[low]) { glosses.push(contextInfo.replacements[low]); continue; }
    if (LEXICON[low] || LEXICON[ascii]) { glosses.push(LEXICON[low] || LEXICON[ascii]); continue; }
    if (/^\d+$/.test(low)) { glosses.push(`NÚMERO-${low}`); continue; }
    const spelled = fingerspell(low);
    if (spelled) { glosses.push(spelled); unknown.push(token); }
  }

  const ordered = reorder(glosses);
  const nonManual = detectNonManual(input, regionalHits);
  const coverage = rawTokens.length ? Math.max(0, Math.min(1, (rawTokens.length - unknown.length) / rawTokens.length)) : 0;
  const confidence = Number(((contextInfo.confidence * 0.55) + (coverage * 0.45)).toFixed(2));

  return {
    input,
    glosses: ordered,
    unknown,
    regionalHits,
    contextNotes: contextInfo.notes.length ? contextInfo.notes : ['Nenhuma regra especial de desambiguação foi acionada.'],
    nonManual,
    confidence,
    coverage: Number(coverage.toFixed(2)),
    pipeline: ['normalização', 'expressões compostas', regional ? 'perfil regional' : null, context ? 'desambiguação' : null, 'léxico', 'reordenação', 'marcador não manual'].filter(Boolean)
  };
}
