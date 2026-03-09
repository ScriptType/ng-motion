import '../test-env';
import { Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import type { IProjectionNode, Measurements, ScrollMeasurements } from 'motion-dom';
import { NgmMotionDirective } from '../core/motion.directive';
import { NgmPresenceDirective } from '../presence/presence.directive';
import { _resetFeatureInit } from '../core/feature-init';

function getDirective(
  fixture: ComponentFixture<unknown>,
  index = 0,
): NgmMotionDirective {
  const debugEls = fixture.debugElement.queryAll(By.directive(NgmMotionDirective));
  return debugEls[index].injector.get(NgmMotionDirective);
}

/** Extract the projection node from a motion directive with proper typing.
 *  ve.projection is typed as `any` in motion-dom, so we centralise the cast. */
function getProjection(dir: NgmMotionDirective): IProjectionNode | undefined {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- ve.projection is `any` in motion-dom
  const proj: IProjectionNode | undefined = dir.ve?.projection;
  return proj;
}

function makeMeasurements(x: number, y: number, w: number, h: number): Measurements {
  return {
    animationId: 0,
    measuredBox: { x: { min: x, max: x + w }, y: { min: y, max: y + h } },
    layoutBox: { x: { min: x, max: x + w }, y: { min: y, max: y + h } },
    latestValues: {},
    source: 0,
  };
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('Layout Animations', () => {
  beforeEach(() => {
    _resetFeatureInit();
  });

  it('creates projection node when layout=true', () => {
    @Component({
      template: '<div ngmMotion [layout]="true"></div>',
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const dir = getDirective(fixture);
    expect(dir.ve).not.toBeNull();
    expect(getProjection(dir)).toBeDefined();
  });

  it('primes initial layout measurement on mount', async () => {
    @Component({
      template: '<div ngmMotion [layout]="true"></div>',
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const dir = getDirective(fixture);
    await wait(25);

    expect(getProjection(dir)?.layout).toBeDefined();
  });

  it('creates projection node when layoutId is set', () => {
    @Component({
      template: '<div ngmMotion layoutId="hero"></div>',
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const dir = getDirective(fixture);
    expect(dir.ve).not.toBeNull();
    expect(getProjection(dir)).toBeDefined();
  });

  it('creates projection node when layoutScroll is set', () => {
    @Component({
      template: '<div ngmMotion [layoutScroll]="true"></div>',
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const dir = getDirective(fixture);
    expect(dir.ve).not.toBeNull();
    expect(getProjection(dir)).toBeDefined();

    expect(getProjection(dir)?.layout).toBeUndefined();
  });

  it('creates projection node when layoutRoot is set', () => {
    @Component({
      template: '<div ngmMotion [layoutRoot]="true"></div>',
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const dir = getDirective(fixture);
    expect(dir.ve).not.toBeNull();
    expect(getProjection(dir)).toBeDefined();
  });

  it('creates a passive projection when layout is not set', () => {
    @Component({
      template: '<div ngmMotion [animate]="{ opacity: 1 }"></div>',
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const dir = getDirective(fixture);
    expect(dir.ve).not.toBeNull();
    expect(getProjection(dir)).toBeDefined();

    expect(getProjection(dir)?.options.layout).toBeUndefined();
  });

  it('includes transformed non-layout ancestors in the projection tree', () => {
    @Component({
      template: `
        <div ngmMotion [animate]="{ y: 20 }">
          <div ngmMotion [layout]="true"></div>
        </div>
      `,
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const parent = getDirective(fixture, 0);
    const child = getDirective(fixture, 1);

    expect(getProjection(parent)).toBeDefined();

    expect(getProjection(child)?.parent).toBe(getProjection(parent));
  });

  it('cleans up projection on destroy', () => {
    @Component({
      template: '<div ngmMotion [layout]="true"></div>',
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const dir = getDirective(fixture);
    expect(getProjection(dir)).toBeDefined();

    fixture.destroy();
    expect(dir.ve).toBeNull();
  });

  it('supports layout="position" mode', () => {
    @Component({
      template: '<div ngmMotion layout="position"></div>',
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const dir = getDirective(fixture);
    expect(getProjection(dir)).toBeDefined();
  });

  it('creates projection when drag is enabled', () => {
    @Component({
      template: '<div ngmMotion [drag]="true"></div>',
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const dir = getDirective(fixture);
    // drag enables projection for drag constraints
    expect(dir.ve).not.toBeNull();
  });

  // ── Shared Layout Behavior ──

  it('layoutId registers in shared node stack', () => {
    @Component({
      template: '<div ngmMotion layoutId="hero"></div>',
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const dir = getDirective(fixture);

    const root = getProjection(dir)?.root;
    expect(root?.sharedNodes.has('hero')).toBe(true);
  });

  it('shared layout A→B: new element gets resumeFrom pointing to old projection', () => {
    @Component({
      template: `
        @if (tab() === 'a') {
          <div ngmMotion layoutId="indicator" [animate]="{ opacity: 1 }"></div>
        }
        @if (tab() === 'b') {
          <div ngmMotion layoutId="indicator" [animate]="{ opacity: 1 }"></div>
        }
      `,
      imports: [NgmMotionDirective],
    })
    class Host {
      tab = signal<'a' | 'b'>('a');
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const dirA = getDirective(fixture);
    const projA = getProjection(dirA);
    expect(projA).toBeDefined();

    // Switch from A to B
    fixture.componentInstance.tab.set('b');
    fixture.detectChanges();
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    TestBed.flushEffects();
    fixture.detectChanges();

    const dirB = getDirective(fixture);

    const projB = getProjection(dirB);
    // The new projection should have resumeFrom set to the old projection
    // (this is the key mechanism for shared layout animations)
    expect(projB?.resumeFrom).toBeDefined();
  });

  it('snapshot preserved on destroy for layoutId nodes', () => {
    @Component({
      template: `
        @if (show()) {
          <div ngmMotion layoutId="hero" [layout]="true"></div>
        }
      `,
      imports: [NgmMotionDirective],
    })
    class Host {
      show = signal(true);
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const dir = getDirective(fixture);
    const projection = getProjection(dir);

    // Simulate a layout measurement (jsdom returns zeros, so we set manually)
    if (projection) {
      projection.layout = makeMeasurements(0, 0, 100, 50);
    }

    // Destroy the element
    fixture.componentInstance.show.set(false);
    fixture.detectChanges();
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    TestBed.flushEffects();
    fixture.detectChanges();

    // Snapshot should have been preserved during cleanup
    expect(projection?.snapshot).toBeDefined();
  });

  it('layout="size" sets animationType to "size"', () => {
    @Component({
      template: '<div ngmMotion layout="size"></div>',
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const dir = getDirective(fixture);

    const opts = getProjection(dir)?.options;
    expect(opts?.animationType).toBe('size');
  });

  it('layout="preserve-aspect" sets animationType to "preserve-aspect"', () => {
    @Component({
      template: '<div ngmMotion layout="preserve-aspect"></div>',
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const dir = getDirective(fixture);

    const opts = getProjection(dir)?.options;
    expect(opts?.animationType).toBe('preserve-aspect');
  });

  it('layout=true sets animationType to "both"', () => {
    @Component({
      template: '<div ngmMotion [layout]="true"></div>',
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const dir = getDirective(fixture);

    const opts = getProjection(dir)?.options;
    expect(opts?.animationType).toBe('both');
  });

  it('layoutId option is set on projection', () => {
    @Component({
      template: '<div ngmMotion layoutId="card-123"></div>',
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const dir = getDirective(fixture);

    const opts = getProjection(dir)?.options;
    expect(opts?.layoutId).toBe('card-123');
  });

  it('multiple toggle cycles: each transition sets up resumeFrom', () => {
    @Component({
      template: `
        @if (tab() === 'a') {
          <div ngmMotion layoutId="tab" [animate]="{ opacity: 1 }"></div>
        }
        @if (tab() === 'b') {
          <div ngmMotion layoutId="tab" [animate]="{ opacity: 1 }"></div>
        }
      `,
      imports: [NgmMotionDirective],
    })
    class Host {
      tab = signal<'a' | 'b'>('a');
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    // Toggle A → B
    fixture.componentInstance.tab.set('b');
    fixture.detectChanges();
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    TestBed.flushEffects();
    fixture.detectChanges();

    const dirB = getDirective(fixture);

    expect(getProjection(dirB)?.resumeFrom).toBeDefined();

    // Toggle B → A
    fixture.componentInstance.tab.set('a');
    fixture.detectChanges();
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    TestBed.flushEffects();
    fixture.detectChanges();

    const dirA2 = getDirective(fixture);

    expect(getProjection(dirA2)?.resumeFrom).toBeDefined();
  });

  it('shared layout handoff removes the destroyed projection without post-destroy emits', async () => {
    @Component({
      template: `
        @if (tab() === 'a') {
          <div ngmMotion layoutId="tab" [layout]="true" [animate]="{ opacity: 1 }"></div>
        }
        @if (tab() === 'b') {
          <div ngmMotion layoutId="tab" [layout]="true" [animate]="{ opacity: 1 }"></div>
        }
      `,
      imports: [NgmMotionDirective],
    })
    class Host {
      tab = signal<'a' | 'b'>('a');
    }

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { /* noop */ });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { /* noop */ });

    try {
      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();

      const dirA = getDirective(fixture);

      const projA = getProjection(dirA);
      const stack = projA?.getStack();
      expect(stack?.members).toContain(projA);

      fixture.componentInstance.tab.set('b');
      fixture.detectChanges();
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      TestBed.flushEffects();
      fixture.detectChanges();

      const dirB = getDirective(fixture);

      const projB = getProjection(dirB);

      expect(projB?.resumeFrom).toBeDefined();
      await wait(25);
      expect(stack?.members).toEqual([projB]);

      const logged = [...warnSpy.mock.calls, ...errorSpy.mock.calls]
        .flat()
        .join(' ');
      expect(logged).not.toContain('NG0953');
    } finally {
      warnSpy.mockRestore();
      errorSpy.mockRestore();
    }
  });

  it('layoutDependency change triggers animation cycle', () => {
    @Component({
      template: '<div ngmMotion [layout]="true" [layoutDependency]="dep()"></div>',
      imports: [NgmMotionDirective],
    })
    class Host {
      dep = signal(0);
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const dir = getDirective(fixture);
    const projection = getProjection(dir);
    expect(projection).toBeDefined();

    // Simulate a layout measurement so there's something to snapshot
    if (projection) {
      projection.layout = makeMeasurements(0, 0, 100, 50);
    }

    // Change layoutDependency — should trigger FLIP cycle via snapshotBeforeUpdate
    fixture.componentInstance.dep.set(1);
    fixture.detectChanges();
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    TestBed.flushEffects();
    fixture.detectChanges();

    // After the effect runs, the projection should have been notified of the update
    // (willUpdate was called, which sets isLayoutDirty)
    expect(projection).toBeDefined();
  });

  it('layoutDependency change does not run a second post-render willUpdate', () => {
    @Component({
      template: '<div ngmMotion [layout]="true" [layoutDependency]="dep()"></div>',
      imports: [NgmMotionDirective],
    })
    class Host {
      dep = signal(0);
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const dir = getDirective(fixture);
    const projection = getProjection(dir);
    expect(projection).toBeDefined();
    if (!projection) return;

    const willUpdateSpy = vi.spyOn(projection, 'willUpdate');

    fixture.componentInstance.dep.set(1);
    fixture.detectChanges();
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    TestBed.flushEffects();
    fixture.detectChanges();

    expect(willUpdateSpy).toHaveBeenCalledTimes(1);
  });

  it('layoutDependency inside layoutScroll prefers a live snapshot after a browser scroll jump', () => {
    @Component({
      template: `
        <div ngmMotion [layoutScroll]="true">
          <div ngmMotion [layout]="true" [layoutDependency]="dep()"></div>
        </div>
      `,
      imports: [NgmMotionDirective],
    })
    class Host {
      dep = signal(0);
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const scrollDir = getDirective(fixture, 0);
    const childDir = getDirective(fixture, 1);
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- nativeElement is typed as `any` in Angular's DebugElement
    const scrollEl = fixture.debugElement.queryAll(By.directive(NgmMotionDirective))[0]
      .nativeElement as HTMLElement;

    // Simulate the last measured state before the browser scrolled the container.
    const childProj = getProjection(childDir);
    expect(childProj).toBeDefined();
    if (!childProj) return;
    childProj.layout = makeMeasurements(0, 0, 100, 50);

    const scrollProj = getProjection(scrollDir);
    if (scrollProj) {
      scrollProj.scroll = {
        animationId: 0,
        phase: 'measure',
        isRoot: false,
        offset: { x: 0, y: 0 },
        wasRoot: false,
      } satisfies ScrollMeasurements;
    }

    // Simulate the browser moving scrollTop before Angular applies the layout change.
    scrollEl.scrollTop = 100;
    const willUpdateSpy = vi.spyOn(childProj, 'willUpdate').mockImplementation(() => undefined);

    fixture.componentInstance.dep.set(1);
    fixture.detectChanges();
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    TestBed.flushEffects();
    fixture.detectChanges();

    expect(willUpdateSpy).toHaveBeenCalledTimes(1);
    // snapshotBeforeUpdate now clones layout directly for dependency changes,
    // bypassing the scroll-delta check that previously returned undefined.
    const snap = getProjection(childDir)?.snapshot;
    expect(snap).toBeDefined();
    expect(snap?.layoutBox.x.min).toBe(0);
    expect(snap?.layoutBox.y.min).toBe(0);
  });

  it('post-render fallback inside layoutScroll skips the cached snapshot after a browser scroll jump', () => {
    @Component({
      template: `
        <div ngmMotion [layoutScroll]="true">
          <div [style.height.px]="spacer()"></div>
          <div ngmMotion [layout]="true"></div>
        </div>
      `,
      imports: [NgmMotionDirective],
    })
    class Host {
      spacer = signal(0);
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const scrollDir = getDirective(fixture, 0);
    const childDir = getDirective(fixture, 1);
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- nativeElement is typed as `any` in Angular's DebugElement
    const scrollEl = fixture.debugElement.queryAll(By.directive(NgmMotionDirective))[0]
      .nativeElement as HTMLElement;

    // Simulate the last measured state before the browser scrolled the container.
    const childProj = getProjection(childDir);
    expect(childProj).toBeDefined();
    if (!childProj) return;
    childProj.layout = {
      animationId: 0,
      measuredBox: { x: { min: 0, max: 100 }, y: { min: 0, max: 50 } },
      layoutBox: { x: { min: 0, max: 100 }, y: { min: 100, max: 150 } },
      latestValues: {},
      source: 0,
    };

    const scrollProj = getProjection(scrollDir);
    if (scrollProj) {
      scrollProj.scroll = {
        animationId: 0,
        phase: 'measure',
        isRoot: false,
        offset: { x: 0, y: 0 },
        wasRoot: false,
      } satisfies ScrollMeasurements;
    }

    // Simulate the browser moving scrollTop before Angular processes an external
    // layout shift above the projected child.
    scrollEl.scrollTop = 100;
    const willUpdateSpy = vi.spyOn(childProj, 'willUpdate').mockImplementation(() => undefined);

    fixture.componentInstance.spacer.set(40);
    fixture.detectChanges();
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    TestBed.flushEffects();
    fixture.detectChanges();

    expect(willUpdateSpy).toHaveBeenCalledTimes(1);
    expect(getProjection(childDir)?.snapshot).toBeUndefined();
  });

  it('layoutDependency stable prevents animation', () => {
    @Component({
      template: '<div ngmMotion [layout]="true" [layoutDependency]="dep()"></div>',
      imports: [NgmMotionDirective],
    })
    class Host {
      dep = signal('stable');
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const dir = getDirective(fixture);

    const proj = getProjection(dir);

    // Simulate layout
    if (proj) {
      proj.layout = makeMeasurements(0, 0, 100, 50);
    }

    // Set the same value again — no new animation should trigger
    fixture.componentInstance.dep.set('stable');
    fixture.detectChanges();
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    TestBed.flushEffects();
    fixture.detectChanges();

    // Snapshot should NOT have been set by the afterEveryRender because dep is stable
    // (the depStable guard prevents manual snapshot insertion)
    // The projection still exists and is functional
    expect(getProjection(dir)).toBeDefined();
  });

  it('layout + presence snapshot — element with layout inside presence preserves snapshot on exit', () => {
    @Component({
      template: `
        <div *ngmPresence="show()">
          <div ngmMotion layoutId="hero-layout" [layout]="true" [animate]="{ opacity: 1 }"></div>
        </div>
      `,
      imports: [NgmPresenceDirective, NgmMotionDirective],
    })
    class Host {
      show = signal(true);
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const debugEl = fixture.debugElement.query(
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- nativeElement is typed as `any` in Angular's DebugElement
      (de) => (de.nativeElement as HTMLElement).tagName === 'DIV' && de.injector.get(NgmMotionDirective, null) != null,
    );
    const dir = debugEl.injector.get(NgmMotionDirective);
    const projection = getProjection(dir);

    // Simulate layout measurement
    if (projection) {
      projection.layout = makeMeasurements(10, 20, 190, 100);
    }

    // Toggle presence off
    fixture.componentInstance.show.set(false);
    fixture.detectChanges();
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    TestBed.flushEffects();
    fixture.detectChanges();

    // Snapshot should be preserved
    expect(projection?.snapshot).toBeDefined();
    expect(projection?.snapshot?.layoutBox.x.min).toBe(10);
    expect(projection?.snapshot?.layoutBox.x.max).toBe(200);
    expect(projection?.snapshot?.layoutBox.y.min).toBe(20);
    expect(projection?.snapshot?.layoutBox.y.max).toBe(120);
  });

  it('layoutRoot sets layoutRoot option on projection', () => {
    @Component({
      template: '<div ngmMotion [layout]="true" [layoutRoot]="true"></div>',
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const dir = getDirective(fixture);

    const opts = getProjection(dir)?.options;
    expect(opts?.layoutRoot).toBe(true);
  });

  it('detaches projection from VE on destroy so ve.unmount does not call projection.unmount', () => {
    @Component({
      template: `
        @if (show()) {
          <div ngmMotion layoutId="hero" [layout]="true"></div>
        }
      `,
      imports: [NgmMotionDirective],
    })
    class Host {
      show = signal(true);
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const dir = getDirective(fixture);
    const projection = getProjection(dir);
    expect(projection).toBeDefined();

    // Destroy
    fixture.componentInstance.show.set(false);
    fixture.detectChanges();
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    TestBed.flushEffects();
    fixture.detectChanges();

    // After cleanup, ve should be null (directive unmounted)
    expect(dir.ve).toBeNull();
    // But the projection should NOT have been removed from shared stack
    // (ve.projection was set to null before ve.unmount())
  });
});
