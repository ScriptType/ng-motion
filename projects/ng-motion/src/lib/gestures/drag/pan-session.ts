import { addDomEvent, isPrimaryPointer } from 'motion-dom';
import type { Point } from 'motion-utils';
import type { PanInfo } from './utils';

function isPointerEvent(e: Event): e is PointerEvent {
  return e instanceof PointerEvent;
}

const DISTANCE_THRESHOLD = 3;

interface TimestampedPoint {
  x: number;
  y: number;
  timestamp: number;
}

function subtractPoint(a: Point, b: Point): Point {
  return { x: a.x - b.x, y: a.y - b.y };
}

function distance2D(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function calcVelocity(history: TimestampedPoint[], timeDelta = 100): Point {
  if (history.length < 2) return { x: 0, y: 0 };

  const now = history[history.length - 1];
  let prev = history[0];

  for (let i = history.length - 2; i >= 0; i--) {
    if (now.timestamp - history[i].timestamp > timeDelta) {
      prev = history[i];
      break;
    }
  }

  const dt = (now.timestamp - prev.timestamp) / 1000;
  if (dt === 0) return { x: 0, y: 0 };

  return {
    x: (now.x - prev.x) / dt,
    y: (now.y - prev.y) / dt,
  };
}

function extractPoint(event: PointerEvent): Point {
  return { x: event.pageX, y: event.pageY };
}

export type PanHandler = (event: PointerEvent, info: PanInfo) => void;

export interface PanSessionHandlers {
  onSessionStart?: PanHandler;
  onStart?: PanHandler;
  onMove?: PanHandler;
  onEnd?: PanHandler;
  onSessionEnd?: PanHandler;
}

export class PanSession {
  private history: TimestampedPoint[] = [];
  private startPoint: Point | null = null;
  private lastPoint: Point | null = null;
  private removeListeners: (() => void)[] = [];
  private started = false;

  constructor(
    startPointerEvent: PointerEvent,
    private handlers: PanSessionHandlers,
    private transformPagePoint?: (point: Point) => Point,
  ) {
    this.handlePointerDown(startPointerEvent);
  }

  private handlePointerDown(event: PointerEvent): void {
    const point = this.getTransformedPoint(event);
    this.startPoint = point;
    this.lastPoint = point;
    this.history = [{ ...point, timestamp: performance.now() }];

    const info = this.getPanInfo(event);
    this.handlers.onSessionStart?.(event, info);

    this.removeListeners.push(
      addDomEvent(
        window,
        'pointermove',
        (e: Event) => {
          if (isPointerEvent(e)) {
            this.handlePointerMove(e);
          }
        },
        { passive: false },
      ),
      addDomEvent(window, 'pointerup', (e: Event) => {
        if (isPointerEvent(e)) {
          this.handlePointerUp(e);
        }
      }),
      addDomEvent(window, 'pointercancel', (e: Event) => {
        if (isPointerEvent(e)) {
          this.handlePointerUp(e);
        }
      }),
    );
  }

  private handlePointerMove(event: PointerEvent): void {
    if (!isPrimaryPointer(event)) return;

    const point = this.getTransformedPoint(event);
    this.lastPoint = point;
    this.history.push({ ...point, timestamp: performance.now() });

    if (this.history.length > 20) this.history.shift();

    const info = this.getPanInfo(event);

    try {
      if (!this.started) {
        const dist = distance2D(info.offset, { x: 0, y: 0 });
        if (dist < DISTANCE_THRESHOLD) return;

        this.started = true;
        this.handlers.onStart?.(event, info);
      } else {
        this.handlers.onMove?.(event, info);
      }
    } catch (error) {
      this.end();
      throw error;
    }
  }

  private handlePointerUp(event: PointerEvent): void {
    this.end();

    const info = this.getPanInfo(event);
    if (this.started) {
      this.handlers.onEnd?.(event, info);
    }
    this.handlers.onSessionEnd?.(event, info);
  }

  private getTransformedPoint(event: PointerEvent): Point {
    const point = extractPoint(event);
    return this.transformPagePoint ? this.transformPagePoint(point) : point;
  }

  private getPanInfo(event: PointerEvent): PanInfo {
    const point = this.getTransformedPoint(event);
    return {
      point,
      delta: subtractPoint(point, this.lastPoint ?? point),
      offset: subtractPoint(point, this.startPoint ?? point),
      velocity: calcVelocity(this.history),
    };
  }

  end(): void {
    this.removeListeners.forEach((fn) => { fn(); });
    this.removeListeners = [];
  }

  cancel(): void {
    this.end();
  }
}
