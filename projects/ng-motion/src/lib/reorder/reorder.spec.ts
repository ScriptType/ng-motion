import '../test-env';
import { Component, signal, viewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { NgmMotionDirective } from '../core/motion.directive';
import { checkReorder } from './check-reorder';
import { NgmReorderGroupDirective } from './reorder-group.directive';
import { NgmReorderItemDirective } from './reorder-item.directive';
import { REORDER_CONTEXT } from './reorder-context';
import type { ItemData } from './types';
import type { Box, Point } from 'motion-utils';

async function flushAnimations(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 50));
}

// ── checkReorder tests ──

describe('checkReorder', () => {
  function makeOrder<T>(items: { value: T; min: number; max: number }[]): ItemData<T>[] {
    return items.map((i) => ({ value: i.value, layout: { min: i.min, max: i.max } }));
  }

  it('returns same array when velocity is zero', () => {
    const order = makeOrder([
      { value: 'a', min: 0, max: 50 },
      { value: 'b', min: 50, max: 100 },
    ]);
    const result = checkReorder(order, 'a', 60, 0);
    expect(result).toBe(order);
  });

  it('returns same array when value is not found', () => {
    const order = makeOrder([
      { value: 'a', min: 0, max: 50 },
      { value: 'b', min: 50, max: 100 },
    ]);
    const result = checkReorder(order, 'z', 60, 1);
    expect(result).toBe(order);
  });

  it('returns same array when there is no neighbor in direction', () => {
    const order = makeOrder([
      { value: 'a', min: 0, max: 50 },
      { value: 'b', min: 50, max: 100 },
    ]);
    // Moving 'b' forward (positive velocity) but 'b' is last
    const result = checkReorder(order, 'b', 10, 1);
    expect(result).toBe(order);
  });

  it('swaps items forward when offset passes next midpoint', () => {
    const order = makeOrder([
      { value: 'a', min: 0, max: 50 },
      { value: 'b', min: 50, max: 100 },
    ]);
    // 'a' max (50) + offset (30) = 80 > midpoint of 'b' (75)
    const result = checkReorder(order, 'a', 30, 1);
    expect(result.map((i) => i.value)).toEqual(['b', 'a']);
  });

  it('swaps items backward when offset passes previous midpoint', () => {
    const order = makeOrder([
      { value: 'a', min: 0, max: 50 },
      { value: 'b', min: 50, max: 100 },
    ]);
    // 'b' min (50) + offset (-30) = 20 < midpoint of 'a' (25)
    const result = checkReorder(order, 'b', -30, -1);
    expect(result.map((i) => i.value)).toEqual(['b', 'a']);
  });

  it('does not swap when offset is below threshold', () => {
    const order = makeOrder([
      { value: 'a', min: 0, max: 50 },
      { value: 'b', min: 50, max: 100 },
    ]);
    // 'a' max (50) + offset (10) = 60 < midpoint of 'b' (75)
    const result = checkReorder(order, 'a', 10, 1);
    expect(result).toBe(order);
  });

  it('handles three items: swaps middle forward', () => {
    const order = makeOrder([
      { value: 'a', min: 0, max: 40 },
      { value: 'b', min: 40, max: 80 },
      { value: 'c', min: 80, max: 120 },
    ]);
    // 'b' max (80) + offset (25) = 105 > midpoint of 'c' (100)
    const result = checkReorder(order, 'b', 25, 1);
    expect(result.map((i) => i.value)).toEqual(['a', 'c', 'b']);
  });
});

// ── NgmReorderGroupDirective tests ──

@Component({
  template: `
    <div [ngmReorderGroup]="items()" [axis]="axis()" (reorder)="onReorder($event)">
      @for (item of items(); track item) {
        <div>{{ item }}</div>
      }
    </div>
  `,
  imports: [NgmReorderGroupDirective],
})
class TestGroupHost {
  items = signal(['a', 'b', 'c']);
  axis = signal<'x' | 'y'>('y');
  reordered: string[] = [];
  onReorder(newOrder: string[]): void {
    this.reordered = newOrder;
  }
  group = viewChild(NgmReorderGroupDirective);
}

describe('NgmReorderGroupDirective', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('provides REORDER_CONTEXT to children', () => {
    const fixture = TestBed.createComponent(TestGroupHost);
    fixture.detectChanges();
    const group = fixture.componentInstance.group();
    expect(group).toBeTruthy();
    const ctx = group?.context;
    expect(ctx).toBeTruthy();
    expect(ctx?.registerItem).toBeInstanceOf(Function);
    expect(ctx?.updateOrder).toBeInstanceOf(Function);
  });

  it('uses default axis of "y"', () => {
    const fixture = TestBed.createComponent(TestGroupHost);
    fixture.detectChanges();
    const group = fixture.componentInstance.group();
    expect(group?.context.axis).toBe('y');
  });

  it('reflects custom axis', () => {
    const fixture = TestBed.createComponent(TestGroupHost);
    fixture.componentInstance.axis.set('x');
    fixture.detectChanges();
    const group = fixture.componentInstance.group();
    expect(group?.context.axis).toBe('x');
  });

  it('sets overflow-anchor: none on host element', () => {
    const fixture = TestBed.createComponent(TestGroupHost);
    fixture.detectChanges();
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- fixture.nativeElement is any
    const groupEl = fixture.nativeElement.querySelector('[style]') as HTMLElement | null;
    expect(groupEl?.style.overflowAnchor).toBe('none');
  });

  it('emits reorder when checkReorder produces a new order', () => {
    const fixture = TestBed.createComponent(TestGroupHost);
    fixture.detectChanges();
    const group = fixture.componentInstance.group();
    expect(group).toBeTruthy();
    const ctx = group?.context;
    expect(ctx).toBeTruthy();
    if (!ctx) return;

    // Register items with layouts
    ctx.registerItem('a', { min: 0, max: 50 });
    ctx.registerItem('b', { min: 50, max: 100 });
    ctx.registerItem('c', { min: 100, max: 150 });

    // Trigger reorder: 'a' passes midpoint of 'b'
    ctx.updateOrder('a', 30, 1);
    expect(fixture.componentInstance.reordered).toEqual(['b', 'a', 'c']);
  });

  it('deduplicates item registration', () => {
    const fixture = TestBed.createComponent(TestGroupHost);
    fixture.detectChanges();
    const group = fixture.componentInstance.group();
    expect(group).toBeTruthy();
    const ctx = group?.context;
    expect(ctx).toBeTruthy();
    if (!ctx) return;

    ctx.registerItem('a', { min: 0, max: 50 });
    ctx.registerItem('a', { min: 10, max: 60 }); // update, not duplicate

    // Should only have one entry for 'a'
    ctx.registerItem('b', { min: 60, max: 110 });
    ctx.updateOrder('a', 55, 1);
    expect(fixture.componentInstance.reordered).toEqual(['b', 'a']);
  });

  it('keeps internal order in sync so a drag can progress through neighbors', async () => {
    const fixture = TestBed.createComponent(TestGroupHost);
    fixture.detectChanges();
    const group = fixture.componentInstance.group();
    expect(group).toBeTruthy();
    const ctx = group?.context;
    expect(ctx).toBeTruthy();
    if (!ctx) return;

    ctx.registerItem('a', { min: 0, max: 50 });
    ctx.registerItem('b', { min: 50, max: 100 });
    ctx.registerItem('c', { min: 100, max: 150 });

    ctx.updateOrder('a', 30, 1);
    expect(fixture.componentInstance.reordered).toEqual(['b', 'a', 'c']);

    await Promise.resolve();

    ctx.updateOrder('a', 80, 1);
    expect(fixture.componentInstance.reordered).toEqual(['b', 'c', 'a']);
  });
});

// ── NgmReorderItemDirective tests ──

@Component({
  template: `
    <div [ngmReorderGroup]="items()" [axis]="'y'" (reorder)="onReorder($event)">
      @for (item of items(); track item) {
        <div [ngmReorderItem]="item">{{ item }}</div>
      }
    </div>
  `,
  imports: [NgmReorderGroupDirective, NgmReorderItemDirective],
})
class TestItemHost {
  items = signal(['x', 'y', 'z']);
  reordered: string[] = [];
  onReorder(newOrder: string[]): void {
    this.reordered = newOrder;
  }
  itemDirectives = viewChild(NgmReorderItemDirective);
}

describe('NgmReorderItemDirective', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('injects REORDER_CONTEXT from parent group', () => {
    const fixture = TestBed.createComponent(TestItemHost);
    fixture.detectChanges();
    const item = fixture.componentInstance.itemDirectives();
    expect(item).toBeTruthy();
    expect(item?.getAxis()).toBe('y');
  });

  it('registers layout via registerLayout()', () => {
    const fixture = TestBed.createComponent(TestItemHost);
    fixture.detectChanges();
    const item = fixture.componentInstance.itemDirectives();
    expect(item).toBeTruthy();
    if (!item) return;
    // Should not throw
    item.registerLayout({ x: { min: 0, max: 100 }, y: { min: 0, max: 50 } });
  });

  it('tracks isDragging state', () => {
    const fixture = TestBed.createComponent(TestItemHost);
    fixture.detectChanges();
    const item = fixture.componentInstance.itemDirectives();
    expect(item).toBeTruthy();
    if (!item) return;
    expect(item.isDragging()).toBe(false);
    item.onDragStart();
    expect(item.isDragging()).toBe(true);
    item.onDragEnd();
    expect(item.isDragging()).toBe(false);
  });

  it('delegates updateOrder to group context', () => {
    const fixture = TestBed.createComponent(TestItemHost);
    fixture.detectChanges();

    // Get context from the group directive's debug element
    const groupEl = fixture.debugElement.children[0];
    const ctx = groupEl.injector.get(REORDER_CONTEXT);
    const spy = vi.spyOn(ctx, 'updateOrder');

    const item = fixture.componentInstance.itemDirectives();
    expect(item).toBeTruthy();
    if (!item) return;
    item.updateOrder(10, 5);
    expect(spy).toHaveBeenCalledWith(item.value(), 10, 5);
  });

  it('has default layout of true', () => {
    const fixture = TestBed.createComponent(TestItemHost);
    fixture.detectChanges();
    const item = fixture.componentInstance.itemDirectives();
    expect(item).toBeTruthy();
    if (!item) return;
    expect(item.layout()).toBe(true);
  });

  it('integrates with ngmMotion layout and drag callbacks', async () => {
    @Component({
      template: `
        <div [ngmReorderGroup]="items()" [axis]="'y'">
          <div [ngmReorderItem]="items()[0]" ngmMotion [layout]="true" [drag]="'y'"></div>
        </div>
      `,
      imports: [NgmReorderGroupDirective, NgmReorderItemDirective, NgmMotionDirective],
    })
    class TestMotionReorderHost {
      readonly items = signal([{ id: 'a' }]);
    }

    const fixture = TestBed.createComponent(TestMotionReorderHost);
    fixture.detectChanges();
    await flushAnimations();

    const motion = fixture.debugElement.query(By.directive(NgmMotionDirective)).injector.get(
      NgmMotionDirective,
    );
    const item = fixture.debugElement.query(By.directive(NgmReorderItemDirective)).injector.get(
      NgmReorderItemDirective<{ id: string }>,
    );

    const registerLayout = vi.spyOn(item, 'registerLayout');
    const onDragStart = vi.spyOn(item, 'onDragStart');
    const updateOrder = vi.spyOn(item, 'updateOrder');
    const onDragEnd = vi.spyOn(item, 'onDragEnd');

    const measured: Box = {
      x: { min: 0, max: 100 },
      y: { min: 20, max: 70 },
    };
    const panInfo = {
      point: { x: 0, y: 140 } satisfies Point,
      delta: { x: 0, y: 12 } satisfies Point,
      offset: { x: 0, y: 36 } satisfies Point,
      velocity: { x: 0, y: 320 } satisfies Point,
    };

    expect(motion.ve).toBeTruthy();
    if (!motion.ve) return;
    motion.ve.getValue('y', 0).set(84);

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- narrow getProps() return for test access
    const props = motion.ve.getProps() as {
      onLayoutMeasure?: (box: Box, prevBox: Box) => void;
      onDragStart?: (event: PointerEvent, info: typeof panInfo) => void;
      onDrag?: (event: PointerEvent, info: typeof panInfo) => void;
      onDragEnd?: (event: PointerEvent, info: typeof panInfo) => void;
    };

    props.onLayoutMeasure?.(measured, measured);
    props.onDragStart?.(new PointerEvent('pointerdown'), panInfo);
    props.onDrag?.(new PointerEvent('pointermove'), panInfo);
    props.onDragEnd?.(new PointerEvent('pointerup'), panInfo);

    expect(registerLayout).toHaveBeenCalledWith(measured);
    expect(onDragStart).toHaveBeenCalledOnce();
    expect(updateOrder).toHaveBeenCalledWith(84, 320, 140);
    expect(onDragEnd).toHaveBeenCalledOnce();
  });
});
