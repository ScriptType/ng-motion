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
  Injector,
  input,
  OnInit,
  output,
  untracked,
  ɵallLeavingAnimations,
  ɵgetLContext,
} from '@angular/core';
import { Router } from '@angular/router';
import { animateVisualElement, isMotionValue, motionValue } from 'motion-dom';
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

/** Extended MotionNodeOptions with style support (mirrors framer-motion's MotionProps). */
interface MotionProps extends MotionNodeOptions {
  style?: MotionStyle;
}

/** Orchestration config extracted from a variant's transition. */
interface OrchestrationConfig {
  when?: 'beforeChildren' | 'afterChildren';
  staggerChildren: number;
  delayChildren: number;
}

/**
 * Internal Angular LView array indices — verified for Angular 21.2.
 * Used by registerLeaveAnimation() to write directly to the LView's animation
 * data, bypassing the (animate.leave) host binding overhead for non-exit elements.
 *
 * Validate on major Angular upgrades:
 *   node_modules/@angular/core/fesm2022/_effect-chunk2.mjs → search "const ID", "const ANIMATIONS"
 */
const LVIEW_ID = 19;
const LVIEW_INJECTOR = 9;
const LVIEW_ANIMATIONS = 26;
const LVIEW_PARENT = 3;
const LVIEW_DECLARATION_VIEW = 14;

type LeaveAnimateFn = () => { promise: Promise<void> };

interface LViewLeaveAnimationEntry {
  animateFns: LeaveAnimateFn[];
  resolvers?: Array<() => void>;
}

interface LViewAnimations {
  leave?: Map<number, LViewLeaveAnimationEntry>;
  running?: Promise<void>;
}

interface AngularAnimationQueue {
  queue: Set<() => void>;
  isScheduled: boolean;
  scheduler: ((injector: unknown) => void) | null;
  injector: unknown;
}

/** Type guard for non-null, non-array objects (TargetAndTransition, not VariantLabels). */
function isObjectTarget(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
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
  private readonly router = inject(Router, { optional: true });

  // ── Internal ──
  /** @internal Exposed for parent-child VisualElement linking. */
  ve: HTMLVisualElement | null = null;
  private destroyed = false;
  private mounted = false;
  private projection: IProjectionNode | null = null;
  private pendingProjectionDidUpdate = false;
  private pendingNotifyDidUpdate = false;
  private prevLayoutDependency: unknown;
  private reorderPointX: MotionValue<number> | null = null;
  private reorderPointY: MotionValue<number> | null = null;
  /** Whether a leave animation is currently playing. */
  private leaveAnimationActive = false;
  /** Whether this element has a leave animation registered on its LView. */
  private leaveRegistered = false;
  /** Cached LView data from registerLeaveAnimation() for O(1) cleanup. */
  private leaveNodeIndex = -1;
  private leaveLView: unknown[] | null = null;
  /** Cached animateFn identity for O(1) leave map cleanup. */
  private leaveAnimateFn: LeaveAnimateFn | null = null;
  /** Resolvers for Angular leave promises; route teardown may register multiple waiters per node. */
  private readonly leaveResolvers: Array<() => void> = [];
  /** Listener for Angular's cancel-leaving-nodes event, stored for cleanup. */
  private cancelLeaveListener: ((e: Event) => void) | null = null;
  /** Reference to this directive's entry in activeLeaves for O(1) cleanup. */
  private leaveEntry: {
    directive: NgmMotionDirective;
    parent: Node;
    userExitKeys: Set<string>;
  } | null = null;

  /** @internal Registered child directives for orchestration. */
  private readonly orchestrationChildren = new Set<NgmMotionDirective>();
  /** @internal Animate value propagated from parent (variant propagation). */
  private propagatedAnimate: string | undefined;
  /** @internal Pending orchestration timeouts for cleanup. */
  private orchestrationTimeouts: ReturnType<typeof setTimeout>[] = [];

  /** Static registry of active leave animations for fast toggle cancellation. */
  private static activeLeaves = new Set<{
    directive: NgmMotionDirective;
    parent: Node;
    /** Keys from the user's original exit definition (excludes auto-added collapse keys). */
    userExitKeys: Set<string>;
  }>();

  /**
   * Static store for snapshots from cancelled leave animations.
   * When Angular's `cancelLeavingNodes` removes a leaving element (fast @if toggle),
   * the snapshot is saved here keyed by parent node so the incoming element can
   * pick it up as its initial state in mount().
   */
  private static cancelledLeaveSnapshots = new WeakMap<Node, Record<string, number>>();
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

  /** Resolves every pending Angular leave promise for this node. */
  private resolveLeavePromises(): void {
    while (this.leaveResolvers.length > 0) {
      this.leaveResolvers.pop()?.();
    }
  }

  constructor() {
    // Register with parent for variant propagation / orchestration
    this.parentMotion?.orchestrationChildren.add(this);

    afterNextRender(() => {
      this.mount();
    });

    effect(() => {
      // Read all signals to establish reactive dependencies
      const initial = this.initial();
      const animate = this.animate();
      const transition = this.transition();
      const variants = this.variants();
      const style = this.style();
      const whileHover = this.whileHover();
      const whileTap = this.whileTap();
      const whileFocus = this.whileFocus();
      const globalTapTarget = this.globalTapTarget();
      const whileInView = this.whileInView();
      const viewport = this.viewport();
      const exitVal = this.exit();
      // Read presence signal to establish reactive dependency
      const isPresent = this.presenceContext?.isPresent$();
      const drag = this.drag();
      const whileDrag = this.whileDrag();
      const dragConstraints = this.dragConstraints();
      const dragElastic = this.dragElastic();
      const dragMomentum = this.dragMomentum();
      const dragTransition = this.dragTransition();
      const dragX = this.dragX();
      const dragY = this.dragY();
      const dragSnapToOrigin = this.dragSnapToOrigin();
      const dragDirectionLock = this.dragDirectionLock();
      const dragListener = this.dragListener();
      const dragPropagation = this.dragPropagation();
      // Read layout signals to establish reactive dependencies
      const layoutVal = this.layout();
      const layoutIdVal = this.layoutId();
      const layoutScrollVal = this.layoutScroll();
      const layoutRootVal = this.layoutRoot();
      const layoutDependencyVal = this.layoutDependency();

      // Skip before mount — afterNextRender handles initial state
      if (!this.mounted) return;

      untracked(() => {
        if (this.ve === null) return;
        const { initial: ri, animate: ra } = this.resolveExitDefaults(initial, animate, exitVal);
        const props = this.buildProps(
          ri,
          ra,
          transition,
          variants,
          style,
          whileHover,
          whileTap,
          whileFocus,
          globalTapTarget,
          whileInView,
          viewport,
          exitVal,
          drag,
          whileDrag,
          dragConstraints,
          dragElastic,
          dragMomentum,
          dragTransition,
          dragX,
          dragY,
          dragSnapToOrigin,
          dragDirectionLock,
          dragListener,
          dragPropagation,
          layoutVal,
          layoutIdVal,
          layoutScrollVal,
          layoutRootVal,
          layoutDependencyVal,
        );

        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- MotionProps→Record boundary: viewport/dragConstraints types diverge from motion-dom (Angular doesn't use React refs)
        const propsRec = props as Record<string, unknown>;

        if (this.projection !== null) {
          syncProjectionOptions(this.projection, this.ve, propsRec, this.layoutGroup);
        }

        const hasMeasureLayout = this.hasMeasureLayoutFeatures(drag, layoutVal, layoutIdVal);

        // Snapshot before DOM update (FLIP "before" phase)
        if (this.projection && hasMeasureLayout) {
          this.pendingProjectionDidUpdate =
            snapshotBeforeUpdate(
              this.projection,
              propsRec,
              isPresent ?? true,
              this.prevLayoutDependency,
            ) || this.pendingProjectionDidUpdate;
          this.prevLayoutDependency = layoutDependencyVal;
        }

        const presenceCtx = this.buildPresenceContext(isPresent ?? true);
        const hasDirectExit = exitVal !== undefined && this.presenceContext === null;

        // Dynamically register leave animation if [exit] was added after mount.
        if (hasDirectExit && !this.leaveRegistered) {
          this.registerLeaveAnimation();
        }

        // Check for orchestration (when/staggerChildren/delayChildren)
        const orch = this.getOrchestration(animate, variants);
        const variantChildren = orch ? this.getVariantChildren() : [];
        if (orch && variantChildren.length > 0 && typeof animate === 'string') {
          this.cancelOrchestration();
          updateVisualElementProps(this.ve, props as MotionNodeOptions, presenceCtx); // eslint-disable-line @typescript-eslint/consistent-type-assertions -- viewport/drag types diverge
          void this.orchestrate(animate, orch, variantChildren);
        } else {
          updateVisualElement(this.ve, props as MotionNodeOptions, presenceCtx); // eslint-disable-line @typescript-eslint/consistent-type-assertions -- viewport/drag types diverge
        }
      });
    });

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
      },
      write: () => {
        if (!this.pendingNotifyDidUpdate || !this.projection) return;
        this.pendingNotifyDidUpdate = false;
        notifyDidUpdate(this.projection);
      },
    });

    this.destroyRef.onDestroy(() => {
      // Angular's actual order: DOM detach (checks lView[ANIMATIONS].leave) → then DestroyRef.
      // If registerLeaveAnimation() wrote to lView[ANIMATIONS].leave, the element is still in
      // DOM at this point — Angular skipped immediate removal. We start the exit animation here
      // and manually remove the element when it completes.
      const exitVal = untracked(this.exit);
      const hasExit =
        exitVal !== undefined &&
        this.presenceContext === null &&
        this.ve !== null &&
        this.leaveRegistered;
      const skipLeaveAnimation = hasExit && this.shouldSkipLeaveAnimation();
      const queueRepairInjector = this.getAnimationQueueInjector();

      if (this.leaveRegistered) {
        if (skipLeaveAnimation) {
          this.flushAngularAnimationQueue();
        } else {
          this.ensureAngularAnimationQueueScheduler();
        }
        if (queueRepairInjector !== null) {
          afterNextRender(
            () => {
              if (skipLeaveAnimation) {
                this.flushAngularAnimationQueue();
              } else {
                this.ensureAngularAnimationQueueScheduler();
              }
            },
            { injector: queueRepairInjector },
          );
        }
      }

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
      if (this.ve !== null && (!hasExit || skipLeaveAnimation)) {
        unmountVisualElement(this.ve);
        this.ve = null;
      }
      // If leave was registered but we're not animating (e.g. [exit] removed, VE gone,
      // or router teardown should bypass exit), resolve Angular's pending promises
      // so view destruction never stalls.
      if (this.leaveRegistered && !hasExit) {
        this.resolveLeavePromises();
        this.cleanupLeaveMapEntry();
      }
      if (this.leaveRegistered && skipLeaveAnimation) {
        this.cleanupLeaveMapEntry();
        this.removeRoutedHostIfPresent();
      }
      this.reorderPointX?.destroy();
      this.reorderPointX = null;
      this.reorderPointY?.destroy();
      this.reorderPointY = null;
      this.pendingProjectionDidUpdate = false;
      this.pendingNotifyDidUpdate = false;
      this.mounted = false;

      // Start exit animation directly — don't depend on Angular's animation queue scheduler.
      if (hasExit && !skipLeaveAnimation) {
        this.startLeaveAnimation(exitVal);
      }
    });
  }

  private mount(): void {
    const exitVal = untracked(this.exit);
    const { initial, animate } = this.resolveExitDefaults(
      untracked(this.initial),
      untracked(this.animate),
      exitVal,
    );
    const transition = untracked(this.transition);
    const variants = untracked(this.variants);
    const style = untracked(this.style);
    const whileHover = untracked(this.whileHover);
    const whileTap = untracked(this.whileTap);
    const whileFocus = untracked(this.whileFocus);
    const globalTapTarget = untracked(this.globalTapTarget);
    const whileInView = untracked(this.whileInView);
    const viewport = untracked(this.viewport);
    const drag = untracked(this.drag);
    const whileDrag = untracked(this.whileDrag);
    const dragConstraints = untracked(this.dragConstraints);
    const dragElastic = untracked(this.dragElastic);
    const dragMomentum = untracked(this.dragMomentum);
    const dragTransition = untracked(this.dragTransition);
    const dragX = untracked(this.dragX);
    const dragY = untracked(this.dragY);
    const dragSnapToOrigin = untracked(this.dragSnapToOrigin);
    const dragDirectionLock = untracked(this.dragDirectionLock);
    const dragListener = untracked(this.dragListener);
    const dragPropagation = untracked(this.dragPropagation);
    const layoutVal = untracked(this.layout);
    const layoutIdVal = untracked(this.layoutId);
    const layoutScrollVal = untracked(this.layoutScroll);
    const layoutRootVal = untracked(this.layoutRoot);
    const layoutDependencyVal = untracked(this.layoutDependency);

    const props = this.buildProps(
      initial,
      animate,
      transition,
      variants,
      style,
      whileHover,
      whileTap,
      whileFocus,
      globalTapTarget,
      whileInView,
      viewport,
      exitVal,
      drag,
      whileDrag,
      dragConstraints,
      dragElastic,
      dragMomentum,
      dragTransition,
      dragX,
      dragY,
      dragSnapToOrigin,
      dragDirectionLock,
      dragListener,
      dragPropagation,
      layoutVal,
      layoutIdVal,
      layoutScrollVal,
      layoutRootVal,
      layoutDependencyVal,
    );

    const hasMeasureLayout = this.hasMeasureLayoutFeatures(drag, layoutVal, layoutIdVal);

    const presenceCtx = this.buildPresenceContext(this.presenceContext?.isPresent ?? true);

    // Cancel any active leave animation at the same parent (fast @if toggle).
    // If a sibling is mid-leave, snapshot its values as initial so the new
    // element reverses from the exit position — matching *ngmPresence behavior.
    if (exitVal !== undefined && this.presenceContext === null) {
      const snapshot = this.cancelActiveLeave();
      if (snapshot) {
        props.initial = snapshot;
      }
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- MotionProps→MotionNodeOptions boundary: viewport/dragConstraints types diverge from motion-dom (Angular doesn't use React refs)
    const mountProps = props as MotionNodeOptions;

    this.ve = createVisualElement({
      props: mountProps,
      parent: this.parentMotion?.ve ?? undefined,
      blockInitialAnimation: initial === false,
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
      this.prevLayoutDependency = layoutDependencyVal;
    }

    // Register leave animation dynamically when [exit] is set (without *ngmPresence).
    // Must happen after mount so ɵgetLContext finds the element in the LView.
    if (exitVal !== undefined && this.presenceContext === null) {
      this.registerLeaveAnimation();
    }

    this.mounted = true;
  }

  private buildProps(
    initial: TargetAndTransition | VariantLabels | boolean | undefined,
    animate: TargetAndTransition | VariantLabels | boolean | undefined,
    transition: Transition | undefined,
    variants: Variants | undefined,
    style: MotionStyle | undefined,
    whileHover?: TargetAndTransition | VariantLabels,
    whileTap?: TargetAndTransition | VariantLabels,
    whileFocus?: TargetAndTransition | VariantLabels,
    globalTapTarget?: boolean,
    whileInView?: TargetAndTransition | VariantLabels,
    viewport?: ViewportOptions,
    exitVal?: TargetAndTransition | VariantLabels,
    drag?: boolean | DragDirection,
    whileDrag?: TargetAndTransition | VariantLabels,
    dragConstraints?: BoundingBox | HTMLElement,
    dragElastic?: boolean | number | Partial<BoundingBox>,
    dragMomentum?: boolean,
    dragTransition?: Record<string, unknown>,
    dragX?: MotionValue<number>,
    dragY?: MotionValue<number>,
    dragSnapToOrigin?: boolean,
    dragDirectionLock?: boolean,
    dragListener?: boolean,
    dragPropagation?: boolean,
    layoutVal?: boolean | 'position' | 'size' | 'preserve-aspect',
    layoutIdVal?: string,
    layoutScrollVal?: boolean,
    layoutRootVal?: boolean,
    layoutDependencyVal?: unknown,
  ): MotionProps {
    const mergedTransition = transition ?? this.config?.transition;
    const resolvedStyle = this.getResolvedStyle(style, dragX, dragY);
    const props: MotionProps = {};

    if (initial !== undefined) props.initial = initial;
    // Use parent-propagated animate if this child has no own [animate]
    const effectiveAnimate = animate ?? this.propagatedAnimate;
    if (effectiveAnimate !== undefined) props.animate = effectiveAnimate;
    if (mergedTransition !== undefined) props.transition = mergedTransition;
    if (variants !== undefined) props.variants = variants;
    if (resolvedStyle !== undefined) props.style = resolvedStyle;
    if (exitVal !== undefined) props.exit = exitVal;

    // Gesture props
    if (whileHover !== undefined) props.whileHover = whileHover;
    if (whileTap !== undefined) props.whileTap = whileTap;
    if (whileFocus !== undefined) props.whileFocus = whileFocus;
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Angular adapts viewport.root and dragConstraints types (no React refs)
    const untypedProps = props as Record<string, unknown>;
    if (globalTapTarget !== undefined) untypedProps['globalTapTarget'] = globalTapTarget;
    if (whileInView !== undefined) props.whileInView = whileInView;
    if (viewport !== undefined) untypedProps['viewport'] = viewport;

    // Wire event callbacks to Angular outputs (guardedEmit checks this.destroyed).
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

    // Drag props — use untypedProps for dragConstraints (Angular accepts HTMLElement, motion-dom expects React ref)
    const p = untypedProps;
    if (drag !== undefined) p['drag'] = drag;
    if (whileDrag !== undefined) props.whileDrag = whileDrag;
    if (dragConstraints !== undefined) p['dragConstraints'] = dragConstraints;
    if (dragElastic !== undefined) p['dragElastic'] = dragElastic;
    if (dragMomentum !== undefined) p['dragMomentum'] = dragMomentum;
    if (dragTransition !== undefined) p['dragTransition'] = dragTransition;
    if (dragX !== undefined) p['_dragX'] = dragX;
    if (dragY !== undefined) p['_dragY'] = dragY;
    if (dragSnapToOrigin !== undefined) p['dragSnapToOrigin'] = dragSnapToOrigin;
    if (dragDirectionLock !== undefined) p['dragDirectionLock'] = dragDirectionLock;
    if (dragListener !== undefined) p['dragListener'] = dragListener;
    if (dragPropagation !== undefined) p['dragPropagation'] = dragPropagation;

    p['onDragStart'] = () => {
      if (this.destroyed) return;
      this.reorderItem?.onDragStart();
      this.dragStart.emit();
    };
    p['onDrag'] = (_event: PointerEvent, info: PanInfo) => {
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
    p['onDragEnd'] = () => {
      if (this.destroyed) return;
      this.reorderItem?.onDragEnd();
      this.dragEnd.emit();
    };
    p['onDirectionLock'] = this.guardedVoidEmit(this.directionLock);

    // Layout props
    if (layoutVal !== undefined) p['layout'] = layoutVal;
    if (layoutIdVal !== undefined) p['layoutId'] = layoutIdVal;
    if (layoutScrollVal !== undefined) p['layoutScroll'] = layoutScrollVal;
    if (layoutRootVal !== undefined) p['layoutRoot'] = layoutRootVal;
    if (layoutDependencyVal !== undefined) p['layoutDependency'] = layoutDependencyVal;

    // Layout animation event callbacks
    p['onLayoutAnimationStart'] = this.guardedVoidEmit(this.layoutAnimationStart);
    p['onLayoutAnimationComplete'] = this.guardedVoidEmit(this.layoutAnimationComplete);
    p['onLayoutMeasure'] = (measured: Box) => {
      if (this.destroyed) return;
      this.reorderItem?.registerLayout(measured);
    };

    // ── Hoist repeat into per-target transitions ──
    // When the top-level transition has `repeat` and gesture states are defined,
    // embed the full transition (incl. repeat) into each animation target and
    // strip repeat from the top-level. This prevents deactivation fallback
    // animations (which use the default transition) from repeating infinitely.
    if (props.transition !== undefined) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Transition union type doesn't expose repeat directly
      const tr = props.transition as Record<string, unknown>;
      if (tr['repeat'] !== undefined && tr['repeat'] !== 0) {
        const hasObjectGesture =
          isObjectTarget(props.whileInView) ||
          isObjectTarget(props.whileHover) ||
          isObjectTarget(props.whileTap) ||
          isObjectTarget(props.whileFocus) ||
          isObjectTarget(props.whileDrag);

        if (hasObjectGesture) {
          const fullTr = props.transition;
          const embedRepeat = (
            target: TargetAndTransition | VariantLabels | undefined,
          ): typeof target => {
            if (target === undefined || typeof target !== 'object' || Array.isArray(target))
              return target;
            const existing = target.transition;
            /* eslint-disable @typescript-eslint/consistent-type-assertions -- Transition union type can't be spread directly, cast to object for merge */
            const merged = existing
              ? { ...(fullTr as object), ...(existing as object) }
              : fullTr;
            return { ...target, transition: merged } as TargetAndTransition;
            /* eslint-enable @typescript-eslint/consistent-type-assertions */
          };

          // Embed full transition (incl. repeat) into animate only if it's an object target
          if (isObjectTarget(props.animate)) {
            props.animate = embedRepeat(props.animate);
          }
          props.whileInView = embedRepeat(props.whileInView);
          props.whileHover = embedRepeat(props.whileHover);
          props.whileTap = embedRepeat(props.whileTap);
          props.whileFocus = embedRepeat(props.whileFocus);
          props.whileDrag = embedRepeat(props.whileDrag);

          // Strip repeat-related keys from top-level so fallback animations finish
          const { repeat: _r, repeatType: _rt, repeatDelay: _rd, ...rest } = tr;
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- reconstructing Transition without repeat keys
          props.transition = (Object.keys(rest).length > 0 ? rest : undefined) as
            | Transition
            | undefined;
        }
      }
    }

    return props;
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
    const initial = untracked(this.initial);
    const animate = untracked(this.animate);
    const exitVal = untracked(this.exit);
    const { initial: ri, animate: ra } = this.resolveExitDefaults(initial, animate, exitVal);
    return this.buildProps(
      ri,
      ra,
      untracked(this.transition),
      untracked(this.variants),
      untracked(this.style),
      untracked(this.whileHover),
      untracked(this.whileTap),
      untracked(this.whileFocus),
      untracked(this.globalTapTarget),
      untracked(this.whileInView),
      untracked(this.viewport),
      untracked(this.exit),
      untracked(this.drag),
      untracked(this.whileDrag),
      untracked(this.dragConstraints),
      untracked(this.dragElastic),
      untracked(this.dragMomentum),
      untracked(this.dragTransition),
      untracked(this.dragX),
      untracked(this.dragY),
      untracked(this.dragSnapToOrigin),
      untracked(this.dragDirectionLock),
      untracked(this.dragListener),
      untracked(this.dragPropagation),
      untracked(this.layout),
      untracked(this.layoutId),
      untracked(this.layoutScroll),
      untracked(this.layoutRoot),
      untracked(this.layoutDependency),
    );
  }

  /**
   * Stops all running WAAPI animations on a VisualElement and returns a snapshot
   * of its current numeric values filtered to the given keys.
   */
  private static stopAndSnapshot(
    ve: HTMLVisualElement,
    filterKeys: Set<string>,
  ): Record<string, number> {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-call -- internal VE/MotionValue APIs */
    const valuesMap = (ve as any).values as Map<string, MotionValue>;
    valuesMap.forEach((mv) => { (mv as any).animation?.stop(); });
    /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-call */
    const snap: Record<string, number> = {};
    for (const [k, v] of Object.entries(ve.latestValues)) {
      if (typeof v === 'number' && filterKeys.has(k)) snap[k] = v;
    }
    return snap;
  }

  /**
   * Dynamically registers a leave animation on this element's LView.
   * Writes to the same internal data structure (lView[ANIMATIONS].leave) that
   * Angular's `(animate.leave)` host binding uses, but only when [exit] is set.
   * This avoids the overhead of Angular's leave pipeline (Promise, setTimeout,
   * animationend listener) on every non-exit element removal.
   *
   * Uses ɵgetLContext (exported from @angular/core) and internal LView indices.
   */
  private registerLeaveAnimation(): void {
    if (this.leaveRegistered) return;

    const ctx = ɵgetLContext(this.element);
    if (ctx === null) return;

    const lView = ctx.lView;
    if (lView === null) return;

    const nodeIndex = ctx.nodeIndex;

    // Cache for cleanupLeaveMapEntry() — avoids a second ɵgetLContext walk.
    this.leaveNodeIndex = nodeIndex;
    this.leaveLView = lView;

    // The animateFn is a placeholder — its only purpose is to exist in the leave Map
    // so Angular's removal path sees it and doesn't immediately remove the element.
    // The actual animation is started from onDestroy → startLeaveAnimation().
    // The promise keeps the element alive until we resolve it in cleanupLeaveState()
    // (called by both completeLeave and the cancel path). Without resolving,
    // Angular's view destruction pipeline blocks forever — breaking routing.
    const animateFn: LeaveAnimateFn = () => ({
      promise: this.shouldSkipLeaveAnimation()
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            this.leaveResolvers.push(resolve);
          }),
    });
    this.leaveAnimateFn = animateFn;
    const animationData = (lView[LVIEW_ANIMATIONS] ??= {}) as LViewAnimations;
    const leaveAnimations = (animationData.leave ??= new Map<number, LViewLeaveAnimationEntry>());
    const nodeAnimations = leaveAnimations.get(nodeIndex) ?? { animateFns: [] };
    nodeAnimations.animateFns.push(animateFn);
    leaveAnimations.set(nodeIndex, nodeAnimations);
    ɵallLeavingAnimations.add(lView[LVIEW_ID] as number);
    this.leaveRegistered = true;
  }

  /**
   * Starts the exit animation. Called from onDestroy when [exit] is defined and the
   * leave animation was registered on the LView.
   *
   * At this point the element is still in DOM because registerLeaveAnimation() wrote
   * to lView[ANIMATIONS].leave, which caused Angular's DOM detach path to skip
   * immediate removal. We animate the element in-place, then manually remove it.
   */
  private startLeaveAnimation(exitVal: TargetAndTransition | VariantLabels): void {
    // Set pointer-events:none during exit to prevent interaction with the leaving element.
    this.element.style.pointerEvents = 'none';

    const isObjectExit = isObjectTarget(exitVal);

    // If exit includes height, apply overflow:hidden so content clips during collapse.
    if (isObjectExit && 'height' in exitVal) {
      this.element.style.overflow = 'hidden';
    }

    const userExitKeys = new Set(
      isObjectExit ? Object.keys(exitVal).filter((k) => k !== 'transition') : [],
    );

    // Track for fast-toggle cancellation.
    const parent = this.element.parentNode;
    if (parent !== null) {
      const leaveEntry = {
        directive: this,
        parent,
        userExitKeys,
      };
      NgmMotionDirective.activeLeaves.add(leaveEntry);
      this.leaveEntry = leaveEntry;

      // Listen for Angular's cancelLeavingNodes — it dispatches a custom 'animationend'
      // event with { detail: { cancel: true } } right before removing the element.
      // Snapshot the mid-animation values so the incoming element can reverse from here.
      // NOTE: Don't use { once: true } — a stray CSS animationend could consume it first.
      this.cancelLeaveListener = (e: Event) => {
        if (!(e instanceof CustomEvent)) return;
        const detail: unknown = e.detail;
        if (
          typeof detail !== 'object' ||
          detail === null ||
          !('cancel' in detail) ||
          detail.cancel !== true
        )
          return;
        // Snapshot mid-animation values for reversal before cleanup destroys the VE.
        const ve = this.ve;
        if (ve !== null) {
          const snapshot = NgmMotionDirective.stopAndSnapshot(ve, userExitKeys);
          if (Object.keys(snapshot).length > 0) {
            NgmMotionDirective.cancelledLeaveSnapshots.set(parent, snapshot);
          }
        }
        this.cleanupLeaveState();
      };
      this.element.addEventListener('animationend', this.cancelLeaveListener);
    }

    this.leaveAnimationActive = true;

    // Animate exit on the REAL element via the live VE — no cloning needed.
    // motion-dom accepts both object targets and variant labels here.
    const ve = this.ve;
    if (ve === null) {
      this.completeLeave();
      return;
    }
    void animateVisualElement(ve, exitVal).then(
      () => {
        this.completeLeave();
      },
      () => {
        this.completeLeave();
      },
    );
  }

  /** Shared cleanup for leave animation state (used by both cancel and completion paths). */
  private cleanupLeaveState(): void {
    this.leaveAnimationActive = false;
    // Resolve Angular's leave promise so the view destruction pipeline can proceed.
    // Nested view teardown can register multiple waiters for the same direct [exit].
    this.resolveLeavePromises();
    if (this.cancelLeaveListener) {
      this.element.removeEventListener('animationend', this.cancelLeaveListener);
      this.cancelLeaveListener = null;
    }
    if (this.ve !== null) {
      unmountVisualElement(this.ve);
      this.ve = null;
    }
    if (this.leaveEntry) {
      NgmMotionDirective.activeLeaves.delete(this.leaveEntry);
      this.leaveEntry = null;
    }
    this.cleanupLeaveMapEntry();
  }

  /** Completes the leave animation and removes the element from the DOM. */
  private completeLeave(): void {
    if (!this.leaveAnimationActive) return; // Already completed or cancelled.
    this.cleanupLeaveState();
    this.element.remove();
  }

  /** Removes this directive's leave registration from Angular's internal leave map. */
  private cleanupLeaveMapEntry(): void {
    const lView = this.leaveLView;
    const animateFn = this.leaveAnimateFn;
    if (lView === null || animateFn === null) return;

    const animationData = lView[LVIEW_ANIMATIONS] as LViewAnimations | undefined;
    const leaveAnimations = animationData?.leave;
    const nodeAnimations = leaveAnimations?.get(this.leaveNodeIndex);
    if (nodeAnimations) {
      nodeAnimations.animateFns = nodeAnimations.animateFns.filter((fn) => fn !== animateFn);
      if (nodeAnimations.animateFns.length === 0) {
        leaveAnimations?.delete(this.leaveNodeIndex);
      }
    }
    if (leaveAnimations !== undefined && leaveAnimations.size === 0 && animationData?.running === undefined) {
      ɵallLeavingAnimations.delete(lView[LVIEW_ID] as number);
    }
    this.leaveAnimateFn = null;
    this.leaveLView = null;
  }

  /** Route navigation teardown should bypass direct [exit] animations entirely. */
  private shouldSkipLeaveAnimation(): boolean {
    return this.router?.currentNavigation() !== null;
  }

  /** Finds Angular's internal animation queues across the current view chain. */
  private getAngularAnimationQueues(): AngularAnimationQueue[] {
    const lView = this.leaveLView;
    if (lView === null) return [];

    const queues: AngularAnimationQueue[] = [];
    const seenViews = new Set<unknown[]>();
    const seenQueues = new Set<AngularAnimationQueue>();
    const pendingViews: unknown[][] = [lView];

    while (pendingViews.length > 0) {
      const currentView = pendingViews.pop();
      if (currentView === undefined || seenViews.has(currentView)) continue;
      seenViews.add(currentView);

      const injector = currentView[LVIEW_INJECTOR] as
        | { records?: Map<unknown, { value: unknown }> }
        | undefined;
      const records = injector?.records;
      if (records !== undefined) {
        for (const record of records.values()) {
          const value = record.value;
          if (
            typeof value === 'object' &&
            value !== null &&
            'queue' in value &&
            value.queue instanceof Set &&
            'isScheduled' in value &&
            typeof value.isScheduled === 'boolean' &&
            'scheduler' in value &&
            'injector' in value
          ) {
            const queue = value as AngularAnimationQueue;
            if (!seenQueues.has(queue)) {
              seenQueues.add(queue);
              queues.push(queue);
            }
          }
        }
      }

      const declarationView = currentView[LVIEW_DECLARATION_VIEW];
      if (Array.isArray(declarationView)) {
        pendingViews.push(declarationView);
      }

      const parentView = currentView[LVIEW_PARENT];
      if (Array.isArray(parentView)) {
        pendingViews.push(parentView);
      }
    }

    return queues;
  }

  /** Returns the environment injector Angular uses for after-render scheduling. */
  private getAnimationQueueInjector(): Injector | null {
    const lView = this.leaveLView;
    if (lView === null) return null;
    return lView[LVIEW_INJECTOR] as Injector;
  }

  /** Schedules Angular's queued leave callback so host removal can complete later. */
  private ensureAngularAnimationQueueScheduler(): void {
    for (const animationQueue of this.getAngularAnimationQueues()) {
      if (animationQueue.scheduler === null) {
        animationQueue.scheduler = () => {
          if (animationQueue.isScheduled) return;

          afterNextRender(
            () => {
              animationQueue.isScheduled = false;
              for (const animateFn of animationQueue.queue) {
                animateFn();
              }
              animationQueue.queue.clear();
            },
            {
              injector: animationQueue.injector as Injector,
            },
          );
          animationQueue.isScheduled = true;
        };
      }

      animationQueue.scheduler(animationQueue.injector);
    }
  }

  /** Route teardown skips animations, so flush Angular's queued leave callback immediately. */
  private flushAngularAnimationQueue(): void {
    for (const animationQueue of this.getAngularAnimationQueues()) {
      animationQueue.scheduler = null;
      animationQueue.isScheduled = false;
      for (const animateFn of animationQueue.queue) {
        animateFn();
      }
      animationQueue.queue.clear();
    }
  }

  /** Route teardown can leave the routed host behind, so remove that host directly. */
  private removeRoutedHostIfPresent(): void {
    const routedHost = this.getRoutedHostElement();
    routedHost?.remove();
  }

  /** Finds the routed component host as the ancestor inserted directly after a router-outlet. */
  private getRoutedHostElement(): HTMLElement | null {
    let currentElement: HTMLElement | null = this.element;

    while (currentElement !== null) {
      if (currentElement.previousElementSibling?.tagName === 'ROUTER-OUTLET') {
        return currentElement;
      }
      currentElement = currentElement.parentElement;
    }

    return null;
  }

  /**
   * Cancels any active leave animation at this element's position (fast @if toggle).
   * First checks `cancelledLeaveSnapshots` — populated when Angular's `cancelLeavingNodes`
   * already removed the leaving element and our animationend listener saved its snapshot.
   * Falls back to checking `activeLeaves` for a sibling still mid-leave.
   * Returns a snapshot of the leaving element's animated values for reversal, or null.
   */
  private cancelActiveLeave(): Record<string, number> | null {
    const parent = this.element.parentNode;
    if (!parent) return null;

    // Check the static snapshot store first — filled by the animationend listener
    // in startLeaveAnimation when Angular's cancelLeavingNodes fires.
    const snapshot = NgmMotionDirective.cancelledLeaveSnapshots.get(parent);
    if (snapshot) {
      NgmMotionDirective.cancelledLeaveSnapshots.delete(parent);
      return snapshot;
    }

    // Fallback: check if a sibling is still mid-leave (e.g. *ngmPresence path).
    const sibling = this.element.nextSibling;
    for (const entry of NgmMotionDirective.activeLeaves) {
      const leavingEl = entry.directive.element;
      if (
        entry.parent === parent &&
        (leavingEl === sibling || leavingEl.nextSibling === this.element)
      ) {
        const leavingVe = entry.directive.ve;
        if (leavingVe === null) continue;

        const snap = NgmMotionDirective.stopAndSnapshot(leavingVe, entry.userExitKeys);

        // Remove the leaving element immediately.
        entry.directive.completeLeave();
        return Object.keys(snap).length > 0 ? snap : null;
      }
    }
    return null;
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
