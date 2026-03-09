import { Feature, hover, frame } from 'motion-dom';
import { extractEventInfo } from './event-info';

function isElement(value: unknown): value is Element {
  return value instanceof Element;
}

export class HoverFeature extends Feature {
  private removeHoverListener?: () => void;

  override mount(): void {
    const current: unknown = this.node.current;
    if (!isElement(current)) return;

    this.removeHoverListener = hover(current, (_el, startEvent) => {
      void this.node.animationState?.setActive('whileHover', true);

      const props = this.node.getProps();
      const startInfo = extractEventInfo(startEvent);
      if (props.onHoverStart !== undefined) {
        frame.postRender(() => {
          props.onHoverStart?.(startEvent, startInfo);
        });
      }

      return (endEvent: PointerEvent) => {
        void this.node.animationState?.setActive('whileHover', false);

        const endInfo = extractEventInfo(endEvent);
        const currentProps = this.node.getProps();
        if (currentProps.onHoverEnd !== undefined) {
          frame.postRender(() => {
            currentProps.onHoverEnd?.(endEvent, endInfo);
          });
        }
      };
    });
  }

  override unmount(): void {
    this.removeHoverListener?.();
    this.removeHoverListener = undefined;
  }
}
