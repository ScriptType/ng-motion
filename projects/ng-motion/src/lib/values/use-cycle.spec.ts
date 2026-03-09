import '../test-env';
import { useCycle } from './use-cycle';

describe('useCycle', () => {
  it('initial value is first item', () => {
    const [current] = useCycle('a', 'b', 'c');
    expect(current()).toBe('a');
  });

  it('cycle() advances to next item', () => {
    const [current, cycle] = useCycle('a', 'b', 'c');
    cycle();
    expect(current()).toBe('b');
  });

  it('cycle() wraps around to first item', () => {
    const [current, cycle] = useCycle('a', 'b', 'c');
    cycle(); // b
    cycle(); // c
    cycle(); // a (wrap)
    expect(current()).toBe('a');
  });

  it('cycle(explicit index) jumps to specific item', () => {
    const [current, cycle] = useCycle('a', 'b', 'c');
    cycle(2);
    expect(current()).toBe('c');
  });

  it('works with various types (strings, objects)', () => {
    const obj1 = { x: 1 };
    const obj2 = { x: 2 };
    const [current, cycle] = useCycle(obj1, obj2);
    expect(current()).toBe(obj1);
    cycle();
    expect(current()).toBe(obj2);
  });
});
