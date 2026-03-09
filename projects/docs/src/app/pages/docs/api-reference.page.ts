import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgmMotionDirective } from 'ng-motion';

interface ApiEntry {
  readonly name: string;
  readonly description: string;
}

@Component({
  selector: 'app-api-reference',
  imports: [RouterLink, NgmMotionDirective],
  template: `
    <article class="max-w-3xl pb-16">
      <!-- Header -->
      <div
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
      >
        <h1 class="font-display font-bold text-4xl mb-4">API Reference</h1>
        <p class="text-lg text-secondary mb-12 leading-relaxed">
          Complete reference of every export from ng-motion. Directives, hooks,
          types, and utilities &mdash; organized by category.
        </p>
      </div>

      <!-- Legend -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.1 }"
        class="mb-12"
      >
        <div
          class="rounded-xl border border-border bg-surface/30 px-6 py-4 flex flex-wrap gap-6"
        >
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full bg-accent"></div>
            <span class="text-sm text-secondary">Directives</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full bg-accent-purple"></div>
            <span class="text-sm text-secondary">Hooks</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full bg-accent-pink"></div>
            <span class="text-sm text-secondary">Types</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full bg-accent-gold"></div>
            <span class="text-sm text-secondary">Utilities</span>
          </div>
        </div>
      </section>

      <!-- Core -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.2 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Core</h2>
        <p class="text-secondary mb-6">
          The foundational building blocks for declaring animations. The
          directive is the primary entry point for all template-driven motion.
        </p>
        <div
          class="rounded-xl border border-border bg-surface/30 overflow-hidden"
        >
          @for (entry of coreEntries; track entry.name) {
            <div
              class="flex items-start gap-4 border-b border-border/50 px-5 py-4 last:border-b-0"
            >
              <div
                class="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                [class.bg-accent]="entry.color === 'accent'"
                [class.bg-accent-gold]="entry.color === 'accent-gold'"
              ></div>
              <div>
                <code
                  class="font-mono text-sm px-1.5 py-0.5 rounded"
                  [class.text-accent]="entry.color === 'accent'"
                  [class.bg-accent/10]="entry.color === 'accent'"
                  [class.text-accent-gold]="entry.color === 'accent-gold'"
                  [class.bg-accent-gold/10]="entry.color === 'accent-gold'"
                  >{{ entry.name }}</code
                >
                <p class="text-sm text-secondary mt-1">
                  {{ entry.description }}
                </p>
              </div>
            </div>
          }
        </div>
        <div class="mt-4">
          <a
            routerLink="/docs/motion-directive"
            class="text-sm text-accent hover:underline"
            >Motion Directive docs &rarr;</a
          >
        </div>
      </section>

      <!-- Core Types -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.3 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Core Types</h2>
        <p class="text-secondary mb-6">
          TypeScript interfaces and type aliases used throughout the library for
          targets, transitions, variants, and animation state.
        </p>
        <div
          class="rounded-xl border border-border bg-surface/30 overflow-hidden"
        >
          @for (t of coreTypes; track t.name) {
            <div
              class="flex items-start gap-4 border-b border-border/50 px-5 py-4 last:border-b-0"
            >
              <div
                class="w-2 h-2 rounded-full flex-shrink-0 mt-2 bg-accent-pink"
              ></div>
              <div>
                <code
                  class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                  >{{ t.name }}</code
                >
                <p class="text-sm text-secondary mt-1">
                  {{ t.description }}
                </p>
              </div>
            </div>
          }
        </div>
        <div class="mt-4">
          <a
            routerLink="/docs/transitions"
            class="text-sm text-accent hover:underline"
            >Transitions docs &rarr;</a
          >
        </div>
      </section>

      <!-- Motion Values and Hooks -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.4 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Motion Values &amp; Hooks
        </h2>
        <p class="text-secondary mb-6">
          Reactive primitives for high-frequency animated state. These run
          outside Angular's change detection for maximum performance.
        </p>
        <div
          class="rounded-xl border border-border bg-surface/30 overflow-hidden"
        >
          @for (entry of motionValueEntries; track entry.name) {
            <div
              class="flex items-start gap-4 border-b border-border/50 px-5 py-4 last:border-b-0"
            >
              <div
                class="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                [class.bg-accent-purple]="entry.color === 'accent-purple'"
                [class.bg-accent-gold]="entry.color === 'accent-gold'"
              ></div>
              <div>
                <code
                  class="font-mono text-sm px-1.5 py-0.5 rounded"
                  [class.text-accent-purple]="entry.color === 'accent-purple'"
                  [class.bg-accent-purple/10]="entry.color === 'accent-purple'"
                  [class.text-accent-gold]="entry.color === 'accent-gold'"
                  [class.bg-accent-gold/10]="entry.color === 'accent-gold'"
                  >{{ entry.name }}</code
                >
                <p class="text-sm text-secondary mt-1">
                  {{ entry.description }}
                </p>
              </div>
            </div>
          }
        </div>
        <div class="mt-4">
          <a
            routerLink="/docs/motion-values"
            class="text-sm text-accent hover:underline"
            >Motion Values docs &rarr;</a
          >
        </div>
      </section>

      <!-- Gestures and Drag -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.5 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Gestures &amp; Drag
        </h2>
        <p class="text-secondary mb-6">
          Pointer-driven interaction features including hover, press, focus,
          viewport detection, drag, and pan gestures.
        </p>
        <div
          class="rounded-xl border border-border bg-surface/30 overflow-hidden"
        >
          @for (entry of gestureEntries; track entry.name) {
            <div
              class="flex items-start gap-4 border-b border-border/50 px-5 py-4 last:border-b-0"
            >
              <div
                class="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                [class.bg-accent-gold]="entry.color === 'accent-gold'"
                [class.bg-accent-purple]="entry.color === 'accent-purple'"
                [class.bg-accent-pink]="entry.color === 'accent-pink'"
              ></div>
              <div>
                <code
                  class="font-mono text-sm px-1.5 py-0.5 rounded"
                  [class.text-accent-gold]="entry.color === 'accent-gold'"
                  [class.bg-accent-gold/10]="entry.color === 'accent-gold'"
                  [class.text-accent-purple]="entry.color === 'accent-purple'"
                  [class.bg-accent-purple/10]="entry.color === 'accent-purple'"
                  [class.text-accent-pink]="entry.color === 'accent-pink'"
                  [class.bg-accent-pink/10]="entry.color === 'accent-pink'"
                  >{{ entry.name }}</code
                >
                <p class="text-sm text-secondary mt-1">
                  {{ entry.description }}
                </p>
              </div>
            </div>
          }
        </div>
        <div class="mt-4">
          <a
            routerLink="/docs/gestures"
            class="text-sm text-accent hover:underline"
            >Gestures docs &rarr;</a
          >
        </div>
      </section>

      <!-- Presence -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.6 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Presence</h2>
        <p class="text-secondary mb-6">
          Animate elements as they enter and leave the DOM. The presence system
          defers removal until exit animations complete.
        </p>
        <div
          class="rounded-xl border border-border bg-surface/30 overflow-hidden"
        >
          @for (entry of presenceEntries; track entry.name) {
            <div
              class="flex items-start gap-4 border-b border-border/50 px-5 py-4 last:border-b-0"
            >
              <div
                class="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                [class.bg-accent]="entry.color === 'accent'"
                [class.bg-accent-gold]="entry.color === 'accent-gold'"
                [class.bg-accent-purple]="entry.color === 'accent-purple'"
                [class.bg-accent-pink]="entry.color === 'accent-pink'"
              ></div>
              <div>
                <code
                  class="font-mono text-sm px-1.5 py-0.5 rounded"
                  [class.text-accent]="entry.color === 'accent'"
                  [class.bg-accent/10]="entry.color === 'accent'"
                  [class.text-accent-gold]="entry.color === 'accent-gold'"
                  [class.bg-accent-gold/10]="entry.color === 'accent-gold'"
                  [class.text-accent-purple]="entry.color === 'accent-purple'"
                  [class.bg-accent-purple/10]="entry.color === 'accent-purple'"
                  [class.text-accent-pink]="entry.color === 'accent-pink'"
                  [class.bg-accent-pink/10]="entry.color === 'accent-pink'"
                  >{{ entry.name }}</code
                >
                <p class="text-sm text-secondary mt-1">
                  {{ entry.description }}
                </p>
              </div>
            </div>
          }
        </div>
        <div class="mt-4">
          <a
            routerLink="/docs/presence"
            class="text-sm text-accent hover:underline"
            >Presence docs &rarr;</a
          >
        </div>
      </section>

      <!-- Layout -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.7 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Layout</h2>
        <p class="text-secondary mb-6">
          Automatic FLIP-based layout animations. Group related elements so
          they animate together when their positions change.
        </p>
        <div
          class="rounded-xl border border-border bg-surface/30 overflow-hidden"
        >
          @for (entry of layoutEntries; track entry.name) {
            <div
              class="flex items-start gap-4 border-b border-border/50 px-5 py-4 last:border-b-0"
            >
              <div
                class="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                [class.bg-accent]="entry.color === 'accent'"
                [class.bg-accent-gold]="entry.color === 'accent-gold'"
                [class.bg-accent-pink]="entry.color === 'accent-pink'"
              ></div>
              <div>
                <code
                  class="font-mono text-sm px-1.5 py-0.5 rounded"
                  [class.text-accent]="entry.color === 'accent'"
                  [class.bg-accent/10]="entry.color === 'accent'"
                  [class.text-accent-gold]="entry.color === 'accent-gold'"
                  [class.bg-accent-gold/10]="entry.color === 'accent-gold'"
                  [class.text-accent-pink]="entry.color === 'accent-pink'"
                  [class.bg-accent-pink/10]="entry.color === 'accent-pink'"
                  >{{ entry.name }}</code
                >
                <p class="text-sm text-secondary mt-1">
                  {{ entry.description }}
                </p>
              </div>
            </div>
          }
        </div>
        <div class="mt-4">
          <a
            routerLink="/docs/layout"
            class="text-sm text-accent hover:underline"
            >Layout docs &rarr;</a
          >
        </div>
      </section>

      <!-- Scroll -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.8 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Scroll</h2>
        <p class="text-secondary mb-6">
          Scroll-linked animations and scroll progress tracking. Drive motion
          values from scroll position for parallax and reveal effects.
        </p>
        <div
          class="rounded-xl border border-border bg-surface/30 overflow-hidden"
        >
          @for (entry of scrollEntries; track entry.name) {
            <div
              class="flex items-start gap-4 border-b border-border/50 px-5 py-4 last:border-b-0"
            >
              <div
                class="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                [class.bg-accent-gold]="entry.color === 'accent-gold'"
                [class.bg-accent-pink]="entry.color === 'accent-pink'"
              ></div>
              <div>
                <code
                  class="font-mono text-sm px-1.5 py-0.5 rounded"
                  [class.text-accent-gold]="entry.color === 'accent-gold'"
                  [class.bg-accent-gold/10]="entry.color === 'accent-gold'"
                  [class.text-accent-pink]="entry.color === 'accent-pink'"
                  [class.bg-accent-pink/10]="entry.color === 'accent-pink'"
                  >{{ entry.name }}</code
                >
                <p class="text-sm text-secondary mt-1">
                  {{ entry.description }}
                </p>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Reorder -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.9 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Reorder</h2>
        <p class="text-secondary mb-6">
          Drag-to-reorder list components with automatic layout animation
          and scroll handling.
        </p>
        <div
          class="rounded-xl border border-border bg-surface/30 overflow-hidden"
        >
          @for (entry of reorderEntries; track entry.name) {
            <div
              class="flex items-start gap-4 border-b border-border/50 px-5 py-4 last:border-b-0"
            >
              <div
                class="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                [class.bg-accent]="entry.color === 'accent'"
                [class.bg-accent-gold]="entry.color === 'accent-gold'"
                [class.bg-accent-pink]="entry.color === 'accent-pink'"
              ></div>
              <div>
                <code
                  class="font-mono text-sm px-1.5 py-0.5 rounded"
                  [class.text-accent]="entry.color === 'accent'"
                  [class.bg-accent/10]="entry.color === 'accent'"
                  [class.text-accent-gold]="entry.color === 'accent-gold'"
                  [class.bg-accent-gold/10]="entry.color === 'accent-gold'"
                  [class.text-accent-pink]="entry.color === 'accent-pink'"
                  [class.bg-accent-pink/10]="entry.color === 'accent-pink'"
                  >{{ entry.name }}</code
                >
                <p class="text-sm text-secondary mt-1">
                  {{ entry.description }}
                </p>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Imperative Animation -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 1.0 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Imperative Animation
        </h2>
        <p class="text-secondary mb-6">
          Programmatic animation control for complex sequences, staggered
          animations, and scoped element targeting.
        </p>
        <div
          class="rounded-xl border border-border bg-surface/30 overflow-hidden"
        >
          @for (entry of imperativeEntries; track entry.name) {
            <div
              class="flex items-start gap-4 border-b border-border/50 px-5 py-4 last:border-b-0"
            >
              <div
                class="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                [class.bg-accent-gold]="entry.color === 'accent-gold'"
                [class.bg-accent-purple]="entry.color === 'accent-purple'"
                [class.bg-accent-pink]="entry.color === 'accent-pink'"
              ></div>
              <div>
                <code
                  class="font-mono text-sm px-1.5 py-0.5 rounded"
                  [class.text-accent-gold]="entry.color === 'accent-gold'"
                  [class.bg-accent-gold/10]="entry.color === 'accent-gold'"
                  [class.text-accent-purple]="entry.color === 'accent-purple'"
                  [class.bg-accent-purple/10]="entry.color === 'accent-purple'"
                  [class.text-accent-pink]="entry.color === 'accent-pink'"
                  [class.bg-accent-pink/10]="entry.color === 'accent-pink'"
                  >{{ entry.name }}</code
                >
                <p class="text-sm text-secondary mt-1">
                  {{ entry.description }}
                </p>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Feature Loading -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 1.1 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Feature Loading
        </h2>
        <p class="text-secondary mb-6">
          Tree-shakable feature bundles and lazy loading utilities for
          optimizing bundle size. Only include the features you use.
        </p>
        <div
          class="rounded-xl border border-border bg-surface/30 overflow-hidden"
        >
          @for (entry of featureEntries; track entry.name) {
            <div
              class="flex items-start gap-4 border-b border-border/50 px-5 py-4 last:border-b-0"
            >
              <div
                class="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                [class.bg-accent-gold]="entry.color === 'accent-gold'"
                [class.bg-accent-pink]="entry.color === 'accent-pink'"
              ></div>
              <div>
                <code
                  class="font-mono text-sm px-1.5 py-0.5 rounded"
                  [class.text-accent-gold]="entry.color === 'accent-gold'"
                  [class.bg-accent-gold/10]="entry.color === 'accent-gold'"
                  [class.text-accent-pink]="entry.color === 'accent-pink'"
                  [class.bg-accent-pink/10]="entry.color === 'accent-pink'"
                  >{{ entry.name }}</code
                >
                <p class="text-sm text-secondary mt-1">
                  {{ entry.description }}
                </p>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Visual Element Adapters -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 1.2 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Visual Element Adapters
        </h2>
        <p class="text-secondary mb-6">
          Low-level primitives for the visual element lifecycle. These power the
          directive internally and are available for advanced use cases like
          custom renderers and SVG support.
        </p>
        <div
          class="rounded-xl border border-border bg-surface/30 overflow-hidden"
        >
          @for (entry of visualElementEntries; track entry.name) {
            <div
              class="flex items-start gap-4 border-b border-border/50 px-5 py-4 last:border-b-0"
            >
              <div
                class="w-2 h-2 rounded-full flex-shrink-0 mt-2 bg-accent-gold"
              ></div>
              <div>
                <code
                  class="text-accent-gold font-mono text-sm px-1.5 py-0.5 rounded bg-accent-gold/10"
                  >{{ entry.name }}</code
                >
                <p class="text-sm text-secondary mt-1">
                  {{ entry.description }}
                </p>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Next steps -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 1.3 }"
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
export class ApiReferencePage {
  // ── Core ──
  readonly coreEntries: readonly (ApiEntry & { color: string })[] = [
    {
      name: 'NgmMotionDirective',
      description:
        'Main directive for declarative motion. Apply to any element for animate, gesture, layout, and presence support.',
      color: 'accent',
    },
    {
      name: 'provideMotionConfig(config)',
      description:
        'Provider factory for setting global DI-based animation defaults (transition, reduced motion, features).',
      color: 'accent-gold',
    },
    {
      name: 'MOTION_CONFIG',
      description:
        'Injection token for the global motion configuration. Use with inject() or provider overrides.',
      color: 'accent-gold',
    },
    {
      name: 'VERSION',
      description: 'Library version constant. Useful for logging and debugging.',
      color: 'accent-gold',
    },
  ];

  // ── Core Types ──
  readonly coreTypes: readonly ApiEntry[] = [
    {
      name: 'MotionValue',
      description:
        'Reactive container for a single animated value, updated outside change detection.',
    },
    {
      name: 'MotionConfig',
      description:
        'Global configuration shape for default transition and reduced-motion behavior.',
    },
    {
      name: 'Target',
      description:
        'Object mapping CSS/transform properties to their target values.',
    },
    {
      name: 'TargetAndTransition',
      description:
        'A Target combined with an optional Transition for per-property animation control.',
    },
    {
      name: 'Transition',
      description:
        'Timing, easing, spring, and repeat configuration for an animation.',
    },
    {
      name: 'Variants',
      description:
        'Named map of animation states, e.g. { hidden: { opacity: 0 }, visible: { opacity: 1 } }.',
    },
    {
      name: 'Variant',
      description:
        'A single variant definition — a Target, TargetAndTransition, or TargetResolver.',
    },
    {
      name: 'VariantLabels',
      description:
        'String or string array referencing variant names defined in a Variants map.',
    },
    {
      name: 'MotionStyle',
      description:
        'Style object that accepts MotionValues alongside standard CSS values.',
    },
    {
      name: 'ResolvedValues',
      description:
        'Flat record of resolved CSS/transform values as strings or numbers.',
    },
    {
      name: 'AnimationDefinition',
      description:
        'Union type describing what to animate: a Target, VariantLabels, or a Variant.',
    },
    {
      name: 'AnimationPlaybackControls',
      description:
        'Returned handle for controlling a running animation (stop, pause, play, then).',
    },
    {
      name: 'AnimationState',
      description:
        'Internal state machine managing active animation targets and transitions.',
    },
    {
      name: 'KeyframeOptions',
      description:
        'Configuration for keyframe-based animations including duration, ease, and times.',
    },
    {
      name: 'SpringOptions',
      description:
        'Physics parameters for spring animations: stiffness, damping, mass, velocity.',
    },
    {
      name: 'InertiaOptions',
      description:
        'Configuration for inertia/decay animations: power, timeConstant, bounceDamping.',
    },
    {
      name: 'MotionNodeOptions',
      description:
        'Low-level options for a motion node including initial values and parent reference.',
    },
    {
      name: 'TargetResolver',
      description:
        'Function that dynamically resolves a Target at animation time, receiving transition info.',
    },
    {
      name: 'ReducedMotionConfig',
      description:
        'Reduced-motion preference: "always" (skip all), "never" (ignore preference), or "user".',
    },
  ];

  // ── Motion Values and Hooks ──
  readonly motionValueEntries: readonly (ApiEntry & { color: string })[] = [
    {
      name: 'useMotionValue',
      description:
        'Create a mutable value that drives animation and style outside change detection.',
      color: 'accent-purple',
    },
    {
      name: 'useSpring',
      description:
        'Wrap a value or MotionValue with spring physics for natural easing.',
      color: 'accent-purple',
    },
    {
      name: 'useTransform',
      description:
        'Derive values via mapping function, input/output ranges, or multi-input combiner.',
      color: 'accent-purple',
    },
    {
      name: 'useVelocity',
      description:
        'Track the instantaneous velocity of a MotionValue in pixels per second.',
      color: 'accent-purple',
    },
    {
      name: 'useTime',
      description:
        'Animation-frame timestamp as a MotionValue. Useful for continuous effects.',
      color: 'accent-purple',
    },
    {
      name: 'useMotionTemplate',
      description:
        'Build CSS strings from motion values using tagged template literals.',
      color: 'accent-purple',
    },
    {
      name: 'useMotionValueEvent',
      description:
        'Subscribe to change, animationStart, animationComplete, or animationCancel events.',
      color: 'accent-purple',
    },
    {
      name: 'useAnimationFrame',
      description:
        'Per-frame callback with (time, delta). For advanced manual animation loops.',
      color: 'accent-purple',
    },
    {
      name: 'useCycle',
      description:
        'Rotate through a list of values. Returns [signal, cycleFn].',
      color: 'accent-purple',
    },
    {
      name: 'useReducedMotion',
      description:
        'Returns an Angular signal tracking the prefers-reduced-motion media query.',
      color: 'accent-purple',
    },
    {
      name: 'useWillChange',
      description:
        'Creates a MotionValue for manual will-change CSS property control.',
      color: 'accent-purple',
    },
    {
      name: 'useInView',
      description:
        'Returns a signal that tracks whether a referenced element is in the viewport.',
      color: 'accent-purple',
    },
    {
      name: 'useScroll',
      description:
        'Returns scroll progress MotionValues bound to a container or the page.',
      color: 'accent-purple',
    },
    {
      name: 'isMotionValue',
      description:
        'Type guard to check whether a value is a MotionValue instance.',
      color: 'accent-gold',
    },
    {
      name: 'TransformOptions',
      description:
        'Configuration options for useTransform including clamping and easing.',
      color: 'accent-pink',
    },
    {
      name: 'UseInViewOptions',
      description:
        'Configuration for the useInView hook including root, margin, amount, and once.',
      color: 'accent-pink',
    },
  ];

  // ── Gestures and Drag ──
  readonly gestureEntries: readonly (ApiEntry & { color: string })[] = [
    {
      name: 'HoverFeature',
      description:
        'Feature class enabling hover gesture detection and whileHover animations.',
      color: 'accent-gold',
    },
    {
      name: 'PressFeature',
      description:
        'Feature class enabling press/tap gesture detection and whileTap animations.',
      color: 'accent-gold',
    },
    {
      name: 'FocusFeature',
      description:
        'Feature class enabling focus gesture detection and whileFocus animations.',
      color: 'accent-gold',
    },
    {
      name: 'InViewFeature',
      description:
        'Feature class enabling viewport detection and whileInView animations.',
      color: 'accent-gold',
    },
    {
      name: 'DragGesture',
      description:
        'Full drag gesture implementation with constraints, snap, and elastic boundaries.',
      color: 'accent-gold',
    },
    {
      name: 'PanGesture',
      description: 'Low-level pan gesture recognizer for custom drag behavior.',
      color: 'accent-gold',
    },
    {
      name: 'PanSession',
      description:
        'Manages pointer tracking state for a single pan/drag interaction.',
      color: 'accent-gold',
    },
    {
      name: 'VisualElementDragControls',
      description:
        'Internal drag controller bound to a visual element instance.',
      color: 'accent-gold',
    },
    {
      name: 'DragControls',
      description:
        'Imperative handle for starting drag from an external trigger element.',
      color: 'accent-gold',
    },
    {
      name: 'useDragControls',
      description:
        'Hook to create a DragControls instance for programmatic drag initiation.',
      color: 'accent-purple',
    },
    {
      name: 'EventInfo',
      description:
        'Pointer event metadata including point coordinates passed to gesture callbacks.',
      color: 'accent-pink',
    },
    {
      name: 'PressGestureInfo',
      description: 'Event info specific to press/tap gesture callbacks.',
      color: 'accent-pink',
    },
    {
      name: 'PanInfo',
      description:
        'Pan gesture data including point, delta, offset, and velocity.',
      color: 'accent-pink',
    },
    {
      name: 'DragDirection',
      description:
        'Union type for drag axis constraint: "x", "y", or unconstrained.',
      color: 'accent-pink',
    },
    {
      name: 'ViewportOptions',
      description:
        'Configuration for whileInView including once, amount, margin, and root.',
      color: 'accent-pink',
    },
    {
      name: 'Constraints',
      description:
        'Drag constraint boundaries as top/right/bottom/left pixel values.',
      color: 'accent-pink',
    },
    {
      name: 'BoundingBox',
      description:
        'Axis-aligned bounding box used for drag constraint calculations.',
      color: 'accent-pink',
    },
  ];

  // ── Presence ──
  readonly presenceEntries: readonly (ApiEntry & { color: string })[] = [
    {
      name: 'NgmPresenceDirective',
      description:
        'Structural directive that defers DOM removal until exit animations complete.',
      color: 'accent',
    },
    {
      name: 'PRESENCE_CONTEXT',
      description:
        'Injection token for the presence context shared between parent and children.',
      color: 'accent-gold',
    },
    {
      name: 'createPresenceContext',
      description:
        'Factory function to create a new presence context for custom presence wrappers.',
      color: 'accent-gold',
    },
    {
      name: 'NgmPresenceContext',
      description:
        'Interface describing the presence context shape (isPresent, onExitComplete).',
      color: 'accent-pink',
    },
    {
      name: 'ExitAnimationFeature',
      description:
        'Feature class that enables exit animation support on the visual element.',
      color: 'accent-gold',
    },
    {
      name: 'useIsPresent',
      description:
        'Hook returning a signal that indicates whether the element is currently present.',
      color: 'accent-purple',
    },
    {
      name: 'usePresence',
      description:
        'Hook returning [isPresent, safeToRemove] for manual exit animation orchestration.',
      color: 'accent-purple',
    },
    {
      name: 'usePresenceList',
      description:
        'Hook that derives stable layout metadata (visible IDs, gap markers) for presence-driven lists with exiting items.',
      color: 'accent-purple',
    },
    {
      name: 'PresenceListState',
      description:
        'Signals returned by usePresenceList: visibleIds, visibleById, and gapAfter.',
      color: 'accent-pink',
    },
    {
      name: 'UsePresenceListOptions',
      description:
        'Configuration for usePresenceList including getId mapper and optional exitingIds signal.',
      color: 'accent-pink',
    },
  ];

  // ── Layout ──
  readonly layoutEntries: readonly (ApiEntry & { color: string })[] = [
    {
      name: 'NgmLayoutGroupDirective',
      description:
        'Groups elements for coordinated layout animations using shared FLIP contexts.',
      color: 'accent',
    },
    {
      name: '[layoutDependency]',
      description:
        'Input on NgmMotionDirective. When this value changes, a FLIP layout animation cycle is triggered. Use to animate layout shifts caused by data changes.',
      color: 'accent',
    },
    {
      name: 'LAYOUT_GROUP',
      description:
        'Injection token for the layout group context shared across siblings.',
      color: 'accent-gold',
    },
    {
      name: 'LayoutGroupContextProps',
      description:
        'Interface for the layout group context including id and force-render callback.',
      color: 'accent-pink',
    },
  ];

  // ── Scroll ──
  readonly scrollEntries: readonly (ApiEntry & { color: string })[] = [
    {
      name: 'scroll',
      description:
        'Bind a callback or animation to scroll progress for a container or the page.',
      color: 'accent-gold',
    },
    {
      name: 'scrollInfo',
      description:
        'Low-level scroll info tracker that fires a callback with axis data on every scroll.',
      color: 'accent-gold',
    },
    {
      name: 'ScrollOffset',
      description:
        'Predefined scroll offset presets (e.g., enter, exit, any) for scroll-linked triggers.',
      color: 'accent-gold',
    },
    {
      name: 'ScrollOptions',
      description:
        'Configuration for scroll() including target, axis, offset, and container.',
      color: 'accent-pink',
    },
    {
      name: 'ScrollInfo',
      description:
        'Full scroll info object containing x and y axis scroll data.',
      color: 'accent-pink',
    },
    {
      name: 'AxisScrollInfo',
      description:
        'Per-axis scroll data including current, offset, progress, velocity, and more.',
      color: 'accent-pink',
    },
    {
      name: 'OnScroll',
      description:
        'Callback type for scroll progress updates (receives progress number).',
      color: 'accent-pink',
    },
    {
      name: 'OnScrollInfo',
      description:
        'Callback type for low-level scroll info updates (receives ScrollInfo).',
      color: 'accent-pink',
    },
    {
      name: 'ScrollInfoOptions',
      description: 'Options for the scrollInfo utility function.',
      color: 'accent-pink',
    },
    {
      name: 'ScrollOffsetType',
      description:
        'Union type for scroll offset values: number, string, or named preset.',
      color: 'accent-pink',
    },
    {
      name: 'UseScrollOptions',
      description: 'Configuration for the useScroll hook.',
      color: 'accent-pink',
    },
    {
      name: 'ScrollMotionValues',
      description:
        'Object containing scrollX, scrollY, scrollXProgress, and scrollYProgress MotionValues.',
      color: 'accent-pink',
    },
  ];

  // ── Reorder ──
  readonly reorderEntries: readonly (ApiEntry & { color: string })[] = [
    {
      name: 'NgmReorderGroupDirective',
      description:
        'Container directive for a reorderable list. Manages drag-to-reorder state.',
      color: 'accent',
    },
    {
      name: 'NgmReorderItemDirective',
      description:
        'Item directive within a reorder group. Handles drag interaction and layout animation.',
      color: 'accent',
    },
    {
      name: 'REORDER_CONTEXT',
      description:
        'Injection token for the reorder context shared between group and items.',
      color: 'accent-gold',
    },
    {
      name: 'checkReorder',
      description:
        'Utility to calculate new item order based on current drag position.',
      color: 'accent-gold',
    },
    {
      name: 'autoScrollIfNeeded',
      description:
        'Automatically scrolls the container when dragging near its edges.',
      color: 'accent-gold',
    },
    {
      name: 'resetAutoScrollState',
      description: 'Resets auto-scroll velocity state after a drag ends.',
      color: 'accent-gold',
    },
    {
      name: 'ReorderContextProps',
      description:
        'Interface for the reorder group context including axis and register/unregister.',
      color: 'accent-pink',
    },
    {
      name: 'ItemData',
      description:
        'Internal data shape for tracked reorder items (value, layout, element).',
      color: 'accent-pink',
    },
  ];

  // ── Imperative Animation ──
  readonly imperativeEntries: readonly (ApiEntry & { color: string })[] = [
    {
      name: 'animate',
      description:
        'Imperatively animate one or more elements, motion values, or run a sequence.',
      color: 'accent-gold',
    },
    {
      name: 'stagger',
      description:
        'Generate staggered delay values for sequencing child animations.',
      color: 'accent-gold',
    },
    {
      name: 'useAnimate',
      description:
        'Hook returning [scope, animate] for scoped imperative animations within a component.',
      color: 'accent-purple',
    },
    {
      name: 'ScopedAnimate',
      description:
        'Type for the scoped animate function returned by useAnimate.',
      color: 'accent-pink',
    },
    {
      name: 'createAnimationsFromSequence',
      description:
        'Convert an AnimationSequence definition into concrete animation descriptions.',
      color: 'accent-gold',
    },
    {
      name: 'AnimationSequence',
      description:
        'Array type for defining sequenced animation steps with timing.',
      color: 'accent-pink',
    },
    {
      name: 'SequenceOptions',
      description:
        'Global options for an animation sequence (delay, duration, repeat).',
      color: 'accent-pink',
    },
    {
      name: 'SequenceTime',
      description:
        'Type for specifying absolute or relative time positions in a sequence.',
      color: 'accent-pink',
    },
  ];

  // ── Feature Loading ──
  readonly featureEntries: readonly (ApiEntry & { color: string })[] = [
    {
      name: 'provideMotionFeatures',
      description:
        'Provider factory to register specific motion features (gestures, layout, exit, etc.).',
      color: 'accent-gold',
    },
    {
      name: 'ngmAnimationFeatures',
      description:
        'Standard feature bundle including animation engine, hover, tap, focus, in-view, pan, and exit.',
      color: 'accent-gold',
    },
    {
      name: 'ngmAllFeatures',
      description:
        'Full feature bundle including animation, gestures, exit, drag, and layout projection.',
      color: 'accent-gold',
    },
    {
      name: 'NgmFeatureBundle',
      description:
        'Type for a synchronous feature bundle object (partial FeatureDefinitions).',
      color: 'accent-pink',
    },
    {
      name: 'NgmLazyFeatureBundle',
      description:
        'Type for a lazily loaded feature bundle via dynamic import.',
      color: 'accent-pink',
    },
    {
      name: 'initNgmFeatures',
      description:
        'Initialize features synchronously at application bootstrap.',
      color: 'accent-gold',
    },
    {
      name: 'loadNgmFeatures',
      description:
        'Merge additional feature definitions into the registry at runtime.',
      color: 'accent-gold',
    },
  ];

  // ── Visual Element Adapters ──
  readonly visualElementEntries: readonly ApiEntry[] = [
    {
      name: 'createVisualElement',
      description:
        'Factory to create an HTML visual element instance from a DOM element.',
    },
    {
      name: 'mountVisualElement',
      description:
        'Mount a visual element, binding it to the DOM and starting observation.',
    },
    {
      name: 'updateVisualElement',
      description:
        'Push new props (targets, transitions, variants) to a mounted visual element.',
    },
    {
      name: 'unmountVisualElement',
      description:
        'Teardown a visual element, cancelling animations and removing listeners.',
    },
    {
      name: 'createHtmlVisualState',
      description: 'Create initial visual state for an HTML element.',
    },
    {
      name: 'createHtmlRenderState',
      description:
        'Create the mutable render state object for HTML element rendering.',
    },
    {
      name: 'createSvgVisualElement',
      description:
        'Factory to create an SVG visual element with SVG-specific attribute handling.',
    },
    {
      name: 'createSvgVisualState',
      description: 'Create initial visual state for an SVG element.',
    },
    {
      name: 'createSvgRenderState',
      description: 'Create the mutable render state object for SVG rendering.',
    },
    {
      name: 'isSVGElement',
      description:
        'Check whether a DOM element is an SVG element (excluding <svg> root).',
    },
    {
      name: 'onCleanup',
      description:
        'Register a cleanup callback tied to the current injection context lifecycle.',
    },
    {
      name: 'resolveInput',
      description: 'Resolve a signal or plain value to its current value.',
    },
    {
      name: 'motionValue',
      description:
        'Low-level factory to create a raw MotionValue without injection context.',
    },
    {
      name: 'animateValue',
      description:
        'Animate a MotionValue to a target with a given transition configuration.',
    },
    {
      name: 'animateSingleValue',
      description:
        'Animate a single CSS property value from its current state to a target.',
    },
    {
      name: 'frame',
      description:
        'Schedule a callback on the next animation frame via the shared frame loop.',
    },
    {
      name: 'cancelFrame',
      description: 'Cancel a previously scheduled frame callback.',
    },
  ];

  // ── Next steps ──
  readonly nextLinks = [
    {
      path: '/docs/getting-started',
      title: 'Getting Started',
      description: 'Installation, setup, and your first animation',
    },
    {
      path: '/docs/motion-directive',
      title: 'Motion Directive',
      description: 'Full directive inputs, outputs, and usage patterns',
    },
    {
      path: '/docs/motion-values',
      title: 'Motion Values',
      description: 'Reactive animation primitives and hooks',
    },
    {
      path: '/docs/gestures',
      title: 'Gestures',
      description: 'Hover, tap, drag, and focus interactions',
    },
  ];
}
