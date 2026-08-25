export function detectNonManual(text, regionalHits = []) {
  const t = text.toLowerCase();
  if (/\?/.test(text) || /\b(quem|onde|quando|como|qual|quanto|por que|porque)\b/.test(t)) return { id:'question', label:'interrogação', description:'sobrancelhas elevadas e atenção facial' };
  if (/\b(não|nao|nunca|jamais)\b/.test(t)) return { id:'negative', label:'negação', description:'expressão contraída e movimento de cabeça sugerido' };
  if (regionalHits.some(h => h.emotion === 'surprise') || /!+|nossa|caramba/.test(t)) return { id:'surprise', label:'surpresa/ênfase', description:'olhos abertos e boca arredondada' };
  if (regionalHits.some(h => h.emotion === 'intense') || /\b(muito|demais|super)\b/.test(t)) return { id:'intense', label:'intensidade', description:'expressão concentrada e gesto ampliado' };
  if (regionalHits.some(h => h.emotion === 'positive') || /\b(feliz|ótimo|otimo|legal|bom|boa)\b/.test(t)) return { id:'positive', label:'afeto positivo', description:'expressão facial positiva' };
  return { id:'neutral', label:'neutro', description:'sem marcador não manual forte detectado' };
}
