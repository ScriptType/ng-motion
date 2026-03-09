import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { CodeBlockComponent } from '../../components/code-block.component';

@Component({
  selector: 'app-performance',
  imports: [RouterLink, NgmMotionDirective, CodeBlockComponent],
  template: `
    <article class="max-w-3xl pb-16">
      <!-- Header -->
      <div
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
      >
        <h1 class="font-display font-bold text-4xl mb-4">Performance</h1>
        <p class="text-lg text-secondary mb-12 leading-relaxed">
          ng-motion is built on
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >motion-dom</code
          >&rsquo;s Web Animations API engine. Most animations run entirely
          outside Angular change detection, giving you smooth 60fps motion
          without the overhead of zone-triggered re-renders.
        </p>
      </div>

      <!-- ═══════════════ MotionValue vs Signal ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.1 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          MotionValue vs Signal
        </h2>
        <p class="text-secondary mb-6">
          Both
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >MotionValue</code
          >
          and Angular
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >signal()</code
          >
          hold reactive state, but they serve different purposes. Choosing the
          right one for each use case is the single biggest performance lever in
          ng-motion.
        </p>

        <!-- Comparison table -->
        <div class="rounded-xl border border-border overflow-hidden mb-6">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border bg-elevated/50">
                <th class="text-left px-4 py-2.5 font-mono text-xs text-muted">
                </th>
                <th class="text-left px-4 py-2.5 font-mono text-xs text-muted">
                  MotionValue
                </th>
                <th class="text-left px-4 py-2.5 font-mono text-xs text-muted">
                  Signal
                </th>
              </tr>
            </thead>
            <tbody class="bg-code-bg">
              @for (row of comparisonRows; track row.aspect) {
                <tr class="border-b border-border/50 last:border-0">
                  <td class="px-4 py-2.5 font-medium text-primary">
                    {{ row.aspect }}
                  </td>
                  <td class="px-4 py-2.5 text-secondary">
                    {{ row.motionValue }}
                  </td>
                  <td class="px-4 py-2.5 text-secondary">
                    {{ row.signal }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <!-- ═══════════════ The Golden Rule ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.2 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          The golden rule
        </h2>
        <p class="text-secondary mb-6">
          <strong class="text-primary"
            >High-frequency values belong in MotionValues. Application state
            belongs in Signals.</strong
          >
          Drag position, spring interpolation, scroll progress, and any value
          that changes multiple times per frame should never flow through Angular
          change detection. MotionValues update the DOM directly via the WAAPI
          engine, skipping the framework entirely.
        </p>

        <div
          class="rounded-xl border border-border bg-surface/30 p-6 space-y-4"
        >
          <div class="flex items-start gap-3">
            <div
              class="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 mt-2"
            ></div>
            <p class="text-secondary">
              <strong class="text-primary">MotionValue:</strong> drag
              position, spring output, scroll progress, interpolated colors,
              frame-by-frame transforms
            </p>
          </div>
          <div class="flex items-start gap-3">
            <div
              class="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 mt-2"
            ></div>
            <p class="text-secondary">
              <strong class="text-primary">Signal:</strong> toggle states
              (open/closed), selected item index, form values, anything that
              drives template conditionals
            </p>
          </div>
          <div class="flex items-start gap-3">
            <div
              class="w-2 h-2 rounded-full bg-red-400 flex-shrink-0 mt-2"
            ></div>
            <p class="text-secondary">
              <strong class="text-primary">Avoid:</strong> mirroring
              MotionValue updates into signals on every frame. This defeats the
              purpose of keeping animation values out of change detection.
            </p>
          </div>
        </div>

        <app-code-block [code]="goldenRuleCode" lang="typescript" filename="component.ts" class="mt-6" />
      </section>

      <!-- ═══════════════ will-change Management ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.3 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          will-change management
        </h2>
        <p class="text-secondary mb-6">
          ng-motion automatically sets
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >will-change</code
          >
          on elements before they animate and removes it when the animation
          completes. This hints the browser to promote the element to its own
          compositing layer, avoiding expensive repaints during motion.
        </p>

        <div
          class="rounded-xl border border-border bg-surface/30 p-6 space-y-4 mb-6"
        >
          <div class="flex items-start gap-3">
            <div
              class="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2"
            ></div>
            <p class="text-secondary">
              <strong class="text-primary">Automatic:</strong> The directive
              adds
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >will-change: transform, opacity</code
              >
              (or whichever properties are animated) right before an animation
              starts, and cleans it up when the animation settles.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <div
              class="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2"
            ></div>
            <p class="text-secondary">
              <strong class="text-primary">Manual control:</strong> Use
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >useWillChange()</code
              >
              to create a MotionValue that you can pass to the
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >style</code
              >
              input for explicit will-change control.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <div
              class="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 mt-2"
            ></div>
            <p class="text-secondary">
              <strong class="text-primary">Don't overuse it.</strong> Every
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >will-change</code
              >
              hint creates a new compositing layer, consuming GPU memory. If you
              promote hundreds of elements simultaneously you can cause jank
              instead of preventing it. Let ng-motion manage it automatically
              whenever possible.
            </p>
          </div>
        </div>

        <app-code-block [code]="willChangeCode" lang="typescript" filename="component.ts" />
      </section>

      <!-- ═══════════════ Reduced Motion ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.4 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Reduced motion
        </h2>
        <p class="text-secondary mb-6">
          Some users enable the
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >prefers-reduced-motion</code
          >
          media query at the OS level to minimize vestibular-trigger animations.
          ng-motion provides two ways to respect this preference.
        </p>

        <app-code-block [code]="reducedMotionCode" lang="typescript" filename="component.ts" class="mb-6" />

        <app-code-block [code]="reducedMotionGlobalCode" lang="typescript" filename="app.config.ts" />

        <div class="rounded-xl border border-border overflow-hidden mt-6">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border bg-elevated/50">
                <th class="text-left px-4 py-2.5 font-mono text-xs text-muted">
                  Policy
                </th>
                <th class="text-left px-4 py-2.5 font-mono text-xs text-muted">
                  Behavior
                </th>
              </tr>
            </thead>
            <tbody class="bg-code-bg">
              @for (row of reducedMotionPolicies; track row.policy) {
                <tr class="border-b border-border/50 last:border-0">
                  <td class="px-4 py-2.5">
                    <code
                      class="text-accent-pink font-mono text-xs px-1.5 py-0.5 rounded bg-accent-pink/10"
                      >{{ row.policy }}</code
                    >
                  </td>
                  <td class="px-4 py-2.5 text-secondary">{{ row.behavior }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <!-- ═══════════════ Performance Tips ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.5 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Performance tips
        </h2>
        <div
          class="rounded-xl border border-border bg-surface/30 p-6 space-y-4"
        >
          @for (tip of perfTips; track tip.title) {
            <div class="flex items-start gap-3">
              <div
                class="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2"
              ></div>
              <p class="text-secondary">
                <strong class="text-primary">{{ tip.title }}</strong>
                {{ tip.body }}
              </p>
            </div>
          }
        </div>

        <h3 class="font-display font-semibold text-lg mt-8 mb-4">
          useMotionValueEvent example
        </h3>
        <p class="text-secondary mb-4">
          Instead of subscribing to every frame update, use
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >useMotionValueEvent()</code
          >
          to respond to discrete lifecycle events on a MotionValue. The
          subscription is automatically cleaned up when the injection context
          is destroyed.
        </p>
        <app-code-block [code]="motionValueEventCode" lang="typescript" filename="component.ts" class="mb-8" />

        <h3 class="font-display font-semibold text-lg mt-8 mb-4">
          Frame scheduling example
        </h3>
        <p class="text-secondary mb-4">
          Use
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >frame.read()</code
          >
          and
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >frame.render()</code
          >
          to batch DOM measurements and mutations in the correct order,
          preventing layout thrashing.
        </p>
        <app-code-block [code]="frameSchedulingCode" lang="typescript" filename="component.ts" />
      </section>

      <!-- ═══════════════ Next Steps ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.6 }"
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
export class PerformancePage {
  // ── Comparison table data ──────────────────────────────────────

  readonly comparisonRows = [
    {
      aspect: 'Update mechanism',
      motionValue: 'Direct DOM mutation via WAAPI',
      signal: 'Triggers Angular change detection',
    },
    {
      aspect: 'Update frequency',
      motionValue: 'Every animation frame (60+ fps)',
      signal: 'On discrete state changes',
    },
    {
      aspect: 'Zone interaction',
      motionValue: 'Runs outside NgZone',
      signal: 'Runs inside NgZone by default',
    },
    {
      aspect: 'Template binding',
      motionValue: 'Not directly bindable in templates',
      signal: 'Bindable via signal() call',
    },
    {
      aspect: 'Best for',
      motionValue: 'Drag, spring, scroll, transforms',
      signal: 'Toggle states, form values, UI flags',
    },
    {
      aspect: 'Composability',
      motionValue: 'useTransform, useSpring chains',
      signal: 'computed(), effect()',
    },
  ];

  // ── Reduced motion policies ────────────────────────────────────

  readonly reducedMotionPolicies = [
    {
      policy: "'user'",
      behavior:
        'Respects the OS prefers-reduced-motion setting. Animations are replaced with instant transitions when enabled.',
    },
    {
      policy: "'always'",
      behavior:
        'Always reduces motion regardless of OS setting. Useful for motion-sensitive contexts.',
    },
    {
      policy: "'never'",
      behavior:
        'Never reduces motion. Use with caution — this overrides user accessibility preferences.',
    },
  ];

  // ── Performance tips ───────────────────────────────────────────

  readonly perfTips = [
    {
      title: 'Keep transforms and opacity as motion values.',
      body: 'These properties are GPU-composited. Animating them via MotionValues avoids layout recalculation and stays on the compositor thread.',
    },
    {
      title: "Don't mirror frame-by-frame motion into Angular state.",
      body: 'Subscribing to a MotionValue and writing to a signal() on every frame creates unnecessary change detection cycles. Use useMotionValueEvent() for discrete callbacks instead.',
    },
    {
      title: 'Use whileInView for lazy animation triggering.',
      body: 'Elements below the fold don\'t need to animate on page load. Bind animations to whileInView with viewport: { once: true } so they only fire when scrolled into view.',
    },
    {
      title: 'Batch DOM reads and writes via frame scheduling.',
      body: "Import frame and cancelFrame from '@scripttype/ng-motion' to schedule DOM measurements and mutations in the correct order, avoiding layout thrashing.",
    },
    {
      title: 'Prefer spring transitions for interactive gestures.',
      body: 'Springs respond to velocity changes instantly and feel more responsive than duration-based tweens for drag, hover, and tap feedback.',
    },
    {
      title: 'Limit simultaneous layout animations.',
      body: 'Each layout-animated element triggers a FLIP measurement. Animating dozens of layout elements at once can cause frame drops. Batch or stagger them instead.',
    },
  ];

  // ── Code snippets ──────────────────────────────────────────────

  readonly goldenRuleCode = [
    "import { useMotionValue, useTransform } from '@scripttype/ng-motion';",
    '',
    '// Good: high-frequency value stays as MotionValue',
    'readonly x = useMotionValue(0);',
    "readonly background = useTransform(this.x, [-100, 0, 100], ['#ff0000', '#00ff00', '#0000ff']);",
    '',
    '// Good: discrete app state uses Signal',
    'readonly isOpen = signal(false);',
    '',
    '// Bad: mirroring motion into signal on every frame',
    "// this.x.on('change', v => this.xSignal.set(v));  // Don't do this!",
  ].join('\n');

  readonly willChangeCode = [
    "import { useWillChange } from '@scripttype/ng-motion';",
    '',
    '// Manual will-change control for complex animations',
    'readonly willChange = useWillChange();',
    '',
    '// In the template:',
    '// <div ngmMotion',
    '//   [animate]="{ x: 100 }"',
    '//   [style]="{ willChange }"',
    '// >',
  ].join('\n');

  readonly reducedMotionCode = [
    "import { useReducedMotion } from '@scripttype/ng-motion';",
    '',
    '// Returns an Angular signal that tracks the OS setting',
    'readonly prefersReduced = useReducedMotion();',
    '',
    '// Use in template:',
    '// [animate]="prefersReduced() ? {} : { scale: 1.1, rotate: 5 }"',
  ].join('\n');

  readonly reducedMotionGlobalCode = [
    "import { provideMotionConfig } from '@scripttype/ng-motion';",
    '',
    'export const appConfig = {',
    '  providers: [',
    "    provideMotionConfig({ reducedMotion: 'user' }),",
    '  ],',
    '};',
  ].join('\n');

  readonly motionValueEventCode = [
    "import { useMotionValue, useMotionValueEvent } from '@scripttype/ng-motion';",
    '',
    '@Component({ /* ... */ })',
    'export class MyComponent {',
    '  // Create a motion value for horizontal position',
    '  readonly x = useMotionValue(0);',
    '',
    '  constructor() {',
    "    // React to discrete events — no per-frame signal writes",
    "    useMotionValueEvent(this.x, 'change', (latest) => {",
    "      console.log('x changed to', latest);",
    '    });',
    '',
    "    useMotionValueEvent(this.x, 'animationStart', () => {",
    "      console.log('animation started');",
    '    });',
    '',
    "    useMotionValueEvent(this.x, 'animationComplete', () => {",
    "      console.log('animation finished');",
    '    });',
    '',
    '    // Cleanup is automatic when the component is destroyed',
    '  }',
    '}',
  ].join('\n');

  readonly frameSchedulingCode = [
    "import { frame, cancelFrame } from '@scripttype/ng-motion';",
    '',
    '// Batch DOM reads and writes to avoid layout thrashing',
    'frame.read(() => {',
    '  const box = element.getBoundingClientRect();',
    '  // ... store measurements',
    '});',
    '',
    'frame.render(() => {',
    "  element.style.transform = 'translateX(100px)';",
    '});',
    '',
    '// Cancel a scheduled callback',
    'const process = frame.render(() => { /* ... */ });',
    'cancelFrame(process);',
  ].join('\n');

  // ── Next steps ─────────────────────────────────────────────────

  readonly nextLinks = [
    {
      path: '/docs/feature-loading',
      title: 'Feature Loading \u2192',
      description: 'Control which features are loaded and when',
    },
    {
      path: '/docs/motion-values',
      title: 'Motion Values \u2192',
      description: 'Track and transform animation values reactively',
    },
    {
      path: '/docs/transitions',
      title: 'Transitions \u2192',
      description: 'Spring, tween, and inertia configuration',
    },
    {
      path: '/docs/gestures',
      title: 'Gestures \u2192',
      description: 'Hover, tap, drag, and focus interactions',
    },
  ];
}
