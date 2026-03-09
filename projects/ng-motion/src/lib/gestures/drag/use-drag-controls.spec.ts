import '../../test-env';
import { DragControls, useDragControls } from './use-drag-controls';

describe('useDragControls', () => {
  it('creates a DragControls instance', () => {
    const controls = useDragControls();
    expect(controls).toBeInstanceOf(DragControls);
  });

  it('subscribe returns an unsubscribe function', () => {
    const controls = useDragControls();
    const unsub = controls.subscribe(() => { /* noop */ });
    expect(typeof unsub).toBe('function');
  });

  it('start triggers all subscribers with the event', () => {
    const controls = useDragControls();
    const spy1 = vi.fn();
    const spy2 = vi.fn();
    controls.subscribe(spy1);
    controls.subscribe(spy2);

    const event = new PointerEvent('pointerdown');
    controls.start(event);

    expect(spy1).toHaveBeenCalledWith(event);
    expect(spy2).toHaveBeenCalledWith(event);
  });

  it('unsubscribe prevents future calls', () => {
    const controls = useDragControls();
    const spy = vi.fn();
    const unsub = controls.subscribe(spy);

    unsub();
    controls.start(new PointerEvent('pointerdown'));

    expect(spy).not.toHaveBeenCalled();
  });

  it('returns a DragControls when called', () => {
    const controls = useDragControls();
    expect(controls).toBeDefined();
    expect(controls).toBeInstanceOf(DragControls);
  });
});
