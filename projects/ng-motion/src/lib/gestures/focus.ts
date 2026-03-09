import { Feature, addDomEvent } from 'motion-dom';

function isElement(value: unknown): value is Element & EventTarget {
  return value instanceof Element;
}

function isCallable(value: unknown): value is () => void {
  return typeof value === 'function';
}

export class FocusFeature extends Feature {
  private removeFocusListener?: () => void;
  private removeBlurListener?: () => void;

  override mount(): void {
    const current: unknown = this.node.current;
    if (!isElement(current)) return;

    const focusCleanup: () => void = addDomEvent(current, 'focus', () => {
      const isFocusVisible = this.checkFocusVisible(current);

      if (!isFocusVisible) return;

      void this.node.animationState?.setActive('whileFocus', true);

      const props: Record<string, unknown> = { ...this.node.getProps() };
      const onFocusStart = props['onFocusStart'];
      if (isCallable(onFocusStart)) {
        onFocusStart();
      }
    });
    this.removeFocusListener = focusCleanup;

    const blurCleanup: () => void = addDomEvent(current, 'blur', () => {
      void this.node.animationState?.setActive('whileFocus', false);

      const props: Record<string, unknown> = { ...this.node.getProps() };
      const onFocusEnd = props['onFocusEnd'];
      if (isCallable(onFocusEnd)) {
        onFocusEnd();
      }
    });
    this.removeBlurListener = blurCleanup;
  }

  private checkFocusVisible(element: Element): boolean {
    try {
      return element.matches(':focus-visible');
    } catch {
      return true;
    }
  }

  override unmount(): void {
    this.removeFocusListener?.();
    this.removeFocusListener = undefined;
    this.removeBlurListener?.();
    this.removeBlurListener = undefined;
  }
}
