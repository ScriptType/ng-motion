import { Feature, isPrimaryPointer, addDomEvent } from 'motion-dom';
import { VisualElementDragControls } from './drag-controls';

function isEventTarget(value: unknown): value is EventTarget {
  return value instanceof EventTarget;
}

function isPointerEvent(e: Event): e is PointerEvent {
  return e instanceof PointerEvent;
}

export class DragGesture extends Feature {
  private controls: VisualElementDragControls | null = null;
  private removePointerDown?: () => void;

  override mount(): void {
    this.controls = new VisualElementDragControls(this.node);

    const props = this.node.getProps();
    if (props.dragListener !== false) {
      const current: unknown = this.node.current;
      if (!isEventTarget(current)) return;

      this.removePointerDown = addDomEvent(
        current,
        'pointerdown',
        (e: Event) => {
          if (!isPointerEvent(e)) return;
          if (!isPrimaryPointer(e)) return;
          this.controls?.start(e);
        },
      );
    }
  }

  override unmount(): void {
    this.removePointerDown?.();
    this.controls?.cancel();
  }
}
