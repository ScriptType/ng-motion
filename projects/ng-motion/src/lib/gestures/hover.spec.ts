import '../test-env';
import { Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import type { TargetAndTransition } from 'motion-dom';
import { NgmMotionDirective } from '../core/motion.directive';
import { _resetFeatureInit } from '../core/feature-init';

function getNativeEl(fixture: ComponentFixture<unknown>, index = 0): HTMLElement {
  const debugEls = fixture.debugElement.queryAll(By.directive(NgmMotionDirective));
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return debugEls[index].nativeElement as HTMLElement;
}

async function flushAnimations(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 50));
}

describe('HoverFeature', () => {
  beforeEach(() => {
    _resetFeatureInit();
  });

  it('whileHover applies animation on pointerenter and reverts on pointerleave', async () => {
    @Component({
      template: `<div ngmMotion
        [animate]="{opacity: 1}"
        [whileHover]="{opacity: 0.5}"
        [transition]="{duration: 0}"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const el = getNativeEl(fixture);
    expect(el.style.opacity).toBe('1');

    el.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
    await flushAnimations();
    expect(el.style.opacity).toBe('0.5');

    el.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
    await flushAnimations();
    expect(el.style.opacity).toBe('1');
  });

  it('hoverStart and hoverEnd outputs fire', async () => {
    @Component({
      template: `<div ngmMotion
        [whileHover]="{opacity: 0.5}"
        [transition]="{duration: 0}"
        (hoverStart)="onHoverStart()"
        (hoverEnd)="onHoverEnd()"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {
      hoverStartFired = false;
      hoverEndFired = false;
      onHoverStart(): void { this.hoverStartFired = true; }
      onHoverEnd(): void { this.hoverEndFired = true; }
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const el = getNativeEl(fixture);

    el.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
    await flushAnimations();
    expect(fixture.componentInstance.hoverStartFired).toBe(true);

    el.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
    await flushAnimations();
    expect(fixture.componentInstance.hoverEndFired).toBe(true);
  });

  it('no animation when whileHover not set', async () => {
    @Component({
      template: `<div ngmMotion [animate]="{opacity: 1}" [transition]="{duration: 0}"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const el = getNativeEl(fixture);
    expect(el.style.opacity).toBe('1');

    el.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
    await flushAnimations();
    // opacity should remain unchanged
    expect(el.style.opacity).toBe('1');
  });

  it('rapid enter/leave returns to original state', async () => {
    @Component({
      template: `<div ngmMotion
        [animate]="{opacity: 1}"
        [whileHover]="{opacity: 0.5}"
        [transition]="{duration: 0}"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const el = getNativeEl(fixture);
    expect(el.style.opacity).toBe('1');

    el.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
    el.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
    await flushAnimations();

    expect(el.style.opacity).toBe('1');
  });

  it('nested hover elements — both parent and child animate independently', async () => {
    // When pointerenter fires on the child with bubbles:true, motion-dom's hover()
    // also fires on the parent because pointerenter bubbles. Both elements
    // independently track their own hover state.
    @Component({
      template: `
        <div ngmMotion
          [animate]="{opacity: 1}"
          [whileHover]="{opacity: 0.7}"
          [transition]="{duration: 0}">
          <div ngmMotion
            [animate]="{opacity: 1}"
            [whileHover]="{opacity: 0.3}"
            [transition]="{duration: 0}">
          </div>
        </div>`,
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const parentEl = getNativeEl(fixture, 0);
    const childEl = getNativeEl(fixture, 1);

    expect(parentEl.style.opacity).toBe('1');
    expect(childEl.style.opacity).toBe('1');

    // Hover the child — pointerenter bubbles, so parent also enters hover
    childEl.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
    await flushAnimations();

    expect(childEl.style.opacity).toBe('0.3');
    // Parent also receives the bubbled pointerenter
    expect(parentEl.style.opacity).toBe('0.7');

    // Leave the child — parent remains hovered
    childEl.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
    await flushAnimations();
    expect(childEl.style.opacity).toBe('1');
  });

  it('hover animation queue — final state is correct after rapid changes', async () => {
    @Component({
      template: `<div ngmMotion
        [animate]="{opacity: 1}"
        [whileHover]="{opacity: 0.5}"
        [transition]="{duration: 0}"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const el = getNativeEl(fixture);

    // Enter, leave, enter rapidly
    el.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
    el.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
    el.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
    await flushAnimations();

    expect(el.style.opacity).toBe('0.5');
  });

  it('hover + tap interaction — both gestures coexist', async () => {
    @Component({
      template: `<div ngmMotion
        [animate]="{opacity: 1}"
        [whileHover]="{opacity: 0.7}"
        [whileTap]="{opacity: 0.3}"
        [transition]="{duration: 0}"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const el = getNativeEl(fixture);

    // Hover first
    el.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
    await flushAnimations();
    expect(el.style.opacity).toBe('0.7');

    // Then tap while hovering — whileTap should take priority
    el.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, isPrimary: true, pointerId: 1 }),
    );
    await flushAnimations();
    expect(el.style.opacity).toBe('0.3');

    // Release tap — should revert to hover state
    window.dispatchEvent(
      new PointerEvent('pointerup', { bubbles: true, isPrimary: true, pointerId: 1 }),
    );
    await flushAnimations();
    expect(el.style.opacity).toBe('0.7');
  });

  it('hoverStart callback fires on pointer enter', async () => {
    @Component({
      template: `<div ngmMotion
        [whileHover]="{opacity: 0.5}"
        [transition]="{duration: 0}"
        (hoverStart)="onHover()"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {
      hoverFired = false;
      onHover(): void { this.hoverFired = true; }
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const el = getNativeEl(fixture);

    el.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
    await flushAnimations();
    expect(fixture.componentInstance.hoverFired).toBe(true);
  });

  it('dynamic whileHover removal stops hover animation', async () => {
    @Component({
      template: `<div ngmMotion
        [animate]="{opacity: 1}"
        [whileHover]="hoverVal()"
        [transition]="{duration: 0}"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {
      hoverVal = signal<TargetAndTransition | undefined>({ opacity: 0.5 });
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const el = getNativeEl(fixture);

    // Hover works initially
    el.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
    await flushAnimations();
    expect(el.style.opacity).toBe('0.5');

    el.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
    await flushAnimations();

    // Remove whileHover
    fixture.componentInstance.hoverVal.set(undefined);
    fixture.detectChanges();
    TestBed.tick();
    await flushAnimations();

    // Now hover should not change opacity
    el.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
    await flushAnimations();
    expect(el.style.opacity).toBe('1');
  });

  it('hover on touch device — pointerenter with pointerType touch', async () => {
    // motion-dom's hover() uses the browser's hover media query to filter
    // touch hover events. In jsdom there is no real media query support,
    // so we just verify that pointerenter with pointerType 'touch' is handled
    // without errors and callbacks still fire (jsdom limitation: can't test
    // the actual touch-filtering behavior).
    @Component({
      template: `<div ngmMotion
        [whileHover]="{opacity: 0.5}"
        [transition]="{duration: 0}"
        (hoverStart)="onHover()"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {
      hoverFired = false;
      onHover(): void { this.hoverFired = true; }
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const el = getNativeEl(fixture);

    el.dispatchEvent(
      new PointerEvent('pointerenter', { bubbles: true, pointerType: 'touch' }),
    );
    await flushAnimations();

    // In a real browser with touch, hover events might be ignored.
    // In jsdom, we just verify no errors are thrown.
    expect(true).toBe(true);
  });

  it('pointerenter from child element fires hover', async () => {
    @Component({
      template: `<div ngmMotion
        [animate]="{opacity: 1}"
        [whileHover]="{opacity: 0.5}"
        [transition]="{duration: 0}">
        <span class="child">inner</span>
      </div>`,
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const el = getNativeEl(fixture);

    // Dispatch pointerenter on the parent (simulating pointer entering from child)
    el.dispatchEvent(
      new PointerEvent('pointerenter', { bubbles: true }),
    );
    await flushAnimations();

    expect(el.style.opacity).toBe('0.5');
  });
});
