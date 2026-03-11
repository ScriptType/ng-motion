/**
 * NgmMotionDirective — the core motion directive for ng-motion.
 *
 * Bridges Angular's signal-based reactivity to motion-dom's VisualElement
 * animation engine. Uses afterNextRender for DOM mounting, a single effect
 * for reactive input tracking, and DestroyRef for cleanup.
 */

import {
  afterEveryRender,
  afterNextRender,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  OnInit,
  output,
  untracked,
} from '@angular/core';
import { isMotionValue, motionValue } from 'motion-dom';
import type {
  AnimationDefinition,
  HTMLVisualElement,
  IProjectionNode,
  MotionValue,
  MotionNodeOptions,
  MotionStyle,
  ResolvedValues,
  TargetAndTransition,
  Transition,
  VariantLabels,
  Variants,
} from 'motion-dom';
import type { BoundingBox, Box } from 'motion-utils';
import type { ViewportOptions } from '../gestures/in-view';
import type { DragDirection, PanInfo } from '../gestures/drag/utils';
import {
  createVisualElement,
  mountVisualElement,
  prerenderVisualElementStyles,
  unmountVisualElement,
  updateVisualElement,
  updateVisualElementProps,
  triggerVisualElementAnimation,
} from './visual-element-adapter';
import { MOTION_CONFIG } from './motion-config';
import { PRESENCE_CONTEXT } from '../presence/presence-context';
import { LAYOUT_GROUP } from '../layout/layout-group-context';
import {
  cleanupProjection,
  flushSharedLayoutOrphans,
  getCachedLayoutSnapshot,
  initProjection,
  reparentProjection,
  notifyDidUpdate,
  snapshotBeforeUpdate,
  syncProjectionOptions,
} from '../layout/measure-layout';
import { NgmReorderItemDirective } from '../reorder/reorder-item.directive';
import { isObjectTarget } from '../utils/type-guards';
import { installRouterOutletTeardownAdapter } from './router-outlet-teardown-adapter';
import { DirectLeaveController } from './direct-leave-controller';

/** Extended MotionNodeOptions with style support (mirrors framer-motion's MotionProps). */
interface MotionProps extends MotionNodeOptions {
  style?: MotionStyle;
}

type MotionAnimationInput = TargetAndTransition | VariantLabels | boolean | undefined;
type MotionTargetInput = TargetAndTransition | VariantLabels | undefined;

/** Resolved directive inputs used to build MotionProps without a giant positional argument list. */
interface MotionInputSnapshot {
  initial: MotionAnimationInput;
  animate: MotionAnimationInput;
  transition: Transition | undefined;
  variants: Variants | undefined;
  style: MotionStyle | undefined;
  whileHover: MotionTargetInput;
  whileTap: MotionTargetInput;
  whileFocus: MotionTargetInput;
  globalTapTarget: boolean | undefined;
  whileInView: MotionTargetInput;
  viewport: ViewportOptions | undefined;
  exit: MotionTargetInput;
  drag: boolean | DragDirection | undefined;
  whileDrag: MotionTargetInput;
  dragConstraints: BoundingBox | HTMLElement | undefined;
  dragElastic: boolean | number | Partial<BoundingBox> | undefined;
  dragMomentum: boolean | undefined;
  dragTransition: Record<string, unknown> | undefined;
  dragX: MotionValue<number> | undefined;
  dragY: MotionValue<number> | undefined;
  dragSnapToOrigin: boolean | undefined;
  dragDirectionLock: boolean | undefined;
  dragListener: boolean | undefined;
  dragPropagation: boolean | undefined;
  layout: boolean | 'position' | 'size' | 'preserve-aspect' | undefined;
  layoutId: string | undefined;
  layoutScroll: boolean | undefined;
  layoutRoot: boolean | undefined;
  layoutDependency: unknown;
}

/** Orchestration config extracted from a variant's transition. */
interface OrchestrationConfig {
  when?: 'beforeChildren' | 'afterChildren';
  staggerChildren: number;
  delayChildren: number;
}

@Directive({
  selector: '[ngmMotion]',
})
export class NgmMotionDirective implements OnInit {
  // ── Signal inputs ──
  readonly initial = input<TargetAndTransition | VariantLabels | boolean>();
  readonly animate = input<TargetAndTransition | VariantLabels | boolean>();
  readonly transition = input<Transition>();
  readonly variants = input<Variants>();
  readonly style = input<MotionStyle>();
  readonly whileHover = input<TargetAndTransition | VariantLabels>();
  readonly whileTap = input<TargetAndTransition | VariantLabels>();
  readonly whileFocus = input<TargetAndTransition | VariantLabels>();
  readonly globalTapTarget = input<boolean>();
  readonly whileInView = input<TargetAndTransition | VariantLabels>();
  readonly viewport = input<ViewportOptions>();
  readonly exit = input<TargetAndTransition | VariantLabels>();
  readonly drag = input<boolean | DragDirection>();
  readonly whileDrag = input<TargetAndTransition | VariantLabels>();
  readonly dragConstraints = input<BoundingBox | HTMLElement>();
  readonly dragElastic = input<boolean | number | Partial<BoundingBox>>();
  readonly dragMomentum = input<boolean>();
  readonly dragTransition = input<Record<string, unknown>>();
  readonly dragX = input<MotionValue<number>>();
  readonly dragY = input<MotionValue<number>>();
  readonly dragSnapToOrigin = input<boolean>();
  readonly dragDirectionLock = input<boolean>();
  readonly dragListener = input<boolean>();
  readonly dragPropagation = input<boolean>();

  // ── Layout inputs ──
  readonly layout = input<boolean | 'position' | 'size' | 'preserve-aspect'>();
  readonly layoutId = input<string>();
  readonly layoutScroll = input<boolean>();
  readonly layoutRoot = input<boolean>();
  readonly layoutDependency = input<unknown>();

  // ── Outputs ──
  readonly animationStart = output<AnimationDefinition>();
  readonly animationComplete = output<AnimationDefinition>();
  readonly update = output<ResolvedValues>();
  readonly hoverStart = output();
  readonly hoverEnd = output();
  readonly tap = output();
  readonly tapStart = output();
  readonly tapCancel = output();
  readonly viewportEnter = output();
  readonly viewportLeave = output();
  readonly dragStart = output();
  readonly dragMove = output();
  readonly dragEnd = output();
  readonly directionLock = output();
  readonly layoutAnimationStart = output();
  readonly layoutAnimationComplete = output();

  // ── DI ──
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Angular ElementRef.nativeElement is typed as any
  private readonly element: HTMLElement = inject(ElementRef).nativeElement;
  private readonly destroyRef = inject(DestroyRef);
  private readonly parentMotion = inject(NgmMotionDirective, { optional: true, skipSelf: true });
  private readonly config = inject(MOTION_CONFIG, { optional: true });
  private readonly presenceContext = inject(PRESENCE_CONTEXT, { optional: true });
  private readonly layoutGroup = inject(LAYOUT_GROUP, { optional: true, skipSelf: true });
  private readonly reorderItem = inject(NgmReorderItemDirective, { optional: true, self: true });

  // ── Internal ──
  /** @internal Exposed for parent-child VisualElement linking. */
  ve: HTMLVisualElement | null = null;
  private readonly directLeave = new DirectLeaveController({
    element: this.element,
    getVisualElement: () => this.ve,
    clearVisualElement: () => {
      if (this.ve !== null) {
        unmountVisualElement(this.ve);
        this.ve = null;
      }
    },
  });
  private destroyed = false;
  private mounted = false;
  private projection: IProjectionNode | null = null;
  private pendingProjectionDidUpdate = false;
  private pendingNotifyDidUpdate = false;
  private prevLayoutDependency: unknown;
  private reorderPointX: MotionValue<number> | null = null;
  private reorderPointY: MotionValue<number> | null = null;

  /** @internal Registered child directives for orchestration. */
  private readonly orchestrationChildren = new Set<NgmMotionDirective>();
  /** @internal Animate value propagated from parent (variant propagation). */
  private propagatedAnimate: string | undefined;
  /** @internal Pending orchestration timeouts for cleanup. */
  private orchestrationTimeouts: ReturnType<typeof setTimeout>[] = [];
  ngOnInit(): void {
    prerenderVisualElementStyles(this.element, this.buildCurrentProps() as MotionNodeOptions); // eslint-disable-line @typescript-eslint/consistent-type-assertions -- viewport/drag types diverge
  }

  private hasMeasureLayoutFeatures(
    drag: boolean | DragDirection | undefined,
    layoutVal: boolean | 'position' | 'size' | 'preserve-aspect' | undefined,
    layoutIdVal: string | undefined,
  ): boolean {
    return (
      layoutVal !== undefined || layoutIdVal !== undefined || (drag !== undefined && drag !== false)
    );
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- infer from presenceContext to avoid duplicating its type
  private buildPresenceContext(isPresent: boolean) {
    return this.presenceContext
      ? {
          id: this.presenceContext.id,
          isPresent,
          register: this.presenceContext.register,
          onExitComplete: this.presenceContext.onExitComplete,
        }
      : null;
  }

  /** Wraps a typed output emitter with a destroyed guard. */
  private guardedEmit<T>(emitter: { emit(value: T): void }): (value: T) => void {
    return (value: T) => {
      if (!this.destroyed) emitter.emit(value);
    };
  }

  /** Wraps a void output emitter with a destroyed guard (ignores callback arguments). */
  private guardedVoidEmit(emitter: { emit(): void }): () => void {
    return () => {
      if (!this.destroyed) emitter.emit();
    };
  }

  constructor() {
    installRouterOutletTeardownAdapter();

    // Register with parent for variant propagation / orchestration
    this.parentMotion?.orchestrationChildren.add(this);

    this.setupMountLifecycle();
    this.setupReactiveUpdates();
    this.setupFlipLifecycle();
    this.setupDestroyLifecycle();
  }

  private setupMountLifecycle(): void {
    afterNextRender(() => {
      this.mount();
    });
  }

  private setupReactiveUpdates(): void {
    effect(() => {
      const inputs = this.readMotionInputs();
      const isPresent = this.presenceContext?.isPresent$();

      // Skip before mount — afterNextRender handles initial state.
      if (!this.mounted) return;

      untracked(() => {
        this.applyReactiveUpdate(inputs, isPresent);
      });
    });
  }

  private applyReactiveUpdate(inputs: MotionInputSnapshot, isPresent: boolean | undefined): void {
    if (this.ve === null) return;

    const props = this.buildProps(inputs);
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- MotionProps→Record boundary: viewport/dragConstraints types diverge from motion-dom (Angular doesn't use React refs)
    const propsRec = props as Record<string, unknown>;

    if (this.projection !== null) {
      syncProjectionOptions(this.projection, this.ve, propsRec, this.layoutGroup);
    }

    const hasMeasureLayout = this.hasMeasureLayoutFeatures(
      inputs.drag,
      inputs.layout,
      inputs.layoutId,
    );

    // Snapshot before DOM update (FLIP "before" phase).
    if (this.projection && hasMeasureLayout) {
      this.pendingProjectionDidUpdate =
        snapshotBeforeUpdate(
          this.projection,
          propsRec,
          isPresent ?? true,
          this.prevLayoutDependency,
        ) || this.pendingProjectionDidUpdate;
      this.prevLayoutDependency = inputs.layoutDependency;
    }

    const presenceCtx = this.buildPresenceContext(isPresent ?? true);
    const hasDirectExit = inputs.exit !== undefined && this.presenceContext === null;

    // Dynamically register leave animation if [exit] was added after mount.
    if (hasDirectExit && !this.directLeave.isRegistered()) {
      this.directLeave.register();
    }

    const orch = this.getOrchestration(inputs.animate, inputs.variants);
    const variantChildren = orch ? this.getVariantChildren() : [];
    if (orch && variantChildren.length > 0 && typeof inputs.animate === 'string') {
      this.cancelOrchestration();
      updateVisualElementProps(this.ve, props as MotionNodeOptions, presenceCtx); // eslint-disable-line @typescript-eslint/consistent-type-assertions -- viewport/drag types diverge
      void this.orchestrate(inputs.animate, orch, variantChildren);
      return;
    }

    updateVisualElement(this.ve, props as MotionNodeOptions, presenceCtx); // eslint-disable-line @typescript-eslint/consistent-type-assertions -- viewport/drag types diverge
  }

  private setupFlipLifecycle(): void {
    // FLIP lifecycle — snapshot previous layout, then notify projection tree.
    // This handles the case where Angular's @for reorders DOM elements without
    // any directive inputs changing (so the effect doesn't fire). We use the
    // layout measured in the previous cycle as the "before" snapshot.
    //
    // Split into earlyRead (DOM measurements) and write (schedule projection
    // update) phases to avoid layout thrashing when multiple [ngmMotion]
    // elements are on the page. The browser batches all earlyRead callbacks
    // before any write callbacks, so reads never interleave with writes.
    afterEveryRender({
      earlyRead: () => {
        this.handleFlipEarlyRead();
      },
      write: () => {
        this.handleFlipWrite();
      },
    });
  }

  private handleFlipEarlyRead(): void {
    if (!this.projection) return;

    const hasMeasureLayout = this.hasMeasureLayoutFeatures(
      untracked(this.drag),
      untracked(this.layout),
      untracked(this.layoutId),
    );
    if (!hasMeasureLayout) return;

    // Match Framer's getSnapshotBeforeUpdate -> componentDidUpdate flow.
    // If we already captured a pre-render snapshot this cycle, only commit
    // the update in the write phase and avoid a second post-render willUpdate().
    if (this.pendingProjectionDidUpdate) {
      this.pendingProjectionDidUpdate = false;
      this.pendingNotifyDidUpdate = true;
      return;
    }

    // When layoutDependency is set and stable, skip the manual snapshot but
    // still run willUpdate()+didUpdate() so projection.layout stays current.
    // Without the manual snapshot, willUpdate() measures the element at its
    // CURRENT position → didUpdate() re-measures the same → no delta → no animation.
    // But projection.layout is updated, so cleanup snapshots the correct position.
    const dep = untracked(this.layoutDependency);
    const depStable = dep !== undefined && dep === this.prevLayoutDependency;

    // If willUpdate wasn't already triggered by the effect (no input changes),
    // manually provide a snapshot from the previous layout measurement.
    // This handles DOM reorders where Angular's @for moves elements without
    // any directive inputs changing. Setting snapshot BEFORE willUpdate() is
    // critical: willUpdate's updateSnapshot() has a guard `if (this.snapshot) return`
    // so our manually-set snapshot is preserved.
    // Skip when layoutDependency is stable — prevents animations from external
    // page shifts (e.g., content above growing and pushing this element down).
    if (
      !depStable &&
      !this.projection.isLayoutDirty &&
      this.projection.layout !== undefined &&
      this.projection.snapshot === undefined
    ) {
      this.projection.snapshot = getCachedLayoutSnapshot(this.projection);
    }

    this.projection.willUpdate();
    this.pendingNotifyDidUpdate = true;
  }

  private handleFlipWrite(): void {
    if (!this.pendingNotifyDidUpdate || !this.projection) return;
    this.pendingNotifyDidUpdate = false;
    notifyDidUpdate(this.projection);
  }

  private setupDestroyLifecycle(): void {
    this.destroyRef.onDestroy(() => {
      this.handleDestroy();
    });
  }

  private handleDestroy(): void {
    // Angular's actual order: DOM detach (checks lView[ANIMATIONS].leave) → then DestroyRef.
    // If the direct leave controller wrote to Angular's leave map, the element is still in
    // DOM at this point — Angular skipped immediate removal. We start the exit animation here
    // and manually remove the element when it completes.
    const exitVal = untracked(this.exit);
    const hasExit =
      exitVal !== undefined &&
      this.presenceContext === null &&
      this.ve !== null &&
      this.directLeave.isRegistered();
    const skipLeaveAnimation = hasExit && this.directLeave.shouldSkipLeaveAnimation();
    this.directLeave.setSkipLeaveAnimationOnDestroy(skipLeaveAnimation);

    this.destroyed = true;
    this.parentMotion?.orchestrationChildren.delete(this);
    this.cancelOrchestration();

    if (this.projection) {
      const preserveProjectionOnUnmount = Boolean(this.projection.options.layoutId);
      cleanupProjection(this.projection, this.layoutGroup);
      if (this.ve && preserveProjectionOnUnmount) {
        this.ve.projection = null;
      }
      this.projection = null;
    }
    const shouldAnimateLeave = hasExit && !skipLeaveAnimation;

    if (this.ve !== null && !shouldAnimateLeave) {
      unmountVisualElement(this.ve);
      this.ve = null;
    }

    // Exactly one of these three branches runs when leave is registered:
    //   1. Exit animation plays → start() handles cleanup on completion
    //   2. No [exit] binding (removed or VE gone) → resolve promises so view destruction unblocks
    //   3. Route teardown detected → skip animation and remove routed host
    if (shouldAnimateLeave) {
      // Start exit animation directly — don't depend on Angular's animation queue scheduler.
      this.directLeave.start(exitVal);
    } else if (this.directLeave.isRegistered() && !hasExit) {
      this.directLeave.cleanupAfterMissingExit();
    } else if (this.directLeave.isRegistered() && skipLeaveAnimation) {
      this.directLeave.cleanupAfterSkippedRouteTeardown();
    }

    this.reorderPointX?.destroy();
    this.reorderPointX = null;
    this.reorderPointY?.destroy();
    this.reorderPointY = null;
    this.pendingProjectionDidUpdate = false;
    this.pendingNotifyDidUpdate = false;
    this.mounted = false;
  }

  private mount(): void {
    const inputs = this.readMotionInputsUntracked();
    const props = this.buildProps(inputs);

    const hasMeasureLayout = this.hasMeasureLayoutFeatures(
      inputs.drag,
      inputs.layout,
      inputs.layoutId,
    );

    const presenceCtx = this.buildPresenceContext(this.presenceContext?.isPresent ?? true);

    // Cancel any active leave animation at the same parent (fast @if toggle).
    // If a sibling is mid-leave, snapshot its values as initial so the new
    // element reverses from the exit position — matching *ngmPresence behavior.
    if (inputs.exit !== undefined && this.presenceContext === null) {
      const snapshot = this.directLeave.cancelActiveLeave();
      if (snapshot) {
        props.initial = snapshot;
      }
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- MotionProps→MotionNodeOptions boundary: viewport/dragConstraints types diverge from motion-dom (Angular doesn't use React refs)
    const mountProps = props as MotionNodeOptions;

    this.ve = createVisualElement({
      props: mountProps,
      parent: this.parentMotion?.ve ?? undefined,
      blockInitialAnimation: inputs.initial === false,
      presenceContext: presenceCtx,
      allowProjection: true,
    });

    mountVisualElement(this.ve, this.element);

    this.projection = initProjection(
      this.ve,
      mountProps as Record<string, unknown>, // eslint-disable-line @typescript-eslint/consistent-type-assertions -- measure-layout takes Record
      this.layoutGroup,
    );
    this.projection.mount(this.element);
    flushSharedLayoutOrphans(this.projection);

    // Fix projection tree for children that mounted before this parent.
    // Angular's afterNextRender doesn't guarantee parent-before-child ordering,
    // so children may have created orphan projection nodes (parent = undefined).
    // Now that this parent's projection exists, reparent them so motion-dom's
    // internal scroll handling (removeElementScroll, updateScroll) works.
    for (const child of this.orchestrationChildren) {
      if (child.projection) {
        reparentProjection(child.projection, this.projection);
      }
    }

    if (hasMeasureLayout) {
      snapshotBeforeUpdate(
        this.projection,
        mountProps as Record<string, unknown>, // eslint-disable-line @typescript-eslint/consistent-type-assertions -- measure-layout takes Record
        this.presenceContext?.isPresent ?? true,
        undefined,
        { useCachedLayoutSnapshot: false },
      );
      notifyDidUpdate(this.projection);
      this.prevLayoutDependency = inputs.layoutDependency;
    }

    // Register leave animation dynamically when [exit] is set (without *ngmPresence).
    // Must happen after mount so ɵgetLContext finds the element in the LView.
    if (inputs.exit !== undefined && this.presenceContext === null) {
      this.directLeave.register();
    }

    this.mounted = true;
  }

  private readMotionInputs(): MotionInputSnapshot {
    const exit = this.exit();
    const { initial, animate } = this.resolveExitDefaults(this.initial(), this.animate(), exit);

    return {
      initial,
      animate,
      transition: this.transition(),
      variants: this.variants(),
      style: this.style(),
      whileHover: this.whileHover(),
      whileTap: this.whileTap(),
      whileFocus: this.whileFocus(),
      globalTapTarget: this.globalTapTarget(),
      whileInView: this.whileInView(),
      viewport: this.viewport(),
      exit,
      drag: this.drag(),
      whileDrag: this.whileDrag(),
      dragConstraints: this.dragConstraints(),
      dragElastic: this.dragElastic(),
      dragMomentum: this.dragMomentum(),
      dragTransition: this.dragTransition(),
      dragX: this.dragX(),
      dragY: this.dragY(),
      dragSnapToOrigin: this.dragSnapToOrigin(),
      dragDirectionLock: this.dragDirectionLock(),
      dragListener: this.dragListener(),
      dragPropagation: this.dragPropagation(),
      layout: this.layout(),
      layoutId: this.layoutId(),
      layoutScroll: this.layoutScroll(),
      layoutRoot: this.layoutRoot(),
      layoutDependency: this.layoutDependency(),
    };
  }

  private readMotionInputsUntracked(): MotionInputSnapshot {
    return untracked(() => this.readMotionInputs());
  }

  private buildProps(inputs: MotionInputSnapshot): MotionProps {
    const mergedTransition = inputs.transition ?? this.config?.transition;
    const resolvedStyle = this.getResolvedStyle(inputs.style, inputs.dragX, inputs.dragY);
    const props = this.buildBaseMotionProps(inputs, mergedTransition, resolvedStyle);
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Angular adapts viewport.root and dragConstraints types (no React refs)
    const untypedProps = props as Record<string, unknown>;

    this.applyGestureProps(props, untypedProps, inputs);
    this.attachAnimationCallbacks(props);
    this.applyDragProps(props, untypedProps, inputs);
    this.applyLayoutProps(untypedProps, inputs);
    this.attachLayoutCallbacks(untypedProps);
    this.hoistRepeatTransitions(props);

    return props;
  }

  private buildBaseMotionProps(
    inputs: MotionInputSnapshot,
    mergedTransition: Transition | undefined,
    resolvedStyle: MotionStyle | undefined,
  ): MotionProps {
    const props: MotionProps = {};

    if (inputs.initial !== undefined) props.initial = inputs.initial;
    const effectiveAnimate = inputs.animate ?? this.propagatedAnimate;
    if (effectiveAnimate !== undefined) props.animate = effectiveAnimate;
    if (mergedTransition !== undefined) props.transition = mergedTransition;
    if (inputs.variants !== undefined) props.variants = inputs.variants;
    if (resolvedStyle !== undefined) props.style = resolvedStyle;
    if (inputs.exit !== undefined) props.exit = inputs.exit;

    return props;
  }

  private applyGestureProps(
    props: MotionProps,
    untypedProps: Record<string, unknown>,
    inputs: MotionInputSnapshot,
  ): void {
    if (inputs.whileHover !== undefined) props.whileHover = inputs.whileHover;
    if (inputs.whileTap !== undefined) props.whileTap = inputs.whileTap;
    if (inputs.whileFocus !== undefined) props.whileFocus = inputs.whileFocus;
    if (inputs.globalTapTarget !== undefined) untypedProps['globalTapTarget'] = inputs.globalTapTarget;
    if (inputs.whileInView !== undefined) props.whileInView = inputs.whileInView;
    if (inputs.viewport !== undefined) untypedProps['viewport'] = inputs.viewport;
  }

  private attachAnimationCallbacks(props: MotionProps): void {
    props.onAnimationStart = this.guardedEmit(this.animationStart);
    props.onAnimationComplete = this.guardedEmit(this.animationComplete);
    props.onUpdate = this.guardedEmit(this.update);
    props.onHoverStart = this.guardedVoidEmit(this.hoverStart);
    props.onHoverEnd = this.guardedVoidEmit(this.hoverEnd);
    props.onTap = this.guardedVoidEmit(this.tap);
    props.onTapStart = this.guardedVoidEmit(this.tapStart);
    props.onTapCancel = this.guardedVoidEmit(this.tapCancel);
    props.onViewportEnter = this.guardedVoidEmit(this.viewportEnter);
    props.onViewportLeave = this.guardedVoidEmit(this.viewportLeave);
  }

  private applyDragProps(
    props: MotionProps,
    untypedProps: Record<string, unknown>,
    inputs: MotionInputSnapshot,
  ): void {
    if (inputs.drag !== undefined) untypedProps['drag'] = inputs.drag;
    if (inputs.whileDrag !== undefined) props.whileDrag = inputs.whileDrag;
    if (inputs.dragConstraints !== undefined) untypedProps['dragConstraints'] = inputs.dragConstraints;
    if (inputs.dragElastic !== undefined) untypedProps['dragElastic'] = inputs.dragElastic;
    if (inputs.dragMomentum !== undefined) untypedProps['dragMomentum'] = inputs.dragMomentum;
    if (inputs.dragTransition !== undefined) untypedProps['dragTransition'] = inputs.dragTransition;
    if (inputs.dragX !== undefined) untypedProps['_dragX'] = inputs.dragX;
    if (inputs.dragY !== undefined) untypedProps['_dragY'] = inputs.dragY;
    if (inputs.dragSnapToOrigin !== undefined) untypedProps['dragSnapToOrigin'] = inputs.dragSnapToOrigin;
    if (inputs.dragDirectionLock !== undefined) untypedProps['dragDirectionLock'] = inputs.dragDirectionLock;
    if (inputs.dragListener !== undefined) untypedProps['dragListener'] = inputs.dragListener;
    if (inputs.dragPropagation !== undefined) untypedProps['dragPropagation'] = inputs.dragPropagation;

    untypedProps['onDragStart'] = () => {
      if (this.destroyed) return;
      this.reorderItem?.onDragStart();
      this.dragStart.emit();
    };
    untypedProps['onDrag'] = (_event: PointerEvent, info: PanInfo) => {
      if (this.destroyed) return;
      const reorderItem = this.reorderItem;
      const axis = reorderItem?.getAxis();
      if (reorderItem !== null && axis !== undefined) {
        const motionVal = this.ve?.getValue(axis);
        const currentOffset: number | undefined =
          motionVal !== undefined
            ? (motionVal.get() as number) // eslint-disable-line @typescript-eslint/consistent-type-assertions -- MotionValue.get() returns any
            : undefined;
        reorderItem.updateOrder(
          currentOffset ?? info.offset[axis],
          info.velocity[axis],
          info.point[axis],
        );
      }
      this.dragMove.emit();
    };
    untypedProps['onDragEnd'] = () => {
      if (this.destroyed) return;
      this.reorderItem?.onDragEnd();
      this.dragEnd.emit();
    };
    untypedProps['onDirectionLock'] = this.guardedVoidEmit(this.directionLock);
  }

  private applyLayoutProps(
    untypedProps: Record<string, unknown>,
    inputs: MotionInputSnapshot,
  ): void {
    if (inputs.layout !== undefined) untypedProps['layout'] = inputs.layout;
    if (inputs.layoutId !== undefined) untypedProps['layoutId'] = inputs.layoutId;
    if (inputs.layoutScroll !== undefined) untypedProps['layoutScroll'] = inputs.layoutScroll;
    if (inputs.layoutRoot !== undefined) untypedProps['layoutRoot'] = inputs.layoutRoot;
    if (inputs.layoutDependency !== undefined) untypedProps['layoutDependency'] = inputs.layoutDependency;
  }

  private attachLayoutCallbacks(untypedProps: Record<string, unknown>): void {
    untypedProps['onLayoutAnimationStart'] = this.guardedVoidEmit(this.layoutAnimationStart);
    untypedProps['onLayoutAnimationComplete'] = this.guardedVoidEmit(this.layoutAnimationComplete);
    untypedProps['onLayoutMeasure'] = (measured: Box) => {
      if (this.destroyed) return;
      this.reorderItem?.registerLayout(measured);
    };
  }

  private hoistRepeatTransitions(props: MotionProps): void {
    // When the top-level transition has `repeat` and gesture states are defined,
    // embed the full transition (incl. repeat) into each animation target and
    // strip repeat from the top-level. This prevents deactivation fallback
    // animations (which use the default transition) from repeating infinitely.
    if (props.transition === undefined) return;

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Transition union type doesn't expose repeat directly
    const transitionRecord = props.transition as Record<string, unknown>;
    if (transitionRecord['repeat'] === undefined || transitionRecord['repeat'] === 0) {
      return;
    }

    const hasObjectGesture =
      isObjectTarget(props.whileInView) ||
      isObjectTarget(props.whileHover) ||
      isObjectTarget(props.whileTap) ||
      isObjectTarget(props.whileFocus) ||
      isObjectTarget(props.whileDrag);

    if (!hasObjectGesture) return;

    const fullTransition = props.transition;
    const embedRepeat = (
      target: TargetAndTransition | VariantLabels | undefined,
    ): typeof target => {
      if (target === undefined || typeof target !== 'object' || Array.isArray(target)) {
        return target;
      }

      const existing = target.transition;
      /* eslint-disable @typescript-eslint/consistent-type-assertions -- Transition union type can't be spread directly, cast to object for merge */
      const merged = existing
        ? { ...(fullTransition as object), ...(existing as object) }
        : fullTransition;
      return { ...target, transition: merged } as TargetAndTransition;
      /* eslint-enable @typescript-eslint/consistent-type-assertions */
    };

    if (isObjectTarget(props.animate)) {
      props.animate = embedRepeat(props.animate);
    }
    props.whileInView = embedRepeat(props.whileInView);
    props.whileHover = embedRepeat(props.whileHover);
    props.whileTap = embedRepeat(props.whileTap);
    props.whileFocus = embedRepeat(props.whileFocus);
    props.whileDrag = embedRepeat(props.whileDrag);

    const { repeat: _repeat, repeatType: _repeatType, repeatDelay: _repeatDelay, ...rest } =
      transitionRecord;
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- reconstructing Transition without repeat keys
    props.transition = (Object.keys(rest).length > 0 ? rest : undefined) as
      | Transition
      | undefined;
  }

  private getResolvedStyle(
    style: MotionStyle | undefined,
    dragX: MotionValue<number> | undefined,
    dragY: MotionValue<number> | undefined,
  ): MotionStyle | undefined {
    if (!this.reorderItem) {
      return style;
    }

    const nextStyle: MotionStyle = { ...(style ?? {}) };
    nextStyle['x'] = dragX ?? this.getReorderPointValue('x', style?.['x']);
    nextStyle['y'] = dragY ?? this.getReorderPointValue('y', style?.['y']);
    return nextStyle;
  }

  private getReorderPointValue(
    axis: 'x' | 'y',
    styleValue: MotionStyle['x'] | undefined,
  ): MotionValue<number> {
    if (isMotionValue(styleValue)) {
      return styleValue as MotionValue<number>; // eslint-disable-line @typescript-eslint/consistent-type-assertions -- isMotionValue narrows to MotionValue<any>
    }

    if (axis === 'x') {
      this.reorderPointX ??= motionValue(0);
      return this.reorderPointX;
    }

    this.reorderPointY ??= motionValue(0);
    return this.reorderPointY;
  }

  /**
   * When [exit] is set without [initial], auto-derive initial from exit values
   * so the enter animation reverses from the exit state (like AnimatePresence).
   * Also injects height: 'auto' into animate when exit has height but animate doesn't.
   */
  private resolveExitDefaults(
    initial: TargetAndTransition | VariantLabels | boolean | undefined,
    animate: TargetAndTransition | VariantLabels | boolean | undefined,
    exitVal: TargetAndTransition | VariantLabels | undefined,
  ): {
    initial: TargetAndTransition | VariantLabels | boolean | undefined;
    animate: TargetAndTransition | VariantLabels | boolean | undefined;
  } {
    if (
      !isObjectTarget(exitVal) ||
      initial !== undefined ||
      this.presenceContext !== null
    ) {
      return { initial, animate };
    }

    const derived: Record<string, unknown> = {};
    for (const key of Object.keys(exitVal)) {
      if (key !== 'transition') derived[key] = (exitVal as Record<string, unknown>)[key]; // eslint-disable-line @typescript-eslint/consistent-type-assertions -- TargetAndTransition lacks index signature
    }
    if (Object.keys(derived).length === 0) return { initial, animate };

    let resolvedAnimate = animate;

    // When exit defines height and animate is an object without a height target,
    // inject height: 'auto' so motion-dom measures the element's natural height.
    if (
      'height' in derived &&
      typeof resolvedAnimate === 'object' &&
      !Array.isArray(resolvedAnimate) &&
      !('height' in resolvedAnimate)
    ) {
      resolvedAnimate = { ...resolvedAnimate, height: 'auto' };
    }

    return {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- derived built from exit keys, mirrors TargetAndTransition shape
      initial: derived as TargetAndTransition,
      animate: resolvedAnimate,
    };
  }

  private buildCurrentProps(): MotionProps {
    return this.buildProps(this.readMotionInputsUntracked());
  }

  // ── Orchestration (when / staggerChildren / delayChildren) ──

  /** Extracts orchestration config from the active variant's transition. */
  private getOrchestration(
    animate: TargetAndTransition | VariantLabels | boolean | undefined,
    variants: Variants | undefined,
  ): OrchestrationConfig | null {
    if (variants === undefined || typeof animate !== 'string') return null;

    const variant = variants[animate];
    if (typeof variant !== 'object') return null;

    const transition = variant.transition;
    if (transition === undefined || typeof transition !== 'object') return null;

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Transition type doesn't expose orchestration fields directly
    const t = transition as Record<string, unknown>;
    const when = typeof t['when'] === 'string' ? t['when'] : undefined;
    const staggerChildren =
      typeof t['staggerChildren'] === 'number' ? t['staggerChildren'] : undefined;
    const delayChildren = typeof t['delayChildren'] === 'number' ? t['delayChildren'] : undefined;

    if (when === undefined && staggerChildren === undefined && delayChildren === undefined) {
      return null;
    }

    return {
      when: when === 'beforeChildren' || when === 'afterChildren' ? when : undefined,
      staggerChildren: staggerChildren ?? 0,
      delayChildren: delayChildren ?? 0,
    };
  }

  /** Returns children that don't have their own [animate] (variant nodes). */
  private getVariantChildren(): NgmMotionDirective[] {
    return Array.from(this.orchestrationChildren).filter(
      (child) => child.animate() === undefined && child.ve !== null,
    );
  }

  /** Cancels any pending orchestration timeouts. */
  private cancelOrchestration(): void {
    for (const t of this.orchestrationTimeouts) clearTimeout(t);
    this.orchestrationTimeouts = [];
  }

  /** Orchestrates parent + children animations based on config. */
  private async orchestrate(
    parentAnimate: string,
    config: OrchestrationConfig,
    children: NgmMotionDirective[],
  ): Promise<void> {
    if (!this.ve || this.destroyed) return;

    // Propagate the variant label to children so their VEs know what to animate to
    for (const child of children) {
      if (child.ve) {
        child.propagatedAnimate = parentAnimate;
        const childProps = { ...child.ve.getProps(), animate: parentAnimate };
        child.ve.update(childProps, null);
        child.ve.updateFeatures();
      }
    }

    const { when, staggerChildren, delayChildren } = config;

    if (when === 'beforeChildren') {
      await triggerVisualElementAnimation(this.ve);
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- this.destroyed may change during await
      if (!this.destroyed) {
        await this.animateChildrenStaggered(children, staggerChildren, delayChildren);
      }
    } else if (when === 'afterChildren') {
      await this.animateChildrenStaggered(children, staggerChildren, delayChildren);
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- this.destroyed may change during await
      if (!this.destroyed) {
        await triggerVisualElementAnimation(this.ve);
      }
    } else {
      // No 'when' — parent + staggered children simultaneously
      await Promise.all([
        triggerVisualElementAnimation(this.ve),
        this.animateChildrenStaggered(children, staggerChildren, delayChildren),
      ]);
    }
  }

  /** Triggers staggered animations on children. */
  private animateChildrenStaggered(
    children: NgmMotionDirective[],
    stagger: number,
    delay: number,
  ): Promise<void> {
    const promises = children.map((child, i) => {
      const totalDelayMs = (delay + i * stagger) * 1000;

      return new Promise<void>((resolve) => {
        const trigger = (): void => {
          if (this.destroyed || !child.ve) {
            resolve();
            return;
          }
          const p = child.ve.animationState?.animateChanges();
          if (p !== undefined) {
            void p.then(resolve, resolve);
          } else {
            resolve();
          }
        };

        if (totalDelayMs <= 0) {
          trigger();
        } else {
          const t = setTimeout(trigger, totalDelayMs);
          this.orchestrationTimeouts.push(t);
        }
      });
    });

    return Promise.all(promises).then(() => {
      this.orchestrationTimeouts = [];
    });
  }
}
