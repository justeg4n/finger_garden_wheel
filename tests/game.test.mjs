import { test } from 'node:test';
import assert from 'node:assert/strict';
import { animals, eligibleAnimals, pickAnimal, targetRotation } from '../game.js';

test('wheel pointer lands on the selected animal after successive spins', () => {
  let rotation = 0;
  for (let round=0;round<20;round++) for (let index=0;index<5;index++) {
    const next = targetRotation(rotation,index);
    assert.ok(next - rotation >= 1800);
    assert.equal((next + index*72)%360,0);
    rotation = next;
  }
});
test('a completed no-repeat cycle restarts with all five animals', () => {
  const ids = animals.map(a => a.id);
  assert.deepEqual(eligibleAnimals(true,ids.slice(0,4)).map(a => a.id),['butterfly']);
  assert.deepEqual(eligibleAnimals(true,ids).map(a => a.id),ids);
  assert.equal(eligibleAnimals(false,['rabbit']).length,5);
});
test('no-repeat cycles keep all five wheel segments and never repeat within five draws', () => {
  const expected = animals.map(a => a.id).sort();
  for (let round=0;round<50;round++) {
    const seen = [];
    for (let i=0;i<5;i++) {
      const pool = eligibleAnimals(true,seen);
      assert.equal(pool.length,5-i);
      const selected = pickAnimal(pool);
      assert.ok(!seen.includes(selected.id));
      seen.push(selected.id);
      assert.equal(animals.length,5);
      assert.deepEqual(animals.map(a => a.id).sort(),expected);
    }
    assert.equal(new Set(seen).size,5);
    assert.equal(eligibleAnimals(true,seen).length,5);
  }
});
test('draw boundaries and a single active animal are valid', () => {
  assert.equal(pickAnimal(animals,() => 0).id,'mosquito');
  assert.equal(pickAnimal(animals,() => .99999999).id,'butterfly');
  assert.equal(pickAnimal([animals[2]],() => .9).id,'cat');
  assert.throws(() => pickAnimal([]));
});
