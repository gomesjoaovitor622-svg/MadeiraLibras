import test from 'node:test';
import assert from 'node:assert/strict';
import { resample, sequenceDistance } from '../src/vision/temporalRecognizer.js';

test('resample normaliza a quantidade de quadros',()=>{
  const seq=[[0,0],[1,1],[2,2],[3,3]];
  const out=resample(seq,24);
  assert.equal(out.length,24);
  assert.deepEqual(out[0],[0,0]);
  assert.deepEqual(out.at(-1),[3,3]);
});

test('sequências idênticas possuem distância praticamente zero',()=>{
  const seq=Array.from({length:12},(_,i)=>[i/12,Math.sin(i/3)]);
  assert.ok(sequenceDistance(seq,seq)<1e-9);
});

test('sequências diferentes possuem distância maior',()=>{
  const a=Array.from({length:12},(_,i)=>[i/12,0]);
  const b=Array.from({length:12},(_,i)=>[i/12,2]);
  assert.ok(sequenceDistance(a,b)>1);
});
