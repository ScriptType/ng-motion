import {
  Component,
  ElementRef,
  OnDestroy,
  TemplateRef,
  contentChild,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { NgmMotionDirective } from 'ng-motion';

@Component({
  selector: 'app-demo-replay',
  imports: [NgTemplateOutlet, NgmMotionDirective],
  template: `
    <div #frameHost class="relative">
      <button
        (click)="replay()"
        [attr.aria-disabled]="replaying()"
        type="button"
        ngmMotion
        [whileHover]="{ scale: 1.04, y: -1 }"
        [whileTap]="{ scale: 0.97 }"
        [transition]="{ type: 'spring', stiffness: 420, damping: 24 }"
        class="absolute right-3 top-3 z-10 cursor-pointer select-none appearance-none rounded-md border border-accent/18 bg-surface px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-accent shadow-lg shadow-black/10 transition-colors"
      >
        Replay
      </button>

      <div
        #contentHost
        [style.minHeight.px]="placeholderHeight() ?? null"
      >
        @if (contentVisible()) {
          <ng-container [ngTemplateOutlet]="demoTemplate()" />
        }
      </div>
    </div>
  `,
})
export class DemoReplayComponent implements OnDestroy {
  readonly demoTemplate = contentChild.required<TemplateRef<unknown>>(TemplateRef);
  private readonly frameHost = viewChild<ElementRef<HTMLElement>>('frameHost');
  private readonly contentHost = viewChild<ElementRef<HTMLElement>>('contentHost');
  readonly replaying = signal(false);
  readonly contentVisible = signal(true);
  readonly placeholderHeight = signal<number | null>(null);
  private replayTimeout: ReturnType<typeof setTimeout> | null = null;
  private replayFrame: number | null = null;
  private snapshotOverlay: HTMLElement | null = null;

  replay(): void {
    if (this.replaying()) {
      return;
    }

    const frame = this.frameHost()?.nativeElement;
    const host = this.contentHost()?.nativeElement;

    this.replaying.set(true);
    this.placeholderHeight.set(host?.offsetHeight ?? null);
    this.mountSnapshotOverlay(frame, host);
    this.contentVisible.set(false);

    this.replayTimeout = setTimeout(() => {
      this.contentVisible.set(true);
      this.replayTimeout = null;

      this.replayFrame = requestAnimationFrame(() => {
        this.clearSnapshotOverlay();
        this.placeholderHeight.set(null);
        this.replaying.set(false);
        this.replayFrame = null;
      });
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.replayTimeout !== null) {
      clearTimeout(this.replayTimeout);
    }

    if (this.replayFrame !== null) {
      cancelAnimationFrame(this.replayFrame);
    }

    this.clearSnapshotOverlay();
  }

  private mountSnapshotOverlay(
    frame: HTMLElement | undefined,
    host: HTMLElement | undefined,
  ): void {
    this.clearSnapshotOverlay();

    if (!frame || !host || host.childElementCount === 0) {
      return;
    }

    const overlay = document.createElement('div');
    overlay.setAttribute('aria-hidden', 'true');
    Object.assign(overlay.style, {
      position: 'absolute',
      inset: '0',
      zIndex: '1',
      pointerEvents: 'none',
      overflow: 'hidden',
    });

    const snapshot = host.cloneNode(true);
    overlay.appendChild(snapshot);
    frame.appendChild(overlay);
    this.snapshotOverlay = overlay;
  }

  private clearSnapshotOverlay(): void {
    this.snapshotOverlay?.remove();
    this.snapshotOverlay = null;
  }
}
