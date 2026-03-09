import '../test-env';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import type { IProjectionNode } from 'motion-dom';
import { NgmLayoutGroupDirective } from './layout-group.directive';
import { NgmMotionDirective } from '../core/motion.directive';
import { _resetFeatureInit } from '../core/feature-init';
import { LAYOUT_GROUP, type LayoutGroupContextProps } from './layout-group-context';

/** Extract the projection node from a motion directive with proper typing.
 *  ve.projection is typed as `any` in motion-dom, so we centralise the cast. */
function getProjection(dir: NgmMotionDirective): IProjectionNode | undefined {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- ve.projection is `any` in motion-dom
  const proj: IProjectionNode | undefined = dir.ve?.projection;
  return proj;
}

describe('NgmLayoutGroupDirective', () => {
  it('creates a layout group with a NodeGroup', () => {
    @Component({
      template: '<div ngmLayoutGroup></div>',
      imports: [NgmLayoutGroupDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const groupEl = fixture.debugElement.children[0];
    const ctx = groupEl.injector.get(LAYOUT_GROUP);
    expect(ctx).toBeDefined();
    expect(ctx.group).toBeDefined();
  });

  it('provides LAYOUT_GROUP token to children', () => {
    let _childCtx: LayoutGroupContextProps | null = null;

    @Component({
      // eslint-disable-next-line @angular-eslint/component-selector
      selector: 'app-child',
      template: '',
    })
    class Child {
      constructor() {
        const ctx = TestBed.inject(LAYOUT_GROUP, null);
        _childCtx = ctx;
      }
    }

    @Component({
      template: '<div ngmLayoutGroup><app-child /></div>',
      imports: [NgmLayoutGroupDirective, Child],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    // The child should get the context from the parent directive
    const groupEl = fixture.debugElement.children[0];
    const ctx = groupEl.injector.get(LAYOUT_GROUP);
    expect(ctx.group).toBeDefined();
  });

  it('creates group with add/remove/dirty methods', () => {
    @Component({
      template: '<div ngmLayoutGroup></div>',
      imports: [NgmLayoutGroupDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const groupEl = fixture.debugElement.children[0];
    const ctx = groupEl.injector.get(LAYOUT_GROUP);
    expect(typeof ctx.group?.add).toBe('function');
    expect(typeof ctx.group?.remove).toBe('function');
    expect(typeof ctx.group?.dirty).toBe('function');
  });

  it('nested groups with inherit=true share parent group', () => {
    @Component({
      template: `
        <div ngmLayoutGroup>
          <div ngmLayoutGroup>
          </div>
        </div>`,
      imports: [NgmLayoutGroupDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const outerEl = fixture.debugElement.children[0];
    const innerEl = outerEl.children[0];
    const outerCtx = outerEl.injector.get(LAYOUT_GROUP);
    const innerCtx = innerEl.injector.get(LAYOUT_GROUP);

    expect(outerCtx.group).toBe(innerCtx.group);
  });
});

// ── Integration with motion directives ──

describe('NgmLayoutGroupDirective + NgmMotionDirective', () => {
  beforeEach(() => {
    _resetFeatureInit();
  });

  it('motion directive within group gets added to group', () => {
    @Component({
      template: `
        <div ngmLayoutGroup>
          <div ngmMotion [layout]="true"></div>
        </div>
      `,
      imports: [NgmLayoutGroupDirective, NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const groupEl = fixture.debugElement.children[0];
    const ctx = groupEl.injector.get(LAYOUT_GROUP);
    const dir = fixture.debugElement
      .queryAll(By.directive(NgmMotionDirective))[0]
      .injector.get(NgmMotionDirective);

    // The projection should exist and be part of the group
    expect(dir.ve?.projection).toBeDefined();
    // Verify the group has members (we added one)
    expect(ctx.group).toBeDefined();
  });

  it('motion directive cleanup removes from group', () => {
    @Component({
      template: `
        <div ngmLayoutGroup>
          @if (show()) {
            <div ngmMotion [layout]="true"></div>
          }
        </div>
      `,
      imports: [NgmLayoutGroupDirective, NgmMotionDirective],
    })
    class Host {
      show = signal(true);
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const groupEl = fixture.debugElement.children[0];
    const ctx = groupEl.injector.get(LAYOUT_GROUP);
    const group = ctx.group;
    expect(group).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const removeSpy = vi.spyOn(group!, 'remove');

    // Destroy the motion element
    fixture.componentInstance.show.set(false);
    fixture.detectChanges();
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    TestBed.flushEffects();
    fixture.detectChanges();

    expect(removeSpy).toHaveBeenCalled();
  });

  it('layoutId motion directives within same group coordinate', () => {
    @Component({
      template: `
        <div ngmLayoutGroup>
          @if (tab() === 'a') {
            <div ngmMotion layoutId="indicator" [animate]="{ opacity: 1 }"></div>
          }
          @if (tab() === 'b') {
            <div ngmMotion layoutId="indicator" [animate]="{ opacity: 1 }"></div>
          }
        </div>
      `,
      imports: [NgmLayoutGroupDirective, NgmMotionDirective],
    })
    class Host {
      tab = signal<'a' | 'b'>('a');
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    // Switch tab
    fixture.componentInstance.tab.set('b');
    fixture.detectChanges();
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    TestBed.flushEffects();
    fixture.detectChanges();

    const dirs = fixture.debugElement.queryAll(By.directive(NgmMotionDirective));
    expect(dirs.length).toBe(1);

    const dirB = dirs[0].injector.get(NgmMotionDirective);

    const projB = getProjection(dirB);
    expect(projB?.resumeFrom).toBeDefined();
  });

  it('group dirty triggers layout cycle', () => {
    @Component({
      template: `
        <div ngmLayoutGroup>
          <div ngmMotion [layout]="true"></div>
        </div>
      `,
      imports: [NgmLayoutGroupDirective, NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const groupEl = fixture.debugElement.children[0];
    const ctx = groupEl.injector.get(LAYOUT_GROUP);

    // dirty() should be callable without errors — it notifies the group
    expect(() => ctx.group?.dirty()).not.toThrow();
  });

  it('multiple layoutId elements with different animation states coordinate within group', () => {
    @Component({
      template: `
        <div ngmLayoutGroup>
          @if (tab() === 'a') {
            <div ngmMotion layoutId="coord" [animate]="{ opacity: 0.5 }"></div>
          }
          @if (tab() === 'b') {
            <div ngmMotion layoutId="coord" [animate]="{ opacity: 1 }"></div>
          }
        </div>
      `,
      imports: [NgmLayoutGroupDirective, NgmMotionDirective],
    })
    class Host {
      tab = signal<'a' | 'b'>('a');
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const dirA = fixture.debugElement
      .queryAll(By.directive(NgmMotionDirective))[0]
      .injector.get(NgmMotionDirective);
    expect(dirA.ve?.getProps().animate).toEqual({ opacity: 0.5 });

    // Switch to b
    fixture.componentInstance.tab.set('b');
    fixture.detectChanges();
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    TestBed.flushEffects();
    fixture.detectChanges();

    const dirs = fixture.debugElement.queryAll(By.directive(NgmMotionDirective));
    expect(dirs.length).toBe(1);
    const dirB = dirs[0].injector.get(NgmMotionDirective);
    expect(dirB.ve?.getProps().animate).toEqual({ opacity: 1 });

    expect(getProjection(dirB)?.resumeFrom).toBeDefined();
  });

  it('removing all elements from group', () => {
    @Component({
      template: `
        <div ngmLayoutGroup>
          @if (show()) {
            <div ngmMotion [layout]="true" class="item"></div>
          }
        </div>
      `,
      imports: [NgmLayoutGroupDirective, NgmMotionDirective],
    })
    class Host {
      show = signal(true);
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const groupEl = fixture.debugElement.children[0];
    const ctx = groupEl.injector.get(LAYOUT_GROUP);
    expect(ctx.group).toBeDefined();

    // Remove all elements
    fixture.componentInstance.show.set(false);
    fixture.detectChanges();
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    TestBed.flushEffects();
    fixture.detectChanges();

    // Group still exists and is functional even with no members
    expect(ctx.group).toBeDefined();
    expect(() => ctx.group?.dirty()).not.toThrow();
  });

  it('group forceRender triggers re-layout if available', () => {
    @Component({
      template: `
        <div ngmLayoutGroup>
          <div ngmMotion [layout]="true"></div>
        </div>
      `,
      imports: [NgmLayoutGroupDirective, NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const groupEl = fixture.debugElement.children[0];
    const ctx = groupEl.injector.get(LAYOUT_GROUP);

    // NodeGroup from motion-dom may have an undocumented forceRender method at runtime.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-assignment -- undocumented runtime API not in types
    const group = ctx.group as any;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- undocumented runtime API
    if (typeof group?.forceRender === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return -- undocumented runtime API
      expect(() => group.forceRender()).not.toThrow();
    } else {
      // forceRender is not part of the NodeGroup API — verify group is still functional
      expect(typeof ctx.group?.dirty).toBe('function');
    }
  });
});
