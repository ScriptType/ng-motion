import { ɵallLeavingAnimations, ɵgetLContext } from '@angular/core';
import { animateVisualElement } from 'motion-dom';
import type {
  HTMLVisualElement,
  MotionValue,
  TargetAndTransition,
  VariantLabels,
} from 'motion-dom';
import { isObjectTarget } from '../utils/type-guards';
import { isDeactivatingRouteHost } from './router-outlet-teardown-adapter';

type LeaveAnimateFn = () => { promise: Promise<void> };
type AngularRendererLike = {
  removeChild(
    parent: unknown,
    oldChild: unknown,
    isHostElement?: boolean,
    requireSynchronousElementRemoval?: boolean,
  ): void;
};

interface LViewLeaveAnimationEntry {
  animateFns: LeaveAnimateFn[];
  resolvers?: Array<() => void>;
}

interface LViewAnimations {
  leave?: Map<number, LViewLeaveAnimationEntry>;
  running?: Promise<void>;
}

interface DirectLeaveControllerHost {
  readonly element: HTMLElement;
  getVisualElement(): HTMLVisualElement | null;
  clearVisualElement(): void;
}

interface ActiveLeaveEntry {
  controller: DirectLeaveController;
  parent: Node;
  userExitKeys: Set<string>;
}

/**
 * Internal Angular LView array indices — verified for Angular 21.2.
 * Validate on major Angular upgrades:
 *   node_modules/@angular/core/fesm2022/_effect-chunk2.mjs → search "const ID", "const ANIMATIONS"
 */
const LVIEW_ID = 19;
const LVIEW_RENDERER = 11;
const LVIEW_ANIMATIONS = 26;

const activeLeaves = new Set<ActiveLeaveEntry>();
const cancelledLeaveSnapshots = new WeakMap<Node, Record<string, number>>();

/**
 * Handles the direct `[exit]` interop path with Angular's internal leave map.
 * The directive delegates all leave registration, route-skip detection, and
 * fast-toggle cancellation through this helper so the core mount/update logic
 * does not carry Angular animation internals inline.
 */
export class DirectLeaveController {
  private leaveAnimationActive = false;
  private leaveRegistered = false;
  private leaveNodeIndex = -1;
  private leaveLView: unknown[] | null = null;
  private leaveAnimateFn: LeaveAnimateFn | null = null;
  private readonly leaveResolvers: Array<() => void> = [];
  private cancelLeaveListener: ((e: Event) => void) | null = null;
  private skipLeaveAnimationOnDestroy = false;
  private leaveEntry: ActiveLeaveEntry | null = null;

  constructor(private readonly host: DirectLeaveControllerHost) {}

  isRegistered(): boolean {
    return this.leaveRegistered;
  }

  setSkipLeaveAnimationOnDestroy(skip: boolean): void {
    this.skipLeaveAnimationOnDestroy = skip;
  }

  /**
   * Writes a placeholder leave callback into Angular's internal leave map so
   * Angular keeps the node mounted until ng-motion resolves the callback later.
   */
  register(): void {
    if (this.leaveRegistered) return;

    const ctx = ɵgetLContext(this.host.element);
    if (ctx === null) return;

    const lView = ctx.lView;
    if (lView === null) return;

    const nodeIndex = ctx.nodeIndex;
    this.leaveNodeIndex = nodeIndex;
    this.leaveLView = lView;

    const animateFn: LeaveAnimateFn = () => ({
      promise: this.skipLeaveAnimationOnDestroy || this.shouldSkipLeaveAnimation()
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

  shouldSkipLeaveAnimation(): boolean {
    return this.getDeactivatingRouteHost() !== null;
  }

  cleanupAfterMissingExit(): void {
    this.resolveLeavePromises();
    this.cleanupLeaveMapEntry();
  }

  cleanupAfterSkippedRouteTeardown(): void {
    this.removeRoutedHostIfPresent();
    this.cleanupLeaveMapEntry();
  }

  start(exitVal: TargetAndTransition | VariantLabels): void {
    this.host.element.style.pointerEvents = 'none';

    const isObjectExit = isObjectTarget(exitVal);
    if (isObjectExit && 'height' in exitVal) {
      this.host.element.style.overflow = 'hidden';
    }

    const userExitKeys = new Set(
      isObjectExit ? Object.keys(exitVal).filter((key) => key !== 'transition') : [],
    );

    const parent = this.host.element.parentNode;
    if (parent !== null) {
      const leaveEntry = {
        controller: this,
        parent,
        userExitKeys,
      };
      activeLeaves.add(leaveEntry);
      this.leaveEntry = leaveEntry;

      // Angular's cancelLeavingNodes dispatches a custom animationend with { cancel: true }.
      // Snapshot current values so a rapidly re-entering element can reverse from them.
      this.cancelLeaveListener = (event: Event) => {
        if (!(event instanceof CustomEvent)) return;
        const detail: unknown = event.detail;
        if (
          typeof detail !== 'object' ||
          detail === null ||
          !('cancel' in detail) ||
          detail.cancel !== true
        ) {
          return;
        }

        const visualElement = this.host.getVisualElement();
        if (visualElement !== null) {
          const snapshot = stopAndSnapshot(visualElement, userExitKeys);
          if (Object.keys(snapshot).length > 0) {
            cancelledLeaveSnapshots.set(parent, snapshot);
          }
        }
        this.cleanupLeaveState();
      };
      this.host.element.addEventListener('animationend', this.cancelLeaveListener);
    }

    this.leaveAnimationActive = true;

    const visualElement = this.host.getVisualElement();
    if (visualElement === null) {
      this.completeLeave();
      return;
    }

    void animateVisualElement(visualElement, exitVal).then(
      () => {
        this.completeLeave();
      },
      () => {
        this.completeLeave();
      },
    );
  }

  /**
   * Cancels a sibling direct leave animation when a node re-enters immediately.
   * Returns the cancelled element's latest numeric values so the new element can
   * reuse them as its initial state.
   */
  cancelActiveLeave(): Record<string, number> | null {
    const parent = this.host.element.parentNode;
    if (parent === null) return null;

    const snapshot = cancelledLeaveSnapshots.get(parent);
    if (snapshot !== undefined) {
      cancelledLeaveSnapshots.delete(parent);
      return snapshot;
    }

    const sibling = this.host.element.nextSibling;
    for (const entry of activeLeaves) {
      const leavingElement = entry.controller.host.element;
      if (
        entry.parent === parent &&
        (leavingElement === sibling || leavingElement.nextSibling === this.host.element)
      ) {
        const leavingVisualElement = entry.controller.host.getVisualElement();
        if (leavingVisualElement === null) continue;

        const cancelledSnapshot = stopAndSnapshot(leavingVisualElement, entry.userExitKeys);
        entry.controller.completeLeave();
        return Object.keys(cancelledSnapshot).length > 0 ? cancelledSnapshot : null;
      }
    }

    return null;
  }

  private resolveLeavePromises(): void {
    while (this.leaveResolvers.length > 0) {
      this.leaveResolvers.pop()?.();
    }
  }

  private cleanupLeaveState(): void {
    this.leaveAnimationActive = false;
    this.resolveLeavePromises();

    if (this.cancelLeaveListener !== null) {
      this.host.element.removeEventListener('animationend', this.cancelLeaveListener);
      this.cancelLeaveListener = null;
    }

    this.host.clearVisualElement();

    if (this.leaveEntry !== null) {
      activeLeaves.delete(this.leaveEntry);
      this.leaveEntry = null;
    }

    this.cleanupLeaveMapEntry();
  }

  private completeLeave(): void {
    if (!this.leaveAnimationActive) return;
    this.cleanupLeaveState();
    this.host.element.remove();
  }

  private cleanupLeaveMapEntry(): void {
    const lView = this.leaveLView;
    const animateFn = this.leaveAnimateFn;
    if (lView === null || animateFn === null) return;

    const animationData = lView[LVIEW_ANIMATIONS] as LViewAnimations | undefined;
    const leaveAnimations = animationData?.leave;
    const nodeAnimations = leaveAnimations?.get(this.leaveNodeIndex);

    if (nodeAnimations !== undefined) {
      nodeAnimations.animateFns = nodeAnimations.animateFns.filter((fn) => fn !== animateFn);
      if (nodeAnimations.animateFns.length === 0) {
        leaveAnimations?.delete(this.leaveNodeIndex);
      }
    }

    if (
      leaveAnimations !== undefined &&
      leaveAnimations.size === 0 &&
      animationData?.running === undefined
    ) {
      ɵallLeavingAnimations.delete(lView[LVIEW_ID] as number);
    }

    this.leaveAnimateFn = null;
    this.leaveLView = null;
  }

  private removeRoutedHostIfPresent(): void {
    const routedHost = this.getDeactivatingRouteHost();
    if (routedHost === null) return;

    const renderer = this.getRoutedHostRenderer(routedHost);
    if (renderer !== null) {
      renderer.removeChild(null, routedHost, true, true);
      return;
    }

    routedHost.parentNode?.removeChild(routedHost);
  }

  private getDeactivatingRouteHost(): HTMLElement | null {
    let currentNode: Node | null = this.host.element;

    while (currentNode !== null) {
      if (currentNode instanceof HTMLElement && isDeactivatingRouteHost(currentNode)) {
        return currentNode;
      }
      currentNode = getComposedParentNode(currentNode);
    }

    return null;
  }

  private getRoutedHostRenderer(routedHost: HTMLElement): AngularRendererLike | null {
    const routedHostLView = ɵgetLContext(routedHost)?.lView;
    const candidateViews = [routedHostLView, this.leaveLView];

    for (const candidateView of candidateViews) {
      const renderer = candidateView?.[LVIEW_RENDERER];
      if (
        typeof renderer === 'object' &&
        renderer !== null &&
        'removeChild' in renderer &&
        typeof renderer.removeChild === 'function'
      ) {
        return renderer as AngularRendererLike;
      }
    }

    return null;
  }
}

function getComposedParentNode(node: Node): Node | null {
  if (node.parentNode instanceof ShadowRoot) {
    return node.parentNode.host;
  }
  if (node.parentNode !== null) {
    return node.parentNode;
  }

  const rootNode = node.getRootNode();
  return rootNode instanceof ShadowRoot ? rootNode.host : null;
}

function stopAndSnapshot(
  visualElement: HTMLVisualElement,
  filterKeys: Set<string>,
): Record<string, number> {
  /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-call -- internal VE/MotionValue APIs */
  const valuesMap = (visualElement as any).values as Map<string, MotionValue>;
  valuesMap.forEach((motionValue) => {
    (motionValue as any).animation?.stop();
  });
  /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-call */

  const snapshot: Record<string, number> = {};
  for (const [key, value] of Object.entries(visualElement.latestValues)) {
    if (typeof value === 'number' && filterKeys.has(key)) {
      snapshot[key] = value;
    }
  }
  return snapshot;
}
