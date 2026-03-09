import { Component, signal, computed, type OnDestroy } from '@angular/core';
import { NgmMotionDirective, NgmPresenceDirective } from '@scripttype/ng-motion';
import type { TargetAndTransition, Transition } from '@scripttype/ng-motion';

type SlideDirection = 'left' | 'right' | 'up' | 'down';

interface ListItem {
  id: number;
  emoji: string;
  label: string;
  color: string;
  removing?: boolean;
}

type NotificationType = 'info' | 'success' | 'warning';

interface Toast {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: number;
}

const EMOJIS = ['🎯', '🚀', '🎨', '🔮', '⚡', '🌊', '🎪', '💎', '🎭', '✨', '🧊', '🌀'];
const LABELS = [
  'Quantum Flux',
  'Nova Burst',
  'Pixel Drift',
  'Void Echo',
  'Arc Pulse',
  'Tide Shift',
  'Phase Gate',
  'Core Shard',
  'Mask Flip',
  'Glint Spark',
  'Frost Cube',
  'Spin Loop',
];
const ITEM_COLORS = [
  'from-accent-cyan/20 to-accent-cyan/5',
  'from-accent-purple/20 to-accent-purple/5',
  'from-accent-amber/20 to-accent-amber/5',
  'from-accent-cyan/15 to-accent-purple/10',
  'from-accent-purple/15 to-accent-amber/10',
  'from-accent-amber/15 to-accent-cyan/10',
];

const TOAST_CONFIGS: Record<NotificationType, { title: string; messages: string[] }> = {
  info: {
    title: 'Info',
    messages: ['Build completed in 2.4s', 'New version available', '3 dependencies updated'],
  },
  success: {
    title: 'Success',
    messages: ['Deployed to production', 'Tests passed (417/417)', 'Pipeline green'],
  },
  warning: {
    title: 'Warning',
    messages: ['Memory usage at 85%', 'Rate limit approaching', 'Certificate expires in 7d'],
  },
};

const SPRING_TRANSITION: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 25,
};

@Component({
  selector: 'app-presence-page',
  imports: [NgmMotionDirective, NgmPresenceDirective],
  template: `
    <!-- Page header -->
    <div
      ngmMotion
      [initial]="{ opacity: 0, y: 20 }"
      [animate]="{ opacity: 1, y: 0 }"
      [transition]="{ duration: 0.5, ease: 'easeOut' }"
      class="mb-12"
    >
      <p class="mb-3 font-mono text-xs tracking-widest text-accent-amber uppercase">
        Enter & Exit Animations
      </p>
      <h1
        class="font-display text-4xl font-extrabold bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent mb-3"
      >
        Presence
      </h1>
      <p class="text-text-secondary max-w-xl leading-relaxed">
        Animate elements in and out of the DOM. The
        <code class="font-mono text-xs text-accent-cyan bg-accent-cyan/10 px-1.5 py-0.5 rounded">
          *ngmPresence
        </code>
        directive plays exit animations before removing elements.
      </p>
    </div>

    <!-- ─── Demo 1: Simple Toggle ─── -->
    <section
      ngmMotion
      [initial]="{ opacity: 0, y: 20 }"
      [animate]="{ opacity: 1, y: 0 }"
      [transition]="{ delay: 0.15, duration: 0.5 }"
      class="mb-10"
    >
      <h2 class="font-display text-lg font-semibold text-text-primary mb-1">Simple Toggle</h2>
      <p class="text-sm text-text-secondary mb-5">
        Fade and scale on enter, reverse on exit. The element is fully removed from the DOM.
      </p>

      <div class="bg-surface-1 rounded-demo p-6 border border-border">
        <div class="flex items-center gap-4 mb-6">
          <button
            (click)="toggleVisible()"
            class="px-4 py-2 rounded-button bg-gradient-to-r from-accent-cyan to-accent-purple text-white font-medium text-sm transition-shadow hover:shadow-lg hover:shadow-accent-cyan/20"
          >
            {{ simpleVisible() ? 'Hide' : 'Show' }}
          </button>
          <span class="font-mono text-xs text-text-muted flex items-center gap-2">
            <span
              class="inline-block h-2 w-2 rounded-full transition-colors"
              [class]="simpleVisible() ? 'bg-emerald-400' : 'bg-red-400'"
            ></span>
            {{ simpleVisible() ? 'Visible' : 'Hidden' }}
          </span>
        </div>

        <div class="flex items-center justify-center h-48 rounded-lg bg-surface-0/50 border border-border/50 overflow-hidden">
          <ng-container *ngmPresence="simpleVisible()">
            <div
              ngmMotion
              [initial]="{ opacity: 0, scale: 0.8 }"
              [animate]="{ opacity: 1, scale: 1 }"
              [exit]="{ opacity: 0, scale: 0.8 }"
              [transition]="springTransition"
              class="flex flex-col items-center gap-3"
            >
              <div
                class="h-20 w-20 rounded-2xl bg-gradient-to-br from-accent-cyan to-accent-purple shadow-lg shadow-accent-purple/25 flex items-center justify-center"
              >
                <span class="text-3xl font-bold text-white">ng</span>
              </div>
              <span class="font-mono text-xs text-text-muted">I exist in the DOM</span>
            </div>
          </ng-container>
        </div>
      </div>
    </section>

    <!-- ─── Demo 2: Slide Directions ─── -->
    <section
      ngmMotion
      [initial]="{ opacity: 0, y: 20 }"
      [animate]="{ opacity: 1, y: 0 }"
      [transition]="{ delay: 0.25, duration: 0.5 }"
      class="mb-10"
    >
      <h2 class="font-display text-lg font-semibold text-text-primary mb-1">Slide Directions</h2>
      <p class="text-sm text-text-secondary mb-5">
        Dynamic initial and exit values based on direction. Toggle visibility to see directional slides.
      </p>

      <div class="bg-surface-1 rounded-demo p-6 border border-border">
        <div class="flex flex-wrap items-center gap-3 mb-6">
          @for (dir of directions; track dir) {
            <button
              (click)="setDirection(dir)"
              class="px-4 py-2 rounded-button text-sm font-medium transition-all"
              [class]="
                slideDirection() === dir
                  ? 'bg-gradient-to-r from-accent-cyan to-accent-purple text-white shadow-lg shadow-accent-cyan/20'
                  : 'bg-surface-2 text-text-secondary border border-border hover:border-border-hover'
              "
            >
              {{ directionLabels[dir] }}
            </button>
          }

          <div class="w-px h-6 bg-border mx-1"></div>

          <button
            (click)="toggleSlide()"
            class="px-4 py-2 rounded-button bg-surface-2 text-text-secondary border border-border hover:border-border-hover text-sm font-medium transition-colors"
          >
            {{ slideVisible() ? 'Exit' : 'Enter' }}
          </button>
        </div>

        <div class="flex items-center justify-center h-56 rounded-lg bg-surface-0/50 border border-border/50 overflow-hidden relative">
          <ng-container *ngmPresence="slideVisible()">
            <div
              ngmMotion
              [initial]="slideInitial()"
              [animate]="{ opacity: 1, x: 0, y: 0 }"
              [exit]="slideExit()"
              [transition]="springTransition"
              class="flex items-center gap-4 px-6 py-4 rounded-xl bg-gradient-to-r from-surface-2 to-surface-3 border border-border shadow-xl"
            >
              <div class="h-12 w-12 rounded-lg bg-gradient-to-br from-accent-purple to-accent-amber flex items-center justify-center text-xl">
                {{ directionEmojis[slideDirection()] }}
              </div>
              <div>
                <p class="font-display text-sm font-semibold text-text-primary">
                  Sliding {{ slideDirection() }}
                </p>
                <p class="font-mono text-xs text-text-muted mt-0.5">
                  {{ slideDirection() === 'left' || slideDirection() === 'right' ? 'x' : 'y' }}:
                  {{ slideOffset()[slideDirection() === 'left' || slideDirection() === 'right' ? 'x' : 'y'] }}px
                </p>
              </div>
            </div>
          </ng-container>

          <!-- Direction indicators -->
          <div class="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div class="absolute top-3 left-1/2 -translate-x-1/2 font-mono text-[10px] text-text-muted/30">
              UP
            </div>
            <div class="absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[10px] text-text-muted/30">
              DOWN
            </div>
            <div class="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-text-muted/30">
              LEFT
            </div>
            <div class="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-text-muted/30">
              RIGHT
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── Demo 3: List Add/Remove ─── -->
    <section
      ngmMotion
      [initial]="{ opacity: 0, y: 20 }"
      [animate]="{ opacity: 1, y: 0 }"
      [transition]="{ delay: 0.35, duration: 0.5 }"
      class="mb-10"
    >
      <h2 class="font-display text-lg font-semibold text-text-primary mb-1">List Add / Remove</h2>
      <p class="text-sm text-text-secondary mb-5">
        Each item animates in and out independently. Add items or click the remove button.
      </p>

      <div class="bg-surface-1 rounded-demo p-6 border border-border">
        <div class="flex items-center gap-3 mb-6">
          <button
            (click)="addItem()"
            class="px-4 py-2 rounded-button bg-gradient-to-r from-accent-cyan to-accent-purple text-white font-medium text-sm transition-shadow hover:shadow-lg hover:shadow-accent-cyan/20"
          >
            + Add Item
          </button>
          <button
            (click)="clearItems()"
            class="px-4 py-2 rounded-button bg-surface-2 text-text-secondary border border-border hover:border-border-hover text-sm font-medium transition-colors"
          >
            Clear All
          </button>
          <span class="font-mono text-xs text-text-muted ml-auto">
            {{ listItems().length }} items
          </span>
        </div>

        <div class="space-y-3 min-h-[200px]">
          @for (item of listItems(); track item.id) {
            <ng-container *ngmPresence="!item.removing">
              <div
                ngmMotion
                [initial]="{ opacity: 0, x: -30, scale: 0.95 }"
                [animate]="{ opacity: 1, x: 0, scale: 1 }"
                [exit]="{ opacity: 0, x: 30, scale: 0.95 }"
                [transition]="springTransition"
                class="flex items-center gap-4 px-4 py-3 rounded-xl bg-gradient-to-r border border-border/50 group"
                [class]="item.color"
              >
                <span class="text-2xl select-none">{{ item.emoji }}</span>
                <div class="flex-1 min-w-0">
                  <p class="font-display text-sm font-semibold text-text-primary">
                    {{ item.label }}
                  </p>
                  <p class="font-mono text-[10px] text-text-muted mt-0.5">id: {{ item.id }}</p>
                </div>
                <button
                  (click)="removeItem(item.id)"
                  class="h-7 w-7 rounded-lg bg-surface-0/50 text-text-muted hover:text-red-400 hover:bg-red-400/10 flex items-center justify-center text-sm transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Remove item"
                >
                  &times;
                </button>
              </div>
            </ng-container>
          }

          @if (listItems().length === 0) {
            <div class="flex items-center justify-center h-[200px] text-text-muted text-sm font-mono">
              Empty list -- add some items
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ─── Demo 4: Notification Stack ─── -->
    <section
      ngmMotion
      [initial]="{ opacity: 0, y: 20 }"
      [animate]="{ opacity: 1, y: 0 }"
      [transition]="{ delay: 0.45, duration: 0.5 }"
      class="mb-10"
    >
      <h2 class="font-display text-lg font-semibold text-text-primary mb-1">
        Notification Stack
      </h2>
      <p class="text-sm text-text-secondary mb-5">
        Toast notifications that auto-dismiss after 3 seconds. A real-world presence pattern.
      </p>

      <div class="bg-surface-1 rounded-demo p-6 border border-border">
        <div class="flex flex-wrap items-center gap-3 mb-6">
          <button
            (click)="sendNotification('info')"
            class="px-4 py-2 rounded-button text-sm font-medium bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/20 hover:bg-accent-cyan/25 transition-colors"
          >
            Info
          </button>
          <button
            (click)="sendNotification('success')"
            class="px-4 py-2 rounded-button text-sm font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 transition-colors"
          >
            Success
          </button>
          <button
            (click)="sendNotification('warning')"
            class="px-4 py-2 rounded-button text-sm font-medium bg-accent-amber/15 text-accent-amber border border-accent-amber/20 hover:bg-accent-amber/25 transition-colors"
          >
            Warning
          </button>
          <button
            (click)="sendRandomNotification()"
            class="px-4 py-2 rounded-button bg-gradient-to-r from-accent-cyan to-accent-purple text-white font-medium text-sm transition-shadow hover:shadow-lg hover:shadow-accent-cyan/20"
          >
            Random
          </button>
        </div>

        <div class="relative h-72 rounded-lg bg-surface-0/50 border border-border/50 overflow-hidden">
          <!-- Decorative background pattern -->
          <div class="absolute inset-0 opacity-[0.03]">
            <div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0); background-size: 24px 24px;"></div>
          </div>

          <!-- App mockup lines -->
          <div class="absolute top-4 left-4 right-28 space-y-3 opacity-20">
            <div class="h-3 w-24 rounded-full bg-text-muted"></div>
            <div class="h-2 w-full rounded-full bg-text-muted/50"></div>
            <div class="h-2 w-4/5 rounded-full bg-text-muted/50"></div>
            <div class="h-8 w-32 rounded-lg bg-text-muted/30 mt-4"></div>
            <div class="h-2 w-full rounded-full bg-text-muted/50 mt-4"></div>
            <div class="h-2 w-3/4 rounded-full bg-text-muted/50"></div>
          </div>

          <!-- Toast container — stacks from bottom-right -->
          <div class="absolute bottom-3 right-3 flex flex-col-reverse gap-2 w-72 z-10">
            @for (toast of toasts(); track toast.id) {
              <ng-container *ngmPresence="true">
                <div
                  ngmMotion
                  [initial]="{ opacity: 0, x: 80, scale: 0.9 }"
                  [animate]="{ opacity: 1, x: 0, scale: 1 }"
                  [exit]="{ opacity: 0, x: 80, scale: 0.9 }"
                  [transition]="{ type: 'spring', stiffness: 400, damping: 30 }"
                  class="relative rounded-xl border p-3 backdrop-blur-md shadow-2xl overflow-hidden"
                  [class]="toastStyles[toast.type]"
                >
                  <div class="flex items-start gap-3">
                    <span class="text-base mt-0.5 shrink-0">{{ toastIcons[toast.type] }}</span>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-semibold" [class]="toastTitleColors[toast.type]">
                        {{ toast.title }}
                      </p>
                      <p class="text-xs text-text-secondary mt-0.5 leading-relaxed">
                        {{ toast.message }}
                      </p>
                    </div>
                    <button
                      (click)="dismissToast(toast.id)"
                      class="text-text-muted hover:text-text-primary text-xs mt-0.5 shrink-0 transition-colors"
                      aria-label="Dismiss"
                    >
                      &times;
                    </button>
                  </div>

                  <!-- Progress bar -->
                  <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-surface-0/30">
                    <div
                      class="h-full transition-none"
                      [class]="toastProgressColors[toast.type]"
                      [style.width.%]="getToastProgress(toast)"
                    ></div>
                  </div>
                </div>
              </ng-container>
            }
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class PresencePage implements OnDestroy {
  // ── Shared ──
  readonly springTransition: Transition = SPRING_TRANSITION;

  // ── Demo 1: Simple Toggle ──
  readonly simpleVisible = signal(true);

  toggleVisible(): void {
    this.simpleVisible.update((v) => !v);
  }

  // ── Demo 2: Slide Directions ──
  readonly directions: SlideDirection[] = ['left', 'right', 'up', 'down'];
  readonly directionLabels: Record<SlideDirection, string> = {
    left: 'Left',
    right: 'Right',
    up: 'Up',
    down: 'Down',
  };
  readonly directionEmojis: Record<SlideDirection, string> = {
    left: '\u2190',
    right: '\u2192',
    up: '\u2191',
    down: '\u2193',
  };

  readonly slideDirection = signal<SlideDirection>('left');
  readonly slideVisible = signal(true);

  readonly slideOffset = computed<Record<string, number>>(() => {
    const offsets: Record<SlideDirection, Record<string, number>> = {
      left: { x: -120, y: 0 },
      right: { x: 120, y: 0 },
      up: { x: 0, y: -120 },
      down: { x: 0, y: 120 },
    };
    return offsets[this.slideDirection()];
  });

  readonly slideInitial = computed<TargetAndTransition>(() => {
    const off = this.slideOffset();
    return { opacity: 0, x: off['x'], y: off['y'] };
  });

  readonly slideExit = computed<TargetAndTransition>(() => {
    const off = this.slideOffset();
    return { opacity: 0, x: off['x'], y: off['y'] };
  });

  setDirection(dir: SlideDirection): void {
    if (this.slideVisible()) {
      this.slideVisible.set(false);
      setTimeout(() => {
        this.slideDirection.set(dir);
        this.slideVisible.set(true);
      }, 350);
    } else {
      this.slideDirection.set(dir);
      this.slideVisible.set(true);
    }
  }

  toggleSlide(): void {
    this.slideVisible.update((v) => !v);
  }

  // ── Demo 3: List Add/Remove ──
  private nextItemId = 0;

  readonly listItems = signal<ListItem[]>([
    this.createItem(),
    this.createItem(),
    this.createItem(),
  ]);

  addItem(): void {
    this.listItems.update((items) => [...items, this.createItem()]);
  }

  removeItem(id: number): void {
    // Mark for removal — triggers *ngmPresence to flip to false, playing exit animation
    this.listItems.update((items) =>
      items.map((item) => (item.id === id ? { ...item, removing: true } : item)),
    );
    // Remove from array after exit animation completes (~400ms spring)
    setTimeout(() => {
      this.listItems.update((items) => items.filter((item) => item.id !== id));
    }, 500);
  }

  clearItems(): void {
    this.listItems.set([]);
  }

  private createItem(): ListItem {
    const id = this.nextItemId++;
    const idx = id % EMOJIS.length;
    return {
      id,
      emoji: EMOJIS[idx],
      label: LABELS[idx],
      color: ITEM_COLORS[id % ITEM_COLORS.length],
    };
  }

  // ── Demo 4: Notification Stack ──
  private nextToastId = 0;
  private toastTimers = new Map<number, ReturnType<typeof setTimeout>>();
  private progressFrame: ReturnType<typeof requestAnimationFrame> | null = null;
  private now = signal(Date.now());

  readonly toasts = signal<Toast[]>([]);

  readonly toastStyles: Record<NotificationType, string> = {
    info: 'bg-surface-2/90 border-accent-cyan/20',
    success: 'bg-surface-2/90 border-emerald-500/20',
    warning: 'bg-surface-2/90 border-accent-amber/20',
  };

  readonly toastIcons: Record<NotificationType, string> = {
    info: '\u2139\uFE0F',
    success: '\u2705',
    warning: '\u26A0\uFE0F',
  };

  readonly toastTitleColors: Record<NotificationType, string> = {
    info: 'text-accent-cyan',
    success: 'text-emerald-400',
    warning: 'text-accent-amber',
  };

  readonly toastProgressColors: Record<NotificationType, string> = {
    info: 'bg-accent-cyan',
    success: 'bg-emerald-400',
    warning: 'bg-accent-amber',
  };

  constructor() {
    this.tickProgress();
  }

  ngOnDestroy(): void {
    for (const timer of this.toastTimers.values()) {
      clearTimeout(timer);
    }
    this.toastTimers.clear();
    if (this.progressFrame !== null) {
      cancelAnimationFrame(this.progressFrame);
    }
  }

  sendNotification(type: NotificationType): void {
    const config = TOAST_CONFIGS[type];
    const message = config.messages[Math.floor(Math.random() * config.messages.length)];
    const toast: Toast = {
      id: this.nextToastId++,
      type,
      title: config.title,
      message,
      createdAt: Date.now(),
    };

    this.toasts.update((list) => [...list, toast]);

    const timer = setTimeout(() => {
      this.dismissToast(toast.id);
    }, 3000);
    this.toastTimers.set(toast.id, timer);
  }

  sendRandomNotification(): void {
    const types: NotificationType[] = ['info', 'success', 'warning'];
    this.sendNotification(types[Math.floor(Math.random() * types.length)]);
  }

  dismissToast(id: number): void {
    const timer = this.toastTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.toastTimers.delete(id);
    }
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  getToastProgress(toast: Toast): number {
    const elapsed = this.now() - toast.createdAt;
    const duration = 3000;
    return Math.max(0, 100 - (elapsed / duration) * 100);
  }

  private tickProgress(): void {
    this.now.set(Date.now());
    this.progressFrame = requestAnimationFrame(() => this.tickProgress());
  }
}
