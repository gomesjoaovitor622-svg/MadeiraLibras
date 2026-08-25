export function detectContext(text) {
  const t = text.toLowerCase();
  const replacements = {};
  const notes = [];
  let confidence = 0.55;

  if (/\bbanco\b/.test(t)) {
    if (/sacar|dinheiro|conta|pix|cart[aã]o|ag[eê]ncia|dep[oó]sito/.test(t)) {
      replacements.banco = 'BANCO-FINANCEIRO';
      notes.push('“banco” interpretado como instituição financeira pelas pistas da frase.');
      confidence = Math.max(confidence, 0.92);
    } else if (/sent|pra[cç]a|parque|assento|madeira/.test(t)) {
      replacements.banco = 'BANCO-ASSENTO';
      notes.push('“banco” interpretado como assento pelas pistas da frase.');
      confidence = Math.max(confidence, 0.91);
    } else {
      replacements.banco = 'BANCO-AMBÍGUO';
      notes.push('“banco” permaneceu ambíguo: faltam pistas contextuais.');
      confidence = 0.48;
    }
  }

  if (/\bmanga\b/.test(t)) {
    if (/camisa|roupa|curta|comprida/.test(t)) {
      replacements.manga = 'MANGA-ROUPA';
      notes.push('“manga” interpretada como parte da roupa.');
      confidence = Math.max(confidence, 0.90);
    } else if (/fruta|comer|suco|doce/.test(t)) {
      replacements.manga = 'MANGA-FRUTA';
      notes.push('“manga” interpretada como fruta.');
      confidence = Math.max(confidence, 0.90);
    } else {
      replacements.manga = 'MANGA-AMBÍGUA';
      notes.push('“manga” permaneceu ambígua.');
      confidence = 0.48;
    }
  }
  return { replacements, notes, confidence };
}
