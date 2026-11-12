import assert from 'node:assert/strict';
import {expansionState, lineGradientPosition} from '../dist/motion-rules.mjs';

// The frame starts cropped, reaches the full viewport at 55% of its scroll,
// and reveals readable content later. Reverse scroll must follow the same path.
const desktopStart = expansionState(0, 1440);
assert.equal(desktopStart.horizontalInset, 35);
assert.equal(desktopStart.verticalInset, 30);
assert.equal(desktopStart.opacity, 0);
assert.equal(expansionState(0, 390).horizontalInset, 20);
assert.equal(expansionState(0.55, 1440).horizontalInset, 0);
assert.equal(expansionState(0.55, 1440).opacity, 0);
assert.equal(expansionState(0.72, 1440).opacity, 1);
assert.equal(expansionState(1, 1440).offset, 0);
assert.equal(expansionState(-1, 1440).scale, 1.25);
assert.equal(expansionState(2, 1440).scale, 1);
const positions = [0, 0.2, 0.4, 0.6, 0.8, 1];
const forward = positions.map(position => expansionState(position, 1440));
const backward = [...positions].reverse().map(position => expansionState(position, 1440)).reverse();
assert.deepEqual(forward, backward);
for (let index = 1; index < forward.length; index++) {
  assert(forward[index].horizontalInset <= forward[index - 1].horizontalInset);
  assert(forward[index].opacity >= forward[index - 1].opacity);
}
assert.equal(lineGradientPosition(0, 0, 3), -18);
assert.equal(lineGradientPosition(1, 2, 3), 118);
assert(lineGradientPosition(0.5, 0, 3) > lineGradientPosition(0.5, 2, 3));
console.log('PASS: responsive frame expansion, reveal ordering, bounded values, reverse scroll and sequential line gradients.');
