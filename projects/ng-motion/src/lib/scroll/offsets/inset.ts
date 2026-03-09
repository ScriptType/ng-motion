import { isHTMLElement } from 'motion-dom';

export function calcInset(
  element: Element,
  container: Element,
): { x: number; y: number } {
  const inset = { x: 0, y: 0 };

  let current: Element | null = element;
  while (current && current !== container) {
    if (isHTMLElement(current)) {
      inset.x += current.offsetLeft;
      inset.y += current.offsetTop;
      current = current.offsetParent;
    } else if (current.tagName === 'svg') {
      const svgBoundingBox = current.getBoundingClientRect();
      current = current.parentElement;
      if (!current) break;
      const parentBoundingBox = current.getBoundingClientRect();
      inset.x += svgBoundingBox.left - parentBoundingBox.left;
      inset.y += svgBoundingBox.top - parentBoundingBox.top;
    } else if (current instanceof SVGGraphicsElement) {
      const { x, y } = current.getBBox();
      inset.x += x;
      inset.y += y;

      let svg: SVGElement | null = null;
      let parent: SVGElement = current.parentNode as SVGElement; // eslint-disable-line @typescript-eslint/consistent-type-assertions -- SVG DOM traversal
      while (!svg) {
        if (parent.tagName === 'svg') {
          svg = parent;
        }
        parent = current.parentNode as SVGElement; // eslint-disable-line @typescript-eslint/consistent-type-assertions -- SVG DOM traversal
      }
      current = svg;
    } else {
      break;
    }
  }

  return inset;
}
