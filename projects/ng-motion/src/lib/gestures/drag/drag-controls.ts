import { animateMotionValue, eachAxis, setDragLock } from 'motion-dom';
import type { LayoutUpdateData, MotionValue, Transition, VisualElement } from 'motion-dom';
import type { BoundingBox, Point } from 'motion-utils';
import { PanSession } from './pan-session';
import { type PanInfo, type DragDirection, shouldDrag, getCurrentDirection } from './utils';
import {
  type Constraints,
  resolveConstraints,
  resolveDragElastic,
  applyConstraints,
} from './constraints';

/** Minimal shape of a projection node (VisualElement.projection is typed as `any`). */
interface ProjectionNode {
  isAnimationBlocked: boolean;
  target: unknown;
  addEventListener: (
    event: string,
    callback: (data: LayoutUpdateData) => void,
  ) => () => void;
}

function isProjectionNode(value: unknown): value is ProjectionNode {
  return (
    value !== null &&
    value !== undefined &&
    typeof value === 'object' &&
    'addEventListener' in value
  );
}

function isHTMLElement(value: unknown): value is HTMLElement {
  return value instanceof HTMLElement;
}

function hasRenderMethod(value: unknown): value is { render: () => void } {
  if (value === null || value === undefined || typeof value !== 'object') return false;
  if (!('render' in value)) return false;
  const obj: { render: unknown } = value;
  return typeof obj.render === 'function';
}

/**
 * Extract a drag constraint value that resolveConstraints can handle.
 * MotionNodeOptions.dragConstraints is `false | Partial<BoundingBox> | { current: Element | null }`
 * but resolveConstraints expects `BoundingBox | HTMLElement | undefined`.
 */
function extractDragConstraint(
  raw: false | Partial<BoundingBox> | { current: Element | null } | undefined,
): BoundingBox | HTMLElement | undefined {
  if (raw === undefined || raw === false) return undefined;
  // Ref-like object { current: Element | null }
  if ('current' in raw) {
    const el = raw.current;
    if (isHTMLElement(el)) return el;
    return undefined;
  }
  // Partial<BoundingBox> — fill missing fields with Infinity to act as no-constraint
  return {
    top: raw.top ?? -Infinity,
    right: raw.right ?? Infinity,
    bottom: raw.bottom ?? Infinity,
    left: raw.left ?? -Infinity,
  };
}

export class VisualElementDragControls {
  private panSession: PanSession | null = null;
  private constraints: Constraints | undefined;
  private originPoint: Point = { x: 0, y: 0 };
  private current: Point = { x: 0, y: 0 };
  private isDragging = false;
  private lockedDirection: DragDirection | null = null;
  private releaseDragLock: (() => void) | null = null;
  private stopLayoutUpdateListener: (() => void) | null = null;
  private previousUserSelect: {
    body: string;
    documentElement: string;
  } | null = null;

  constructor(private node: VisualElement) {}

  start(originEvent: PointerEvent): void {
    this.ensureLayoutUpdateListener();

    const props = this.node.getProps();
    const dragProp = props.drag;

    if (dragProp === false || dragProp === undefined) return;
    if (props.dragListener === false) return;

    const lockAxis = typeof dragProp === 'string' ? dragProp : undefined;
    const dragElastic = resolveDragElastic(props.dragElastic);

    this.panSession = new PanSession(originEvent, {
      onStart: (event, info) => {
        this.releaseDragLock = setDragLock(lockAxis ?? true);
        if (!this.releaseDragLock) return;

        this.stopAnimations();

        const element: unknown = this.node.current;
        if (!isHTMLElement(element)) return;
        const elementRect = element.getBoundingClientRect();
        this.constraints = resolveConstraints(
          extractDragConstraint(props.dragConstraints),
          elementRect,
        );

        eachAxis((axis: 'x' | 'y') => {
          const currentVal = Number(this.getAxisMotionValue(axis).get());
          this.originPoint[axis] = currentVal;
          this.current[axis] = currentVal;
        });
        this.lockedDirection = null;
        this.isDragging = true;
        this.lockTextSelection();
        const projection: unknown = this.node.projection;
        if (isProjectionNode(projection)) {
          projection.isAnimationBlocked = true;
          projection.target = undefined;
        }
        void this.node.animationState?.setActive('whileDrag', true);
        props.onDragStart?.(event, info);
      },
      onMove: (event, info) => {
        if (!this.isDragging) return;

        eachAxis((axis: 'x' | 'y') => {
          if (!shouldDrag(dragProp, axis)) return;

          let value = this.originPoint[axis] + info.offset[axis];

          if (props.dragDirectionLock === true && this.lockedDirection === null) {
            this.lockedDirection = getCurrentDirection(info.offset);
            if (this.lockedDirection !== null) {
              props.onDirectionLock?.(this.lockedDirection);
            }
          }

          if (this.lockedDirection !== null && axis !== this.lockedDirection) return;

          const elastic = axis === 'x' ? dragElastic.left : dragElastic.top;
          value = applyConstraints(value, this.constraints?.[axis], elastic);

          this.current[axis] = value;
        });

        this.updatePosition();
        // Reorder state updates triggered from onDrag need the latest dragged
        // transform flushed to the DOM before layout is measured again.
        this.triggerRender();
        props.onDrag?.(event, this.createDragInfo(info));
      },
      onEnd: (event, info) => {
        this.stop(event, info);
      },
      onSessionEnd: () => {
        this.panSession = null;
      },
    });
  }

  private ensureLayoutUpdateListener(): void {
    const projection: unknown = this.node.projection;
    if (this.stopLayoutUpdateListener !== null || !isProjectionNode(projection)) return;

    this.stopLayoutUpdateListener = projection.addEventListener(
      'didUpdate',
      (update: LayoutUpdateData) => {
        if (!this.isDragging || !update.hasLayoutChanged) return;

        const props = this.node.getProps();

        eachAxis((axis: 'x' | 'y') => {
          if (!shouldDrag(props.drag, axis)) return;

          const translate = update.delta[axis].translate;
          if (translate === 0) return;

          this.originPoint[axis] += translate;
          this.current[axis] += translate;
          this.getAxisMotionValue(axis).set(this.current[axis]);
        });

        this.triggerRender();
      },
    );
  }

  private updatePosition(): void {
    eachAxis((axis: 'x' | 'y') => {
      const motionValue = this.getAxisMotionValue(axis);
      motionValue.set(this.current[axis]);
    });
  }

  private createDragInfo(panInfo: PanInfo): PanInfo {
    return {
      point: panInfo.point,
      delta: panInfo.delta,
      offset: {
        x: this.current.x - this.originPoint.x,
        y: this.current.y - this.originPoint.y,
      },
      velocity: panInfo.velocity,
    };
  }

  private stop(event: PointerEvent, info: PanInfo): void {
    const props = this.node.getProps();
    const wasDragging = this.isDragging;

    this.isDragging = false;
    const projection: unknown = this.node.projection;
    if (isProjectionNode(projection)) {
      projection.isAnimationBlocked = false;
    }
    this.unlockTextSelection();
    this.releaseDragLock?.();
    this.releaseDragLock = null;

    void this.node.animationState?.setActive('whileDrag', false);

    if (!wasDragging) return;

    const dragInfo = this.createDragInfo(info);
    props.onDragEnd?.(event, dragInfo);

    if (this.shouldAnimateRelease(props)) {
      this.startReleaseAnimation(info.velocity);
    }
  }

  private shouldAnimateRelease(props: {
    dragSnapToOrigin?: boolean;
    dragMomentum?: boolean;
  }): boolean {
    return Boolean(
      props.dragSnapToOrigin === true ||
      props.dragMomentum !== false ||
      this.constraints,
    );
  }

  private startReleaseAnimation(velocity: Point): void {
    const props = this.node.getProps();
    const dragElastic = props.dragElastic;
    const dragTransition = props.dragTransition ?? {};
    const bounceStiffness = dragElastic === false ? 1_000_000 : 200;
    const bounceDamping = dragElastic === false ? 10_000_000 : 40;

    eachAxis((axis: 'x' | 'y') => {
      if (!shouldDrag(props.drag, axis)) return;

      const motionValue = this.getAxisMotionValue(axis);

      if (props.dragSnapToOrigin === true) {
        const snapTransition = this.getSnapToOriginTransition(props);
        void motionValue.start(
          animateMotionValue(axis, motionValue, 0, snapTransition, this.node, false),
        );
        return;
      }

      const transition: Transition = this.constraints?.[axis]
        ? { ...this.constraints[axis] }
        : {};

      const inertia: Transition = {
        type: 'inertia',
        velocity: props.dragMomentum === false ? 0 : velocity[axis],
        bounceStiffness,
        bounceDamping,
        timeConstant: 750,
        restDelta: 1,
        restSpeed: 10,
        ...dragTransition,
        ...transition,
      };

      void motionValue.start(
        animateMotionValue(axis, motionValue, 0, inertia, this.node, false),
      );
    });
  }

  private getSnapToOriginTransition(props: {
    dragTransition?: Transition;
    transition?: Transition;
  }): Transition {
    if (this.isTargetAnimationTransition(props.dragTransition)) {
      return props.dragTransition;
    }

    return props.transition ?? {};
  }

  private isTargetAnimationTransition(transition: Transition | undefined): transition is Transition {
    if (transition === undefined || typeof transition !== 'object') return false;
    return 'type' in transition
      ? transition.type !== undefined && transition.type !== 'inertia'
      : false;
  }

  private getAxisMotionValue(axis: 'x' | 'y'): MotionValue {
    const props = this.node.getProps();
    const dragValue = axis === 'x' ? props._dragX : props._dragY;
    return dragValue ?? this.node.getValue(axis, 0);
  }

  private stopAnimations(): void {
    eachAxis((axis: 'x' | 'y') => {
      this.getAxisMotionValue(axis).stop();
    });
  }

  cancel(): void {
    this.isDragging = false;
    const projection: unknown = this.node.projection;
    if (isProjectionNode(projection)) {
      projection.isAnimationBlocked = false;
    }
    this.unlockTextSelection();
    this.panSession?.cancel();
    this.panSession = null;
    this.releaseDragLock?.();
    this.releaseDragLock = null;
    this.stopLayoutUpdateListener?.();
    this.stopLayoutUpdateListener = null;
  }

  private triggerRender(): void {
    if (hasRenderMethod(this.node)) {
      this.node.render();
    }
  }

  private lockTextSelection(): void {
    const current: unknown = this.node.current;
    if (!isHTMLElement(current)) return;
    const doc = current.ownerDocument;
    if (this.previousUserSelect !== null) return;

    const body = doc.body;
    const documentElement = doc.documentElement;

    this.previousUserSelect = {
      body: body.style.userSelect,
      documentElement: documentElement.style.userSelect,
    };

    documentElement.style.userSelect = 'none';
    body.style.userSelect = 'none';
  }

  private unlockTextSelection(): void {
    const current: unknown = this.node.current;
    if (!isHTMLElement(current)) return;
    const doc = current.ownerDocument;
    if (this.previousUserSelect === null) return;

    const body = doc.body;
    const documentElement = doc.documentElement;

    documentElement.style.userSelect = this.previousUserSelect.documentElement;
    body.style.userSelect = this.previousUserSelect.body;

    this.previousUserSelect = null;
  }
}
