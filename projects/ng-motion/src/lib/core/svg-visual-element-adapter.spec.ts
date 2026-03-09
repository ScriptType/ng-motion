import '../test-env';
import { _resetFeatureInit } from './feature-init';
import {
  createSvgRenderState,
  createSvgVisualElement,
  createSvgVisualState,
  isSVGElement,
} from './svg-visual-element-adapter';

const SVG_NS = 'http://www.w3.org/2000/svg';
const hasDocument = typeof document !== 'undefined';

function createSvgElement<K extends keyof SVGElementTagNameMap>(
  tag: K,
): SVGElementTagNameMap[K] {
  return document.createElementNS(SVG_NS, tag);
}

describe('isSVGElement', () => {
  it('returns true for SVG child elements', () => {
    if (!hasDocument) {
      // SVG element detection requires DOM; skip in non-DOM environments
      expect(true).toBe(true);
      return;
    }
    const circle = createSvgElement('circle');
    expect(isSVGElement(circle)).toBe(true);
  });

  it('returns false for HTML elements', () => {
    if (!hasDocument) {
      expect(true).toBe(true);
      return;
    }
    const div = document.createElement('div');
    expect(isSVGElement(div)).toBe(false);
  });
});

describe('createSvgRenderState', () => {
  it('returns render state with attrs field', () => {
    const state = createSvgRenderState();
    expect(state).toEqual({
      style: {},
      transform: {},
      transformOrigin: {},
      vars: {},
      attrs: {},
    });
  });
});

describe('createSvgVisualState', () => {
  it('returns latestValues and renderState with attrs', () => {
    const state = createSvgVisualState({ initial: { opacity: 0.5 } });
    expect(state.latestValues['opacity']).toBe(0.5);
    expect(state.renderState.attrs).toEqual({});
  });
});

describe('createSvgVisualElement', () => {
  beforeEach(() => {
    _resetFeatureInit();
  });

  it('creates a visual element for SVG', () => {
    const ve = createSvgVisualElement({ props: { animate: { opacity: 1 } } });
    expect(ve).toBeDefined();
    expect(ve.latestValues).toBeDefined();
  });

  it('mounts to an SVG element', () => {
    if (!hasDocument) {
      expect(true).toBe(true);
      return;
    }
    const svg = createSvgElement('svg');
    const circle = createSvgElement('circle');
    svg.appendChild(circle);
    document.body.appendChild(svg);

    const ve = createSvgVisualElement({ props: { animate: { opacity: 1 } } });
    expect(() => {
      ve.mount(circle);
    }).not.toThrow();

    ve.unmount();
    svg.remove();
  });

  it('applies SVG attributes via initial values', () => {
    const ve = createSvgVisualElement({
      props: { initial: { cx: 50, cy: 50, r: 25 } },
    });
    expect(ve.latestValues['cx']).toBe(50);
    expect(ve.latestValues['cy']).toBe(50);
    expect(ve.latestValues['r']).toBe(25);
  });

  it('handles SVG transforms', () => {
    const ve = createSvgVisualElement({
      props: { initial: { x: 10, y: 20, rotate: 45 } },
    });
    expect(ve.latestValues['x']).toBe(10);
    expect(ve.latestValues['y']).toBe(20);
    expect(ve.latestValues['rotate']).toBe(45);
  });

  it('handles pathLength attribute', () => {
    const ve = createSvgVisualElement({
      props: { initial: { pathLength: 1 } },
    });
    expect(ve.latestValues['pathLength']).toBe(1);
  });

  it('handles pathOffset via initial values', () => {
    const ve = createSvgVisualElement({
      props: { initial: { pathOffset: 0.5 } },
    });
    expect(ve.latestValues['pathOffset']).toBe(0.5);
  });

  it('handles pathSpacing via initial values', () => {
    const ve = createSvgVisualElement({
      props: { initial: { pathSpacing: 0.8 } },
    });
    expect(ve.latestValues['pathSpacing']).toBe(0.8);
  });

  it('render state includes attrs object', () => {
    const state = createSvgVisualState({ initial: { fill: '#ff0000' } });
    expect(state.renderState).toHaveProperty('attrs');
    expect(typeof state.renderState.attrs).toBe('object');
  });

  it('cleanup unmounts without error', () => {
    if (!hasDocument) {
      expect(true).toBe(true);
      return;
    }
    const svg = createSvgElement('svg');
    const rect = createSvgElement('rect');
    svg.appendChild(rect);
    document.body.appendChild(svg);

    const ve = createSvgVisualElement({ props: { animate: { opacity: 1 } } });
    ve.mount(rect);

    expect(() => {
      ve.unmount();
    }).not.toThrow();

    svg.remove();
  });
});
