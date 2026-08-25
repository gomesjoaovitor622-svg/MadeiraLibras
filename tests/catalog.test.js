import test from 'node:test';
import assert from 'node:assert/strict';
import { SIGN_CATALOG, findSign, catalogStats } from '../src/data/signCatalog.js';

test('catálogo possui perfis de movimento estruturados', () => {
  const stats = catalogStats();
  assert.ok(stats.total >= 15);
  assert.ok(stats.motionStudies >= 15);
});

test('perfil ESTUDAR possui parâmetros manuais completos', () => {
  const sign = findSign('ESTUDAR');
  assert.equal(sign.hands, 2);
  assert.ok(sign.handshape);
  assert.ok(sign.palm);
  assert.ok(sign.location);
  assert.ok(sign.movement);
  assert.ok(sign.frames.length >= 2);
});

test('flexão temporal pode reutilizar perfil base', () => {
  assert.equal(findSign('IR-PASSADO')?.gloss, 'IR');
  assert.equal(findSign('IR-FUTURO')?.gloss, 'IR');
});

test('todo perfil declara status de validação explicitamente', () => {
  for (const sign of Object.values(SIGN_CATALOG)) {
    assert.equal(typeof sign.validated, 'boolean');
    assert.ok(sign.status);
  }
});
