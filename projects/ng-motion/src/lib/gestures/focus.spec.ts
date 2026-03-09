import '../test-env';
import { Component } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgmMotionDirective } from '../core/motion.directive';
import { _resetFeatureInit } from '../core/feature-init';

function getNativeEl(fixture: ComponentFixture<unknown>): HTMLElement {
  const debugEl = fixture.debugElement.query(By.directive(NgmMotionDirective));
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return debugEl.nativeElement as HTMLElement;
}

async function flushAnimations(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 50));
}

describe('FocusFeature', () => {
  beforeEach(() => {
    _resetFeatureInit();
  });

  it('whileFocus applies animation on focus', async () => {
    @Component({
      template: `<button ngmMotion
        [animate]="{opacity: 1}"
        [whileFocus]="{opacity: 0.5}"
        [transition]="{duration: 0}">Click me</button>`,
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const el = getNativeEl(fixture);
    expect(el.style.opacity).toBe('1');

    el.focus();
    await flushAnimations();
    expect(el.style.opacity).toBe('0.5');
  });

  it('whileFocus reverts animation on blur', async () => {
    @Component({
      template: `<button ngmMotion
        [animate]="{opacity: 1}"
        [whileFocus]="{opacity: 0.5}"
        [transition]="{duration: 0}">Click me</button>`,
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const el = getNativeEl(fixture);

    el.focus();
    await flushAnimations();
    expect(el.style.opacity).toBe('0.5');

    el.blur();
    await flushAnimations();
    expect(el.style.opacity).toBe('1');
  });

  it('no animation when whileFocus not set', async () => {
    @Component({
      template: `<button ngmMotion
        [animate]="{opacity: 1}"
        [transition]="{duration: 0}">Click me</button>`,
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const el = getNativeEl(fixture);
    expect(el.style.opacity).toBe('1');

    el.focus();
    await flushAnimations();
    // opacity should remain unchanged
    expect(el.style.opacity).toBe('1');
  });
});
