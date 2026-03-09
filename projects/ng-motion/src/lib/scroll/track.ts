import { cancelFrame, frame, frameData, resize } from 'motion-dom';
import { noop } from 'motion-utils';
import { createScrollInfo } from './info';
import { createOnScrollHandler } from './on-scroll-handler';
import type { OnScrollHandler, OnScrollInfo, ScrollInfoOptions } from './types';

const scrollListeners = new WeakMap<Element, VoidFunction>();
const resizeListeners = new WeakMap<Element, VoidFunction>();
const onScrollHandlers = new WeakMap<Element, Set<OnScrollHandler>>();
const scrollSize = new WeakMap<Element, { width: number; height: number }>();

const getEventTarget = (element: Element): Element | Window =>
  element === document.scrollingElement ? window : element;

export function scrollInfo(
  onScroll: OnScrollInfo,
  {
    container: rawContainer,
    trackContentSize = false,
    ...options
  }: ScrollInfoOptions = {},
): VoidFunction {
  const container = rawContainer ?? document.scrollingElement;
  if (container === null) return noop as VoidFunction; // eslint-disable-line @typescript-eslint/consistent-type-assertions -- motion-utils noop

  let containerHandlers = onScrollHandlers.get(container);

  if (!containerHandlers) {
    containerHandlers = new Set();
    onScrollHandlers.set(container, containerHandlers);
  }

  const info = createScrollInfo();
  const containerHandler = createOnScrollHandler(container, onScroll, info, options);
  containerHandlers.add(containerHandler);

  if (!scrollListeners.has(container)) {
    // Capture a local reference so closures don't need non-null assertions
    const handlers = containerHandlers;

    const measureAll = (): void => {
      for (const handler of handlers) {
        handler.measure(frameData.timestamp);
      }
      frame.preUpdate(notifyAll);
    };

    const notifyAll = (): void => {
      for (const handler of handlers) {
        handler.notify();
      }
    };

    const listener = (): void => {
      frame.read(measureAll);
    };

    scrollListeners.set(container, listener);

    const target = getEventTarget(container);
    window.addEventListener('resize', listener);
    if (container !== document.documentElement) {
      resizeListeners.set(container, resize(container, listener));
    }

    target.addEventListener('scroll', listener as EventListener); // eslint-disable-line @typescript-eslint/consistent-type-assertions -- DOM event listener
    listener();
  }

  if (trackContentSize && !scrollSize.has(container)) {
    const listener = scrollListeners.get(container);
    if (!listener) return noop as VoidFunction; // eslint-disable-line @typescript-eslint/consistent-type-assertions -- motion-utils noop

    const size = {
      width: container.scrollWidth,
      height: container.scrollHeight,
    };
    scrollSize.set(container, size);

    const checkScrollDimensions = (): void => {
      const newWidth = container.scrollWidth;
      const newHeight = container.scrollHeight;

      if (size.width !== newWidth || size.height !== newHeight) {
        listener();
        size.width = newWidth;
        size.height = newHeight;
      }
    };

    frame.read(checkScrollDimensions, true);
  }

  const outerListener = scrollListeners.get(container);
  if (outerListener) {
    frame.read(outerListener, false, true);
  }

  return (): void => {
    if (outerListener) {
      cancelFrame(outerListener);
    }

    const currentHandlers = onScrollHandlers.get(container);
    if (!currentHandlers) return;

    currentHandlers.delete(containerHandler);

    if (currentHandlers.size > 0) return;

    const scrollListener = scrollListeners.get(container);
    scrollListeners.delete(container);

    if (scrollListener) {
      getEventTarget(container).removeEventListener(
        'scroll',
        scrollListener as EventListener, // eslint-disable-line @typescript-eslint/consistent-type-assertions -- DOM event listener
      );
      resizeListeners.get(container)?.();
      window.removeEventListener('resize', scrollListener);
    }

    scrollSize.delete(container);
  };
}
