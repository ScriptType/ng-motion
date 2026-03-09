import { Component, computed, signal } from '@angular/core';
import { NgmMotionDirective, NgmLayoutGroupDirective } from '@scripttype/ng-motion';
import type { Transition, Variants } from '@scripttype/ng-motion';

interface ShuffleItem {
  id: number;
  gradient: string;
  label: string;
}

interface AccordionItem {
  id: number;
  title: string;
  content: string;
  icon: string;
  accent: string;
}

interface TabDef {
  id: string;
  label: string;
  content: string;
  icon: string;
}

interface TransferItem {
  id: string;
  label: string;
  color: string;
}

interface ViewItem {
  id: string;
  label: string;
  icon: string;
  accent: string;
}

@Component({
  selector: 'app-layout-page',
  imports: [NgmMotionDirective, NgmLayoutGroupDirective],
  template: `
    <!-- Page header -->
    <section class="mb-16">
      <div
        ngmMotion
        [initial]="{ opacity: 0, y: 24 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ duration: 0.6, ease: 'easeOut' }"
      >
        <p class="mb-3 font-mono text-xs tracking-widest text-accent-purple uppercase">
          Layout Animations
        </p>
        <h1
          class="font-display text-4xl font-extrabold bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent mb-4"
        >
          Layout
        </h1>
        <p class="max-w-xl text-text-secondary leading-relaxed">
          Smooth FLIP-based layout transitions. Elements animate automatically when their
          position or size changes in the DOM.
        </p>
      </div>
    </section>

    <!-- ─── 1. Shuffle Grid ───────────────────────────────────── -->
    <section class="mb-16">
      <div class="mb-5 flex items-end justify-between">
        <div>
          <h2 class="font-display text-lg font-semibold text-text-primary">Shuffle Grid</h2>
          <p class="mt-1 text-sm text-text-secondary">
            Each box has <code class="font-mono text-accent-cyan text-xs">[layout]="true"</code>.
            Reorder with spring physics.
          </p>
        </div>
        <button
          (click)="shuffleGrid()"
          class="px-4 py-2 rounded-button bg-gradient-to-r from-accent-cyan to-accent-purple text-white font-medium text-sm hover:shadow-lg hover:shadow-accent-cyan/20 transition-shadow"
        >
          Shuffle
        </button>
      </div>

      <div class="bg-surface-1 rounded-demo p-6 border border-border">
        <div class="grid grid-cols-4 gap-3">
          @for (item of shuffleItems(); track item.id) {
            <div
              ngmMotion
              [layout]="true"
              [transition]="springTransition"
              class="relative flex h-20 items-center justify-center rounded-xl text-sm font-bold text-white/90 select-none overflow-hidden"
              [class]="item.gradient"
            >
              <span class="relative z-10">{{ item.label }}</span>
              <div
                class="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity"
              ></div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ─── 2. Expand / Collapse Accordion ────────────────────── -->
    <section class="mb-16">
      <div class="mb-5">
        <h2 class="font-display text-lg font-semibold text-text-primary">Expand / Collapse</h2>
        <p class="mt-1 text-sm text-text-secondary">
          Accordion with
          <code class="font-mono text-accent-amber text-xs">[layoutDependency]</code>.
          Other items reposition smoothly.
        </p>
      </div>

      <div class="bg-surface-1 rounded-demo p-6 border border-border">
        <div class="flex flex-col gap-2">
          @for (item of accordionItems; track item.id) {
            <div
              ngmMotion
              [layout]="true"
              [layoutDependency]="expandedItem()"
              [transition]="springTransition"
              (click)="toggleAccordion(item.id)"
              class="cursor-pointer rounded-xl border bg-surface-2/60 overflow-hidden transition-colors"
              [class]="expandedItem() === item.id ? 'border-' + item.accent : 'border-border hover:border-border-hover'"
            >
              <div
                ngmMotion
                [layout]="'position'"
                [layoutDependency]="expandedItem()"
                [transition]="springTransition"
                class="flex items-center justify-between px-5 py-4"
              >
                <div class="flex items-center gap-3">
                  <span class="text-xl">{{ item.icon }}</span>
                  <span class="font-display font-semibold text-text-primary text-sm">
                    {{ item.title }}
                  </span>
                </div>
                <span
                  class="font-mono text-xs transition-colors"
                  [class]="expandedItem() === item.id ? 'text-accent-cyan' : 'text-text-muted'"
                >
                  {{ expandedItem() === item.id ? '&#x2212;' : '+' }}
                </span>
              </div>

              @if (expandedItem() === item.id) {
                <div
                  ngmMotion
                  [layout]="true"
                  [layoutDependency]="expandedItem()"
                  [transition]="springTransition"
                  class="px-5 pb-4"
                >
                  <div class="border-t border-border pt-4">
                    <p class="text-sm leading-relaxed text-text-secondary">
                      {{ item.content }}
                    </p>
                    <div class="mt-3 flex gap-2">
                      <span
                        class="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium bg-surface-3 text-text-muted"
                      >
                        layout
                      </span>
                      <span
                        class="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium bg-surface-3 text-text-muted"
                      >
                        spring
                      </span>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ─── 3. Shared Layout Tabs ─────────────────────────────── -->
    <section class="mb-16">
      <div class="mb-5">
        <h2 class="font-display text-lg font-semibold text-text-primary">Shared Layout Tabs</h2>
        <p class="mt-1 text-sm text-text-secondary">
          The active indicator uses
          <code class="font-mono text-accent-purple text-xs">[layoutId]</code>
          to animate between tabs.
        </p>
      </div>

      <div class="bg-surface-1 rounded-demo p-6 border border-border">
        <!-- Tab bar -->
        <div class="relative flex gap-1 rounded-xl bg-surface-0/50 p-1.5">
          @for (tab of tabs; track tab.id) {
            <button
              (click)="activeTab.set(tab.id)"
              class="relative z-10 flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
              [class]="activeTab() === tab.id ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'"
            >
              @if (activeTab() === tab.id) {
                <div
                  ngmMotion
                  [layoutId]="'tab-indicator'"
                  [layoutDependency]="activeTab()"
                  [transition]="tabSpring"
                  class="absolute inset-0 rounded-lg bg-surface-2 border border-border-hover"
                ></div>
              }
              <span class="relative z-10">{{ tab.icon }}</span>
              <span class="relative z-10">{{ tab.label }}</span>
            </button>
          }
        </div>

        <!-- Tab content -->
        <div class="mt-6 rounded-xl bg-surface-2/40 border border-border p-5 min-h-[120px]">
          @for (tab of tabs; track tab.id) {
            @if (activeTab() === tab.id) {
              <div
                ngmMotion
                [initial]="{ opacity: 0, y: 8 }"
                [animate]="{ opacity: 1, y: 0 }"
                [transition]="{ duration: 0.3, ease: 'easeOut' }"
              >
                <div class="flex items-center gap-3 mb-3">
                  <span class="text-2xl">{{ tab.icon }}</span>
                  <h3 class="font-display text-base font-semibold text-text-primary">
                    {{ tab.label }}
                  </h3>
                </div>
                <p class="text-sm leading-relaxed text-text-secondary">{{ tab.content }}</p>
              </div>
            }
          }
        </div>
      </div>
    </section>

    <!-- ─── 4. Cross-Container Transfer ───────────────────────── -->
    <section class="mb-16">
      <div class="mb-5">
        <h2 class="font-display text-lg font-semibold text-text-primary">
          Cross-Container Transfer
        </h2>
        <p class="mt-1 text-sm text-text-secondary">
          Items move between lists inside
          <code class="font-mono text-accent-cyan text-xs">ngmLayoutGroup</code>.
          Click an item to transfer it.
        </p>
      </div>

      <div
        class="bg-surface-1 rounded-demo p-6 border border-border"
        ngmLayoutGroup="transfer"
      >
        <div class="grid grid-cols-2 gap-6">
          <!-- List A -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-display text-sm font-semibold text-text-primary">
                Pool A
              </h3>
              <span class="font-mono text-xs text-text-muted tabular-nums">
                {{ listA().length }} items
              </span>
            </div>
            <div
              class="flex flex-col gap-2 rounded-xl bg-surface-0/40 border border-border p-3 min-h-[200px]"
            >
              @for (item of listA(); track item.id) {
                <div
                  ngmMotion
                  [layout]="true"
                  [layoutId]="'transfer-' + item.id"
                  [transition]="springTransition"
                  (click)="transferItem(item.id, 'a-to-b')"
                  class="flex items-center gap-3 rounded-lg px-4 py-3 cursor-pointer border border-transparent transition-colors hover:border-border-hover"
                  [class]="item.color"
                >
                  <span
                    class="flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-xs font-bold text-white/80"
                  >
                    {{ item.label.charAt(0) }}
                  </span>
                  <span class="text-sm font-medium text-white/90">{{ item.label }}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    class="ml-auto h-3.5 w-3.5 text-white/40"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </div>
              }
              @if (listA().length === 0) {
                <div
                  class="flex flex-1 items-center justify-center py-8 text-xs text-text-muted"
                >
                  Empty -- click items in Pool B
                </div>
              }
            </div>
          </div>

          <!-- List B -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-display text-sm font-semibold text-text-primary">
                Pool B
              </h3>
              <span class="font-mono text-xs text-text-muted tabular-nums">
                {{ listB().length }} items
              </span>
            </div>
            <div
              class="flex flex-col gap-2 rounded-xl bg-surface-0/40 border border-border p-3 min-h-[200px]"
            >
              @for (item of listB(); track item.id) {
                <div
                  ngmMotion
                  [layout]="true"
                  [layoutId]="'transfer-' + item.id"
                  [transition]="springTransition"
                  (click)="transferItem(item.id, 'b-to-a')"
                  class="flex items-center gap-3 rounded-lg px-4 py-3 cursor-pointer border border-transparent transition-colors hover:border-border-hover"
                  [class]="item.color"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    class="h-3.5 w-3.5 text-white/40"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                    />
                  </svg>
                  <span class="text-sm font-medium text-white/90">{{ item.label }}</span>
                  <span
                    class="ml-auto flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-xs font-bold text-white/80"
                  >
                    {{ item.label.charAt(0) }}
                  </span>
                </div>
              }
              @if (listB().length === 0) {
                <div
                  class="flex flex-1 items-center justify-center py-8 text-xs text-text-muted"
                >
                  Empty -- click items in Pool A
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── 5. Grid <-> List Toggle ───────────────────────────── -->
    <section class="mb-16">
      <div class="mb-5 flex items-end justify-between">
        <div>
          <h2 class="font-display text-lg font-semibold text-text-primary">Grid / List Toggle</h2>
          <p class="mt-1 text-sm text-text-secondary">
            Items animate between grid and list positions using
            <code class="font-mono text-accent-amber text-xs">[layoutId]</code>.
          </p>
        </div>
        <button
          (click)="isGridView.set(!isGridView())"
          class="flex items-center gap-2 px-4 py-2 rounded-button bg-surface-2 text-text-secondary border border-border text-sm font-medium hover:border-border-hover transition-colors"
        >
          @if (isGridView()) {
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
            </svg>
            List View
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
            Grid View
          }
        </button>
      </div>

      <div class="bg-surface-1 rounded-demo p-6 border border-border">
        @if (isGridView()) {
          <div class="grid grid-cols-3 gap-3">
            @for (item of viewItems; track item.id) {
              <div
                ngmMotion
                [layout]="true"
                [layoutId]="'view-' + item.id"
                [transition]="springTransition"
                class="flex flex-col items-center justify-center gap-3 rounded-xl border border-border p-6"
                [class]="item.accent"
              >
                <span class="text-3xl">{{ item.icon }}</span>
                <span class="text-sm font-semibold text-text-primary">{{ item.label }}</span>
              </div>
            }
          </div>
        } @else {
          <div class="flex flex-col gap-2">
            @for (item of viewItems; track item.id) {
              <div
                ngmMotion
                [layout]="true"
                [layoutId]="'view-' + item.id"
                [transition]="springTransition"
                class="flex items-center gap-4 rounded-xl border border-border px-5 py-3"
                [class]="item.accent"
              >
                <span class="text-xl">{{ item.icon }}</span>
                <span class="text-sm font-semibold text-text-primary">{{ item.label }}</span>
                <div class="ml-auto flex items-center gap-2">
                  <div class="h-1.5 w-24 rounded-full bg-white/10 overflow-hidden">
                    <div class="h-full w-3/4 rounded-full bg-white/20"></div>
                  </div>
                  <span class="font-mono text-xs text-text-muted">75%</span>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class LayoutPage {
  // ── Spring transition used across demos ──
  readonly springTransition: Transition = {
    type: 'spring',
    stiffness: 350,
    damping: 30,
  };

  readonly tabSpring: Transition = {
    type: 'spring',
    stiffness: 400,
    damping: 28,
  };

  // ── 1. Shuffle Grid ──
  readonly shuffleItems = signal<ShuffleItem[]>(this.createShuffleItems());

  private createShuffleItems(): ShuffleItem[] {
    const gradients = [
      'bg-gradient-to-br from-cyan-500 to-blue-600',
      'bg-gradient-to-br from-violet-500 to-purple-700',
      'bg-gradient-to-br from-amber-400 to-orange-600',
      'bg-gradient-to-br from-emerald-400 to-teal-600',
      'bg-gradient-to-br from-rose-400 to-pink-600',
      'bg-gradient-to-br from-sky-400 to-indigo-600',
      'bg-gradient-to-br from-lime-400 to-green-600',
      'bg-gradient-to-br from-fuchsia-400 to-pink-700',
      'bg-gradient-to-br from-cyan-400 to-emerald-500',
      'bg-gradient-to-br from-orange-400 to-red-600',
      'bg-gradient-to-br from-indigo-400 to-violet-600',
      'bg-gradient-to-br from-yellow-400 to-amber-600',
    ];
    return gradients.map((g, i) => ({
      id: i + 1,
      gradient: g,
      label: String(i + 1).padStart(2, '0'),
    }));
  }

  shuffleGrid(): void {
    const arr = [...this.shuffleItems()];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    this.shuffleItems.set(arr);
  }

  // ── 2. Accordion ──
  readonly expandedItem = signal<number | null>(null);

  readonly accordionItems: AccordionItem[] = [
    {
      id: 1,
      title: 'Layout Animation Basics',
      icon: '\u25A1',
      accent: 'accent-cyan',
      content:
        'When an element\'s position changes in the DOM, layout animation automatically calculates the delta and animates the transition using FLIP. Just add [layout]="true" to opt in.',
    },
    {
      id: 2,
      title: 'Shared Layout with layoutId',
      icon: '\u29BB',
      accent: 'accent-purple',
      content:
        'Assign the same layoutId to elements in different locations. When one unmounts and another mounts, they\'ll animate between positions as if they\'re the same element.',
    },
    {
      id: 3,
      title: 'Cross-Container Groups',
      icon: '\u2B1A',
      accent: 'accent-amber',
      content:
        'Wrap containers in ngmLayoutGroup to enable items to animate between different DOM parents. The layout system handles re-parenting with smooth FLIP transitions.',
    },
    {
      id: 4,
      title: 'Layout Dependency Tracking',
      icon: '\u21C4',
      accent: 'accent-cyan',
      content:
        'Use layoutDependency to explicitly tell the layout system when to recalculate. This is especially useful for accordion-style UIs where content changes affect sibling positions.',
    },
  ];

  toggleAccordion(id: number): void {
    this.expandedItem.set(this.expandedItem() === id ? null : id);
  }

  // ── 3. Tabs ──
  readonly activeTab = signal('overview');

  readonly tabs: TabDef[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: '\u25CB',
      content:
        'Layout animations bring interfaces to life by smoothly transitioning elements between states. Instead of abrupt jumps, elements glide to their new positions with spring physics, creating a fluid and natural feel.',
    },
    {
      id: 'api',
      label: 'API',
      icon: '\u27E8\u27E9',
      content:
        'The layout API is declarative: add [layout]="true" to enable position tracking, [layoutId] for shared element transitions, and [layoutDependency] to trigger re-measurement when state changes.',
    },
    {
      id: 'perf',
      label: 'Performance',
      icon: '\u26A1',
      content:
        'Layout animations use the FLIP technique (First, Last, Invert, Play) to run all measurements synchronously, then animate using transforms and opacity for GPU-accelerated, jank-free 60fps motion.',
    },
    {
      id: 'tips',
      label: 'Tips',
      icon: '\u2731',
      content:
        'For best results, keep layout-animated elements as flat siblings. Use layoutDependency to avoid unnecessary recalculations. Combine with spring transitions for natural movement.',
    },
  ];

  // ── 4. Cross-Container Transfer ──
  readonly listA = signal<TransferItem[]>([
    { id: 'alpha', label: 'Alpha', color: 'bg-gradient-to-r from-cyan-600/80 to-cyan-700/80' },
    { id: 'beta', label: 'Beta', color: 'bg-gradient-to-r from-violet-600/80 to-violet-700/80' },
    { id: 'gamma', label: 'Gamma', color: 'bg-gradient-to-r from-amber-600/80 to-amber-700/80' },
    { id: 'delta', label: 'Delta', color: 'bg-gradient-to-r from-emerald-600/80 to-emerald-700/80' },
  ]);

  readonly listB = signal<TransferItem[]>([
    { id: 'epsilon', label: 'Epsilon', color: 'bg-gradient-to-r from-rose-600/80 to-rose-700/80' },
    { id: 'zeta', label: 'Zeta', color: 'bg-gradient-to-r from-sky-600/80 to-sky-700/80' },
  ]);

  transferItem(id: string, direction: 'a-to-b' | 'b-to-a'): void {
    if (direction === 'a-to-b') {
      const a = this.listA();
      const item = a.find((i) => i.id === id);
      if (!item) return;
      this.listA.set(a.filter((i) => i.id !== id));
      this.listB.set([...this.listB(), item]);
    } else {
      const b = this.listB();
      const item = b.find((i) => i.id === id);
      if (!item) return;
      this.listB.set(b.filter((i) => i.id !== id));
      this.listA.set([...this.listA(), item]);
    }
  }

  // ── 5. Grid / List Toggle ──
  readonly isGridView = signal(true);

  readonly viewItems: ViewItem[] = [
    { id: 'motion', label: 'Motion', icon: '\u2B50', accent: 'bg-surface-2/60' },
    { id: 'spring', label: 'Spring', icon: '\u223F', accent: 'bg-surface-2/60' },
    { id: 'layout', label: 'Layout', icon: '\u2B1A', accent: 'bg-surface-2/60' },
    { id: 'gesture', label: 'Gesture', icon: '\u270B', accent: 'bg-surface-2/60' },
    { id: 'scroll', label: 'Scroll', icon: '\u2193', accent: 'bg-surface-2/60' },
    { id: 'presence', label: 'Presence', icon: '\u2728', accent: 'bg-surface-2/60' },
  ];
}
