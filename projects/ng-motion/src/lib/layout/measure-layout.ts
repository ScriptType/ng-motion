/**
 * Projection lifecycle helpers — Angular replacement for React's MeasureLayout.
 *
 * Manages the FLIP lifecycle: snapshot before update → animate after update.
 */

import {
  HTMLProjectionNode,
  cancelFrame,
  globalProjectionState,
  type IProjectionNode,
  type Measurements,
  type ProjectionNodeOptions,
  type VisualElement,
} from 'motion-dom';
import type { LayoutGroupContextProps } from './layout-group-context';

let hasTakenAnySnapshot = false;
const orphanCleanupTimers = new WeakMap<IProjectionNode, ReturnType<typeof setTimeout>>();

/**
 * Extra internal fields on motion-dom projection nodes that aren't exposed
 * via the public `IProjectionNode` interface.
 */
interface ProjectionNodeExtras {
  currentAnimation?: { stop(): void };
  eventHandlers?: Map<unknown, { clear(): void }>;
  ngmLayoutGroupMember?: boolean;
  scheduleUpdate?: () => void;
  updateProjection?: () => void;
}

/** `IProjectionNode` widened with internal fields used by motion-dom at runtime. */
type ProjectionNodeInternals = IProjectionNode & ProjectionNodeExtras;

/**
 * Access internal motion-dom projection node fields not on the public interface.
 * All `IProjectionNode` instances created by `HTMLProjectionNode` carry these
 * properties at runtime; this helper avoids scattered inline type assertions.
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- single-point cast for motion-dom internals
const toInternals = (node: IProjectionNode): ProjectionNodeInternals => node as ProjectionNodeInternals;

interface SnapshotBeforeUpdateOptions {
  useCachedLayoutSnapshot?: boolean;
}

function clearOrphanCleanup(projection: IProjectionNode): void {
  const timer = orphanCleanupTimers.get(projection);
  if (timer !== undefined) {
    clearTimeout(timer);
    orphanCleanupTimers.delete(projection);
  }
}

function finalizeOrphanedProjection(projection: IProjectionNode): void {
  clearOrphanCleanup(projection);

  const stack = projection.getStack();
  stack?.remove(projection);
  projection.clearSnapshot();
  projection.resumeFrom = undefined;
  projection.resumingFrom = undefined;
}

function scheduleOrphanCleanup(projection: IProjectionNode): void {
  clearOrphanCleanup(projection);
  orphanCleanupTimers.set(
    projection,
    setTimeout(() => {
      finalizeOrphanedProjection(projection);
    }, 0),
  );
}

function deactivateProjection(projection: IProjectionNode): void {
  const internals = toInternals(projection);

  internals.currentAnimation?.stop();
  projection.root?.nodes?.remove(projection);
  projection.parent?.children.delete(projection);
  internals.eventHandlers?.forEach((handlers) => { handlers.clear(); });
  internals.eventHandlers?.clear();

  if (internals.scheduleUpdate != null) {
    cancelFrame(internals.scheduleUpdate);
  }
  if (internals.updateProjection != null) {
    cancelFrame(internals.updateProjection);
  }

  projection.instance = undefined;
}

/** Deep-clone a Measurements object for use as a FLIP snapshot. */
export function cloneLayout(layout: Measurements): Measurements {
  return {
    animationId: layout.animationId,
    measuredBox: {
      x: { ...layout.measuredBox.x },
      y: { ...layout.measuredBox.y },
    },
    layoutBox: {
      x: { ...layout.layoutBox.x },
      y: { ...layout.layoutBox.y },
    },
    latestValues: {},
    source: layout.source,
  };
}

function getCurrentScrollOffset(instance: unknown): { x: number; y: number } | null {
  if (instance instanceof HTMLElement) {
    return { x: instance.scrollLeft, y: instance.scrollTop };
  }

  if (typeof window !== 'undefined' && instance === window) {
    return { x: window.scrollX, y: window.scrollY };
  }

  return null;
}

function hasLayoutScrollDeltaSinceLastMeasurement(projection: IProjectionNode): boolean {
  const scrollNodes: IProjectionNode[] = [...projection.path];

  if (projection.options.layoutScroll === true) {
    scrollNodes.push(projection);
  }

  for (const scrollNode of scrollNodes) {
    if (scrollNode.options.layoutScroll !== true) continue;

    const currentOffset = getCurrentScrollOffset(scrollNode.instance);
    if (!currentOffset) continue;

    const measuredOffset = scrollNode.scroll?.offset;
    if (!measuredOffset) return true;

    if (
      measuredOffset.x !== currentOffset.x ||
      measuredOffset.y !== currentOffset.y
    ) {
      return true;
    }
  }

  return false;
}

export function getCachedLayoutSnapshot(
  projection: IProjectionNode,
  { useCachedLayoutSnapshot = true }: SnapshotBeforeUpdateOptions = {},
): Measurements | undefined {
  if (!useCachedLayoutSnapshot || !projection.layout) {
    return undefined;
  }

  if (hasLayoutScrollDeltaSinceLastMeasurement(projection)) {
    return undefined;
  }

  return cloneLayout(projection.layout);
}

/** Walk the VE tree to find the nearest ancestor with a projection node. */
function getClosestProjectingNode(
  ve?: VisualElement,
): IProjectionNode | undefined {
  if (!ve) return undefined;

  const veOptions: Record<string, unknown> | undefined =
    'options' in ve ? ve.options : undefined;
  if (veOptions?.['allowProjection'] !== false && ve.projection != null) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- motion-dom types VisualElement.projection as `any`
    return ve.projection;
  }
  return getClosestProjectingNode(ve.parent);
}

function shouldTrackProjectionInLayoutGroup(
  options: ProjectionNodeOptions,
): boolean {
  return (
    options.layout !== undefined ||
    options.layoutId !== undefined ||
    options.alwaysMeasureLayout === true
  );
}

/** Extract a string-keyed property as a specific type, returning undefined for mismatches. */
function propString(props: Record<string, unknown>, key: string): string | undefined {
  const v = props[key];
  return typeof v === 'string' ? v : undefined;
}

function propBoolean(props: Record<string, unknown>, key: string): boolean | undefined {
  const v = props[key];
  return typeof v === 'boolean' ? v : undefined;
}

type AnimationType = 'position' | 'size' | 'preserve-aspect';

function propAnimationType(props: Record<string, unknown>, key: string): AnimationType | undefined {
  const v = props[key];
  if (v === 'position' || v === 'size' || v === 'preserve-aspect') {
    return v;
  }
  return undefined;
}

export function syncProjectionOptions(
  projection: IProjectionNode,
  ve: VisualElement,
  props: Record<string, unknown>,
  layoutGroup?: LayoutGroupContextProps | null,
): void {
  const layoutVal = props['layout'];
  projection.setOptions({
    ...projection.options,
    layoutId: propString(props, 'layoutId'),
    layout: typeof layoutVal === 'boolean' || typeof layoutVal === 'string' ? layoutVal : undefined,
    alwaysMeasureLayout: Boolean(props['drag']),
    visualElement: ve,
    animationType: typeof layoutVal === 'string'
      ? (propAnimationType(props, 'layout') ?? 'both')
      : 'both',
    layoutScroll: propBoolean(props, 'layoutScroll'),
    layoutRoot: propBoolean(props, 'layoutRoot'),
  });

  if (!layoutGroup?.group) return;

  const internals = toInternals(projection);
  const shouldBeGrouped = shouldTrackProjectionInLayoutGroup(projection.options);

  if (shouldBeGrouped && internals.ngmLayoutGroupMember !== true) {
    layoutGroup.group.add(projection);
    internals.ngmLayoutGroupMember = true;
  } else if (!shouldBeGrouped && internals.ngmLayoutGroupMember === true) {
    layoutGroup.group.remove(projection);
    internals.ngmLayoutGroupMember = false;
  }
}

/** Create and configure a projection node for the given VisualElement. */
export function initProjection(
  ve: VisualElement,
  props: Record<string, unknown>,
  layoutGroup?: LayoutGroupContextProps | null,
): IProjectionNode {
  const parentProjection = getClosestProjectingNode(ve.parent);

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- HTMLProjectionNode mount() is typed more narrowly than IProjectionNode
  const projection = new HTMLProjectionNode(
    ve.latestValues,
    parentProjection,
  ) as unknown as IProjectionNode;
  ve.projection = projection;

  syncProjectionOptions(projection, ve, props, layoutGroup);

  if (hasTakenAnySnapshot) {
    projection.root?.didUpdate();
  }

  globalProjectionState.hasEverUpdated = true;

  return projection;
}

/** Snapshot layout before DOM update (FLIP "first/last" capture). */
export function snapshotBeforeUpdate(
  projection: IProjectionNode,
  props: Record<string, unknown>,
  isPresent: boolean,
  prevLayoutDependency?: unknown,
  { useCachedLayoutSnapshot = true }: SnapshotBeforeUpdateOptions = {},
): boolean {
  projection.isPresent = isPresent;

  const layoutDependency = props['layoutDependency'];
  if (prevLayoutDependency !== layoutDependency) {
    projection.setOptions({
      ...projection.options,
      layoutDependency,
    });
  }

  hasTakenAnySnapshot = true;

  if (
    props['drag'] !== undefined && props['drag'] !== false ||
    prevLayoutDependency !== layoutDependency ||
    layoutDependency === undefined
  ) {
    // Angular's effect()-based snapshot runs AFTER the DOM has been updated
    // (unlike React's getSnapshotBeforeUpdate which runs before commit).
    // A fresh getBoundingClientRect() would measure the already-updated layout,
    // so we MUST use the cached projection.layout as the FLIP "before" snapshot.
    //
    // When layoutDependency changes, bypass the scroll-delta check. The
    // cache's layoutBox is content-relative (BCR + rootScroll + containerScroll),
    // making it scroll-independent — the scroll offset cancels in the FLIP
    // delta calculation. The scroll check incorrectly invalidates the cache
    // when the user scrolls between animations, because the first sibling's
    // willUpdate() → updateScroll("snapshot") syncs the stored offset to the
    // current DOM value, and getCachedLayoutSnapshot() then falls back to a
    // post-update BCR for the remaining siblings.
    if (!projection.snapshot) {
      const dependencyChanged = prevLayoutDependency !== layoutDependency
        && layoutDependency !== undefined;
      if ((dependencyChanged || layoutDependency === undefined) && projection.layout) {
        // Bypass scroll-delta check — use cached layout as FLIP "before" snapshot.
        // The cached layoutBox is content-relative (BCR + rootScroll, with
        // element scroll removed via removeElementScroll). This makes it
        // scroll-independent — the scroll offset cancels in the FLIP delta.
        //
        // This applies to both:
        // - layoutDependency changes: first sibling's willUpdate() syncs scroll
        //   offset, causing getCachedLayoutSnapshot() to return undefined for
        //   remaining siblings.
        // - Bare layout=true (no layoutDependency): user scrolling between
        //   animations invalidates the cache, leaving no "before" snapshot and
        //   breaking the FLIP animation start position.
        projection.snapshot = cloneLayout(projection.layout);
      } else {
        // Drag-only path: defer to getCachedLayoutSnapshot which validates
        // scroll offsets — drag continuously tracks position so a stale
        // snapshot from a different scroll position could cause jumps.
        projection.snapshot = getCachedLayoutSnapshot(
          projection,
          { useCachedLayoutSnapshot },
        );
      }
    }
    projection.willUpdate();
    return true;
  }

  return false;
}

/** Notify the projection tree that a DOM update has occurred. */
export function notifyDidUpdate(projection: IProjectionNode): void {
  projection.root?.didUpdate();
}

/**
 * Remove any previously destroyed shared-layout projections once a successor
 * has mounted and taken over the handoff snapshot.
 */
export function flushSharedLayoutOrphans(projection: IProjectionNode): void {
  const stack = projection.getStack();
  if (!stack) return;

  for (const member of [...stack.members]) {
    if (member === projection) continue;
    if (member.instance === undefined) {
      finalizeOrphanedProjection(member);
    }
  }
}

/**
 * Reparent a projection node under a new parent.
 *
 * Angular's afterNextRender doesn't guarantee parent-before-child ordering
 * within the same component. Children may mount before their parent, creating
 * orphan projection nodes (parent = undefined, path = []). This function
 * fixes the projection tree after the parent mounts by updating the child's
 * parent, path, root, and children sets so motion-dom's internal scroll
 * handling (removeElementScroll, updateScroll, applyTransform) works correctly.
 */
export function reparentProjection(
  child: IProjectionNode,
  newParent: IProjectionNode,
): void {
  if (child.parent === newParent) return;

  // Remove from old parent's children
  child.parent?.children.delete(child);

  // Set new parent and rebuild path
  child.parent = newParent;
  child.path = [...newParent.path, newParent];
  child.depth = newParent.depth + 1;

  // Update root — the real root owns the FlatTree used for update traversal
  const newRoot = newParent.root ?? newParent;
  child.root = newRoot;

  // Register in new root's FlatTree (addUniqueItem prevents duplicates)
  newRoot.nodes?.add(child);

  // Add to new parent's children
  newParent.children.add(child);

  // Mark path nodes for transform reset (same as constructor does)
  for (const node of child.path) {
    node.shouldResetTransform = true;
  }

  // Recursively update descendants' paths and roots
  updateDescendantProjectionPaths(child);
}

function updateDescendantProjectionPaths(parent: IProjectionNode): void {
  for (const child of parent.children) {
    child.path = [...parent.path, parent];
    child.depth = parent.depth + 1;
    child.root = parent.root;

    // Ensure descendant is in the correct root's FlatTree
    parent.root?.nodes?.add(child);

    updateDescendantProjectionPaths(child);
  }
}

/** Clean up projection node on destroy. */
export function cleanupProjection(
  projection: IProjectionNode,
  layoutGroup?: LayoutGroupContextProps | null,
): void {
  hasTakenAnySnapshot = true;

  // For layoutId nodes, snapshot position before unmounting so the next element
  // with the same layoutId can animate from this position. We call willUpdate()
  // directly instead of unmount() because unmount() also removes the node from
  // the shared layout stack — but the replacement node hasn't mounted yet
  // (Angular defers to afterNextRender). Keeping the old node in the stack lets
  // the new node's registerSharedNode find it and set up resumeFrom.
  const layoutId = projection.options.layoutId;
  if (layoutId != null && layoutId !== '') {
    // Pre-set snapshot from the last measured layout. By the time Angular
    // calls destroyRef.onDestroy(), the DOM element may already be detached,
    // causing measure() to return zero dimensions (which updateSnapshot()
    // discards). Using the cached layout avoids this timing issue.
    if (projection.layout && !projection.snapshot) {
      projection.snapshot = cloneLayout(projection.layout);
    }
    projection.isPresent = false;
    projection.relegate();
    projection.willUpdate();
    deactivateProjection(projection);
    scheduleOrphanCleanup(projection);
  }

  // Do NOT call projection.scheduleCheckAfterUnmount() here.
  // In Angular, each directive's afterEveryRender already calls root.didUpdate().
  // scheduleCheckAfterUnmount triggers clearAllSnapshots() on the shared root
  // BEFORE the replacement node mounts, wiping the snapshot needed for
  // cross-element shared layout animations (layoutId).

  const internals = toInternals(projection);
  if (layoutGroup?.group && internals.ngmLayoutGroupMember === true) {
    layoutGroup.group.remove(projection);
    internals.ngmLayoutGroupMember = false;
  }
}
