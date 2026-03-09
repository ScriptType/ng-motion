import { signal } from '@angular/core';
import { resolveInput, isSignal } from './coerce';

describe('resolveInput', () => {
  it('returns raw value for non-signal', () => {
    expect(resolveInput(42)).toBe(42);
  });

  it('returns raw value for string', () => {
    expect(resolveInput('hello')).toBe('hello');
  });

  it('unwraps Angular signal', () => {
    const sig = signal(99);
    expect(resolveInput(sig)).toBe(99);
  });

  it('unwraps signal with object value', () => {
    const obj = { x: 1, y: 2 };
    const sig = signal(obj);
    expect(resolveInput(sig)).toBe(obj);
  });
});

describe('isSignal', () => {
  it('returns true for Angular signals', () => {
    const sig = signal(0);
    expect(isSignal(sig)).toBe(true);
  });

  it('returns false for plain values', () => {
    expect(isSignal(42)).toBe(false);
    expect(isSignal('hello')).toBe(false);
    expect(isSignal(null)).toBe(false);
    expect(isSignal(undefined)).toBe(false);
  });
});
