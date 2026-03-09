import type { MotionNodeOptions } from 'motion-dom';
import { _resetFeatureInit } from './feature-init';
import {
  createHtmlRenderState,
  createHtmlVisualState,
  createVisualElement,
  makeLatestValues,
  mountVisualElement,
  prerenderVisualElementStyles,
  unmountVisualElement,
  updateVisualElement,
} from './visual-element-adapter';

describe('createHtmlRenderState', () => {
  it('returns empty render state with correct shape', () => {
    const state = createHtmlRenderState();
    expect(state).toEqual({
      style: {},
      transform: {},
      transformOrigin: {},
      vars: {},
    });
  });
});

describe('makeLatestValues', () => {
  it('resolves values from initial prop', () => {
    const props: MotionNodeOptions = {
      initial: { opacity: 0, x: 100 },
    };
    const values = makeLatestValues(props);
    expect(values['opacity']).toBe(0);
    expect(values['x']).toBe(100);
  });

  it('resolves values from variant labels', () => {
    const props: MotionNodeOptions = {
      initial: 'hidden',
      variants: {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      },
    };
    const values = makeLatestValues(props);
    expect(values['opacity']).toBe(0);
  });

  it('uses animate target when initial is false', () => {
    const props: MotionNodeOptions = {
      initial: false,
      animate: { opacity: 1, x: 0 },
    };
    const values = makeLatestValues(props);
    expect(values['opacity']).toBe(1);
    expect(values['x']).toBe(0);
  });

  it('takes last keyframe when initial is false and animate has arrays', () => {
    const props: MotionNodeOptions = {
      initial: false,
      animate: { opacity: [0, 0.5, 1] },
    };
    const values = makeLatestValues(props);
    expect(values['opacity']).toBe(1);
  });

  it('returns empty values when no props provided', () => {
    const values = makeLatestValues({});
    expect(Object.keys(values).length).toBe(0);
  });
});

describe('createHtmlVisualState', () => {
  it('returns latestValues and renderState', () => {
    const state = createHtmlVisualState({ initial: { opacity: 0.5 } });
    expect(state.latestValues['opacity']).toBe(0.5);
    expect(state.renderState).toEqual({
      style: {},
      transform: {},
      transformOrigin: {},
      vars: {},
    });
  });
});

describe('createVisualElement', () => {
  beforeEach(() => {
    _resetFeatureInit();
  });

  it('creates an HTMLVisualElement without errors', () => {
    const ve = createVisualElement({ props: { animate: { opacity: 1 } } });
    expect(ve).toBeDefined();
    expect(ve.latestValues).toBeDefined();
  });

  it('initializes features automatically', () => {
    const ve = createVisualElement({ props: { animate: { opacity: 1 } } });
    expect(ve).toBeDefined();
  });
});

function createDomElement(): HTMLDivElement {
  const el = document.createElement('div');
  document.body.appendChild(el);
  return el;
}

describe('VisualElement lifecycle', () => {
  let el: HTMLDivElement;

  beforeEach(() => {
    _resetFeatureInit();
    el = createDomElement();
  });

  afterEach(() => {
    el.remove();
  });

  it('pre-renders initial DOM styles before mount', () => {
    prerenderVisualElementStyles(el, {
      initial: { opacity: 0, x: -20, height: 0 },
      animate: { opacity: 1, x: 0, height: 'auto' },
    });

    expect(el.style.opacity).toBe('0');
    expect(el.style.transform).toContain('translateX(-20px)');
    expect(el.style.height).toBe('0px');
  });

  it('mounts to DOM element', () => {
    const ve = createVisualElement({ props: { animate: { opacity: 1 } } });
    expect(() => {
      mountVisualElement(ve, el);
    }).not.toThrow();

    unmountVisualElement(ve);
  });

  it('creates animationState after mount + updateFeatures', () => {
    const ve = createVisualElement({ props: { animate: { opacity: 1 } } });
    mountVisualElement(ve, el);

    expect(ve.animationState).toBeDefined();
    unmountVisualElement(ve);
  });

  it('updates props and re-triggers animation', () => {
    const ve = createVisualElement({ props: { animate: { opacity: 0 } } });
    mountVisualElement(ve, el);

    expect(() => {
      updateVisualElement(ve, { animate: { opacity: 1 } });
    }).not.toThrow();

    unmountVisualElement(ve);
  });

  it('unmounts cleanly', () => {
    const ve = createVisualElement({ props: { animate: { opacity: 1 } } });
    mountVisualElement(ve, el);

    expect(() => {
      unmountVisualElement(ve);
    }).not.toThrow();
  });

  it('supports parent-child relationship', () => {
    const parent = createVisualElement({
      props: { animate: 'visible', variants: { visible: { opacity: 1 } } },
    });
    mountVisualElement(parent, el);

    const child = createVisualElement({
      props: {
        variants: { visible: { x: 0 }, hidden: { x: -100 } },
      },
      parent,
    });

    expect(child).toBeDefined();
    unmountVisualElement(parent);
  });
});
