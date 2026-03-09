import { Component, signal, effect, viewChild, DestroyRef, inject, ElementRef } from '@angular/core';
import { NgmMotionDirective, NgmPresenceDirective, NgmReorderGroupDirective, NgmReorderItemDirective, usePresenceList, useMotionValue, useSpring, useTransform, type MotionStyle } from '@scripttype/ng-motion';
import { RouterLink } from '@angular/router';
import { CodeBlockComponent } from '../../components/code-block.component';

@Component({
  selector: 'app-recipes',
  imports: [RouterLink, NgmMotionDirective, NgmPresenceDirective, NgmReorderGroupDirective, NgmReorderItemDirective, CodeBlockComponent],
  template: `
    <article class="max-w-3xl pb-16">
      <!-- Header -->
      <div
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
      >
        <h1 class="font-display font-bold text-4xl mb-4">Recipes</h1>
        <p class="text-lg text-secondary mb-12 leading-relaxed">
          Real-world patterns that combine multiple ng-motion features. Each recipe
          is a self-contained example you can copy and adapt.
        </p>
      </div>

      <!-- Recipe 1: Notification Stack -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.1 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Notification Stack</h2>
        <p class="text-secondary mb-6">
          A toast notification stack where items slide in from the right and can be
          dismissed individually. Combines
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >*ngmPresence</code
          >,
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >usePresenceList</code
          >, layout animation, and spring physics.
        </p>

        <div class="flex flex-wrap gap-2 mb-6">
          @for (tag of ['*ngmPresence', 'usePresenceList', 'layout', 'spring']; track tag) {
            <span class="px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-mono">{{ tag }}</span>
          }
        </div>

        <app-code-block [code]="notificationStackCode" lang="typescript" filename="notification-stack.component.ts" class="mb-6" />

        <div class="rounded-xl border border-border p-10 bg-surface/30 flex flex-col items-center gap-6">
          <div class="flex gap-3">
            <button
              ngmMotion
              [whileHover]="{ scale: 1.05 }"
              [whileTap]="{ scale: 0.95 }"
              [transition]="{ type: 'spring', stiffness: 400, damping: 17 }"
              (click)="addToast()"
              class="px-5 py-2 rounded-lg bg-accent/15 border border-accent/30 text-accent font-medium cursor-pointer select-none text-sm"
            >
              Add notification
            </button>
            <button
              ngmMotion
              [whileHover]="{ scale: 1.05 }"
              [whileTap]="{ scale: 0.95 }"
              [transition]="{ type: 'spring', stiffness: 400, damping: 17 }"
              (click)="clearToasts()"
              class="px-5 py-2 rounded-lg bg-accent-pink/15 border border-accent-pink/30 text-accent-pink font-medium cursor-pointer select-none text-sm"
            >
              Clear all
            </button>
          </div>
          <div class="relative w-full max-w-sm min-h-[200px]">
            @let visibleById = toastPresence.visibleById();
            @let gapAfter = toastPresence.gapAfter();
            @for (toast of toasts(); track toast.id) {
              <div
                *ngmPresence="visibleById[toast.id] ?? false"
                ngmMotion
                [initial]="{ opacity: 0, x: 80, height: 0, marginBottom: 0 }"
                [animate]="{ opacity: 1, x: 0, height: 72, marginBottom: gapAfter[toast.id] ? 8 : 0 }"
                [exit]="{ opacity: 0, x: 80, height: 0, marginBottom: 0 }"
                [transition]="{ type: 'spring', stiffness: 300, damping: 25 }"
                class="overflow-hidden"
              >
                <div class="h-[72px] px-4 py-3 rounded-xl border flex items-center gap-3"
                  [class]="toast.type === 'success' ? 'bg-green-500/5 border-green-500/20' : toast.type === 'warning' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-accent/5 border-accent/20'"
                >
                  <div class="flex-1">
                    <p class="text-sm font-medium">{{ toast.title }}</p>
                    <p class="text-xs text-secondary">{{ toast.message }}</p>
                  </div>
                  <button (click)="dismissToast(toast.id)" class="text-muted hover:text-accent-pink text-xs cursor-pointer">dismiss</button>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Recipe 2: Expandable Card Grid -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.3 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Expandable Card Grid</h2>
        <p class="text-secondary mb-6">
          A 2&times;2 grid of feature cards. Click any card to expand it into a detail
          view with a spring transition. Combines
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >whileHover</code
          >,
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >whileTap</code
          >, and conditional rendering with entry animations.
        </p>

        <div class="flex flex-wrap gap-2 mb-6">
          @for (tag of ['layout', 'whileHover', 'whileTap', 'spring']; track tag) {
            <span class="px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-mono">{{ tag }}</span>
          }
        </div>

        <app-code-block [code]="expandableCardCode" lang="typescript" filename="expandable-grid.component.ts" class="mb-6" />

        <div class="rounded-xl border border-border p-10 bg-surface/30">
          <div class="grid grid-cols-2 gap-3">
            @for (card of gridCards; track card.id) {
              @let isExpanded = card.id === expandedCard();
              @if (expandedCard() === null || isExpanded) {
                <div
                  ngmMotion
                  [layout]="true"
                  [whileHover]="!isExpanded ? { scale: 1.03, y: -2 } : {}"
                  [whileTap]="!isExpanded ? { scale: 0.97 } : {}"
                  [transition]="{ type: 'spring', stiffness: 300, damping: 24 }"
                  (click)="!isExpanded ? expandedCard.set(card.id) : null"
                  class="rounded-xl select-none border"
                  [class]="card.gradient"
                  [class.col-span-2]="isExpanded"
                  [class.p-8]="isExpanded"
                  [class.p-5]="!isExpanded"
                  [class.cursor-pointer]="!isExpanded"
                >
                  @if (isExpanded) {
                    <div class="text-4xl mb-4">{{ card.icon }}</div>
                    <h3 class="font-display font-semibold text-xl mb-2">{{ card.title }}</h3>
                    <p class="text-secondary text-sm mb-6">{{ card.detail }}</p>
                    <button
                      ngmMotion
                      [whileHover]="{ scale: 1.05 }"
                      [whileTap]="{ scale: 0.95 }"
                      [transition]="{ type: 'spring', stiffness: 400, damping: 17 }"
                      (click)="expandedCard.set(null); $event.stopPropagation()"
                      class="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-sm font-medium cursor-pointer select-none"
                    >
                      Back to grid
                    </button>
                  } @else {
                    <div class="text-2xl mb-2">{{ card.icon }}</div>
                    <h3 class="font-display font-semibold text-sm mb-1">{{ card.title }}</h3>
                    <p class="text-xs text-secondary">{{ card.subtitle }}</p>
                  }
                </div>
              }
            }
          </div>
        </div>
      </section>

      <!-- Recipe 3: Scroll-Reveal Landing Section -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.5 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Scroll-Reveal Landing Section</h2>
        <p class="text-secondary mb-6">
          A mini landing page inside a scrollable container. A hero with parallax
          background, numbered feature rows that slide in, and a stats strip
          &mdash; all revealed as you scroll. Uses
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >useMotionValue</code
          >
          with a manual scroll listener to track progress, piped through
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >useSpring</code
          >
          +
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >useTransform</code
          >
          for scroll-linked parallax, and
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >whileInView</code
          >
          for viewport-triggered reveals.
        </p>

        <div class="flex flex-wrap gap-2 mb-6">
          @for (tag of ['useMotionValue', 'useTransform', 'useSpring', 'whileInView', 'parallax']; track tag) {
            <span class="px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-mono">{{ tag }}</span>
          }
        </div>

        <app-code-block [code]="scrollRevealCode" lang="typescript" filename="scroll-reveal.component.ts" class="mb-6" />

        <div class="rounded-xl border border-border bg-surface/30 overflow-hidden">
          <div #scrollRevealContainer class="h-[500px] overflow-y-auto relative">
            <!-- Scroll progress bar -->
            <div class="sticky top-0 z-20 h-[3px] bg-border/30">
              <div
                ngmMotion
                [style]="progressBarStyle"
                class="h-full bg-gradient-to-r from-accent via-accent-purple to-accent-pink origin-left"
              ></div>
            </div>

            <!-- Scroll prompt -->
            <div class="flex items-center justify-center h-20">
              <p
                class="text-[11px] text-muted font-mono tracking-[0.2em] uppercase animate-pulse"
              >&darr; scroll to explore</p>
            </div>

            <div class="h-24"></div>

            <!-- Hero (parallax wrapper) -->
            <div ngmMotion [style]="heroParallaxStyle" class="px-10 py-8">
              <h3
                ngmMotion
                [whileInView]="{ opacity: 1, y: 0 }"
                [initial]="{ opacity: 0, y: 30 }"
                [viewport]="{ amount: 0.5 }"
                [transition]="{ type: 'spring', stiffness: 120, damping: 20 }"
                class="font-display font-bold text-4xl leading-[1.1] tracking-tight mb-5"
              >Build<br />Amazing UIs</h3>
              <!-- Accent line -->
              <div
                ngmMotion
                [whileInView]="{ scaleX: 1, opacity: 1 }"
                [initial]="{ scaleX: 0, opacity: 0 }"
                [viewport]="{ amount: 0.5 }"
                [transition]="{ type: 'spring', stiffness: 100, damping: 25, delay: 0.15 }"
                class="h-[2px] w-16 bg-accent origin-left mb-5"
              ></div>
              <p
                ngmMotion
                [whileInView]="{ opacity: 1, y: 0 }"
                [initial]="{ opacity: 0, y: 12 }"
                [viewport]="{ amount: 0.5 }"
                [transition]="{ duration: 0.4, delay: 0.25 }"
                class="text-sm text-muted max-w-[280px] leading-relaxed"
              >Spring-driven motion, scroll-linked effects, and viewport reveals &mdash; all running outside change detection.</p>
            </div>

            <div class="h-6"></div>

            <!-- Numbered feature rows -->
            <div class="px-10">
              @for (feature of scrollRevealFeatures; track feature.title; let i = $index) {
                <div
                  ngmMotion
                  [whileInView]="{ opacity: 1, x: 0 }"
                  [initial]="{ opacity: 0, x: -16 }"
                  [viewport]="{ amount: 0.4 }"
                  [transition]="{ type: 'spring', stiffness: 200, damping: 22, delay: i * 0.06 }"
                  class="flex gap-5 py-4 border-b border-border/40 last:border-b-0"
                >
                  <span class="font-mono text-accent/50 text-xs tabular-nums pt-1 select-none">0{{ i + 1 }}</span>
                  <div>
                    <h4 class="font-semibold text-sm mb-0.5">{{ feature.title }}</h4>
                    <p class="text-xs text-muted leading-relaxed">{{ feature.description }}</p>
                  </div>
                </div>
              }
            </div>

            <div class="h-10"></div>

            <!-- Stats strip -->
            <div class="px-10 pb-10">
              <div
                ngmMotion
                [whileInView]="{ opacity: 1, y: 0 }"
                [initial]="{ opacity: 0, y: 16 }"
                [viewport]="{ amount: 0.5 }"
                [transition]="{ type: 'spring', stiffness: 200, damping: 22 }"
                class="flex items-center border-t border-b border-border/40 divide-x divide-border/40"
              >
                @for (stat of scrollStats; track stat.label) {
                  <div class="flex-1 text-center py-5">
                    <div class="font-display font-bold text-xl text-accent leading-none">{{ stat.value }}</div>
                    <div class="text-[10px] text-muted font-mono uppercase tracking-[0.15em] mt-1.5">{{ stat.label }}</div>
                  </div>
                }
              </div>
            </div>

          </div>
        </div>

        <!-- How it works callout -->
        <div class="mt-6 rounded-xl border border-border bg-surface/30 p-6 space-y-3">
          <h4 class="font-display font-semibold text-sm">How it works</h4>
          <div class="flex items-start gap-3">
            <div class="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1.5"></div>
            <p class="text-secondary text-sm">
              A
              <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">useMotionValue(0)</code>
              tracks raw scroll progress via a passive scroll listener. That value is piped through
              <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">useSpring()</code>
              for the smooth progress bar and
              <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">useTransform()</code>
              for the parallax offset.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1.5"></div>
            <p class="text-secondary text-sm">
              <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">useTransform(scrollProgress, [0, 1], [0, 50])</code>
              maps scroll progress to a y&#8209;offset &mdash; background moves slower
              than content, creating parallax depth.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1.5"></div>
            <p class="text-secondary text-sm">
              Numbered rows slide in from the left with staggered delays.
              The accent line uses
              <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">scaleX: 0 &rarr; 1</code>
              with
              <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">origin-left</code>
              for a directional expand effect.
            </p>
          </div>
        </div>
      </section>

      <!-- Recipe 4: Interactive Spring Button -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.7 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Interactive Spring Button</h2>
        <p class="text-secondary mb-6">
          A call-to-action button with spring-driven scale and vertical offset on
          hover and tap. The spring physics create a satisfying, interruptible bounce
          that CSS transitions cannot replicate.
        </p>

        <div class="flex flex-wrap gap-2 mb-6">
          @for (tag of ['whileHover', 'whileTap', 'spring']; track tag) {
            <span class="px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-mono">{{ tag }}</span>
          }
        </div>

        <div class="rounded-xl border border-border p-10 bg-surface/30 flex flex-col items-center justify-center gap-6">
          <button
            ngmMotion
            [whileHover]="{ scale: 1.08, y: -4 }"
            [whileTap]="{ scale: 0.95, y: 0 }"
            [transition]="{ type: 'spring', stiffness: 400, damping: 15 }"
            class="relative px-8 py-4 rounded-2xl bg-gradient-to-r from-accent to-accent-purple text-white font-display font-bold text-lg cursor-pointer select-none shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30 transition-shadow"
          >
            Get Started
          </button>
          <p class="text-xs text-muted font-mono">Spring physics on hover and tap</p>
        </div>
      </section>

      <!-- Recipe 5: Animated Tabs with Shared Layout -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.8 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Animated Tabs with Shared Layout</h2>
        <p class="text-secondary mb-6">
          A tab bar where an active indicator slides smoothly between tabs using
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >layoutId</code
          >. The indicator morphs its position and size as you switch tabs &mdash;
          one of the most satisfying micro-interactions you can build.
        </p>

        <div class="flex flex-wrap gap-2 mb-6">
          @for (tag of ['layoutId', 'layoutDependency', 'layout', 'spring']; track tag) {
            <span class="px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-mono">{{ tag }}</span>
          }
        </div>

        <app-code-block [code]="animatedTabsCode" lang="typescript" filename="animated-tabs.component.ts" class="mb-6" />

        <div class="rounded-xl border border-border p-10 bg-surface/30 flex flex-col gap-6">
          <!-- Tab bar -->
          <div class="flex gap-1 p-1 rounded-xl bg-elevated/50 border border-border/50 relative">
            @for (tab of tabs; track tab.label; let i = $index) {
              <button
                (click)="activeTab.set(i)"
                class="relative flex-1 px-4 py-2.5 text-sm font-medium rounded-lg cursor-pointer select-none z-10 transition-colors"
                [class]="activeTab() === i ? 'text-primary' : 'text-muted hover:text-secondary'"
              >
                {{ tab.label }}
                @if (activeTab() === i) {
                  <div
                    ngmMotion
                    layoutId="activeTab"
                    [transition]="{ type: 'spring', stiffness: 350, damping: 30 }"
                    class="absolute inset-0 rounded-lg bg-surface border border-border/80 shadow-sm -z-10"
                  ></div>
                }
              </button>
            }
          </div>
          <!-- Tab content -->
          <div
            ngmMotion
            [animate]="{ opacity: 1, y: 0 }"
            [initial]="{ opacity: 0, y: 8 }"
            [transition]="{ duration: 0.3 }"
            [layoutDependency]="activeTab()"
            class="px-2 py-3"
          >
            <p class="text-secondary text-sm">{{ tabs[activeTab()].content }}</p>
          </div>
        </div>
      </section>

      <!-- Recipe 6: Modal Dialog with Backdrop -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.9 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Modal Dialog with Backdrop</h2>
        <p class="text-secondary mb-6">
          A modal overlay that fades in with a backdrop blur, the dialog scales up
          with spring physics, and everything animates out smoothly on close. Combines
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >*ngmPresence</code
          >,
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >exit</code
          >, and
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >spring</code
          >.
        </p>

        <div class="flex flex-wrap gap-2 mb-6">
          @for (tag of ['*ngmPresence', 'exit', 'spring', 'whileHover']; track tag) {
            <span class="px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-mono">{{ tag }}</span>
          }
        </div>

        <app-code-block [code]="modalDialogCode" lang="typescript" filename="modal-dialog.component.ts" class="mb-6" />

        <div class="rounded-xl border border-border p-10 bg-surface/30 flex flex-col items-center gap-6 relative">
          <button
            ngmMotion
            [whileHover]="{ scale: 1.05 }"
            [whileTap]="{ scale: 0.95 }"
            [transition]="{ type: 'spring', stiffness: 400, damping: 17 }"
            (click)="modalOpen.set(true)"
            class="px-5 py-2.5 rounded-lg bg-accent/15 border border-accent/30 text-accent font-medium cursor-pointer select-none text-sm"
          >
            Open dialog
          </button>

          <div class="text-xs text-muted font-mono">Click the button to open an animated modal</div>

          <!-- Modal container - constrained to the demo box for docs purposes -->
          <div
            *ngmPresence="modalOpen()"
            class="absolute inset-0 z-10 flex items-center justify-center"
          >
            <!-- Backdrop -->
            <div
              ngmMotion
              [initial]="{ opacity: 0 }"
              [animate]="{ opacity: 1 }"
              [exit]="{ opacity: 0 }"
              [transition]="{ duration: 0.2 }"
              (click)="modalOpen.set(false)"
              class="absolute inset-0 rounded-xl bg-black/50 backdrop-blur-[2px]"
            ></div>
            <!-- Dialog panel -->
            <div
              ngmMotion
              [initial]="{ opacity: 0, scale: 0.9, y: 20 }"
              [animate]="{ opacity: 1, scale: 1, y: 0 }"
              [exit]="{ opacity: 0, scale: 0.9, y: 20 }"
              [transition]="{ type: 'spring', stiffness: 300, damping: 25 }"
              class="relative w-[300px] rounded-2xl bg-surface border border-border p-6 shadow-2xl"
            >
              <h3 class="font-display font-semibold text-lg mb-2">Confirm Action</h3>
              <p class="text-sm text-secondary mb-6">This dialog uses spring physics for entry and a smooth scale-down on exit.</p>
              <div class="flex gap-3 justify-end">
                <button
                  ngmMotion [whileHover]="{ scale: 1.05 }" [whileTap]="{ scale: 0.95 }"
                  [transition]="{ type: 'spring', stiffness: 400, damping: 17 }"
                  (click)="modalOpen.set(false)"
                  class="px-4 py-2 rounded-lg border border-border text-sm font-medium cursor-pointer select-none text-secondary"
                >Cancel</button>
                <button
                  ngmMotion [whileHover]="{ scale: 1.05 }" [whileTap]="{ scale: 0.95 }"
                  [transition]="{ type: 'spring', stiffness: 400, damping: 17 }"
                  (click)="modalOpen.set(false)"
                  class="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium cursor-pointer select-none"
                >Confirm</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Recipe 7: Drag-to-Reorder List -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 1.0 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Drag-to-Reorder List</h2>
        <p class="text-secondary mb-6">
          A sortable list where items can be dragged to reorder. Uses
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >NgmReorderGroupDirective</code
          >,
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >NgmReorderItemDirective</code
          >, layout animation, and drag with
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >dragSnapToOrigin</code
          >.
        </p>

        <div class="flex flex-wrap gap-2 mb-6">
          @for (tag of ['drag', 'layout', 'reorder', 'spring']; track tag) {
            <span class="px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-mono">{{ tag }}</span>
          }
        </div>

        <app-code-block [code]="dragReorderCode" lang="typescript" filename="reorder-list.component.ts" class="mb-6" />

        <div class="rounded-xl border border-border p-10 bg-surface/30 flex flex-col items-center gap-6">
          <div
            [ngmReorderGroup]="reorderItems()"
            axis="y"
            (reorder)="reorderItems.set($event)"
            class="w-full max-w-sm space-y-2"
          >
            @for (item of reorderItems(); track item.id) {
              <div
                [ngmReorderItem]="item"
                ngmMotion
                [layout]="true"
                [drag]="'y'"
                [dragSnapToOrigin]="true"
                [whileHover]="{ scale: 1.02 }"
                [whileDrag]="{ scale: 1.04, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }"
                [transition]="{ type: 'spring', stiffness: 300, damping: 25 }"
                class="p-4 rounded-xl bg-gradient-to-r border flex items-center gap-3 cursor-grab active:cursor-grabbing select-none"
                [class]="item.color"
              >
                <svg class="w-4 h-4 text-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path d="M4 8h16M4 16h16" />
                </svg>
                <span class="text-sm font-medium">{{ item.label }}</span>
              </div>
            }
          </div>
          <p class="text-xs text-muted font-mono">Drag items to reorder</p>
        </div>
      </section>

      <!-- Next steps -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 1.1 }"
        class="pt-8 border-t border-border/50"
      >
        <h2 class="font-display font-semibold text-2xl mb-6">Next steps</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          @for (link of nextLinks; track link.path) {
            <a
              [routerLink]="link.path"
              ngmMotion
              [whileHover]="{ x: 4, scale: 1.01 }"
              [transition]="{ type: 'spring', stiffness: 300, damping: 20 }"
              class="group p-5 rounded-xl border border-border hover:border-accent/30 bg-surface/30 transition-colors"
            >
              <h4
                class="font-display font-semibold group-hover:text-accent transition-colors mb-1"
              >
                {{ link.title }}
              </h4>
              <p class="text-sm text-secondary">{{ link.description }}</p>
            </a>
          }
        </div>
      </section>

    </article>
  `,
})
export class RecipesPage {
  private readonly pendingTimers: ReturnType<typeof setTimeout>[] = [];

  // ── Recipe 1: Notification Stack ──
  private toastCounter = 0;
  readonly toasts = signal<{ id: number; title: string; message: string; type: 'success' | 'warning' | 'info' }[]>([]);
  private readonly removingToastIds = signal(new Set<number>());
  readonly toastPresence = usePresenceList(this.toasts, {
    getId: (t) => t.id,
    exitingIds: this.removingToastIds,
  });

  private readonly toastMessages = [
    { title: 'Build succeeded', message: 'Compiled in 1.2s', type: 'success' as const },
    { title: 'New message', message: 'You have 3 unread messages', type: 'info' as const },
    { title: 'Memory warning', message: 'Heap usage at 85%', type: 'warning' as const },
    { title: 'Deploy complete', message: 'v2.4.1 is live', type: 'success' as const },
    { title: 'Test passed', message: 'All 47 specs green', type: 'success' as const },
  ];

  addToast(): void {
    const msg = this.toastMessages[this.toastCounter % this.toastMessages.length];
    this.toasts.update((list) => [{ id: this.toastCounter++, ...msg }, ...list]);
  }

  dismissToast(id: number): void {
    if (this.removingToastIds().has(id)) return;
    this.removingToastIds.update((s) => { const n = new Set(s); n.add(id); return n; });
    this.pendingTimers.push(setTimeout(() => {
      this.toasts.update((list) => list.filter((t) => t.id !== id));
      this.removingToastIds.update((s) => { const n = new Set(s); n.delete(id); return n; });
    }, 500));
  }

  clearToasts(): void {
    const ids = this.toastPresence.visibleIds();
    ids.forEach((id) => this.dismissToast(id));
  }

  // ── Recipe 2: Expandable Card Grid ──
  readonly expandedCard = signal<number | null>(null);
  readonly gridCards = [
    { id: 0, icon: '\u26A1', title: 'Spring Physics', subtitle: 'Natural motion', detail: 'Springs respond to interruption naturally \u2014 if state changes mid-animation, velocity is preserved.', gradient: 'bg-gradient-to-br from-accent/10 to-accent-purple/10 border-accent/20' },
    { id: 1, icon: '\uD83C\uDFAF', title: 'Gestures', subtitle: 'Hover, tap, drag', detail: 'Built-in gesture recognition with physics-based response. No event listeners to manage.', gradient: 'bg-gradient-to-br from-accent-purple/10 to-accent-pink/10 border-accent-purple/20' },
    { id: 2, icon: '\uD83D\uDCD0', title: 'Layout', subtitle: 'Automatic FLIP', detail: 'Elements automatically animate between layout positions using performant FLIP transforms.', gradient: 'bg-gradient-to-br from-accent-pink/10 to-amber-500/10 border-accent-pink/20' },
    { id: 3, icon: '\uD83D\uDC4B', title: 'Presence', subtitle: 'Exit animations', detail: 'Animate elements before Angular removes them from the DOM. No hacks required.', gradient: 'bg-gradient-to-br from-amber-500/10 to-accent/10 border-amber-500/20' },
  ];

  // ── Recipe 3: Scroll-Reveal Landing Section ──
  readonly scrollRevealFeatures = [
    { title: 'Scroll Progress', description: 'useScroll() returns MotionValues for position and 0\u20131 progress. Pipe through useSpring() for smooth animation.' },
    { title: 'Parallax Depth', description: 'useTransform() maps scroll progress to offsets. Background moves slower than content, creating depth.' },
    { title: 'Viewport Reveals', description: 'whileInView fires animations on enter. Set once: true for one-shot, amount for threshold.' },
    { title: 'Zero Re-renders', description: 'MotionValues bypass change detection entirely \u2014 scroll callbacks never trigger Angular\'s zone.' },
  ];

  readonly scrollStats = [
    { value: '60fps', label: 'Animation' },
    { value: '0', label: 'Re-renders' },
    { value: '\u221E', label: 'Springs' },
  ];

  // Scroll-linked progress + parallax for recipe 3 demo
  private readonly scrollRevealRef = viewChild('scrollRevealContainer', { read: ElementRef });
  private readonly destroyRef = inject(DestroyRef);

  readonly scrollProgress = useMotionValue(0);
  readonly smoothProgress = useSpring(this.scrollProgress, { stiffness: 300, damping: 30 });
  readonly clampedProgress = useTransform(this.smoothProgress, (v) => Math.min(v, 1));
  readonly heroParallaxY = useTransform(this.scrollProgress, [0, 1], [0, 50]);

  readonly progressBarStyle: MotionStyle = { scaleX: this.clampedProgress };
  readonly heroParallaxStyle: MotionStyle = { y: this.heroParallaxY };

  constructor() {
    this.destroyRef.onDestroy(() => this.pendingTimers.forEach(clearTimeout));

    effect((onCleanup) => {
      const ref = this.scrollRevealRef();
      if (!ref) return;
      const el = ref.nativeElement as HTMLElement;
      const onScroll = (): void => {
        const max = el.scrollHeight - el.clientHeight;
        this.scrollProgress.set(max > 0 ? el.scrollTop / max : 0);
      };
      el.addEventListener('scroll', onScroll, { passive: true });
      onCleanup(() => el.removeEventListener('scroll', onScroll));
    });
  }

  // ── Recipe 5: Animated Tabs with Shared Layout ──
  readonly activeTab = signal(0);
  readonly tabs = [
    { label: 'Overview', content: 'Spring-based animations with natural, physics-driven motion.' },
    { label: 'Features', content: 'Gestures, layout animation, presence, scroll-linked effects, and more.' },
    { label: 'Performance', content: 'MotionValues bypass change detection entirely — 60fps guaranteed.' },
  ];

  // ── Recipe 6: Modal Dialog with Backdrop ──
  readonly modalOpen = signal(false);

  // ── Recipe 7: Drag-to-Reorder List ──
  readonly reorderItems = signal([
    { id: 1, label: 'Design system', color: 'from-accent/10 to-accent-purple/10 border-accent/20' },
    { id: 2, label: 'API integration', color: 'from-accent-purple/10 to-accent-pink/10 border-accent-purple/20' },
    { id: 3, label: 'Performance audit', color: 'from-accent-pink/10 to-amber-500/10 border-accent-pink/20' },
    { id: 4, label: 'Documentation', color: 'from-amber-500/10 to-accent/10 border-amber-500/20' },
  ]);

  // ── Next steps ──
  readonly nextLinks = [
    {
      path: '/docs/motion-directive',
      title: 'Motion Directive \u2192',
      description: 'Complete API reference for all directive inputs and outputs',
    },
    {
      path: '/docs/presence',
      title: 'Presence & Exit \u2192',
      description: 'Animate elements entering and leaving the DOM',
    },
    {
      path: '/docs/layout',
      title: 'Layout Animation \u2192',
      description: 'Automatic FLIP animations for layout changes',
    },
    {
      path: '/docs/api-reference',
      title: 'API Reference \u2192',
      description: 'Full reference for hooks, directives, and utilities',
    },
  ];

  // ── Code examples ──
  readonly notificationStackCode = [
    "import { Component, signal } from '@angular/core';",
    "import { NgmMotionDirective, NgmPresenceDirective, usePresenceList } from '@scripttype/ng-motion';",
    '',
    '@Component({',
    '  imports: [NgmMotionDirective, NgmPresenceDirective],',
    '  template: `',
    '    <button (click)="addToast()">Add notification</button>',
    '    <button (click)="clearToasts()">Clear all</button>',
    '',
    '    @let visibleById = toastPresence.visibleById();',
    '    @let gapAfter = toastPresence.gapAfter();',
    '    @for (toast of toasts(); track toast.id) {',
    '      <div',
    '        *ngmPresence="visibleById[toast.id] ?? false"',
    '        ngmMotion',
    '        [initial]="{ opacity: 0, x: 80, height: 0, marginBottom: 0 }"',
    '        [animate]="{ opacity: 1, x: 0, height: 72, marginBottom: gapAfter[toast.id] ? 8 : 0 }"',
    '        [exit]="{ opacity: 0, x: 80, height: 0, marginBottom: 0 }"',
    "        [transition]=\"{ type: 'spring', stiffness: 300, damping: 25 }\"",
    '        class="overflow-hidden"',
    '      >',
    '        <div class="toast-inner">',
    '          <p>{{ toast.title }}</p>',
    '          <button (click)="dismissToast(toast.id)">dismiss</button>',
    '        </div>',
    '      </div>',
    '    }',
    '  `,',
    '})',
    'export class NotificationStackComponent {',
    '  private toastCounter = 0;',
    "  readonly toasts = signal<{ id: number; title: string; type: 'success' | 'warning' | 'info' }[]>([]);",
    '  private readonly removingToastIds = signal(new Set<number>());',
    '  readonly toastPresence = usePresenceList(this.toasts, {',
    '    getId: (t) => t.id,',
    '    exitingIds: this.removingToastIds,',
    '  });',
    '',
    '  addToast(): void {',
    '    this.toasts.update((list) => [',
    "      { id: this.toastCounter++, title: 'New toast', type: 'info' },",
    '      ...list,',
    '    ]);',
    '  }',
    '',
    '  dismissToast(id: number): void {',
    '    if (this.removingToastIds().has(id)) return;',
    '    this.removingToastIds.update((s) => {',
    '      const n = new Set(s); n.add(id); return n;',
    '    });',
    '    setTimeout(() => {',
    '      this.toasts.update((list) => list.filter((t) => t.id !== id));',
    '      this.removingToastIds.update((s) => {',
    '        const n = new Set(s); n.delete(id); return n;',
    '      });',
    '    }, 500);',
    '  }',
    '',
    '  clearToasts(): void {',
    '    this.toastPresence.visibleIds().forEach((id) => this.dismissToast(id));',
    '  }',
    '}',
  ].join('\n');

  readonly expandableCardCode = [
    "import { Component, signal } from '@angular/core';",
    "import { NgmMotionDirective } from '@scripttype/ng-motion';",
    '',
    '@Component({',
    '  imports: [NgmMotionDirective],',
    '  template: `',
    '    <div class="grid grid-cols-2 gap-3">',
    '      @for (card of cards; track card.id) {',
    '        @let isExpanded = card.id === expandedCard();',
    '        @if (expandedCard() === null || isExpanded) {',
    '          <div',
    '            ngmMotion',
    '            layout',
    '            [whileHover]="!isExpanded ? { scale: 1.03, y: -2 } : {}"',
    '            [whileTap]="!isExpanded ? { scale: 0.97 } : {}"',
    "            [transition]=\"{ type: 'spring', stiffness: 300, damping: 24 }\"",
    '            (click)="!isExpanded ? expandedCard.set(card.id) : null"',
    '            [class.col-span-2]="isExpanded"',
    '          >',
    '            @if (isExpanded) {',
    '              <h3>{{ card.title }}</h3>',
    '              <p>{{ card.detail }}</p>',
    '              <button (click)="expandedCard.set(null)">Back</button>',
    '            } @else {',
    '              <h3>{{ card.title }}</h3>',
    '              <p>{{ card.subtitle }}</p>',
    '            }',
    '          </div>',
    '        }',
    '      }',
    '    </div>',
    '  `,',
    '})',
    'export class ExpandableGridComponent {',
    '  readonly expandedCard = signal<number | null>(null);',
    '  readonly cards = [',
    "    { id: 0, title: 'Spring Physics', subtitle: 'Natural motion',",
    "      detail: 'Springs respond to interruption naturally.' },",
    "    { id: 1, title: 'Gestures', subtitle: 'Hover, tap, drag',",
    "      detail: 'Built-in gesture recognition.' },",
    "    { id: 2, title: 'Layout', subtitle: 'Automatic FLIP',",
    "      detail: 'Elements animate between layout positions.' },",
    "    { id: 3, title: 'Presence', subtitle: 'Exit animations',",
    "      detail: 'Animate before DOM removal.' },",
    '  ];',
    '',
    '}',
  ].join('\n');

  readonly scrollRevealCode = [
    "import { Component, viewChild, effect, ElementRef, inject } from '@angular/core';",
    'import {',
    '  NgmMotionDirective,',
    '  useMotionValue, useSpring, useTransform,',
    '  type MotionStyle,',
    "} from '@scripttype/ng-motion';",
    '',
    '@Component({',
    '  imports: [NgmMotionDirective],',
    '  template: `',
    '    <div #container class="h-screen overflow-y-auto">',
    '      <!-- Scroll progress bar -->',
    '      <div class="sticky top-0 h-1 bg-black/10 z-10">',
    '        <div',
    '          ngmMotion',
    '          [style]="progressBarStyle"',
    '          class="h-full bg-accent origin-left"',
    '        ></div>',
    '      </div>',
    '',
    '      <!-- Hero with parallax -->',
    '      <div ngmMotion [style]="heroParallaxStyle" class="py-20 px-8">',
    '        <h1',
    '          ngmMotion',
    '          [whileInView]="{ opacity: 1, y: 0 }"',
    '          [initial]="{ opacity: 0, y: 40 }"',
    '          [viewport]="{ once: true }"',
    "          [transition]=\"{ type: 'spring', stiffness: 100, damping: 20 }\"",
    '          class="text-5xl font-bold"',
    '        >Build Amazing UIs</h1>',
    '      </div>',
    '',
    '      <!-- Feature cards reveal on scroll -->',
    '      @for (feature of features; track feature.title; let i = $index) {',
    '        <div',
    '          ngmMotion',
    '          [whileInView]="{ opacity: 1, x: 0 }"',
    '          [initial]="{ opacity: 0, x: -30 }"',
    '          [viewport]="{ once: true, amount: 0.3 }"',
    "          [transition]=\"{ type: 'spring', stiffness: 200, damping: 20 }\"",
    '          class="p-6 my-4 rounded-xl border"',
    '        >',
    '          <h3>{{ feature.title }}</h3>',
    '          <p>{{ feature.description }}</p>',
    '        </div>',
    '      }',
    '    </div>',
    '  `,',
    '})',
    'export class ScrollRevealComponent {',
    "  private readonly containerRef = viewChild('container', { read: ElementRef });",
    '',
    '  readonly scrollProgress = useMotionValue(0);',
    '  readonly smoothProgress = useSpring(this.scrollProgress, {',
    '    stiffness: 300, damping: 30,',
    '  });',
    '  readonly clampedProgress = useTransform(',
    '    this.smoothProgress, (v) => Math.min(v, 1)',
    '  );',
    '  readonly heroY = useTransform(this.scrollProgress, [0, 1], [0, 50]);',
    '',
    '  readonly progressBarStyle: MotionStyle = { scaleX: this.clampedProgress };',
    '  readonly heroParallaxStyle: MotionStyle = { y: this.heroY };',
    '',
    '  constructor() {',
    '    effect((onCleanup) => {',
    '      const ref = this.containerRef();',
    '      if (!ref) return;',
    '      const el = ref.nativeElement as HTMLElement;',
    '      const onScroll = (): void => {',
    '        const max = el.scrollHeight - el.clientHeight;',
    '        this.scrollProgress.set(max > 0 ? el.scrollTop / max : 0);',
    '      };',
    '      el.addEventListener("scroll", onScroll, { passive: true });',
    '      onCleanup(() => el.removeEventListener("scroll", onScroll));',
    '    });',
    '  }',
    '',
    '  readonly features = [',
    "    { title: 'Declarative', description: 'Animations as state, not steps.' },",
    "    { title: 'Spring Physics', description: 'Interruptible, natural motion.' },",
    "    { title: 'Scroll-Linked', description: 'Parallax and progress tracking.' },",
    "    { title: 'Zero Re-renders', description: 'Direct DOM updates at 60fps.' },",
    '  ];',
    '}',
  ].join('\n');

  readonly animatedTabsCode = [
    "import { Component, signal } from '@angular/core';",
    "import { NgmMotionDirective } from '@scripttype/ng-motion';",
    '',
    '@Component({',
    '  imports: [NgmMotionDirective],',
    '  template: `',
    '    <div class="tab-bar">',
    '      @for (tab of tabs; track tab.label; let i = $index) {',
    '        <button (click)="active.set(i)" class="tab">',
    '          {{ tab.label }}',
    '          @if (active() === i) {',
    '            <div',
    '              ngmMotion',
    '              layoutId="activeTab"',
    '              [layoutDependency]="active()"',
    "              [transition]=\"{ type: 'spring', stiffness: 350, damping: 30 }\"",
    '              class="indicator"',
    '            ></div>',
    '          }',
    '        </button>',
    '      }',
    '    </div>',
    '',
    '    <!-- Tab content -->',
    '    <div',
    '      ngmMotion',
    '      [animate]="{ opacity: 1, y: 0 }"',
    '      [initial]="{ opacity: 0, y: 8 }"',
    '      [transition]="{ duration: 0.3 }"',
    '      [layoutDependency]="active()"',
    '    >',
    '      <p>{{ tabs[active()].content }}</p>',
    '    </div>',
    '  `,',
    '})',
    'export class AnimatedTabsComponent {',
    '  readonly active = signal(0);',
    '  readonly tabs = [',
    "    { label: 'Overview', content: 'Spring animations with natural motion.' },",
    "    { label: 'Features', content: 'Gestures, layout, presence, and more.' },",
    "    { label: 'Performance', content: '60fps with zero re-renders.' },",
    '  ];',
    '}',
  ].join('\n');

  readonly modalDialogCode = [
    "import { Component, signal } from '@angular/core';",
    "import { NgmMotionDirective, NgmPresenceDirective } from '@scripttype/ng-motion';",
    '',
    '@Component({',
    '  imports: [NgmMotionDirective, NgmPresenceDirective],',
    '  template: `',
    '    <button (click)="open.set(true)">Open</button>',
    '',
    '    <div *ngmPresence="open()" class="overlay">',
    '      <!-- Backdrop -->',
    '      <div ngmMotion',
    '        [initial]="{ opacity: 0 }"',
    '        [animate]="{ opacity: 1 }"',
    '        [exit]="{ opacity: 0 }"',
    '        (click)="open.set(false)"',
    '        class="backdrop"',
    '      ></div>',
    '      <!-- Dialog -->',
    '      <div ngmMotion',
    '        [initial]="{ opacity: 0, scale: 0.9, y: 20 }"',
    '        [animate]="{ opacity: 1, scale: 1, y: 0 }"',
    '        [exit]="{ opacity: 0, scale: 0.9, y: 20 }"',
    "        [transition]=\"{ type: 'spring', stiffness: 300, damping: 25 }\"",
    '        class="dialog"',
    '      >',
    '        <h2>Dialog Title</h2>',
    '        <p>Content with spring-driven entry animation.</p>',
    '        <button (click)="open.set(false)">Close</button>',
    '      </div>',
    '    </div>',
    '  `,',
    '})',
    'export class ModalComponent {',
    '  readonly open = signal(false);',
    '}',
  ].join('\n');

  readonly dragReorderCode = [
    "import { Component, signal } from '@angular/core';",
    "import { NgmMotionDirective, NgmReorderGroupDirective, NgmReorderItemDirective } from '@scripttype/ng-motion';",
    '',
    '@Component({',
    '  imports: [NgmMotionDirective, NgmReorderGroupDirective, NgmReorderItemDirective],',
    '  template: `',
    '    <div [ngmReorderGroup]="items()" axis="y" (reorder)="items.set($event)">',
    '      @for (item of items(); track item.id) {',
    '        <div',
    '          [ngmReorderItem]="item"',
    '          ngmMotion',
    '          [layout]="true"',
    '          [drag]="\'y\'"',
    '          [dragSnapToOrigin]="true"',
    "          [whileDrag]=\"{ scale: 1.04, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }\"",
    "          [transition]=\"{ type: 'spring', stiffness: 300, damping: 25 }\"",
    '        >',
    '          {{ item.label }}',
    '        </div>',
    '      }',
    '    </div>',
    '  `,',
    '})',
    'export class ReorderListComponent {',
    '  readonly items = signal([',
    "    { id: 1, label: 'Design system' },",
    "    { id: 2, label: 'API integration' },",
    "    { id: 3, label: 'Performance audit' },",
    "    { id: 4, label: 'Documentation' },",
    '  ]);',
    '}',
  ].join('\n');
}
