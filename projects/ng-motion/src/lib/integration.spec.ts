import './test-env';
import { Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import type { MotionValue } from 'motion-dom';
import { motionValue } from 'motion-dom';
import type { MotionStyle, Variants } from 'motion-dom';
import { NgmMotionDirective } from './core/motion.directive';
import { provideMotionConfig } from './core/motion-config';
import { _resetFeatureInit } from './core/feature-init';
import { useMotionValue } from './values/use-motion-value';
import { useSpring } from './values/use-spring';

// ─── Helpers ────────────────────────────────────────────────────────────────

function getDirective(
  fixture: ComponentFixture<unknown>,
  index = 0,
): NgmMotionDirective {
  const debugEls = fixture.debugElement.queryAll(By.directive(NgmMotionDirective));
  return debugEls[index].injector.get(NgmMotionDirective);
}

function getNativeEl(
  fixture: ComponentFixture<unknown>,
  index = 0,
): HTMLElement {
  const debugEls = fixture.debugElement.queryAll(By.directive(NgmMotionDirective));
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- DebugElement.nativeElement is typed as any
  return debugEls[index].nativeElement as HTMLElement;
}

async function flushAnimations(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 50));
}

// ─── Integration Tests ──────────────────────────────────────────────────────

describe('ng-motion integration', () => {
  beforeEach(() => {
    _resetFeatureInit();
  });

  // ════════════════════════════════════════════════════════════════════════
  // 1. Directive + MotionValue style binding + animation events
  // ════════════════════════════════════════════════════════════════════════

  it('combines MotionValue style binding with animate target and animation events', async () => {
    @Component({
      template: `<div ngmMotion
        [style]="s"
        [animate]="{x: 100}"
        [transition]="{duration: 0}"
        (animationStart)="onStart($event)"
        (animationComplete)="onComplete($event)"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {
      mv = motionValue(0.5);
      s: MotionStyle = { opacity: this.mv };
      started = false;
      completed = false;
      startDef: unknown;
      completeDef: unknown;
      onStart(def: unknown): void {
        this.started = true;
        this.startDef = def;
      }
      onComplete(def: unknown): void {
        this.completed = true;
        this.completeDef = def;
      }
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const dir = getDirective(fixture);
    const el = getNativeEl(fixture);

    // MotionValue is bound to the VisualElement
    expect(dir.ve).toBeTruthy();
    if (!dir.ve) return;
    expect(dir.ve.getValue('opacity')).toBeDefined();

    // MotionValue applies its value to the DOM
    dir.ve.render();
    expect(el.style.opacity).toBe('0.5');

    // Wait for duration:0 animation to complete
    await flushAnimations();

    // Animation events fired
    expect(fixture.componentInstance.started).toBe(true);
    expect(fixture.componentInstance.completed).toBe(true);

    // Animate target applied to DOM
    expect(el.style.transform).toContain('translateX(100px)');

    // MotionValue still active — update it and verify DOM reflects change
    fixture.componentInstance.mv.set(0.9);
    await flushAnimations();
    expect(el.style.opacity).toBe('0.9');
  });

  it('animates a spring-followed MotionValue style when its source updates', async () => {
    @Component({
      template: `<div ngmMotion [style]="s"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {
      readonly rawX: MotionValue<number>;
      readonly springX: MotionValue<number>;
      readonly s: MotionStyle;

      constructor() {
        this.rawX = useMotionValue(0);
        this.springX = useSpring(this.rawX, { stiffness: 180, damping: 24 });
        this.s = { x: this.springX };
      }
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const host = fixture.componentInstance;
    const el = getNativeEl(fixture);
    const springDir = getDirective(fixture);
    expect(springDir.ve).toBeTruthy();
    springDir.ve?.render();

    expect(el.style.transform).toBe('none');

    host.rawX.set(100);

    await new Promise((resolve) => setTimeout(resolve, 80));
    expect(host.springX.get()).toBeGreaterThan(0);
    expect(host.springX.get()).toBeLessThan(100);

    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(Math.abs(host.springX.get() - 100)).toBeLessThan(5);
    expect(el.style.transform).toContain('translateX(');
  });

  // ════════════════════════════════════════════════════════════════════════
  // 2. Variant orchestration with parent-child + config injection
  // ════════════════════════════════════════════════════════════════════════

  it('orchestrates parent-child variants with injected config transition', async () => {
    @Component({
      template: `
        <div ngmMotion [initial]="'hidden'" [animate]="'visible'" [variants]="parentV">
          <span ngmMotion [variants]="childV"></span>
        </div>`,
      imports: [NgmMotionDirective],
      providers: [provideMotionConfig({ transition: { duration: 0 } })],
    })
    class Host {
      parentV: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      };
      childV: Variants = {
        hidden: { opacity: 0, x: -30 },
        visible: { opacity: 0.9, x: 60 },
      };
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const parentEl = getNativeEl(fixture, 0);
    const childEl = getNativeEl(fixture, 1);

    // Parent animated to visible state
    expect(parentEl.style.opacity).toBe('1');

    // Child inherited variant label from parent and animated
    expect(childEl.style.opacity).toBe('0.9');
    expect(childEl.style.transform).toContain('translateX(60px)');

    // Verify parent-child VE hierarchy
    const parentDir = getDirective(fixture, 0);
    const childDir = getDirective(fixture, 1);
    expect(parentDir.ve).toBeTruthy();
    expect(childDir.ve).toBeTruthy();
    if (!parentDir.ve || !childDir.ve) return;
    expect(childDir.ve.parent).toBe(parentDir.ve);

    // Config transition was injected (parent has no explicit transition input)
    expect(parentDir.ve.getProps().transition).toEqual({ duration: 0 });
  });

  // ════════════════════════════════════════════════════════════════════════
  // 3. Dynamic input changes with signal-driven animation
  // ════════════════════════════════════════════════════════════════════════

  it('reacts to signal-driven animate input changes', async () => {
    @Component({
      template: `<div ngmMotion
        [initial]="{opacity: 0, x: 0}"
        [animate]="anim()"
        [transition]="{duration: 0}"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {
      anim = signal<Record<string, number>>({ opacity: 1, x: 0 });
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    await flushAnimations();

    const el = getNativeEl(fixture);

    // Initial animation completed — opacity is 1, x is 0
    expect(el.style.opacity).toBe('1');

    // Change signal to new target
    fixture.componentInstance.anim.set({ opacity: 0.5, x: 200 });
    fixture.detectChanges();
    TestBed.tick();
    fixture.detectChanges();
    await fixture.whenStable();
    await flushAnimations();

    // DOM updated to new target
    expect(el.style.opacity).toBe('0.5');
    expect(el.style.transform).toContain('translateX(200px)');

    // Change again to verify repeated updates work
    fixture.componentInstance.anim.set({ opacity: 1, x: 0 });
    fixture.detectChanges();
    TestBed.tick();
    fixture.detectChanges();
    await fixture.whenStable();
    await flushAnimations();

    expect(el.style.opacity).toBe('1');
    // x: 0 means no translateX or translateX(0px)
    // motion-dom may render 'none' for zero transforms
  });

  // ════════════════════════════════════════════════════════════════════════
  // 4. Full lifecycle: mount → animate → update → destroy
  // ════════════════════════════════════════════════════════════════════════

  it('handles full lifecycle: mount, animate, update, destroy', async () => {
    @Component({
      template: `@if (show()) {
        <div ngmMotion
          [initial]="{opacity: 0}"
          [animate]="anim()"
          [transition]="{duration: 0}"
          (animationComplete)="onComplete()"></div>
      }`,
      imports: [NgmMotionDirective],
    })
    class Host {
      show = signal(true);
      anim = signal<Record<string, number>>({ opacity: 1 });
      completions = 0;
      onComplete(): void {
        this.completions++;
      }
    }

    const fixture = TestBed.createComponent(Host);

    // ── Mount ──
    fixture.detectChanges();
    await fixture.whenStable();

    const dir = getDirective(fixture);
    expect(dir.ve).not.toBeNull();

    // ── Animate ──
    await flushAnimations();

    const el = getNativeEl(fixture);
    expect(el.style.opacity).toBe('1');
    expect(fixture.componentInstance.completions).toBeGreaterThanOrEqual(1);

    // ── Update ──
    const completionsBefore = fixture.componentInstance.completions;
    fixture.componentInstance.anim.set({ opacity: 0.3 });
    fixture.detectChanges();
    TestBed.tick();
    fixture.detectChanges();
    await fixture.whenStable();
    await flushAnimations();

    expect(el.style.opacity).toBe('0.3');
    expect(fixture.componentInstance.completions).toBeGreaterThan(completionsBefore);

    // ── Destroy ──
    fixture.componentInstance.show.set(false);
    fixture.detectChanges();
    TestBed.tick();
    fixture.detectChanges();

    // After destroy, the directive's VE reference is nulled out
    expect(dir.ve).toBeNull();
  });
});
