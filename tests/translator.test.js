import test from 'node:test';
import assert from 'node:assert/strict';
import { translate } from '../src/core/translator.js';

test('desambigua banco financeiro', () => {
  const r = translate('Eu fui ao banco sacar dinheiro.');
  assert.ok(r.glosses.includes('BANCO-FINANCEIRO'));
});

test('desambigua banco assento', () => {
  const r = translate('Eu sentei no banco da praça.');
  assert.ok(r.glosses.includes('BANCO-ASSENTO'));
});

test('detecta regionalismo e surpresa', () => {
  const r = translate('Égua, essa festa está de rocha!');
  assert.ok(r.regionalHits.length >= 1);
  assert.equal(r.nonManual.id, 'surprise');
});

test('coloca marcador temporal no início', () => {
  const r = translate('Eu vou estudar hoje.');
  assert.equal(r.glosses[0], 'HOJE');
});
