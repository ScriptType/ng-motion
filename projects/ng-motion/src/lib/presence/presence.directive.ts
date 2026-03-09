import {
  Directive,
  effect,
  inject,
  Injector,
  input,
  TemplateRef,
  ViewContainerRef,
  DestroyRef,
  type EmbeddedViewRef,
} from '@angular/core';
import {
  PRESENCE_CONTEXT,
  createPresenceContext,
  type NgmPresenceContext,
} from './presence-context';

@Directive({
  selector: '[ngmPresence]',
})
export class NgmPresenceDirective {
  readonly ngmPresence = input.required<boolean>();

  private readonly templateRef = inject(TemplateRef);
  private readonly vcr = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly parentInjector = inject(Injector);

  private viewRef: EmbeddedViewRef<unknown> | null = null;
  private presenceContext: NgmPresenceContext | null = null;
  private exitPending = false;

  constructor() {
    effect(() => {
      const isPresent = this.ngmPresence();

      if (isPresent) {
        this.enter();
      } else {
        this.exit();
      }
    });

    this.destroyRef.onDestroy(() => {
      this.viewRef = null;
      this.presenceContext = null;
    });
  }

  private enter(): void {
    if (this.exitPending) {
      // Cancel pending exit — re-enter
      this.exitPending = false;
      if (this.presenceContext) {
        this.presenceContext.isPresent = true;
        this.presenceContext.isPresent$.set(true);
        this.presenceContext.setExitCompleteCallback(undefined);
      }
      return;
    }

    if (this.viewRef) return; // Already showing

    // Create presence context
    this.presenceContext = createPresenceContext(true);

    // Create injector with presence context
    const injector = Injector.create({
      providers: [{ provide: PRESENCE_CONTEXT, useValue: this.presenceContext }],
      parent: this.parentInjector,
    });

    this.viewRef = this.vcr.createEmbeddedView(this.templateRef, {}, { injector });
    this.viewRef.detectChanges();
  }

  private exit(): void {
    if (!this.viewRef) return;
    if (!this.presenceContext) {
      this.removeView();
      return;
    }

    this.exitPending = true;
    this.presenceContext.isPresent = false;
    this.presenceContext.isPresent$.set(false);

    // Set up callback for when all exit animations complete
    this.presenceContext.setExitCompleteCallback(() => {
      if (this.exitPending) {
        this.removeView();
        this.exitPending = false;
      }
    });
  }

  private removeView(): void {
    this.vcr.clear();
    this.viewRef = null;
    this.presenceContext = null;
  }
}
