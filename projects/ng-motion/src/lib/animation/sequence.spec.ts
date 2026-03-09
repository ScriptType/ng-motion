import '../test-env';
import { motionValue } from 'motion-dom';
import { createAnimationsFromSequence } from './sequence';
import type { AnimationSequence } from './sequence-types';

/** Helper that asserts the value is defined and returns it (avoids non-null assertions). */
function defined<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) {
    throw new Error('Expected value to be defined');
  }
  return value;
}

describe('createAnimationsFromSequence', () => {
  // ── Existing tests (1–8) ──────────────────────────────────────────────────

  it('resolves a single MotionValue segment', () => {
    const mv = motionValue(0);
    const sequence: AnimationSequence = [[mv, 100]];
    const result = createAnimationsFromSequence(sequence);

    expect(result.size).toBe(1);
    const def = defined(result.get(mv));
    expect(def.keyframes['default']).toBeDefined();
    expect(def.transition['default']).toBeDefined();
  });

  it('resolves sequential MotionValue segments with correct timing', () => {
    const mv1 = motionValue(0);
    const mv2 = motionValue(0);
    const sequence: AnimationSequence = [
      [mv1, 100],
      [mv2, 200],
    ];
    const result = createAnimationsFromSequence(sequence);

    expect(result.size).toBe(2);
    expect(result.has(mv1)).toBe(true);
    expect(result.has(mv2)).toBe(true);

    // Total duration should be 0.6 (0.3 + 0.3 default)
    const def1 = defined(result.get(mv1));
    expect(def1.transition['default'].duration).toBeCloseTo(0.6, 5);
  });

  it('handles relative timing with "<"', () => {
    const mv1 = motionValue(0);
    const mv2 = motionValue(0);
    const sequence: AnimationSequence = [
      [mv1, 100],
      [mv2, 200, { at: '<' }],
    ];
    const result = createAnimationsFromSequence(sequence);

    // Both start at 0 since "<" means "at previous start time"
    const def1 = defined(result.get(mv1));
    const def2 = defined(result.get(mv2));
    // Total duration should be 0.3 (both start at 0, each lasts 0.3)
    expect(def1.transition['default'].duration).toBeCloseTo(0.3, 5);
    expect(def2.transition['default'].duration).toBeCloseTo(0.3, 5);
  });

  it('handles relative timing with "+0.5"', () => {
    const mv1 = motionValue(0);
    const mv2 = motionValue(0);
    const sequence: AnimationSequence = [
      [mv1, 100],
      [mv2, 200, { at: '+0.5' }],
    ];
    const result = createAnimationsFromSequence(sequence);

    // mv2 starts at 0.3 (end of mv1) + 0.5 = 0.8
    // Total duration = 0.8 + 0.3 = 1.1
    const def2 = defined(result.get(mv2));
    expect(def2.transition['default'].duration).toBeCloseTo(1.1, 5);
  });

  it('handles labels', () => {
    const mv1 = motionValue(0);
    const mv2 = motionValue(0);
    const sequence: AnimationSequence = [
      [mv1, 100],
      'myLabel',
      [mv2, 200, { at: 'myLabel' }],
    ];
    const result = createAnimationsFromSequence(sequence);

    // 'myLabel' is placed at time 0.3 (after mv1 completes)
    // mv2 starts at label time = 0.3
    expect(result.size).toBe(2);
  });

  it('handles custom defaultTransition duration', () => {
    const mv = motionValue(0);
    const sequence: AnimationSequence = [[mv, 100]];
    const result = createAnimationsFromSequence(sequence, {
      defaultTransition: { duration: 1 },
    });

    const def = defined(result.get(mv));
    expect(def.transition['default'].duration).toBeCloseTo(1, 5);
  });

  it('produces correct keyframes for MotionValue', () => {
    const mv = motionValue(0);
    const sequence: AnimationSequence = [[mv, [50, 100]]];
    const result = createAnimationsFromSequence(sequence);

    const def = defined(result.get(mv));
    const kf = def.keyframes['default'];
    // Should contain the keyframes (possibly with null prepended and appended)
    expect(kf.length).toBeGreaterThanOrEqual(2);
  });

  it('handles empty sequence', () => {
    const result = createAnimationsFromSequence([]);
    expect(result.size).toBe(0);
  });

  // ── New tests (9–25) ─────────────────────────────────────────────────────

  it('handles negative relative timing "-0.2"', () => {
    const mv1 = motionValue(0);
    const mv2 = motionValue(0);
    const sequence: AnimationSequence = [
      [mv1, 100],
      [mv2, 200, { at: '-0.2' }],
    ];
    const result = createAnimationsFromSequence(sequence);

    // mv1 ends at 0.3. currentTime at segment 2 = 0.3.
    // "-0.2" means max(0, 0.3 + (-0.2)) = 0.1, so mv2 starts at 0.1.
    // mv2 ends at 0.1 + 0.3 = 0.4 → totalDuration = 0.4
    const def2 = defined(result.get(mv2));
    expect(def2.transition['default'].duration).toBeCloseTo(0.4, 5);

    // Check that mv2 keyframe times reflect it starting at 0.1 out of 0.4
    const times2 = defined(def2.transition['default'].times);
    // The first actual keyframe time should be at 0.1 / 0.4 = 0.25
    // (with a padding keyframe at 0 repeating the first value)
    expect(times2[0]).toBeCloseTo(0, 5);
    expect(times2[1]).toBeCloseTo(0.25, 5);
  });

  it('handles "<+0.5" (previous start + 0.5)', () => {
    const mv1 = motionValue(0);
    const mv2 = motionValue(0);
    const sequence: AnimationSequence = [
      [mv1, 100],
      [mv2, 200, { at: '<+0.5' }],
    ];
    const result = createAnimationsFromSequence(sequence);

    // "<+0.5" → prev (0) + 0.5 = 0.5. mv2: 0.5 → 0.8.
    // totalDuration = 0.8
    const def2 = defined(result.get(mv2));
    expect(def2.transition['default'].duration).toBeCloseTo(0.8, 5);
  });

  it('handles "<-0.2" (previous start - 0.2, clamped to 0)', () => {
    const mv1 = motionValue(0);
    const mv2 = motionValue(0);
    const sequence: AnimationSequence = [
      [mv1, 100],
      [mv2, 200, { at: '<-0.2' }],
    ];
    const result = createAnimationsFromSequence(sequence);

    // "<-0.2" → max(0, prev(0) + (-0.2)) = 0. mv2: 0 → 0.3.
    // totalDuration = max(0.3, 0.3) = 0.3
    const def1 = defined(result.get(mv1));
    const def2 = defined(result.get(mv2));
    expect(def1.transition['default'].duration).toBeCloseTo(0.3, 5);
    expect(def2.transition['default'].duration).toBeCloseTo(0.3, 5);
  });

  it('merges multiple segments targeting the same MotionValue', () => {
    const mv = motionValue(0);
    const sequence: AnimationSequence = [
      [mv, 100],
      [mv, 200],
    ];
    const result = createAnimationsFromSequence(sequence);

    // Both segments target the same MV → single entry in the Map
    expect(result.size).toBe(1);

    const def = defined(result.get(mv));
    // Total duration: 0 → 0.3 (first), 0.3 → 0.6 (second) = 0.6
    expect(def.transition['default'].duration).toBeCloseTo(0.6, 5);

    // Keyframes should contain values from both segments
    const kf = def.keyframes['default'];
    expect(kf.length).toBeGreaterThanOrEqual(3);
  });

  it('handles stagger via delay function in transition', () => {
    const mv1 = motionValue(0);
    const mv2 = motionValue(0);
    const mv3 = motionValue(0);
    // Each segment with a delay function (though for MotionValues elementIndex is always 0)
    // The delay function receives (elementIndex, numSubjects).
    // For MotionValue segments, elementIndex=0 and numSubjects=0.
    const sequence: AnimationSequence = [
      [mv1, 100, { delay: 0 }],
      [mv2, 200, { delay: 0.1 }],
      [mv3, 300, { delay: 0.2 }],
    ];
    const result = createAnimationsFromSequence(sequence);

    expect(result.size).toBe(3);

    // mv1: starts at 0 + delay 0 = 0, ends at 0.3. totalDuration so far = 0.3
    // mv2: starts at 0.3 + delay 0.1 = 0.4, ends at 0.7. totalDuration = 0.7
    // mv3: starts at 0.7 + delay 0.2 = 0.9, ends at 1.2. totalDuration = 1.2
    // Wait — currentTime advances by maxDuration which is delay + segmentDuration.
    // mv1: maxDuration = 0 + 0.3 = 0.3. currentTime after = 0.3.
    // mv2: maxDuration = 0.1 + 0.3 = 0.4. currentTime after = 0.3 + 0.4 = 0.7.
    // mv3: maxDuration = 0.2 + 0.3 = 0.5. currentTime after = 0.7 + 0.5 = 1.2.
    // totalDuration = max(0.3, 0.7, 1.2) = 1.2
    const def3 = defined(result.get(mv3));
    expect(def3.transition['default'].duration).toBeCloseTo(1.2, 5);
  });

  it('expands repeat: 1 to double the duration', () => {
    const mv = motionValue(0);
    const sequence: AnimationSequence = [
      [mv, 100, { repeat: 1 }],
    ];
    const result = createAnimationsFromSequence(sequence);

    const def = defined(result.get(mv));
    // repeat: 1 means play twice → duration = 0.3 * 2 = 0.6
    expect(def.transition['default'].duration).toBeCloseTo(0.6, 5);
  });

  it('expands repeat: 2 to triple the duration', () => {
    const mv = motionValue(0);
    const sequence: AnimationSequence = [
      [mv, 100, { repeat: 2 }],
    ];
    const result = createAnimationsFromSequence(sequence);

    const def = defined(result.get(mv));
    // repeat: 2 means play three times → duration = 0.3 * 3 = 0.9
    expect(def.transition['default'].duration).toBeCloseTo(0.9, 5);
  });

  it('uses per-segment duration override instead of default', () => {
    const mv = motionValue(0);
    const sequence: AnimationSequence = [
      [mv, 100, { duration: 1 }],
    ];
    const result = createAnimationsFromSequence(sequence);

    const def = defined(result.get(mv));
    // Segment specifies duration: 1 → total = 1
    expect(def.transition['default'].duration).toBeCloseTo(1, 5);
  });

  it('handles multiple labels referenced by different segments', () => {
    const mv1 = motionValue(0);
    const mv2 = motionValue(0);
    const mv3 = motionValue(0);
    const sequence: AnimationSequence = [
      [mv1, 100],
      'labelA',           // placed at 0.3
      [mv2, 200],         // runs 0.3 → 0.6
      'labelB',           // placed at 0.6
      [mv3, 300, { at: 'labelA' }],
    ];
    const result = createAnimationsFromSequence(sequence);

    expect(result.size).toBe(3);

    // mv3 starts at labelA = 0.3, ends at 0.6
    // totalDuration = max(0.3, 0.6, 0.6) = 0.6
    const def3 = defined(result.get(mv3));
    expect(def3.transition['default'].duration).toBeCloseTo(0.6, 5);
  });

  it('handles SequenceLabelWithTime objects', () => {
    const mv1 = motionValue(0);
    const mv2 = motionValue(0);
    const sequence: AnimationSequence = [
      [mv1, 100],
      { name: 'intro', at: 0.5 },
      [mv2, 200, { at: 'intro' }],
    ];
    const result = createAnimationsFromSequence(sequence);

    expect(result.size).toBe(2);

    // 'intro' label is set at absolute time 0.5
    // mv2 starts at 0.5, ends at 0.8
    // totalDuration = max(0.3, 0.8) = 0.8
    const def2 = defined(result.get(mv2));
    expect(def2.transition['default'].duration).toBeCloseTo(0.8, 5);
  });

  it('produces correct keyframes for 3-value keyframe array', () => {
    const mv = motionValue(0);
    const sequence: AnimationSequence = [[mv, [0, 50, 100]]];
    const result = createAnimationsFromSequence(sequence);

    const def = defined(result.get(mv));
    const kf = def.keyframes['default'];
    // 3 keyframes from the segment. A trailing null may be appended if the last time != 1.
    // The keyframes should contain 0, 50, 100 in order.
    expect(kf).toContain(0);
    expect(kf).toContain(50);
    expect(kf).toContain(100);
    expect(kf.length).toBeGreaterThanOrEqual(3);
  });

  it('propagates defaultTransition ease to segments', () => {
    const mv = motionValue(0);
    const sequence: AnimationSequence = [[mv, 100]];
    const result = createAnimationsFromSequence(sequence, {
      defaultTransition: { ease: 'linear' },
    });

    const def = defined(result.get(mv));
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- narrowing union type for test assertion
    const ease = def.transition['default'].ease as string[];
    // The ease array should contain 'linear' from the defaultTransition
    expect(ease).toContain('linear');
  });

  it('computes correct total duration for 3 sequential segments', () => {
    const mv1 = motionValue(0);
    const mv2 = motionValue(0);
    const mv3 = motionValue(0);
    const sequence: AnimationSequence = [
      [mv1, 100],
      [mv2, 200],
      [mv3, 300],
    ];
    const result = createAnimationsFromSequence(sequence);

    // 3 sequential segments at 0.3s each → total = 0.9
    const def1 = defined(result.get(mv1));
    const def2 = defined(result.get(mv2));
    const def3 = defined(result.get(mv3));
    expect(def1.transition['default'].duration).toBeCloseTo(0.9, 5);
    expect(def2.transition['default'].duration).toBeCloseTo(0.9, 5);
    expect(def3.transition['default'].duration).toBeCloseTo(0.9, 5);
  });

  it('handles absolute time positioning with { at: 0.5 }', () => {
    const mv1 = motionValue(0);
    const mv2 = motionValue(0);
    const sequence: AnimationSequence = [
      [mv1, 100],
      [mv2, 200, { at: 0.5 }],
    ];
    const result = createAnimationsFromSequence(sequence);

    // mv1: 0 → 0.3
    // mv2: placed at absolute time 0.5, ends at 0.8
    // totalDuration = 0.8
    const def2 = defined(result.get(mv2));
    expect(def2.transition['default'].duration).toBeCloseTo(0.8, 5);

    // Verify that mv2's keyframe times reflect 0.5 / 0.8 start offset
    const times2 = defined(def2.transition['default'].times);
    // First keyframe should be at 0 (padding), then actual start at 0.5/0.8 ≈ 0.625
    expect(times2[0]).toBeCloseTo(0, 5);
    expect(times2[1]).toBeCloseTo(0.625, 5);
  });

  it('handles { at: 0 } to place segment at start regardless of current time', () => {
    const mv1 = motionValue(0);
    const mv2 = motionValue(0);
    const sequence: AnimationSequence = [
      [mv1, 100],
      [mv2, 200, { at: 0 }],
    ];
    const result = createAnimationsFromSequence(sequence);

    // mv1: 0 → 0.3
    // mv2: placed at absolute time 0, ends at 0.3
    // totalDuration = 0.3
    const def1 = defined(result.get(mv1));
    const def2 = defined(result.get(mv2));
    expect(def1.transition['default'].duration).toBeCloseTo(0.3, 5);
    expect(def2.transition['default'].duration).toBeCloseTo(0.3, 5);
  });

  it('handles mixed sequential and overlapping segments', () => {
    const mv1 = motionValue(0);
    const mv2 = motionValue(0);
    const mv3 = motionValue(0);
    const sequence: AnimationSequence = [
      [mv1, 100],                     // 0 → 0.3 (sequential)
      [mv2, 200, { at: '<' }],        // starts at prev start (0), 0 → 0.3
      [mv3, 300],                     // sequential from end of mv2's contribution to currentTime
    ];
    const result = createAnimationsFromSequence(sequence);

    // mv1: 0 → 0.3. prevTime = 0, currentTime = 0.3.
    // mv2: at '<' → currentTime = prev (0). 0 → 0.3. prevTime = 0, currentTime = 0 + 0.3 = 0.3.
    // mv3: sequential → 0.3 → 0.6.
    // totalDuration = 0.6
    expect(result.size).toBe(3);
    const def3 = defined(result.get(mv3));
    expect(def3.transition['default'].duration).toBeCloseTo(0.6, 5);
  });

  it('returns keyframes with null for wildcard start when single value is given', () => {
    const mv = motionValue(50);
    const sequence: AnimationSequence = [[mv, 100]];
    const result = createAnimationsFromSequence(sequence);

    const kf = defined(result.get(mv)).keyframes['default'];
    // When a single value is provided, a null is unshifted to represent "from current"
    expect(kf[0]).toBeNull();
  });

  it('handles repeated segment with keyframe array', () => {
    const mv = motionValue(0);
    const sequence: AnimationSequence = [
      [mv, [0, 100], { repeat: 1 }],
    ];
    const result = createAnimationsFromSequence(sequence);

    const def = defined(result.get(mv));
    // repeat: 1 → duration doubled: 0.3 * 2 = 0.6
    expect(def.transition['default'].duration).toBeCloseTo(0.6, 5);

    // Keyframes should contain repeated values
    const kf = def.keyframes['default'];
    // Original: [0, 100], repeated: [0, 100, 0, 100] plus possible padding
    expect(kf.length).toBeGreaterThanOrEqual(4);
  });

  it('handles SequenceLabelWithTime using relative time', () => {
    const mv1 = motionValue(0);
    const mv2 = motionValue(0);
    const sequence: AnimationSequence = [
      [mv1, 100],
      { name: 'mid', at: '+0.2' },
      [mv2, 200, { at: 'mid' }],
    ];
    const result = createAnimationsFromSequence(sequence);

    // After mv1: currentTime = 0.3, prevTime = 0
    // { name: 'mid', at: '+0.2' } → calcNextTime(0.3, '+0.2', 0, labels) = max(0, 0.3+0.2) = 0.5
    // mv2 at 'mid' = 0.5, ends at 0.8
    // totalDuration = 0.8
    const def2 = defined(result.get(mv2));
    expect(def2.transition['default'].duration).toBeCloseTo(0.8, 5);
  });

  it('preserves per-segment easing in the output', () => {
    const mv = motionValue(0);
    const sequence: AnimationSequence = [
      [mv, 100, { ease: 'linear' }],
    ];
    const result = createAnimationsFromSequence(sequence);

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- narrowing union type for test assertion
    const ease = defined(result.get(mv)).transition['default'].ease as string[];
    // The ease array should include 'linear' from the segment's transition
    expect(ease).toContain('linear');
  });

  it('handles a sequence with only labels and no animation segments', () => {
    const sequence: AnimationSequence = [
      'startLabel',
      { name: 'endLabel', at: 1.0 },
    ];
    const result = createAnimationsFromSequence(sequence);

    // No animation segments → no definitions
    expect(result.size).toBe(0);
  });

  it('handles overlapping segments on same MotionValue (later overwrites)', () => {
    const mv = motionValue(0);
    const sequence: AnimationSequence = [
      [mv, 100],
      [mv, 200, { at: 0 }],
    ];
    const result = createAnimationsFromSequence(sequence);

    expect(result.size).toBe(1);

    const def = defined(result.get(mv));
    const kf = def.keyframes['default'];
    // The second segment at: 0 overwrites (erases) the first segment's keyframes
    // in the overlapping [0, 0.3] time range.
    // The final keyframes should reflect the second segment's target (200)
    const nonNullKeyframes = kf.filter((k) => k !== null);
    expect(nonNullKeyframes).toContain(200);
  });

  it('handles sequenceTransition options like delay', () => {
    const mv = motionValue(0);
    const sequence: AnimationSequence = [[mv, 100]];
    const result = createAnimationsFromSequence(sequence, { delay: 0.5 });

    const def = defined(result.get(mv));
    // sequenceTransition spreads into the final transition object
    expect(def.transition['default'].delay).toBe(0.5);
  });

  it('computes times as normalized offsets within total duration', () => {
    const mv1 = motionValue(0);
    const mv2 = motionValue(0);
    const sequence: AnimationSequence = [
      [mv1, 100],
      [mv2, 200],
    ];
    const result = createAnimationsFromSequence(sequence);

    // totalDuration = 0.6
    // mv1: keyframes at [0, 0.3] → normalized [0, 0.5]
    // With padding: times should start at 0 and include 0.5
    const times1 = defined(defined(result.get(mv1)).transition['default'].times);
    expect(times1[0]).toBeCloseTo(0, 5);
    // The actual keyframe(s) should be at 0 and 0.5
    expect(times1).toContain(0);
    // Last time should be 1 (padding to fill rest of timeline)
    expect(times1[times1.length - 1]).toBeCloseTo(1, 5);

    // mv2: keyframes at [0.3, 0.6] → normalized [0.5, 1.0]
    const times2 = defined(defined(result.get(mv2)).transition['default'].times);
    expect(times2[0]).toBeCloseTo(0, 5);
    expect(times2[times2.length - 1]).toBeCloseTo(1, 5);
  });
});
