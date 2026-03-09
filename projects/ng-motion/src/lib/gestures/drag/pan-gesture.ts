import { Feature, isPrimaryPointer, addDomEvent } from 'motion-dom';
import { PanSession, type PanSessionHandlers } from './pan-session';

function isEventTarget(value: unknown): value is EventTarget {
  return value instanceof EventTarget;
}

function isPointerEvent(e: Event): e is PointerEvent {
  return e instanceof PointerEvent;
}

export class PanGesture extends Feature {
  private session: PanSession | null = null;
  private removePointerDown?: () => void;

  override mount(): void {
    const current: unknown = this.node.current;
    if (!isEventTarget(current)) return;

    this.removePointerDown = addDomEvent(
      current,
      'pointerdown',
      (e: Event) => {
        if (isPointerEvent(e)) {
          this.onPointerDown(e);
        }
      },
    );
  }

  override unmount(): void {
    this.removePointerDown?.();
    this.session?.cancel();
  }

  private onPointerDown(event: PointerEvent): void {
    if (!isPrimaryPointer(event)) return;

    const props = this.node.getProps();
    const handlers: PanSessionHandlers = {
      onSessionStart: (e, info) => {
        props.onPanSessionStart?.(e, info);
      },
      onStart: (e, info) => {
        props.onPanStart?.(e, info);
      },
      onMove: (e, info) => {
        props.onPan?.(e, info);
      },
      onEnd: (e, info) => {
        this.session = null;
        props.onPanEnd?.(e, info);
      },
      onSessionEnd: () => {
        this.session = null;
      },
    };

    this.session = new PanSession(event, handlers);
  }
}
