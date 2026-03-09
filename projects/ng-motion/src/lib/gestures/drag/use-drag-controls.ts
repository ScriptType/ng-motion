export class DragControls {
  private subscribers = new Set<(event: PointerEvent) => void>();

  subscribe(handler: (e: PointerEvent) => void): () => void {
    this.subscribers.add(handler);
    return () => {
      this.subscribers.delete(handler);
    };
  }

  start(event: PointerEvent): void {
    this.subscribers.forEach(h => { h(event); });
  }
}

export function useDragControls(): DragControls {
  return new DragControls();
}
