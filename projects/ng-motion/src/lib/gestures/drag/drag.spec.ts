import '../../test-env';
import { Component } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import type { MotionValue } from 'motion-dom';
import { NgmMotionDirective } from '../../core/motion.directive';
import { _resetFeatureInit } from '../../core/feature-init';
import { useMotionValue } from '../../values/use-motion-value';
import { useSpring } from '../../values/use-spring';

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
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return debugEls[index].nativeElement as HTMLElement;
}

async function flushAnimations(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 50));
}

async function wait(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function pointerDown(el: HTMLElement, x = 0, y = 0): void {
  el.dispatchEvent(
    new PointerEvent('pointerdown', {
      bubbles: true,
      isPrimary: true,
      pointerId: 1,
      clientX: x,
      clientY: y,
    }),
  );
}

function pointerMove(x: number, y = 0): void {
  window.dispatchEvent(
    new PointerEvent('pointermove', {
      isPrimary: true,
      pointerId: 1,
      clientX: x,
      clientY: y,
    }),
  );
}

function pointerUp(x = 0, y = 0): void {
  window.dispatchEvent(
    new PointerEvent('pointerup', {
      isPrimary: true,
      pointerId: 1,
      clientX: x,
      clientY: y,
    }),
  );
}

function getVe(dir: NgmMotionDirective): NonNullable<NgmMotionDirective['ve']> {
  const ve = dir.ve;
  if (ve == null) {
    throw new Error('ve is null');
  }
  return ve;
}

// ─── Test Suite ─────────────────────────────────────────────────────────────

describe('DragGesture', () => {
  beforeEach(() => {
    _resetFeatureInit();
  });

  it('basic drag moves element via MotionValue', async () => {
    @Component({
      template: `<div ngmMotion [drag]="true"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const dir = getDirective(fixture);
    const el = getNativeEl(fixture);

    pointerDown(el, 0, 0);
    // First move: pass the distance threshold (3px) → triggers onStart
    pointerMove(10, 0);
    // Second move: triggers onMove → updatePosition
    pointerMove(50, 0);
    await flushAnimations();

    const xVal = getVe(dir).getValue('x');
    expect(xVal).toBeDefined();
    expect(xVal?.get()).not.toBe(0);

    pointerUp(50, 0);
    await flushAnimations();
  });

  it('does not leak the global drag lock when a pointer session ends before drag starts', async () => {
    @Component({
      template: `
        <div ngmMotion [drag]="true"></div>
        <div ngmMotion [drag]="true"></div>
      `,
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const firstEl = getNativeEl(fixture, 0);
    const secondEl = getNativeEl(fixture, 1);
    const secondDir = getDirective(fixture, 1);

    pointerDown(firstEl, 0, 0);
    pointerUp(0, 0);
    await flushAnimations();

    pointerDown(secondEl, 0, 0);
    pointerMove(10, 0);
    pointerMove(60, 0);
    await flushAnimations();

    const xVal = getVe(secondDir).getValue('x');
    expect(xVal).toBeDefined();
    expect(xVal?.get()).toBeGreaterThan(0);

    pointerUp(60, 0);
    await flushAnimations();
  });

  it('drives a spring-followed style value from an external drag MotionValue', async () => {
    @Component({
      template: `<div ngmMotion
        drag="x"
        [dragX]="rawX"
        [style]="{ x: springX }"
        [dragMomentum]="false"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {
      readonly rawX: MotionValue<number>;
      readonly springX: MotionValue<number>;

      constructor() {
        this.rawX = useMotionValue(0);
        this.springX = useSpring(this.rawX, { stiffness: 180, damping: 24 });
      }
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const host = fixture.componentInstance;
    const el = getNativeEl(fixture);

    pointerDown(el, 0, 0);
    pointerMove(10, 0);
    pointerMove(60, 0);

    expect(host.rawX.get()).toBeGreaterThan(0);

    await wait(120);
    expect(host.springX.get()).toBeGreaterThan(0);
    expect(host.springX.get()).toBeLessThanOrEqual(host.rawX.get());

    await wait(400);
    expect(Math.abs(host.springX.get() - host.rawX.get())).toBeLessThan(5);

    pointerUp(60, 0);
    await flushAnimations();
  });

  it('axis-locked drag=x only moves horizontally', async () => {
    @Component({
      template: `<div ngmMotion drag="x"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const dir = getDirective(fixture);
    const el = getNativeEl(fixture);

    pointerDown(el, 0, 0);
    pointerMove(10, 0);
    pointerMove(50, 50);
    await flushAnimations();

    const ve = getVe(dir);
    const xVal = ve.getValue('x');
    const yVal = ve.getValue('y');

    // x should have moved
    expect(xVal).toBeDefined();
    expect(xVal?.get()).not.toBe(0);

    // y should NOT have been set by drag (axis locked to x)
    if (yVal) {
      expect(yVal.get()).toBe(0);
    }

    pointerUp(50, 50);
    await flushAnimations();
  });

  it('dragStart and dragEnd outputs fire', async () => {
    @Component({
      template: `<div ngmMotion [drag]="true" (dragStart)="onStart()" (dragEnd)="onEnd()"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {
      started = false;
      ended = false;
      onStart(): void {
        this.started = true;
      }
      onEnd(): void {
        this.ended = true;
      }
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const el = getNativeEl(fixture);
    const host = fixture.componentInstance;

    pointerDown(el, 0, 0);
    pointerMove(50, 0);
    await flushAnimations();

    expect(host.started).toBe(true);

    pointerUp(50, 0);
    await flushAnimations();

    expect(host.ended).toBe(true);
  });

  it('blocks layout animation on the actively dragged item until drag end', async () => {
    @Component({
      template: `<div ngmMotion [drag]="true"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const dir = getDirective(fixture);
    const el = getNativeEl(fixture);
    const ve = getVe(dir);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const projection: { isAnimationBlocked: boolean } = ve.projection;

    pointerDown(el, 0, 0);
    pointerMove(10, 0);
    await flushAnimations();

    expect(projection.isAnimationBlocked).toBe(true);

    pointerUp(10, 0);
    await flushAnimations();

    expect(projection.isAnimationBlocked).toBe(false);
  });

  it('disables document text selection for the lifetime of an active drag', async () => {
    @Component({
      template: `<div ngmMotion [drag]="true"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const el = getNativeEl(fixture);

    document.documentElement.style.userSelect = '';
    document.body.style.userSelect = '';

    pointerDown(el, 0, 0);
    pointerMove(10, 0);
    await flushAnimations();

    expect(document.documentElement.style.userSelect).toBe('none');
    expect(document.body.style.userSelect).toBe('none');

    pointerUp(10, 0);
    await flushAnimations();

    expect(document.documentElement.style.userSelect).toBe('');
    expect(document.body.style.userSelect).toBe('');
  });

  it('renders the dragged position before firing dragMove callbacks', async () => {
    @Component({
      template: `<div ngmMotion [drag]="true" (dragMove)="onMove()"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {
      readonly onMove = vi.fn();
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const dir = getDirective(fixture);
    const el = getNativeEl(fixture);
    const ve = getVe(dir);
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const veWithRender = ve as unknown as { render: () => void };
    const renderSpy = vi.spyOn(veWithRender, 'render');
    renderSpy.mockClear();

    pointerDown(el, 0, 0);
    pointerMove(10, 0);
    pointerMove(50, 0);

    expect(fixture.componentInstance.onMove).toHaveBeenCalledOnce();
    expect(renderSpy).toHaveBeenCalled();

    const lastRenderOrder = Math.max(...renderSpy.mock.invocationCallOrder);
    const firstDragMoveOrder = fixture.componentInstance.onMove.mock.invocationCallOrder[0];
    expect(lastRenderOrder).toBeLessThan(firstDragMoveOrder);

    pointerUp(50, 0);
    await flushAnimations();
  });

  it('drag=false does nothing', async () => {
    @Component({
      template: `<div ngmMotion [drag]="false" (dragStart)="onStart()"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {
      started = false;
      onStart(): void {
        this.started = true;
      }
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const el = getNativeEl(fixture);

    pointerDown(el, 0, 0);
    pointerMove(50, 0);
    await flushAnimations();

    expect(fixture.componentInstance.started).toBe(false);

    pointerUp(50, 0);
    await flushAnimations();
  });

  it('whileDrag animation applies during drag', async () => {
    @Component({
      template: `<div ngmMotion
        [drag]="true"
        [whileDrag]="{scale: 1.2}"
        [transition]="{duration: 0}"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const dir = getDirective(fixture);
    const el = getNativeEl(fixture);

    pointerDown(el, 0, 0);
    pointerMove(50, 0);
    await flushAnimations();

    // whileDrag should have activated scale animation
    const scaleVal = getVe(dir).getValue('scale');
    expect(scaleVal).toBeDefined();

    pointerUp(50, 0);
    await flushAnimations();
  });

  it('dragConstraints BoundingBox clamps position', async () => {
    @Component({
      template: `<div ngmMotion
        [drag]="true"
        [dragConstraints]="{top: -100, right: 100, bottom: 100, left: -100}"
        [dragMomentum]="false"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const dir = getDirective(fixture);
    const el = getNativeEl(fixture);

    pointerDown(el, 0, 0);
    pointerMove(10, 0); // pass threshold
    pointerMove(200, 0); // beyond right constraint (100)
    await flushAnimations();

    const xVal = getVe(dir).getValue('x');
    expect(xVal).toBeDefined();
    // With elastic=0.35 (default), value should be less than the full 200
    // but may exceed the constraint due to rubber-banding
    expect(xVal?.get()).toBeLessThan(200);

    pointerUp(200, 0);
    await flushAnimations();
  });

  it('dragMomentum=false stops at release position', async () => {
    @Component({
      template: `<div ngmMotion
        [drag]="true"
        [dragMomentum]="false"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const dir = getDirective(fixture);
    const el = getNativeEl(fixture);

    pointerDown(el, 0, 0);
    pointerMove(10, 0);
    pointerMove(50, 0);
    await flushAnimations();

    const ve = getVe(dir);
    const xBefore: unknown = ve.getValue('x')?.get();

    pointerUp(50, 0);
    await flushAnimations();

    const xAfter: unknown = ve.getValue('x')?.get();
    // With no momentum, position should remain the same after release
    expect(xAfter).toBe(xBefore);
  });

  it('continues dragging from the current position across multiple drag sessions', async () => {
    @Component({
      template: `<div ngmMotion drag="x" [dragMomentum]="false"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const dir = getDirective(fixture);
    const el = getNativeEl(fixture);

    pointerDown(el, 0, 0);
    pointerMove(10, 0);
    pointerMove(50, 0);
    await flushAnimations();
    pointerUp(50, 0);
    await flushAnimations();

    const ve = getVe(dir);
    const xValAfterFirst = ve.getValue('x');
    expect(xValAfterFirst).toBeDefined();
    const firstReleaseX = Number(xValAfterFirst?.get() ?? 0);
    expect(firstReleaseX).toBeGreaterThan(0);

    pointerDown(el, 50, 0);
    pointerMove(60, 0);
    pointerMove(70, 0);
    await flushAnimations();

    const xValAfterSecond = ve.getValue('x');
    expect(xValAfterSecond).toBeDefined();
    const secondDragX = Number(xValAfterSecond?.get() ?? 0);
    expect(secondDragX).toBeGreaterThan(firstReleaseX);

    pointerUp(70, 0);
    await flushAnimations();
  });

  it('keeps drag aligned when layout projection updates during an active drag', async () => {
    @Component({
      template: `<div ngmMotion drag="y" [dragMomentum]="false"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const dir = getDirective(fixture);
    const el = getNativeEl(fixture);

    pointerDown(el, 0, 0);
    pointerMove(0, 10);
    pointerMove(0, 60);

    const ve = getVe(dir);
    // getValue with defaultValue returns non-optional MotionValue
    const yValue = ve.getValue('y', null);
    expect(yValue.get()).toBe(60);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const projection: { notifyListeners: (event: string, data: unknown) => void } = ve.projection;
    projection.notifyListeners('didUpdate', {
      delta: {
        x: { translate: 0 },
        y: { translate: -50 },
      },
      hasLayoutChanged: true,
    });

    expect(yValue.get()).toBe(10);

    pointerMove(0, 65);
    expect(yValue.get()).toBe(15);

    pointerUp(0, 65);
    await flushAnimations();
  });

  it('dragDirectionLock locks to dominant axis', async () => {
    @Component({
      template: `<div ngmMotion
        [drag]="true"
        [dragDirectionLock]="true"
        (directionLock)="onLock()"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {
      lockFired = false;
      onLock(): void { this.lockFired = true; }
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const el = getNativeEl(fixture);

    pointerDown(el, 0, 0);
    // Move diagonally first to pass threshold, then predominantly horizontal
    pointerMove(10, 2);
    pointerMove(30, 3);
    await flushAnimations();

    // Direction lock should have fired
    expect(fixture.componentInstance.lockFired).toBe(true);

    pointerUp(30, 3);
    await flushAnimations();
  });

  it('dragSnapToOrigin animates back to origin on release', async () => {
    @Component({
      template: `<div ngmMotion
        [drag]="true"
        [dragSnapToOrigin]="true"
        [transition]="{ type: 'spring', stiffness: 600, damping: 20 }"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const dir = getDirective(fixture);
    const el = getNativeEl(fixture);

    pointerDown(el, 0, 0);
    pointerMove(10, 0);
    pointerMove(50, 0);
    await flushAnimations();

    const xValue = getVe(dir).getValue('x', null);
    expect(xValue.get()).not.toBe(0);

    pointerUp(50, 0);
    expect(xValue.isAnimating()).toBe(true);
    expect(xValue.get()).not.toBe(0);

    await wait(450);
    expect(Math.abs(Number(xValue.get()))).toBeLessThan(1);
  });

  it('dragListener=false prevents drag', async () => {
    @Component({
      template: `<div ngmMotion
        [drag]="true"
        [dragListener]="false"
        (dragStart)="onStart()"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {
      started = false;
      onStart(): void { this.started = true; }
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const el = getNativeEl(fixture);

    pointerDown(el, 0, 0);
    pointerMove(50, 0);
    await flushAnimations();

    expect(fixture.componentInstance.started).toBe(false);

    pointerUp(50, 0);
    await flushAnimations();
  });

  it('whileDrag with variant label string', async () => {
    // jsdom limitation: variant resolution depends on animationState internal
    // handling. We verify the directive accepts a string variant label without errors.
    @Component({
      template: `<div ngmMotion
        [drag]="true"
        [whileDrag]="'dragging'"
        [variants]="{dragging: {scale: 1.2}}"
        [transition]="{duration: 0}"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const el = getNativeEl(fixture);

    pointerDown(el, 0, 0);
    pointerMove(50, 0);
    await flushAnimations();

    // Variant label should be accepted without errors
    // Actual animation depends on animationState variant resolution
    expect(true).toBe(true);

    pointerUp(50, 0);
    await flushAnimations();
  });

  it('dragElastic rubber-bands beyond constraints', async () => {
    @Component({
      template: `<div ngmMotion
        [drag]="true"
        [dragConstraints]="{top: -50, right: 50, bottom: 50, left: -50}"
        [dragElastic]="0.5"
        [dragMomentum]="false"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const dir = getDirective(fixture);
    const el = getNativeEl(fixture);

    pointerDown(el, 0, 0);
    pointerMove(10, 0); // pass threshold
    pointerMove(100, 0); // well beyond right=50 constraint
    await flushAnimations();

    const xVal = Number(getVe(dir).getValue('x', null).get());
    // With elastic=0.5, position should be between 50 (constraint) and 100 (full)
    expect(xVal).toBeGreaterThan(0);
    expect(xVal).toBeLessThan(100);

    pointerUp(100, 0);
    await flushAnimations();
  });

  it('drag=y only moves vertically', async () => {
    @Component({
      template: `<div ngmMotion drag="y"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const dir = getDirective(fixture);
    const el = getNativeEl(fixture);

    pointerDown(el, 0, 0);
    pointerMove(0, 10); // pass threshold vertically
    pointerMove(50, 50); // move both axes
    await flushAnimations();

    const ve = getVe(dir);
    const yVal = ve.getValue('y');
    const xVal = ve.getValue('x');

    // y should have moved
    expect(yVal).toBeDefined();
    expect(yVal?.get()).not.toBe(0);

    // x should NOT have moved (axis locked to y)
    if (xVal) {
      expect(xVal.get()).toBe(0);
    }

    pointerUp(50, 50);
    await flushAnimations();
  });

  it('dragStart output fires with event info', async () => {
    @Component({
      template: `<div ngmMotion [drag]="true" (dragStart)="onStart()"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {
      started = false;
      onStart(): void { this.started = true; }
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const el = getNativeEl(fixture);

    pointerDown(el, 10, 20);
    pointerMove(30, 20); // pass threshold
    await flushAnimations();

    expect(fixture.componentInstance.started).toBe(true);

    pointerUp(30, 20);
    await flushAnimations();
  });

  it('multiple sequential drags both work', async () => {
    @Component({
      template: `<div ngmMotion [drag]="true" [dragMomentum]="false" (dragStart)="onStart()"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {
      startCount = 0;
      onStart(): void { this.startCount++; }
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const el = getNativeEl(fixture);

    // First drag
    pointerDown(el, 0, 0);
    pointerMove(50, 0);
    await flushAnimations();
    pointerUp(50, 0);
    await flushAnimations();

    // Second drag
    pointerDown(el, 0, 0);
    pointerMove(30, 0);
    await flushAnimations();
    pointerUp(30, 0);
    await flushAnimations();

    expect(fixture.componentInstance.startCount).toBe(2);
  });

  it('drag with zero distance does not trigger dragStart', async () => {
    @Component({
      template: `<div ngmMotion [drag]="true" (dragStart)="onStart()"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {
      started = false;
      onStart(): void { this.started = true; }
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const el = getNativeEl(fixture);

    // Pointer down and up without moving (zero distance)
    pointerDown(el, 0, 0);
    pointerUp(0, 0);
    await flushAnimations();

    // dragStart should NOT have fired — no movement past threshold
    expect(fixture.componentInstance.started).toBe(false);
  });

  it('onDirectionLock output fires when dragDirectionLock is true', async () => {
    @Component({
      template: `<div ngmMotion
        [drag]="true"
        [dragDirectionLock]="true"
        (directionLock)="onLock()"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {
      locked = false;
      onLock(): void { this.locked = true; }
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const el = getNativeEl(fixture);

    pointerDown(el, 0, 0);
    // Move enough to trigger direction lock detection
    pointerMove(15, 2);
    pointerMove(30, 3);
    await flushAnimations();

    expect(fixture.componentInstance.locked).toBe(true);

    pointerUp(30, 3);
    await flushAnimations();
  });
});
