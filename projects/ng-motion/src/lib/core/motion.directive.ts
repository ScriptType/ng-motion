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
  DoCheck,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  OnInit,
  output,
  untracked,
} from '@angular/core';
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

@Directive({
  selector: '[ngmMotion]',
})
export class NgmMotionDirective implements DoCheck, OnInit {
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
  private destroyed = false;
  private mounted = false;
  private projection: IProjectionNode | null = null;
  private pendingProjectionDidUpdate = false;
  private prevLayoutDependency: unknown;
  private reorderPointX: MotionValue<number> | null = null;
  private reorderPointY: MotionValue<number> | null = null;
  /** Cached exit info (Angular detaches DOM before onDestroy). */
  private exitRect: { left: number; top: number; width: number; height: number } | null = null;
  private exitParent: Node | null = null;
  private exitNextSibling: Node | null = null;
  /** Cached offset values — skip getComputedStyle when unchanged. */
  private _lastOffsetTop = -1;
  private _lastOffsetLeft = -1;
  private _lastOffsetWidth = -1;
  private _lastOffsetHeight = -1;

  /** @internal Registered child directives for orchestration. */
  private readonly orchestrationChildren = new Set<NgmMotionDirective>();
  /** @internal Animate value propagated from parent (variant propagation). */
  private propagatedAnimate: string | undefined;
  /** @internal Pending orchestration timeouts for cleanup. */
  private orchestrationTimeouts: ReturnType<typeof setTimeout>[] = [];

  /** Static registry of active exit clones for fast toggle cancellation. */
  private static activeExits = new Set<{
    parent: Node;
    nextSibling: Node | null;
    clone: HTMLElement;
    ve: HTMLVisualElement;
    /** Keys from the user's original exit definition (excludes auto-added collapse keys). */
    userExitKeys: Set<string>;
    cleanup: () => void;
  }>();

  ngOnInit(): void {
    prerenderVisualElementStyles(this.element, this.buildCurrentProps());
  }

  private hasMeasureLayoutFeatures(
    drag: boolean | DragDirection | undefined,
    layoutVal: boolean | 'position' | 'size' | 'preserve-aspect' | undefined,
    layoutIdVal: string | undefined,
  ): boolean {
    return (
      layoutVal !== undefined ||
      layoutIdVal !== undefined ||
      (drag !== undefined && drag !== false)
    );
  }

  ngDoCheck(): void {
    if (!this.mounted || !this.projection || this.ve === null) return;

    const hasMeasureLayout = this.hasMeasureLayoutFeatures(
      this.drag(),
      this.layout(),
      this.layoutId(),
    );
    if (!hasMeasureLayout) return;

    const layoutDependencyVal = this.layoutDependency();
    if (layoutDependencyVal === undefined || layoutDependencyVal === this.prevLayoutDependency) {
      return;
    }

    const props = this.buildCurrentProps();
    syncProjectionOptions(
      this.projection,
      this.ve,
      props as Record<string, unknown>, // eslint-disable-line @typescript-eslint/consistent-type-assertions -- motion-dom interop
      this.layoutGroup,
    );
    this.pendingProjectionDidUpdate =
      snapshotBeforeUpdate(
        this.projection,
        props as Record<string, unknown>, // eslint-disable-line @typescript-eslint/consistent-type-assertions -- motion-dom interop
        this.presenceContext?.isPresent$() ?? true,
        this.prevLayoutDependency,
      ) || this.pendingProjectionDidUpdate;
    this.prevLayoutDependency = layoutDependencyVal;
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
          ri, ra, transition, variants, style,
          whileHover, whileTap, whileFocus, globalTapTarget,
          whileInView, viewport, exitVal,
          drag, whileDrag, dragConstraints, dragElastic,
          dragMomentum, dragTransition, dragX, dragY, dragSnapToOrigin,
          dragDirectionLock, dragListener, dragPropagation,
          layoutVal, layoutIdVal, layoutScrollVal, layoutRootVal,
          layoutDependencyVal,
        );

        if (this.projection !== null) {
          syncProjectionOptions(
            this.projection,
            this.ve,
            props as Record<string, unknown>, // eslint-disable-line @typescript-eslint/consistent-type-assertions -- motion-dom interop
            this.layoutGroup,
          );
        }

        const hasMeasureLayout = this.hasMeasureLayoutFeatures(
          drag,
          layoutVal,
          layoutIdVal,
        );

        // Snapshot before DOM update (FLIP "before" phase)
        if (this.projection && hasMeasureLayout) {
          this.pendingProjectionDidUpdate =
            snapshotBeforeUpdate(
              this.projection,
              props as Record<string, unknown>, // eslint-disable-line @typescript-eslint/consistent-type-assertions -- motion-dom interop
              isPresent ?? true,
              this.prevLayoutDependency,
            ) || this.pendingProjectionDidUpdate;
          this.prevLayoutDependency = layoutDependencyVal;
        }

        const presenceCtx = this.presenceContext
          ? {
              id: this.presenceContext.id,
              isPresent: isPresent ?? true,
              register: this.presenceContext.register,
              onExitComplete: this.presenceContext.onExitComplete,
            }
          : null;

        // Check for orchestration (when/staggerChildren/delayChildren)
        const orch = this.getOrchestration(animate, variants);
        const variantChildren = orch ? this.getVariantChildren() : [];
        if (orch && variantChildren.length > 0 && typeof animate === 'string') {
          this.cancelOrchestration();
          updateVisualElementProps(this.ve, props, presenceCtx);
          void this.orchestrate(animate, orch, variantChildren);
        } else {
          updateVisualElement(this.ve, props, presenceCtx);
        }
      });
    });

    // FLIP lifecycle — snapshot previous layout, then notify projection tree.
    // This handles the case where Angular's @for reorders DOM elements without
    // any directive inputs changing (so the effect doesn't fire). We use the
    // layout measured in the previous cycle as the "before" snapshot.
    afterEveryRender(() => {
      if (!this.projection) return;

      const hasMeasureLayout = this.hasMeasureLayoutFeatures(
        untracked(this.drag),
        untracked(this.layout),
        untracked(this.layoutId),
      );
      if (!hasMeasureLayout) return;

      // Match Framer's getSnapshotBeforeUpdate -> componentDidUpdate flow.
      // If we already captured a pre-render snapshot this cycle, only commit
      // the update here and avoid a second post-render willUpdate().
      if (this.pendingProjectionDidUpdate) {
        this.pendingProjectionDidUpdate = false;
        notifyDidUpdate(this.projection);
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
      if (!depStable && !this.projection.isLayoutDirty && this.projection.layout !== undefined && this.projection.snapshot === undefined) {
        this.projection.snapshot = getCachedLayoutSnapshot(this.projection);
      }

      this.projection.willUpdate();
      notifyDidUpdate(this.projection);
    });

    // Cache element rect for exit-on-destroy. Angular detaches DOM nodes
    // before onDestroy fires, so getBoundingClientRect() returns zeros there.
    // Only runs for elements that actually need it (has [exit], no presence context).
    // Optimization: check cheap integer offsets first — skip getComputedStyle
    // when position and size haven't changed (the common case for stable elements).
    afterEveryRender(() => {
      if (!this.mounted || this.destroyed) return;
      if (!untracked(this.exit) || this.presenceContext) return;
      const el = this.element;
      const ot = el.offsetTop, ol = el.offsetLeft;
      const ow = el.offsetWidth, oh = el.offsetHeight;
      if (
        ot === this._lastOffsetTop && ol === this._lastOffsetLeft &&
        ow === this._lastOffsetWidth && oh === this._lastOffsetHeight
      ) return;
      this._lastOffsetTop = ot;
      this._lastOffsetLeft = ol;
      this._lastOffsetWidth = ow;
      this._lastOffsetHeight = oh;
      this.cacheExitRect();
    });

    this.destroyRef.onDestroy(() => {
      // Exit-on-destroy: when @if removes the element, clone it and play exit
      // via a fresh VE + presence context. Clone is inserted at the original
      // parent position to preserve CSS inheritance (avoids text-wrapping issues).
      const exitVal = untracked(this.exit);
      if (exitVal && !this.presenceContext && this.exitRect && this.exitParent) {
        const rect = this.exitRect;
        const parent = this.exitParent;
        const nextSibling = this.exitNextSibling;

        // Clone the element so the original can be fully destroyed by Angular.
        const clone = this.element.cloneNode(true) as HTMLElement;

        // Always use in-flow clone so surrounding content collapses smoothly.
        // overflow:hidden clips content as height animates to 0.
        Object.assign(clone.style, {
          overflow: 'hidden',
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          pointerEvents: 'none',
        });

        // Insert at original parent position — preserves CSS inheritance.
        // The cached nextSibling may have been removed by Angular in the same
        // destruction cycle (@for removing multiple items), so fall back to append.
        if (nextSibling && nextSibling.parentNode === parent) {
          parent.insertBefore(clone, nextSibling);
        } else {
          parent.appendChild(clone);
        }

        // Build clean props — strip Angular output callbacks (destroyed directive)
        const props = this.buildCurrentProps();
        props.initial = false;
        props.onAnimationStart = undefined;
        props.onAnimationComplete = undefined;
        props.onUpdate = undefined;

        // Lightweight VE — no presence context, no projection.
        // Full mount so motion values are initialized for animateVisualElement.
        const cloneVe = createVisualElement({
          props,
          blockInitialAnimation: true,
          presenceContext: null,
          allowProjection: false,
        });

        mountVisualElement(cloneVe, clone);

        // Track in activeExits so fast toggles can cancel this clone.
        // Track which keys the user explicitly defined in their exit —
        // the snapshot filter uses this to exclude auto-added collapse keys.
        const userExitKeys = new Set(
          typeof exitVal === 'object' && exitVal !== null
            ? Object.keys(exitVal as Record<string, unknown>).filter(k => k !== 'transition')
            : [],
        );

        let exitCleaned = false;
        const exitEntry = {
          parent,
          nextSibling,
          clone,
          ve: cloneVe,
          userExitKeys,
          cleanup: () => {
            if (exitCleaned) return;
            exitCleaned = true;
            clone.remove();
            unmountVisualElement(cloneVe);
            NgmMotionDirective.activeExits.delete(exitEntry);
          },
        };
        NgmMotionDirective.activeExits.add(exitEntry);

        // Animate exit directly — no presence context ceremony needed.
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- TargetAndTransition | VariantLabels
        void animateVisualElement(cloneVe, exitVal as TargetAndTransition)
          .then(() => exitEntry.cleanup(), () => exitEntry.cleanup());
      }
      this.exitRect = null;
      this.exitParent = null;
      this.exitNextSibling = null;

      this.destroyed = true;
      this.parentMotion?.orchestrationChildren.delete(this);
      this.cancelOrchestration();

      if (this.projection) {
        const preserveProjectionOnUnmount = Boolean(
          this.projection.options.layoutId,
        );
        cleanupProjection(this.projection, this.layoutGroup);
        // Detach projection from VE so ve.unmount() doesn't call projection.unmount(),
        // keeping the old node in the shared layout stack for the replacement to find.
        if (this.ve && preserveProjectionOnUnmount) {
          this.ve.projection = null;
        }
        this.projection = null;
      }
      if (this.ve !== null) {
        unmountVisualElement(this.ve);
        this.ve = null;
      }
      this.reorderPointX?.destroy();
      this.reorderPointX = null;
      this.reorderPointY?.destroy();
      this.reorderPointY = null;
      this.pendingProjectionDidUpdate = false;
      this.mounted = false;
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
      initial, animate, transition, variants, style,
      whileHover, whileTap, whileFocus, globalTapTarget,
      whileInView, viewport, exitVal,
      drag, whileDrag, dragConstraints, dragElastic,
      dragMomentum, dragTransition, dragX, dragY, dragSnapToOrigin,
      dragDirectionLock, dragListener, dragPropagation,
      layoutVal, layoutIdVal, layoutScrollVal, layoutRootVal,
      layoutDependencyVal,
    );

    const hasMeasureLayout = this.hasMeasureLayoutFeatures(
      drag,
      layoutVal,
      layoutIdVal,
    );

    const presenceCtx = this.presenceContext
      ? {
          id: this.presenceContext.id,
          isPresent: this.presenceContext.isPresent,
          register: this.presenceContext.register,
          onExitComplete: this.presenceContext.onExitComplete,
        }
      : null;

    // Cancel any active exit clone at the same parent (fast @if toggle).
    // If a clone was mid-exit, use its current visual state as initial so the
    // new element reverses from the exit position — matching *ngmPresence behavior.
    // If no clone (exit completed), normal entrance animation plays.
    if (exitVal && !this.presenceContext) {
      const snapshot = this.cancelActiveExitClone();
      if (snapshot) {
        props.initial = snapshot;
      }
    }

    this.ve = createVisualElement({
      props,
      parent: this.parentMotion?.ve ?? undefined,
      blockInitialAnimation: initial === false,
      presenceContext: presenceCtx,
      allowProjection: true,
    });

    mountVisualElement(this.ve, this.element);

    this.projection = initProjection(
      this.ve,
      props as Record<string, unknown>, // eslint-disable-line @typescript-eslint/consistent-type-assertions -- motion-dom interop
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
        props as Record<string, unknown>, // eslint-disable-line @typescript-eslint/consistent-type-assertions -- motion-dom interop
        this.presenceContext?.isPresent ?? true,
        undefined,
        { useCachedLayoutSnapshot: false },
      );
      notifyDidUpdate(this.projection);
      this.prevLayoutDependency = layoutDependencyVal;
    }

    this.mounted = true;

    // Cache exit rect immediately — afterEveryRender hasn't fired yet on first mount,
    // so without this the first "hide" click would find exitRect null and skip the exit.
    if (exitVal && !this.presenceContext) {
      this.cacheExitRect();
    }
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
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- motion-dom interop: MotionNodeOptions doesn't expose globalTapTarget/viewport
    const propsRec = props as Record<string, unknown>;
    if (globalTapTarget !== undefined) propsRec['globalTapTarget'] = globalTapTarget;
    if (whileInView !== undefined) props.whileInView = whileInView;
    if (viewport !== undefined) propsRec['viewport'] = viewport;

    // Wire event callbacks to Angular outputs.
    // These are read by VisualElement via getProps() when events fire.
    props.onAnimationStart = (definition: AnimationDefinition) => {
      if (this.destroyed) return;
      this.animationStart.emit(definition);
    };
    props.onAnimationComplete = (definition: AnimationDefinition) => {
      if (this.destroyed) return;
      this.animationComplete.emit(definition);
    };
    props.onUpdate = (latest: ResolvedValues) => {
      if (this.destroyed) return;
      this.update.emit(latest);
    };

    // Gesture callbacks → Angular outputs
    props.onHoverStart = () => {
      if (this.destroyed) return;
      this.hoverStart.emit();
    };
    props.onHoverEnd = () => {
      if (this.destroyed) return;
      this.hoverEnd.emit();
    };
    props.onTap = () => {
      if (this.destroyed) return;
      this.tap.emit();
    };
    props.onTapStart = () => {
      if (this.destroyed) return;
      this.tapStart.emit();
    };
    props.onTapCancel = () => {
      if (this.destroyed) return;
      this.tapCancel.emit();
    };
    propsRec['onViewportEnter'] = () => {
      if (this.destroyed) return;
      this.viewportEnter.emit();
    };
    propsRec['onViewportLeave'] = () => {
      if (this.destroyed) return;
      this.viewportLeave.emit();
    };

    // Drag props
    const p = propsRec;
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
        const currentOffset: number | undefined = motionVal !== undefined
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
    p['onDirectionLock'] = () => {
      if (this.destroyed) return;
      this.directionLock.emit();
    };

    // Layout props
    if (layoutVal !== undefined) p['layout'] = layoutVal;
    if (layoutIdVal !== undefined) p['layoutId'] = layoutIdVal;
    if (layoutScrollVal !== undefined) p['layoutScroll'] = layoutScrollVal;
    if (layoutRootVal !== undefined) p['layoutRoot'] = layoutRootVal;
    if (layoutDependencyVal !== undefined) p['layoutDependency'] = layoutDependencyVal;


    // Layout animation event callbacks
    p['onLayoutAnimationStart'] = () => {
      if (this.destroyed) return;
      this.layoutAnimationStart.emit();
    };
    p['onLayoutAnimationComplete'] = () => {
      if (this.destroyed) return;
      this.layoutAnimationComplete.emit();
    };
    p['onLayoutMeasure'] = (measured: Box) => {
      if (this.destroyed) return;
      this.reorderItem?.registerLayout(measured);
    };

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
    styleValue: MotionStyle['x']   | undefined,
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
      !exitVal ||
      initial !== undefined ||
      this.presenceContext ||
      typeof exitVal !== 'object' ||
      Array.isArray(exitVal)
    ) {
      return { initial, animate };
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- extracting exit keys
    const exitObj = exitVal as Record<string, unknown>;
    const derived: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(exitObj)) {
      if (k !== 'transition') derived[k] = v;
    }
    if (Object.keys(derived).length === 0) return { initial, animate };

    let resolvedAnimate = animate;

    // When exit defines height and animate is an object without a height target,
    // inject height: 'auto' so motion-dom measures the element's natural height.
    if (
      'height' in derived &&
      typeof resolvedAnimate === 'object' &&
      resolvedAnimate !== null &&
      !Array.isArray(resolvedAnimate) &&
      !('height' in (resolvedAnimate as Record<string, unknown>))
    ) {
      resolvedAnimate = {
        ...(resolvedAnimate as Record<string, unknown>),
        height: 'auto',
      } as TargetAndTransition;
    }

    return {
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

  /** Caches the element's document-relative position for exit-on-destroy. */
  private cacheExitRect(): void {
    // Use getComputedStyle for sub-pixel width/height — offsetWidth rounds to
    // integers which can cause text wrapping on the clone.
    const cs = getComputedStyle(this.element);
    const w = parseFloat(cs.width);
    const h = parseFloat(cs.height);
    // Accumulate document-relative position via offsetParent chain.
    // Unlike getBoundingClientRect, offsetTop/Left is NOT affected by CSS transforms,
    // so caching during the enter animation gives correct layout position.
    let top = 0, left = 0;
    let el: HTMLElement | null = this.element;
    while (el) {
      top += el.offsetTop;
      left += el.offsetLeft;
      el = el.offsetParent as HTMLElement | null;
    }
    // Store document-relative coords — scroll subtracted at clone creation time.
    this.exitRect = { left, top, width: w, height: h };
    this.exitParent = this.element.parentNode;
    this.exitNextSibling = this.element.nextSibling;
  }

  /**
   * Cancels any active exit clone at this element's parent.
   * Returns a snapshot of the clone's current animated values (for reversal),
   * or null if no active clone was found.
   */
  private cancelActiveExitClone(): Record<string, number> | null {
    const parent = this.element.parentNode;
    if (!parent) return null;
    // Match by parent + nextSibling to find the clone at THIS element's exact
    // DOM position. Prevents @for list items from cancelling each other's exits.
    const sibling = this.element.nextSibling;
    for (const entry of NgmMotionDirective.activeExits) {
      // Match by parent + nextSibling OR parent + clone-is-nextSibling.
      // Angular inserts the new element before the clone, so the new
      // element's nextSibling IS the clone (not the original sibling).
      if (entry.parent === parent && (entry.nextSibling === sibling || entry.clone === sibling)) {
        // Stop all running WAAPI animations on the clone VE.
        // NativeAnimationExtended.stop() → updateMotionValue() → samples current
        // value via a renderless JSAnimation → sets motionValue → onChange fires →
        // latestValues is updated with the accurate mid-animation value.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any -- accessing internal VE values map
        const valuesMap = (entry.ve as any).values as Map<string, MotionValue>;
        valuesMap.forEach(mv => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any -- MotionValue.animation is internal
          (mv as any).animation?.stop();
        });

        // Only snapshot properties the user explicitly defined in their exit.
        // Auto-added collapse props (height, marginTop, etc.) must NOT leak
        // into the new element's initial state as sticky inline styles.
        const snapshot: Record<string, number> = {};
        for (const [k, v] of Object.entries(entry.ve.latestValues)) {
          if (typeof v === 'number' && entry.userExitKeys.has(k)) snapshot[k] = v;
        }

        entry.cleanup();
        return Object.keys(snapshot).length > 0 ? snapshot : null;
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
    const staggerChildren = typeof t['staggerChildren'] === 'number' ? t['staggerChildren'] : undefined;
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
      child => child.animate() === undefined && child.ve !== null,
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

      return new Promise<void>(resolve => {
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
