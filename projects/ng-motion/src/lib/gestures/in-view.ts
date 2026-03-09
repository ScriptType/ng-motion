/**
 * InViewFeature — IntersectionObserver-based viewport detection for ng-motion.
 *
 * Uses observer pooling to reuse IntersectionObservers with identical options,
 * reducing overhead when many elements share the same viewport configuration.
 */

import { Feature } from 'motion-dom';

export interface ViewportOptions {
  root?: Element | null;
  margin?: string;
  amount?: 'some' | 'all' | number;
  once?: boolean;
}

// Observer pooling: reuse IntersectionObservers with same options
const observerCallbacks = new WeakMap<
  IntersectionObserver,
  Map<Element, (entry: IntersectionObserverEntry) => void>
>();
const observerPool = new Map<string, IntersectionObserver>();

function getObserverKey(options: IntersectionObserverInit): string {
  const rootMargin = options.rootMargin ?? '0px';
  const thresholdArray = Array.isArray(options.threshold)
    ? options.threshold
    : [options.threshold ?? 0];
  const rootId = options.root instanceof Element ? options.root.tagName : 'null';
  return `${rootMargin}_${thresholdArray.join(',')}_${rootId}`;
}

function resolveThreshold(amount?: 'some' | 'all' | number): number[] {
  if (amount === 'all') return [1];
  if (typeof amount === 'number') return [amount];
  return [0]; // 'some' or default
}

function getPooledObserver(
  element: Element,
  options: IntersectionObserverInit,
  callback: (entry: IntersectionObserverEntry) => void,
): () => void {
  const key = getObserverKey(options);

  let observer = observerPool.get(key);
  if (observer === undefined) {
    const newObserver = new IntersectionObserver((entries) => {
      const cbs = observerCallbacks.get(newObserver);
      if (cbs === undefined) return;
      entries.forEach((entry) => {
        cbs.get(entry.target)?.(entry);
      });
    }, options);
    observer = newObserver;
    observerPool.set(key, observer);
    observerCallbacks.set(observer, new Map());
  }

  const callbacks = observerCallbacks.get(observer);
  if (callbacks === undefined) return () => { /* noop */ };
  callbacks.set(element, callback);
  observer.observe(element);

  return () => {
    callbacks.delete(element);
    observer.unobserve(element);
    if (callbacks.size === 0) {
      observer.disconnect();
      observerPool.delete(key);
      observerCallbacks.delete(observer);
    }
  };
}

/** Exposed for testing: clear the observer pool between tests. */
export function _resetObserverPool(): void {
  observerPool.clear();
}

function isElement(value: unknown): value is Element {
  return value instanceof Element;
}

export class InViewFeature extends Feature {
  private removeObserver?: () => void;
  private hasEnteredView = false;

  override mount(): void {
    this.startObserver();
  }

  override update(): void {
    if (this.removeObserver) {
      this.removeObserver();
    }
    this.startObserver();
  }

  override unmount(): void {
    this.removeObserver?.();
  }

  private startObserver(): void {
    if (typeof IntersectionObserver === 'undefined') return;
    const current: unknown = this.node.current;
    if (!isElement(current)) return;

    const props = this.node.getProps();
    const viewport = props.viewport;
    const rootElement = viewport?.root?.current ?? null;
    const once = viewport?.once ?? false;

    if (once && this.hasEnteredView) return;

    const threshold = resolveThreshold(viewport?.amount);
    const observerOptions: IntersectionObserverInit = {
      root: rootElement,
      rootMargin: viewport?.margin ?? '0px',
      threshold,
    };

    this.removeObserver = getPooledObserver(current, observerOptions, (entry) => {
      const isInView = entry.isIntersecting;

      if (once && !isInView) return;
      if (once && isInView) this.hasEnteredView = true;

      void this.node.animationState?.setActive('whileInView', isInView);

      const currentProps = this.node.getProps();
      if (isInView) {
        currentProps.onViewportEnter?.(entry);
      } else {
        currentProps.onViewportLeave?.(entry);
      }

      if (once && isInView) {
        this.removeObserver?.();
      }
    });
  }
}
