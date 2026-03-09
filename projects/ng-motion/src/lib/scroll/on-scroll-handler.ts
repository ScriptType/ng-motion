import { updateScrollInfo } from './info';
import { resolveOffsets } from './offsets/index';
import type { OnScrollHandler, OnScrollInfo, ScrollInfo, ScrollInfoOptions } from './types';

function measure(
  container: Element,
  target: Element = container,
  info: ScrollInfo,
): void {
  info.x.targetOffset = 0;
  info.y.targetOffset = 0;
  if (target !== container) {
    let node: HTMLElement | null = target as HTMLElement; // eslint-disable-line @typescript-eslint/consistent-type-assertions -- DOM traversal
    while (node !== null && node !== (container as Node)) { // eslint-disable-line @typescript-eslint/consistent-type-assertions -- DOM traversal
      info.x.targetOffset += node.offsetLeft;
      info.y.targetOffset += node.offsetTop;
      node = node.offsetParent as HTMLElement | null; // eslint-disable-line @typescript-eslint/consistent-type-assertions -- DOM traversal
    }
  }

  info.x.targetLength =
    target === container ? target.scrollWidth : target.clientWidth;
  info.y.targetLength =
    target === container ? target.scrollHeight : target.clientHeight;
  info.x.containerLength = container.clientWidth;
  info.y.containerLength = container.clientHeight;
}

export function createOnScrollHandler(
  element: Element,
  onScroll: OnScrollInfo,
  info: ScrollInfo,
  options: ScrollInfoOptions = {},
): OnScrollHandler {
  return {
    measure: (time: number): void => {
      measure(element, options.target, info);
      updateScrollInfo(element, info, time);

      if (options.offset || options.target) {
        resolveOffsets(element, info, options);
      }
    },
    notify: (): void => {
      onScroll(info);
    },
  };
}
