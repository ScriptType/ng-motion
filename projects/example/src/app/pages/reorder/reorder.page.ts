import { Component, signal } from '@angular/core';
import {
  NgmMotionDirective,
  NgmPresenceDirective,
  NgmReorderGroupDirective,
  NgmReorderItemDirective,
} from '@scripttype/ng-motion';
import type { Transition } from '@scripttype/ng-motion';

interface EmojiItem {
  id: string;
  emoji: string;
  label: string;
}

interface ColorCard {
  id: string;
  label: string;
  bg: string;
  glow: string;
}

interface RemovableItem {
  id: number;
  emoji: string;
  label: string;
  gradient: string;
}

const SPRING_SNAPPY: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
};

const INITIAL_FRUITS: EmojiItem[] = [
  { id: 'mango', emoji: '\uD83E\uDD6D', label: 'Mango' },
  { id: 'cherry', emoji: '\uD83C\uDF52', label: 'Cherry' },
  { id: 'kiwi', emoji: '\uD83E\uDD5D', label: 'Kiwi' },
  { id: 'peach', emoji: '\uD83C\uDF51', label: 'Peach' },
  { id: 'grape', emoji: '\uD83C\uDF47', label: 'Grape' },
  { id: 'melon', emoji: '\uD83C\uDF48', label: 'Melon' },
];

const HORIZONTAL_CARDS: ColorCard[] = [
  { id: 'h1', label: 'A', bg: 'from-accent-cyan/30 to-accent-cyan/10', glow: 'shadow-accent-cyan/15' },
  { id: 'h2', label: 'B', bg: 'from-accent-purple/30 to-accent-purple/10', glow: 'shadow-accent-purple/15' },
  { id: 'h3', label: 'C', bg: 'from-accent-amber/30 to-accent-amber/10', glow: 'shadow-accent-amber/15' },
  { id: 'h4', label: 'D', bg: 'from-accent-cyan/25 to-accent-purple/15', glow: 'shadow-accent-cyan/10' },
  { id: 'h5', label: 'E', bg: 'from-accent-purple/25 to-accent-amber/15', glow: 'shadow-accent-purple/10' },
];

const REMOVABLE_POOL: Omit<RemovableItem, 'id'>[] = [
  { emoji: '\uD83D\uDE80', label: 'Launch Sequence', gradient: 'from-accent-cyan/20 to-accent-cyan/5' },
  { emoji: '\uD83D\uDD2E', label: 'Crystal Matrix', gradient: 'from-accent-purple/20 to-accent-purple/5' },
  { emoji: '\u26A1', label: 'Volt Surge', gradient: 'from-accent-amber/20 to-accent-amber/5' },
  { emoji: '\uD83C\uDF0A', label: 'Wave Pulse', gradient: 'from-accent-cyan/15 to-accent-purple/10' },
  { emoji: '\uD83C\uDF1F', label: 'Nova Flare', gradient: 'from-accent-amber/15 to-accent-cyan/10' },
  { emoji: '\uD83E\uDDCA', label: 'Frost Core', gradient: 'from-accent-purple/15 to-accent-amber/10' },
  { emoji: '\uD83C\uDFAF', label: 'Lock Target', gradient: 'from-accent-cyan/20 to-accent-amber/5' },
  { emoji: '\uD83D\uDC8E', label: 'Gem Shard', gradient: 'from-accent-purple/20 to-accent-cyan/5' },
];

@Component({
  selector: 'app-reorder-page',
  imports: [
    NgmMotionDirective,
    NgmPresenceDirective,
    NgmReorderGroupDirective,
    NgmReorderItemDirective,
  ],
  template: `
    <!-- Page header -->
    <div
      ngmMotion
      [initial]="{ opacity: 0, y: 20 }"
      [animate]="{ opacity: 1, y: 0 }"
      [transition]="{ duration: 0.5, ease: 'easeOut' }"
      class="mb-12"
    >
      <p class="mb-3 font-mono text-xs tracking-widest text-accent-cyan uppercase">
        Drag-to-Reorder
      </p>
      <h1
        class="font-display text-4xl font-extrabold bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent mb-3"
      >
        Reorder
      </h1>
      <p class="text-text-secondary max-w-xl leading-relaxed">
        Drag items to rearrange them. Powered by
        <code
          class="font-mono text-xs text-accent-cyan bg-accent-cyan/10 px-1.5 py-0.5 rounded"
        >ngmReorderGroup</code>
        with spring-based layout animations for buttery repositioning.
      </p>
    </div>

    <!-- ─── Demo 1: Vertical Reorder ─── -->
    <section
      ngmMotion
      [initial]="{ opacity: 0, y: 20 }"
      [animate]="{ opacity: 1, y: 0 }"
      [transition]="{ delay: 0.15, duration: 0.5 }"
      class="mb-10"
    >
      <h2 class="font-display text-lg font-semibold text-text-primary mb-1">Vertical Reorder</h2>
      <p class="text-sm text-text-secondary mb-5">
        Drag items up or down to reorder. Each card smoothly animates to its new position.
      </p>

      <div class="bg-surface-1 rounded-demo p-6 border border-border">
        <div class="flex items-center gap-3 mb-6">
          <button
            (click)="shuffleVertical()"
            class="px-4 py-2 rounded-button bg-gradient-to-r from-accent-cyan to-accent-purple text-white font-medium text-sm transition-shadow hover:shadow-lg hover:shadow-accent-cyan/20"
          >
            Shuffle
          </button>
          <span class="font-mono text-xs text-text-muted ml-auto">
            {{ verticalItems().length }} items
          </span>
        </div>

        <div
          [ngmReorderGroup]="verticalItems()"
          [axis]="'y'"
          (reorder)="verticalItems.set($event)"
          class="space-y-2"
        >
          @for (item of verticalItems(); track item.id) {
            <div
              [ngmReorderItem]="item"
              ngmMotion
              [layout]="'position'"
              [drag]="'y'"
              [dragSnapToOrigin]="true"
              [transition]="springConfig"
              [whileHover]="{ scale: 1.01 }"
              [whileTap]="{ boxShadow: '0 10px 34px rgba(6, 182, 212, 0.18)' }"
              class="flex items-center gap-4 px-5 py-3.5 rounded-xl bg-surface-2/80 border border-border/60
                     cursor-grab active:cursor-grabbing select-none
                     hover:border-border-hover transition-colors"
            >
              <span class="text-2xl w-9 text-center shrink-0">{{ item.emoji }}</span>
              <span class="font-display text-sm font-semibold text-text-primary">{{ item.label }}</span>
              <div class="ml-auto flex items-center gap-2">
                <span class="font-mono text-[10px] text-text-muted/60 uppercase tracking-wider">{{ item.id }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-text-muted/40">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                </svg>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ─── Demo 2: Horizontal Reorder ─── -->
    <section
      ngmMotion
      [initial]="{ opacity: 0, y: 20 }"
      [animate]="{ opacity: 1, y: 0 }"
      [transition]="{ delay: 0.25, duration: 0.5 }"
      class="mb-10"
    >
      <h2 class="font-display text-lg font-semibold text-text-primary mb-1">Horizontal Reorder</h2>
      <p class="text-sm text-text-secondary mb-5">
        Same concept along the horizontal axis. Drag cards left or right to rearrange.
      </p>

      <div class="bg-surface-1 rounded-demo p-6 border border-border">
        <div class="flex items-center gap-3 mb-6">
          <button
            (click)="shuffleHorizontal()"
            class="px-4 py-2 rounded-button bg-gradient-to-r from-accent-cyan to-accent-purple text-white font-medium text-sm transition-shadow hover:shadow-lg hover:shadow-accent-cyan/20"
          >
            Shuffle
          </button>
          <button
            (click)="reverseHorizontal()"
            class="px-4 py-2 rounded-button bg-surface-2 text-text-secondary border border-border hover:border-border-hover text-sm font-medium transition-colors"
          >
            Reverse
          </button>
          <span class="font-mono text-xs text-text-muted ml-auto">
            axis: x
          </span>
        </div>

        <div
          [ngmReorderGroup]="horizontalItems()"
          [axis]="'x'"
          (reorder)="horizontalItems.set($event)"
          class="flex gap-3 overflow-x-auto pb-2"
        >
          @for (card of horizontalItems(); track card.id) {
            <div
              [ngmReorderItem]="card"
              ngmMotion
              [layout]="true"
              [drag]="'x'"
              [dragSnapToOrigin]="true"
              [transition]="springConfig"
              [whileHover]="{ y: -4 }"
              [whileTap]="{ scale: 1.06 }"
              class="shrink-0 flex flex-col items-center justify-center w-28 h-32 rounded-xl
                     bg-gradient-to-br border border-border/40 cursor-grab active:cursor-grabbing select-none
                     shadow-lg transition-colors hover:border-border-hover"
              [class]="card.bg + ' ' + card.glow"
            >
              <span class="font-display text-3xl font-extrabold text-text-primary/80">{{ card.label }}</span>
              <span class="mt-2 font-mono text-[10px] text-text-muted/50 uppercase tracking-widest">{{ card.id }}</span>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ─── Demo 3: Reorder + Remove ─── -->
    <section
      ngmMotion
      [initial]="{ opacity: 0, y: 20 }"
      [animate]="{ opacity: 1, y: 0 }"
      [transition]="{ delay: 0.35, duration: 0.5 }"
      class="mb-10"
    >
      <h2 class="font-display text-lg font-semibold text-text-primary mb-1">Reorder + Remove</h2>
      <p class="text-sm text-text-secondary mb-5">
        Combine drag-to-reorder with animated removal. Items fade out via
        <code class="font-mono text-xs text-accent-amber bg-accent-amber/10 px-1.5 py-0.5 rounded">*ngmPresence</code>
        and remaining items smoothly reposition.
      </p>

      <div class="bg-surface-1 rounded-demo p-6 border border-border">
        <div class="flex items-center gap-3 mb-6">
          <button
            (click)="addRemovableItem()"
            class="px-4 py-2 rounded-button bg-gradient-to-r from-accent-cyan to-accent-purple text-white font-medium text-sm transition-shadow hover:shadow-lg hover:shadow-accent-cyan/20"
          >
            + Add Item
          </button>
          <button
            (click)="resetRemovableItems()"
            class="px-4 py-2 rounded-button bg-surface-2 text-text-secondary border border-border hover:border-border-hover text-sm font-medium transition-colors"
          >
            Reset
          </button>
          <span class="font-mono text-xs text-text-muted ml-auto">
            {{ removableItems().length }} items
          </span>
        </div>

        <div class="space-y-2 min-h-[200px]">
          @for (item of removableItems(); track item.id) {
            <ng-container *ngmPresence="true">
              <div
                ngmMotion
                [layout]="true"
                [initial]="{ opacity: 0, x: -24, scale: 0.96 }"
                [animate]="{ opacity: 1, x: 0, scale: 1 }"
                [exit]="{ opacity: 0, x: 40, scale: 0.92 }"
                [transition]="springConfig"
                class="flex items-center gap-4 px-5 py-3.5 rounded-xl bg-gradient-to-r border border-border/50 group"
                [class]="item.gradient"
              >
                <span class="text-2xl select-none w-9 text-center shrink-0">{{ item.emoji }}</span>
                <div class="flex-1 min-w-0">
                  <p class="font-display text-sm font-semibold text-text-primary">
                    {{ item.label }}
                  </p>
                  <p class="font-mono text-[10px] text-text-muted mt-0.5">id: {{ item.id }}</p>
                </div>
                <button
                  (click)="removeItem(item.id)"
                  class="h-7 w-7 rounded-lg bg-surface-0/50 text-text-muted hover:text-red-400
                         hover:bg-red-400/10 flex items-center justify-center text-sm transition-colors
                         opacity-0 group-hover:opacity-100"
                  aria-label="Remove item"
                >
                  &times;
                </button>
              </div>
            </ng-container>
          }

          @if (removableItems().length === 0) {
            <div class="flex flex-col items-center justify-center h-[200px] gap-2">
              <span class="text-2xl">&#x1F4ED;</span>
              <span class="text-text-muted text-sm font-mono">Empty -- add some items</span>
            </div>
          }
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
export class ReorderPage {
  readonly springConfig: Transition = SPRING_SNAPPY;

  // ── Demo 1: Vertical Reorder ──
  readonly verticalItems = signal<EmojiItem[]>([...INITIAL_FRUITS]);

  shuffleVertical(): void {
    this.verticalItems.update((items) => shuffleArray([...items]));
  }

  // ── Demo 2: Horizontal Reorder ──
  readonly horizontalItems = signal<ColorCard[]>([...HORIZONTAL_CARDS]);

  shuffleHorizontal(): void {
    this.horizontalItems.update((items) => shuffleArray([...items]));
  }

  reverseHorizontal(): void {
    this.horizontalItems.update((items) => [...items].reverse());
  }

  // ── Demo 3: Reorder + Remove ──
  private nextId = 0;

  readonly removableItems = signal<RemovableItem[]>(this.createInitialRemovable());

  addRemovableItem(): void {
    const pool = REMOVABLE_POOL[this.nextId % REMOVABLE_POOL.length];
    const item: RemovableItem = { id: this.nextId++, ...pool };
    this.removableItems.update((items) => [...items, item]);
  }

  removeItem(id: number): void {
    this.removableItems.update((items) => items.filter((i) => i.id !== id));
  }

  resetRemovableItems(): void {
    this.removableItems.set(this.createInitialRemovable());
  }

  private createInitialRemovable(): RemovableItem[] {
    return REMOVABLE_POOL.slice(0, 4).map((pool) => ({
      id: this.nextId++,
      ...pool,
    }));
  }
}

function shuffleArray<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
