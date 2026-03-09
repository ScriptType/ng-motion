import { Feature } from 'motion-dom';

/**
 * ExitAnimationFeature — detects when presence changes from true to false
 * and activates the 'exit' animation type on the VisualElement.
 *
 * On mount, registers with the presence context (incrementing the child count).
 * When isPresent becomes false, starts the exit animation. When the exit
 * animation completes, calls the deregister (safeToRemove) function which
 * decrements the child count and — when all children have exited — fires
 * the presence directive's exit-complete callback to remove the view.
 *
 * Also handles re-entry: if isPresent goes back to true before the exit
 * animation finishes, deactivates exit and re-registers for future exits.
 */
export class ExitAnimationFeature extends Feature {
  private deregister?: () => void;
  private isExiting = false;

  override mount(): void {
    const presenceContext = this.node.presenceContext;
    if (!presenceContext) return;

    const { register, id } = presenceContext;
    this.deregister = register(id);
  }

  override update(): void {
    const presenceContext = this.node.presenceContext;
    if (!presenceContext) return;

    const props = this.node.getProps();
    if (props.exit === undefined) return;

    if (!presenceContext.isPresent) {
      if (!this.isExiting) {
        this.isExiting = true;
        void this.node.animationState?.setActive('exit', true).then(() => {
          // Guard: only deregister if we're still in the exit that started this promise.
          // A rapid toggle (exit → re-enter) sets isExiting=false, so the stale
          // .then() from the cancelled exit harmlessly skips this block.
          if (this.isExiting) {
            this.deregister?.();
            this.deregister = undefined;
          }
        });
      }
    } else if (this.isExiting) {
      // Re-entering: cancel exit animation and fall back to animate state.
      this.isExiting = false;
      void this.node.animationState?.setActive('exit', false);

      // Re-register so future exits work.
      this.deregister ??= presenceContext.register(presenceContext.id);
    }
  }

  override unmount(): void {
    this.deregister?.();
    this.deregister = undefined;
  }
}
