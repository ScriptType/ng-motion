import { getFeatureDefinitions } from 'motion-dom';
import { initNgmFeatures, loadNgmFeatures, _resetFeatureInit } from './feature-init';

describe('initNgmFeatures', () => {
  beforeEach(() => {
    _resetFeatureInit();
  });

  it('registers animation feature definition', () => {
    initNgmFeatures();
    const defs = getFeatureDefinitions();
    expect(defs.animation).toBeDefined();
    expect(defs.animation?.Feature).toBeDefined();
    expect(defs.animation?.isEnabled).toBeInstanceOf(Function);
  });

  it('is idempotent — second call does not throw', () => {
    initNgmFeatures();
    expect(() => {
      initNgmFeatures();
    }).not.toThrow();
  });

  it('isEnabled returns true when animate prop is present', () => {
    initNgmFeatures();
    const defs = getFeatureDefinitions();
    const isEnabled = defs.animation?.isEnabled;
    expect(isEnabled?.({ animate: { opacity: 1 } })).toBe(true);
  });

  it('isEnabled returns true when variants prop is present', () => {
    initNgmFeatures();
    const defs = getFeatureDefinitions();
    const isEnabled = defs.animation?.isEnabled;
    expect(isEnabled?.({ variants: { open: { opacity: 1 } } })).toBe(true);
  });

  it('isEnabled returns true when whileHover prop is present', () => {
    initNgmFeatures();
    const defs = getFeatureDefinitions();
    const isEnabled = defs.animation?.isEnabled;
    expect(isEnabled?.({ whileHover: { scale: 1.1 } })).toBe(true);
  });

  it('isEnabled returns false when no animation props are present', () => {
    initNgmFeatures();
    const defs = getFeatureDefinitions();
    const isEnabled = defs.animation?.isEnabled;
    expect(isEnabled?.({})).toBe(false);
  });
});

describe('loadNgmFeatures', () => {
  it('merges additional feature definitions', () => {
    initNgmFeatures();
    loadNgmFeatures({
      hover: {
        isEnabled: () => true,
      },
    });
    const defs = getFeatureDefinitions();
    expect(defs.hover).toBeDefined();
    expect(defs.animation).toBeDefined();
  });
});
