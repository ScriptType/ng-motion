import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgmMotionDirective, type Variants } from '@scripttype/ng-motion';
import { CodeBlockComponent } from '../../components/code-block.component';

@Component({
  selector: 'app-variants',
  imports: [RouterLink, NgmMotionDirective, CodeBlockComponent],
  template: `
    <article class="max-w-3xl pb-16">
      <!-- Header -->
      <div
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
      >
        <h1 class="font-display font-bold text-4xl mb-4">Variants</h1>
        <p class="text-lg text-secondary mb-12 leading-relaxed">
          Variants let you define reusable animation presets and switch between them
          by variant label. Instead of passing inline objects to
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >animate</code
          >, you give each preset a variant label and reference it as a string. This
          unlocks powerful features like shared variants, orchestration, and staggered
          children.
        </p>
      </div>

      <!-- Defining Variants -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.1 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Defining Variants
        </h2>
        <p class="text-secondary mb-6">
          A
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >Variants</code
          >
          object maps variant labels to animation targets. Each key is a variant
          label, and each value is a set of CSS properties to animate to:
        </p>

        <app-code-block [code]="definingCode" lang="typescript" filename="component.ts" class="mb-6" />

        <p class="text-secondary">
          Pass the variants object to the
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >[variants]</code
          >
          input, then set
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >[animate]</code
          >
          to a variant label string instead of an inline object.
        </p>
      </section>

      <!-- Switching Between Variants -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.2 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Switching Between Variants
        </h2>
        <p class="text-secondary mb-6">
          Use a signal or expression to toggle the active variant label. When the
          label changes, ng-motion automatically animates to the new state:
        </p>

        <app-code-block [code]="switchingCode" lang="html" filename="template" class="mb-6" />

        <!-- Live toggle demo -->
        <div
          class="rounded-xl border border-border p-10 bg-surface/30 flex flex-col items-center justify-center gap-6"
        >
          <div
            ngmMotion
            [animate]="toggleOpen() ? 'open' : 'closed'"
            [variants]="toggleVariants"
            [transition]="{ type: 'spring', stiffness: 300, damping: 20 }"
            class="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent/15 to-accent-purple/15 border border-accent/20"
          ></div>
          <button
            (click)="toggleOpen.set(!toggleOpen())"
            class="px-5 py-2 rounded-lg border border-border hover:border-accent/40 text-sm font-mono text-secondary hover:text-primary transition-colors"
          >
            {{ toggleOpen() ? 'close' : 'open' }}
          </button>
        </div>
      </section>

      <!-- Shared Variants -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.3 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Shared Variants
        </h2>
        <p class="text-secondary mb-6">
          When multiple elements need the same animation behavior, define
          one
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >variants</code
          >
          object and reuse it. Each element still gets its own
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >[animate]</code
          >
          binding — they all animate simultaneously when the signal changes.
          This is the simplest multi-element pattern and serves as the foundation
          for manual stagger and orchestration below:
        </p>

        <app-code-block [code]="propagationCode" lang="typescript" filename="component.ts" class="mb-6" />

        <!-- Live shared variants demo -->
        <div
          class="rounded-xl border border-border p-10 bg-surface/30 flex flex-col items-center justify-center gap-6 mb-6"
        >
          <div class="flex gap-3">
            @for (item of propItems; track item.label; let i = $index) {
              <div
                ngmMotion
                [animate]="propVisible() ? 'visible' : 'hidden'"
                [variants]="propItemVariants"
                [transition]="{ type: 'spring', stiffness: 300, damping: 22 }"
                class="w-14 h-14 rounded-xl flex items-center justify-center text-xs font-mono text-white/80"
                [class]="item.color"
              >
                {{ item.label }}
              </div>
            }
          </div>
          <button
            (click)="propVisible.set(!propVisible())"
            ngmMotion
            [whileHover]="{ scale: 1.04 }"
            [whileTap]="{ scale: 0.96 }"
            [transition]="{ type: 'spring', stiffness: 400, damping: 17 }"
            class="px-5 py-2 rounded-lg border border-border hover:border-accent/40 text-sm font-mono text-secondary hover:text-primary transition-colors cursor-pointer"
          >
            {{ propVisible() ? 'hide' : 'show' }}
          </button>
          <p class="text-xs text-muted text-center max-w-xs">
            All elements share the same variant labels and are driven by a single signal
          </p>
        </div>
      </section>

      <!-- Manual Stagger -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.4 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Manual Stagger
        </h2>
        <p class="text-secondary mb-6">
          Building on shared variants, you can add a cascade effect by multiplying
          the loop index by a fixed interval and passing it as
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >delay</code
          >
          in the transition. Each element starts its animation slightly after the previous
          one, creating a wave-like entrance instead of all animating at once:
        </p>

        <div class="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 mb-6">
          <p class="text-sm text-secondary">
            <strong class="text-primary">Manual stagger vs Orchestration:</strong>
            Manual stagger means each element controls its own timing via
            <code class="text-accent-pink font-mono text-xs px-1 py-0.5 rounded bg-accent-pink/10">delay: i * 0.08</code>
            and has its own
            <code class="text-accent-pink font-mono text-xs px-1 py-0.5 rounded bg-accent-pink/10">[animate]</code>
            binding.
            <a class="text-accent hover:underline font-medium" href="#orchestration">Orchestration</a>
            uses a parent element to control all children's timing automatically via
            <code class="text-accent-pink font-mono text-xs px-1 py-0.5 rounded bg-accent-pink/10">staggerChildren</code>
            — children don't need
            <code class="text-accent-pink font-mono text-xs px-1 py-0.5 rounded bg-accent-pink/10">[animate]</code>
            at all. Use manual stagger for flat sibling lists; use orchestration when you have
            a parent container that should coordinate its children.
          </p>
        </div>

        <app-code-block [code]="staggerCode" lang="html" filename="template" class="mb-6" />

        <!-- Live stagger demo -->
        <div
          class="rounded-xl border border-border p-10 bg-surface/30 flex flex-col items-center justify-center gap-6"
        >
          <div class="w-full max-w-sm space-y-3">
            @for (item of staggerItems; track item.id; let i = $index) {
              <div
                ngmMotion
                [animate]="staggerVisible() ? 'visible' : 'hidden'"
                [variants]="staggerItemVariants"
                [transition]="{ type: 'spring', stiffness: 300, damping: 24, delay: i * 0.08 }"
                class="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-elevated/30"
              >
                <div
                  class="w-8 h-8 rounded-lg flex-shrink-0"
                  [class]="item.color"
                ></div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-primary truncate">
                    {{ item.title }}
                  </p>
                  <p class="text-xs text-muted">{{ item.subtitle }}</p>
                </div>
              </div>
            }
          </div>
          <button
            (click)="staggerVisible.set(!staggerVisible())"
            ngmMotion
            [whileHover]="{ scale: 1.04 }"
            [whileTap]="{ scale: 0.96 }"
            [transition]="{ type: 'spring', stiffness: 400, damping: 17 }"
            class="px-6 py-2.5 rounded-xl border border-accent/30 bg-accent/5 text-accent text-sm font-semibold hover:bg-accent/10 transition-colors"
          >
            {{ staggerVisible() ? 'Hide items' : 'Show items' }}
          </button>
        </div>
      </section>

      <!-- Orchestration -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.5 }"
        class="mb-12"
      >
        <h2 id="orchestration" class="font-display font-semibold text-2xl mb-4">Orchestration</h2>
        <p class="text-secondary mb-6">
          Orchestration lets a parent element propagate its active variant label
          to all children automatically. Place orchestration properties inside the
          variant's
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >transition</code
          >
          to control sequencing.
          Children only need
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >[variants]</code
          >
          with matching variant labels — they inherit the active variant label from the parent,
          so no
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >[animate]</code
          >
          binding is needed on children:
        </p>

        <div class="space-y-4 mb-6">
          <div class="rounded-xl border border-border p-5 bg-surface/30">
            <div class="flex items-start gap-3">
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10 whitespace-nowrap flex-shrink-0"
                >when</code
              >
              <p class="text-secondary text-sm">
                Controls whether the parent animates before or after its
                children. Set to
                <code
                  class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                  >'beforeChildren'</code
                >
                or
                <code
                  class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                  >'afterChildren'</code
                >. By default, parent and children animate simultaneously.
              </p>
            </div>
          </div>

          <div class="rounded-xl border border-border p-5 bg-surface/30">
            <div class="flex items-start gap-3">
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10 whitespace-nowrap flex-shrink-0"
                >staggerChildren</code
              >
              <p class="text-secondary text-sm">
                Delay between each child's animation start, in seconds. A value
                of
                <code
                  class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                  >0.06</code
                >
                means the second child starts 60ms after the first, the third
                120ms after, and so on.
              </p>
            </div>
          </div>

          <div class="rounded-xl border border-border p-5 bg-surface/30">
            <div class="flex items-start gap-3">
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10 whitespace-nowrap flex-shrink-0"
                >delayChildren</code
              >
              <p class="text-secondary text-sm">
                Delay before the first child starts animating, in seconds.
                Useful when you want the parent to finish its own animation
                before children begin.
              </p>
            </div>
          </div>
        </div>

        <app-code-block [code]="orchestrationCode" lang="typescript" filename="component.ts" class="mb-6" />

        <!-- Live orchestration demo -->
        <div
          class="rounded-xl border border-border p-10 bg-surface/30 flex flex-col items-center justify-center gap-6"
        >
          <div class="relative w-full max-w-xs">
            <!-- Parent with orchestration — children inherit animate automatically -->
            <div
              ngmMotion
              [animate]="orchOpen() ? 'open' : 'closed'"
              [variants]="orchPanelVariants"
              class="rounded-2xl border border-border bg-elevated/60 backdrop-blur-sm p-4 space-y-2"
            >
              <!-- Children only have [variants] — no [animate] needed -->
              @for (item of orchMenuItems; track item.label) {
                <div
                  ngmMotion
                  [variants]="orchItemVariants"
                  [transition]="{ type: 'spring', stiffness: 350, damping: 24 }"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent/5 transition-colors cursor-default"
                >
                  <div
                    class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono text-white/90"
                    [class]="item.color"
                  >
                    {{ item.icon }}
                  </div>
                  <span class="text-sm text-primary">{{ item.label }}</span>
                </div>
              }
            </div>
          </div>
          <button
            (click)="orchOpen.set(!orchOpen())"
            ngmMotion
            [whileHover]="{ scale: 1.04 }"
            [whileTap]="{ scale: 0.96 }"
            [transition]="{ type: 'spring', stiffness: 400, damping: 17 }"
            class="px-5 py-2 rounded-lg border border-border hover:border-accent/40 text-sm font-mono text-secondary hover:text-primary transition-colors cursor-pointer"
          >
            {{ orchOpen() ? 'close menu' : 'open menu' }}
          </button>
          <p class="text-xs text-muted text-center max-w-xs">
            Children only have [variants] — the parent propagates the active variant label.
            On open: parent animates first, then children stagger in.
            On close: children animate out first, then the parent follows.
          </p>
        </div>
      </section>

      <!-- Dynamic Variants -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.6 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Dynamic Variants
        </h2>
        <p class="text-secondary mb-6">
          Variants don't have to be static. Use
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >computed()</code
          >
          to derive variant definitions from reactive state. When the computed
          value updates, ng-motion picks up the new definitions:
        </p>

        <app-code-block [code]="dynamicCode" lang="typescript" filename="component.ts" class="mb-6" />

        <!-- Live dynamic variants demo -->
        <div
          class="rounded-xl border border-border p-10 bg-surface/30 flex flex-col items-center justify-center gap-6"
        >
          <div
            ngmMotion
            [animate]="dynOpen() ? 'open' : 'closed'"
            [variants]="dynPanelVariants()"
            [transition]="{ type: 'spring', stiffness: 300, damping: 24 }"
            class="w-full max-w-xs rounded-2xl border border-border bg-elevated/40 overflow-hidden"
          >
            <div class="p-4">
              <div class="flex items-center gap-2 mb-3">
                <div class="w-2 h-2 rounded-full bg-accent"></div>
                <span class="text-xs font-mono text-muted">Panel</span>
              </div>
              <p class="text-sm text-secondary">
                This panel's "open" height changes based on the expanded toggle.
                The variant definition itself is a
                <code class="text-accent-pink font-mono text-xs">computed()</code>
                signal.
              </p>
              @if (dynExpanded()) {
                <div class="mt-3 pt-3 border-t border-border/50 space-y-2">
                  <div class="h-3 rounded bg-accent/10 w-3/4"></div>
                  <div class="h-3 rounded bg-accent-purple/10 w-1/2"></div>
                  <div class="h-3 rounded bg-accent-pink/10 w-5/6"></div>
                </div>
              }
            </div>
          </div>
          <div class="flex items-center gap-4">
            <button
              (click)="dynOpen.set(!dynOpen())"
              ngmMotion
              [whileHover]="{ scale: 1.04 }"
              [whileTap]="{ scale: 0.96 }"
              [transition]="{ type: 'spring', stiffness: 400, damping: 17 }"
              class="px-5 py-2 rounded-lg border border-border hover:border-accent/40 text-sm font-mono text-secondary hover:text-primary transition-colors cursor-pointer"
            >
              {{ dynOpen() ? 'close' : 'open' }}
            </button>
            <label class="flex items-center gap-2 text-sm text-secondary cursor-pointer select-none">
              <input
                type="checkbox"
                [checked]="dynExpanded()"
                (change)="dynExpanded.set(!dynExpanded())"
                class="accent-accent"
              />
              expanded
            </label>
          </div>
          <p class="text-xs text-muted text-center max-w-xs">
            Toggle "expanded" to change the variant definition — the open
            height updates reactively via
            <code class="text-accent-pink font-mono">computed()</code>
          </p>
        </div>
      </section>

      <!-- Next steps -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.7 }"
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
export class VariantsPage {
  // ── Toggle demo state ──
  readonly toggleOpen = signal(false);

  readonly toggleVariants: Variants = {
    open: { opacity: 1, x: 0, scale: 1 },
    closed: { opacity: 0.4, x: -16, scale: 0.92 },
  };

  // ── Propagation demo state ──
  readonly propVisible = signal(true);

  readonly propItems = [
    { label: 'A', color: 'bg-gradient-to-br from-accent to-accent-purple' },
    { label: 'B', color: 'bg-gradient-to-br from-accent-purple to-accent-pink' },
    { label: 'C', color: 'bg-gradient-to-br from-accent-pink to-accent-gold' },
    { label: 'D', color: 'bg-gradient-to-br from-accent-gold to-accent' },
  ];

  readonly propContainerVariants: Variants = {
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
    hidden: { transition: { staggerChildren: 0.05 } },
  };

  readonly propItemVariants: Variants = {
    visible: { opacity: 1, y: 0, scale: 1 },
    hidden: { opacity: 0, y: 20, scale: 0.8 },
  };

  // ── Stagger demo state ──
  readonly staggerVisible = signal(true);

  readonly staggerItems = [
    {
      id: 1,
      title: 'Spring Physics',
      subtitle: 'Natural, fluid motion',
      color: 'bg-gradient-to-br from-accent to-accent-purple',
    },
    {
      id: 2,
      title: 'Gesture Handling',
      subtitle: 'Hover, tap, drag, pan',
      color: 'bg-gradient-to-br from-accent-pink to-accent-gold',
    },
    {
      id: 3,
      title: 'Layout Animation',
      subtitle: 'Automatic FLIP transitions',
      color: 'bg-gradient-to-br from-accent-purple to-accent-pink',
    },
    {
      id: 4,
      title: 'Scroll-Driven',
      subtitle: 'Progress-linked animations',
      color: 'bg-gradient-to-br from-accent-gold to-accent',
    },
    {
      id: 5,
      title: 'Exit Animations',
      subtitle: 'Animate elements leaving the DOM',
      color: 'bg-gradient-to-br from-accent to-accent-pink',
    },
    {
      id: 6,
      title: 'Variant Orchestration',
      subtitle: 'Stagger, delay, and sequence',
      color: 'bg-gradient-to-br from-accent-purple to-accent-gold',
    },
  ];

  readonly staggerContainerVariants: Variants = {
    visible: {
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
    hidden: {
      transition: { staggerChildren: 0.05 },
    },
  };

  readonly staggerItemVariants: Variants = {
    visible: { opacity: 1, y: 0, x: 0 },
    hidden: { opacity: 0, y: 20, x: -12 },
  };

  // ── Orchestration demo state ──
  readonly orchOpen = signal(true);

  readonly orchMenuItems = [
    { label: 'Dashboard', icon: '◉', color: 'bg-gradient-to-br from-accent to-accent-purple' },
    { label: 'Projects', icon: '◫', color: 'bg-gradient-to-br from-accent-purple to-accent-pink' },
    { label: 'Messages', icon: '◈', color: 'bg-gradient-to-br from-accent-pink to-accent-gold' },
    { label: 'Settings', icon: '⚙', color: 'bg-gradient-to-br from-accent-gold to-accent' },
  ];

  readonly orchPanelVariants: Variants = {
    open: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 28,
        when: 'beforeChildren',
        staggerChildren: 0.06,
        delayChildren: 0.1,
      },
    },
    closed: {
      opacity: 0,
      scale: 0.92,
      y: -8,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 28,
        when: 'afterChildren',
        staggerChildren: 0.04,
      },
    },
  };

  readonly orchItemVariants: Variants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: -16 },
  };

  // ── Dynamic variants demo state ──
  readonly dynOpen = signal(true);
  readonly dynExpanded = signal(false);

  readonly dynPanelVariants = computed<Variants>(() => ({
    open: {
      opacity: 1,
      height: this.dynExpanded() ? 220 : 140,
    },
    closed: {
      opacity: 0.5,
      height: 60,
    },
  }));

  // ── Code examples ──

  readonly definingCode = [
    "import { NgmMotionDirective, type Variants } from '@scripttype/ng-motion';",
    '',
    'readonly variants: Variants = {',
    '  open: { opacity: 1, x: 0 },',
    '  closed: { opacity: 0.4, x: -16 },',
    '};',
    '',
    '// In the template:',
    '// [animate]="isOpen() ? \'open\' : \'closed\'"',
    '// [variants]="variants"',
  ].join('\n');

  readonly switchingCode = [
    'readonly isOpen = signal(false);',
    '',
    'readonly variants: Variants = {',
    '  open:   { opacity: 1, x: 0, scale: 1 },',
    '  closed: { opacity: 0.4, x: -16, scale: 0.92 },',
    '};',
    '',
    '// template:',
    '<div',
    '  ngmMotion',
    '  [animate]="isOpen() ? \'open\' : \'closed\'"',
    '  [variants]="variants"',
    '  [transition]="{',
    "    type: 'spring',",
    '    stiffness: 300,',
    '    damping: 20',
    '  }"',
    '>',
    '</div>',
    '',
    '<button (click)="isOpen.set(!isOpen())">Toggle</button>',
  ].join('\n');

  readonly propagationCode = [
    'readonly visible = signal(true);',
    '',
    '// One variants object, reused by all elements',
    'readonly itemVariants: Variants = {',
    '  visible: { opacity: 1, y: 0, scale: 1 },',
    '  hidden: { opacity: 0, y: 20, scale: 0.8 },',
    '};',
    '',
    '// template — every element has its own [animate]:',
    '@for (item of items; track item) {',
    '  <div ngmMotion',
    '    [animate]="visible() ? \'visible\' : \'hidden\'"',
    '    [variants]="itemVariants"',
    '  >',
    '    {{ item }}',
    '  </div>',
    '}',
  ].join('\n');

  readonly staggerCode = [
    'readonly visible = signal(true);',
    '',
    'readonly itemVariants: Variants = {',
    '  visible: { opacity: 1, y: 0, x: 0 },',
    '  hidden: { opacity: 0, y: 20, x: -12 },',
    '};',
    '',
    '// template:',
    '@for (item of items; track item.id; let i = $index) {',
    '  <div ngmMotion',
    '    [animate]="visible() ? \'visible\' : \'hidden\'"',
    '    [variants]="itemVariants"',
    '    [transition]="{',
    "      type: 'spring',",
    '      stiffness: 300,',
    '      damping: 24,',
    '      delay: i * 0.08',
    '    }"',
    '  >',
    '    {{ item.title }}',
    '  </div>',
    '}',
  ].join('\n');

  readonly orchestrationCode = [
    'readonly isOpen = signal(true);',
    '',
    '// Parent variants with orchestration in transition',
    'readonly panelVariants: Variants = {',
    '  open: {',
    '    opacity: 1, scale: 1, y: 0,',
    '    transition: {',
    "      type: 'spring', stiffness: 400, damping: 28,",
    "      when: 'beforeChildren',",
    '      staggerChildren: 0.06,',
    '      delayChildren: 0.1,',
    '    },',
    '  },',
    '  closed: {',
    '    opacity: 0, scale: 0.92, y: -8,',
    '    transition: {',
    "      type: 'spring', stiffness: 400, damping: 28,",
    "      when: 'afterChildren',",
    '      staggerChildren: 0.04,',
    '    },',
    '  },',
    '};',
    '',
    '// Child variants — same labels, no [animate] needed',
    'readonly itemVariants: Variants = {',
    '  open: { opacity: 1, x: 0 },',
    '  closed: { opacity: 0, x: -16 },',
    '};',
    '',
    '// template — children inherit animate from parent:',
    '<div ngmMotion',
    '  [animate]="isOpen() ? \'open\' : \'closed\'"',
    '  [variants]="panelVariants"',
    '>',
    '  @for (item of items; track item) {',
    '    <div ngmMotion [variants]="itemVariants">',
    '      {{ item }}',
    '    </div>',
    '  }',
    '</div>',
  ].join('\n');

  readonly dynamicCode = [
    "import { computed, signal, type Signal } from '@angular/core';",
    "import { type Variants } from '@scripttype/ng-motion';",
    '',
    'readonly expanded = signal(false);',
    '',
    'readonly panelVariants: Signal<Variants> = computed(() => ({',
    '  open: {',
    '    opacity: 1,',
    '    height: this.expanded() ? 360 : 240,',
    '  },',
    '  closed: {',
    '    opacity: 0.6,',
    '    height: 120,',
    '  },',
    '}));',
    '',
    '// In the template:',
    '// [variants]="panelVariants()"',
  ].join('\n');

  // ── Next steps ──

  readonly nextLinks = [
    {
      path: '/docs/gestures',
      title: 'Gestures',
      description: 'Hover, tap, drag, and focus interactions',
    },
    {
      path: '/docs/presence',
      title: 'Presence & Exit',
      description: 'Animate elements entering and leaving the DOM',
    },
    {
      path: '/docs/layout',
      title: 'Layout Animation',
      description: 'Automatic FLIP animations for layout changes',
    },
    {
      path: '/docs/transitions',
      title: 'Transitions',
      description: 'Spring, tween, and inertia configuration',
    },
  ];
}
