import '../test-env';
import { TestBed } from '@angular/core/testing';
import { ApplicationInitStatus } from '@angular/core';
import { getFeatureDefinitions, setFeatureDefinitions } from 'motion-dom';
import { _resetFeatureInit } from './feature-init';
import {
  provideMotionFeatures,
  ngmAnimationFeatures,
  ngmAllFeatures,
  type NgmFeatureBundle,
} from './lazy-features';

describe('provideMotionFeatures', () => {
  beforeEach(() => {
    _resetFeatureInit();
    // Clear all feature definitions
    setFeatureDefinitions({});
  });

  it('registers sync animation features via APP_INITIALIZER', async () => {
    TestBed.configureTestingModule({
      providers: [provideMotionFeatures(ngmAnimationFeatures)],
    });
    // Flush APP_INITIALIZER
    await TestBed.inject(ApplicationInitStatus).donePromise;

    const defs = getFeatureDefinitions();
    expect(defs.animation).toBeDefined();
    expect(defs.hover).toBeDefined();
    expect(defs.tap).toBeDefined();
    expect(defs.focus).toBeDefined();
    expect(defs.inView).toBeDefined();
    expect(defs.exit).toBeDefined();
  });

  it('registers all features including drag and layout', async () => {
    TestBed.configureTestingModule({
      providers: [provideMotionFeatures(ngmAllFeatures)],
    });
    await TestBed.inject(ApplicationInitStatus).donePromise;

    const defs = getFeatureDefinitions();
    expect(defs.animation).toBeDefined();
    expect(defs.drag).toBeDefined();
    expect(defs.layout).toBeDefined();
  });

  it('registers async feature bundle', async () => {
    const asyncBundle = (): Promise<NgmFeatureBundle> => Promise.resolve(ngmAnimationFeatures);
    TestBed.configureTestingModule({
      providers: [provideMotionFeatures(asyncBundle)],
    });
    await TestBed.inject(ApplicationInitStatus).donePromise;

    const defs = getFeatureDefinitions();
    expect(defs.animation).toBeDefined();
    expect(defs.hover).toBeDefined();
  });

  it('merges multiple feature bundles', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideMotionFeatures(ngmAnimationFeatures),
        provideMotionFeatures({ layout: ngmAllFeatures.layout } satisfies NgmFeatureBundle),
      ],
    });
    await TestBed.inject(ApplicationInitStatus).donePromise;

    const defs = getFeatureDefinitions();
    expect(defs.animation).toBeDefined();
    expect(defs.layout).toBeDefined();
  });

  it('ngmAnimationFeatures does not include drag or layout', () => {
    expect(ngmAnimationFeatures.drag).toBeUndefined();
    expect(ngmAnimationFeatures.layout).toBeUndefined();
  });

  it('ngmAllFeatures includes drag and layout', () => {
    expect(ngmAllFeatures.drag).toBeDefined();
    expect(ngmAllFeatures.layout).toBeDefined();
  });
});
