import type { EventInfo } from 'motion-dom';

export function extractEventInfo(event: PointerEvent): EventInfo {
  return { point: { x: event.pageX, y: event.pageY } };
}
