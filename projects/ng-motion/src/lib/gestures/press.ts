import { Feature, press, frame } from 'motion-dom';

function isElement(value: unknown): value is Element {
  return value instanceof Element;
}

export class PressFeature extends Feature {
  private removePressListener?: () => void;

  override mount(): void {
    const current: unknown = this.node.current;
    if (!isElement(current)) return;

    const props = this.node.getProps();

    const options: { useGlobalTarget?: boolean } = {};
    if (props.globalTapTarget === true) {
      options.useGlobalTarget = true;
    }

    this.removePressListener = press(
      current,
      (_el, startEvent) => {
        void this.node.animationState?.setActive('whileTap', true);

        const currentProps = this.node.getProps();
        if (currentProps.onTapStart !== undefined) {
          frame.postRender(() => {
            currentProps.onTapStart?.(startEvent, { point: { x: startEvent.pageX, y: startEvent.pageY } });
          });
        }

        return (endEvent: PointerEvent, info: { success: boolean }) => {
          void this.node.animationState?.setActive('whileTap', false);

          const latestProps = this.node.getProps();
          if (info.success) {
            if (latestProps.onTap !== undefined) {
              frame.postRender(() => {
                latestProps.onTap?.(endEvent, { point: { x: endEvent.pageX, y: endEvent.pageY } });
              });
            }
          } else {
            if (latestProps.onTapCancel !== undefined) {
              frame.postRender(() => {
                latestProps.onTapCancel?.(endEvent, { point: { x: endEvent.pageX, y: endEvent.pageY } });
              });
            }
          }
        };
      },
      options,
    );
  }

  override unmount(): void {
    this.removePressListener?.();
    this.removePressListener = undefined;
  }
}
