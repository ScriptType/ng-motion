import { Feature, isPrimaryPointer, addDomEvent } from 'motion-dom';
import { VisualElementDragControls } from './drag-controls';

function isEventTarget(value: unknown): value is EventTarget {
  return value instanceof EventTarget;
}

function isPointerEvent(e: Event): e is PointerEvent {
  return e instanceof PointerEvent;
}

function isHTMLElement(value: unknown): value is HTMLElement {
  return value instanceof HTMLElement;
}

export class DragGesture extends Feature {
  private controls: VisualElementDragControls | null = null;
  private removePointerDown?: () => void;
  private previousTouchAction: string | null = null;

  override mount(): void {
    this.controls = new VisualElementDragControls(this.node);

    const props = this.node.getProps();
    if (props.dragListener !== false) {
      const current: unknown = this.node.current;
      if (!isEventTarget(current)) return;

      // Set touch-action to prevent browser scroll/gesture handling during drag
      if (isHTMLElement(current) && props.drag !== false && props.drag !== undefined) {
        this.previousTouchAction = current.style.touchAction;
        if (props.drag === 'x') {
          current.style.touchAction = 'pan-y';
        } else if (props.drag === 'y') {
          current.style.touchAction = 'pan-x';
        } else {
          current.style.touchAction = 'none';
        }
      }

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

    // Restore original touch-action
    if (this.previousTouchAction !== null) {
      const current: unknown = this.node.current;
      if (isHTMLElement(current)) {
        current.style.touchAction = this.previousTouchAction;
      }
      this.previousTouchAction = null;
    }
  }
}
