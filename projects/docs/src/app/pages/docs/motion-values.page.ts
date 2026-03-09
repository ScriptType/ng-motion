import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  NgmMotionDirective,
  useMotionValue,
  useSpring,
  useTime,
  useTransform,
  type MotionStyle,
  type SpringOptions,
} from 'ng-motion';
import { CodeBlockComponent } from '../../components/code-block.component';

@Component({
  selector: 'app-motion-values',
  imports: [RouterLink, NgmMotionDirective, CodeBlockComponent],
  template: `
    <article class="max-w-3xl pb-16">
      <!-- Header -->
      <div
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
      >
        <h1 class="font-display font-bold text-4xl mb-4">Motion Values</h1>
        <p class="text-lg text-secondary mb-12 leading-relaxed">
          MotionValues are for high-frequency animated state. They update outside
          Angular's change detection and feed directly into motion styles &mdash;
          no
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >markForCheck</code
          >
          or
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >signal</code
          >
          required.
        </p>
      </div>

      <!-- Signals vs MotionValues -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.1 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Signals vs MotionValues
        </h2>
        <p class="text-secondary mb-6">
          Angular signals and MotionValues serve different purposes. Use the right
          tool for the job:
        </p>

        <div
          class="rounded-xl border border-border bg-surface/30 overflow-hidden"
        >
          <div class="grid grid-cols-3 border-b border-border px-5 py-3">
            <span
              class="text-xs text-muted font-mono uppercase tracking-wider"
            ></span>
            <span class="text-xs text-muted font-mono uppercase tracking-wider"
              >Signal</span
            >
            <span class="text-xs text-muted font-mono uppercase tracking-wider"
              >MotionValue</span
            >
          </div>
          @for (row of comparisonRows; track row.label) {
            <div
              class="grid grid-cols-3 border-b border-border/50 px-5 py-3.5 items-center"
            >
              <span class="text-sm text-secondary font-medium">{{
                row.label
              }}</span>
              <span class="text-sm text-secondary">{{ row.signal }}</span>
              <span class="text-sm text-secondary">{{ row.motionValue }}</span>
            </div>
          }
        </div>
      </section>

      <!-- useMotionValue -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.2 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">useMotionValue</h2>
        <p class="text-secondary mb-6">
          Creates a mutable value that drives animation and style. Call
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >.set()</code
          >
          to update it &mdash; the DOM updates on the next animation frame with
          zero change detection cycles.
        </p>

        <app-code-block [code]="useMotionValueCode" lang="typescript" filename="component.ts" class="mb-6" />

        <!-- Live demo: range slider -->
        <div
          class="rounded-xl border border-border p-10 bg-surface/30 flex flex-col items-center justify-center gap-6"
        >
          <div class="relative w-full h-16 flex items-center justify-center">
            <div
              ngmMotion
              [style]="demoStyle"
              class="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-accent-purple"
            ></div>
          </div>
          <input
            type="range"
            min="0"
            max="300"
            [value]="sliderValue()"
            (input)="setX($event)"
            class="w-full max-w-xs accent-accent cursor-pointer"
          />
          <p class="text-xs text-muted font-mono">
            Drag the slider &mdash; spring follows, opacity transforms
          </p>
        </div>
      </section>

      <!-- useSpring -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.3 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">useSpring</h2>
        <p class="text-secondary mb-6">
          Wraps a value or another MotionValue with spring physics. The returned
          MotionValue follows its source with natural, springy easing. Configure
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >stiffness</code
          >,
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >damping</code
          >, and
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >mass</code
          >
          to tune the feel.
        </p>

        <app-code-block [code]="useSpringCode" lang="typescript" filename="spring.ts" class="mb-6" />
      </section>

      <!-- useTransform -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.4 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">useTransform</h2>
        <p class="text-secondary mb-6">
          Creates a derived MotionValue that updates whenever its source changes.
          Three signatures cover the common cases:
        </p>

        <app-code-block [code]="useTransformCode" lang="typescript" filename="transform.ts" class="mb-6" />
      </section>

      <!-- Full example -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.5 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Putting it together
        </h2>
        <p class="text-secondary mb-6">
          A complete example combining
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >useMotionValue</code
          >,
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >useSpring</code
          >, and
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >useTransform</code
          >
          to build a spring-driven slider with derived opacity:
        </p>

        <app-code-block [code]="fullExampleCode" lang="typescript" filename="motion-value.component.ts" class="mb-6" />
      </section>

      <!-- Hook reference table -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.6 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Hook reference</h2>
        <p class="text-secondary mb-6">
          All motion value hooks available in ng-motion:
        </p>

        <div
          class="rounded-xl border border-border bg-surface/30 overflow-hidden"
        >
          <div class="grid grid-cols-[200px_1fr] border-b border-border px-5 py-3">
            <span class="text-xs text-muted font-mono uppercase tracking-wider"
              >Hook</span
            >
            <span class="text-xs text-muted font-mono uppercase tracking-wider"
              >Description</span
            >
          </div>
          @for (hook of hooks; track hook.name) {
            <div
              class="grid grid-cols-[200px_1fr] border-b border-border/50 px-5 py-3.5 items-start"
            >
              <code class="text-sm font-mono text-accent">{{ hook.name }}</code>
              <span class="text-sm text-secondary">{{ hook.description }}</span>
            </div>
          }
        </div>
      </section>

      <!-- useVelocity -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.7 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">useVelocity</h2>
        <p class="text-secondary mb-6">
          Track the instantaneous velocity of a MotionValue in px/s. Useful for
          skew-on-drag, trail effects, and velocity-dependent visuals.
        </p>
        <app-code-block [code]="useVelocityCode" lang="typescript" filename="component.ts" class="mb-6" />
      </section>

      <!-- useTime -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.8 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">useTime</h2>
        <p class="text-secondary mb-6">
          Returns a MotionValue that updates every frame with milliseconds since
          mount. Use for continuous rotation, pulsing, or any time-based effect
          without manual requestAnimationFrame.
        </p>
        <app-code-block [code]="useTimeCode" lang="typescript" filename="component.ts" class="mb-6" />

        <!-- Live demo: continuous rotation -->
        <div class="rounded-xl border border-border p-10 bg-surface/30 flex flex-col items-center justify-center gap-4">
          <div
            ngmMotion
            [style]="timeStyle"
            class="w-16 h-16 rounded-xl bg-gradient-to-br from-accent to-accent-purple"
          ></div>
          <p class="text-xs text-muted font-mono">Continuous rotation via useTime + useTransform</p>
        </div>
      </section>

      <!-- useMotionTemplate -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.9 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">useMotionTemplate</h2>
        <p class="text-secondary mb-6">
          Build reactive CSS strings from MotionValues using a tagged template
          literal. The result is a
          <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">MotionValue&lt;string&gt;</code>
          that updates whenever any interpolated value changes.
        </p>
        <app-code-block [code]="useMotionTemplateCode" lang="typescript" filename="component.ts" class="mb-6" />
      </section>

      <!-- useAnimationFrame -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 1.0 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">useAnimationFrame</h2>
        <p class="text-secondary mb-6">
          Register a per-frame callback with
          <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">(time, delta)</code>
          arguments. Automatically cleaned up when the component is destroyed.
          Use for physics simulations, particles, or manual animation loops.
        </p>
        <app-code-block [code]="useAnimationFrameCode" lang="typescript" filename="component.ts" class="mb-6" />
      </section>

      <!-- useMotionValueEvent -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 1.1 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">useMotionValueEvent</h2>
        <p class="text-secondary mb-6">
          Subscribe to MotionValue lifecycle events outside Angular's zone.
          Events:
          <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">'change'</code>,
          <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">'animationStart'</code>,
          <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">'animationComplete'</code>,
          <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">'animationCancel'</code>.
        </p>
        <app-code-block [code]="useMotionValueEventCode" lang="typescript" filename="component.ts" class="mb-6" />
      </section>

      <!-- useWillChange -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 1.2 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">useWillChange</h2>
        <p class="text-secondary mb-6">
          Creates a MotionValue that automatically manages the
          <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">will-change</code>
          CSS property during animations, providing GPU compositing hints for
          smoother performance.
        </p>
        <app-code-block [code]="useWillChangeCode" lang="typescript" filename="component.ts" class="mb-6" />
      </section>

      <!-- useReducedMotion -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 1.3 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">useReducedMotion</h2>
        <p class="text-secondary mb-6">
          Returns a
          <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">Signal&lt;boolean&gt;</code>
          that tracks the
          <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">prefers-reduced-motion</code>
          media query. Use it to swap spring animations for instant transitions
          when the user prefers reduced motion.
        </p>
        <app-code-block [code]="useReducedMotionCode" lang="typescript" filename="component.ts" class="mb-6" />
      </section>

      <!-- Injection context -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 1.4 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Injection context
        </h2>
        <p class="text-secondary mb-6">
          Most hooks register cleanup logic through Angular's injection context.
          This means they must be called from one of three places:
        </p>

        <div
          class="rounded-xl border border-border bg-surface/30 p-6 space-y-4"
        >
          <div class="flex items-start gap-3">
            <div
              class="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2"
            ></div>
            <div>
              <p class="text-secondary">
                <strong class="text-primary">Field initializer</strong> &mdash;
                the most common. Declare as a class property and it runs during
                construction.
              </p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <div
              class="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2"
            ></div>
            <div>
              <p class="text-secondary">
                <strong class="text-primary">Constructor body</strong> &mdash;
                use when you need imperative setup logic.
              </p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <div
              class="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2"
            ></div>
            <div>
              <p class="text-secondary">
                <strong class="text-primary">runInInjectionContext()</strong>
                &mdash; for deferred creation, e.g. inside an
                <code
                  class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                  >afterNextRender</code
                >
                callback.
              </p>
            </div>
          </div>
        </div>

        <app-code-block [code]="injectionContextCode" lang="typescript" filename="injection-context.ts" class="mt-6" />
      </section>

      <!-- Performance best practices -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 1.5 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Performance best practices
        </h2>
        <p class="text-secondary mb-6">
          MotionValues bypass change detection by design. Follow these rules to
          keep it that way:
        </p>

        <div
          class="rounded-xl border border-border bg-surface/30 p-6 space-y-4"
        >
          <div class="flex items-start gap-3">
            <div
              class="w-2 h-2 rounded-full bg-accent-pink flex-shrink-0 mt-2"
            ></div>
            <p class="text-secondary">
              <strong class="text-primary"
                >Don't mirror into template state.</strong
              >
              Avoid copying every MotionValue change into a signal or subject
              just to display it. Use
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >[style]</code
              >
              bindings with a
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >MotionStyle</code
              >
              object instead.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <div
              class="w-2 h-2 rounded-full bg-accent-pink flex-shrink-0 mt-2"
            ></div>
            <p class="text-secondary">
              <strong class="text-primary">Keep hot paths in MotionValue land.</strong>
              Chain
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >useTransform</code
              >
              and
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >useSpring</code
              >
              to derive values reactively without triggering Angular's zone.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <div
              class="w-2 h-2 rounded-full bg-accent-pink flex-shrink-0 mt-2"
            ></div>
            <p class="text-secondary">
              <strong class="text-primary"
                >Use useMotionValueEvent for side effects.</strong
              >
              When you need to react to a value crossing a threshold,
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >useMotionValueEvent</code
              >
              fires outside the zone &mdash; you decide when to enter it.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <div
              class="w-2 h-2 rounded-full bg-accent-pink flex-shrink-0 mt-2"
            ></div>
            <p class="text-secondary">
              <strong class="text-primary">Prefer useSpring over manual animation.</strong>
              Springs automatically settle and stop updating. A manual
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >useAnimationFrame</code
              >
              loop runs every frame until you stop it.
            </p>
          </div>
        </div>
      </section>

      <!-- Next steps -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 1.6 }"
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
export class MotionValuesPage {
  // ── Live demo state ──
  readonly springOpts: SpringOptions = { stiffness: 320, damping: 28 };
  readonly rawX = useMotionValue(150);
  readonly x = useSpring(this.rawX, this.springOpts);
  readonly opacity = useTransform(this.x, [0, 150, 300], [0.3, 1, 0.3]);
  readonly demoStyle: MotionStyle = { x: this.x, opacity: this.opacity };
  readonly sliderValue = signal(150);

  // ── useTime live demo ──
  readonly time = useTime();
  readonly rotate = useTransform(this.time, (t) => (t / 1000) * 360 % 360);
  readonly timeStyle: MotionStyle = { rotate: this.rotate };

  setX(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.rawX.set(value);
    this.sliderValue.set(value);
  }

  // ── Comparison table ──
  readonly comparisonRows = [
    {
      label: 'Update frequency',
      signal: 'Low (UI state)',
      motionValue: 'High (60fps animation)',
    },
    {
      label: 'Change detection',
      signal: 'Triggers re-render',
      motionValue: 'Bypasses entirely',
    },
    {
      label: 'Template binding',
      signal: '{{ signal() }}',
      motionValue: '[style]="motionStyle"',
    },
    {
      label: 'Composability',
      signal: 'computed()',
      motionValue: 'useTransform / useSpring',
    },
    {
      label: 'Best for',
      signal: 'App state, form values',
      motionValue: 'Animated styles, gestures',
    },
  ];

  // ── Code examples ──
  readonly useMotionValueCode = [
    "import { useMotionValue, type MotionStyle } from 'ng-motion';",
    '',
    'export class MyComponent {',
    '  // Create a motion value with an initial value',
    '  readonly x = useMotionValue(0);',
    '',
    '  // Pass it to the directive via a MotionStyle object',
    '  readonly style: MotionStyle = { x: this.x };',
    '',
    '  // Update imperatively — no change detection triggered',
    '  onSliderChange(event: Event): void {',
    '    const val = Number((event.target as HTMLInputElement).value);',
    '    this.x.set(val);',
    '  }',
    '}',
  ].join('\n');

  readonly useSpringCode = [
    "import { useMotionValue, useSpring, type SpringOptions } from 'ng-motion';",
    '',
    'export class SpringComponent {',
    '  readonly springOpts: SpringOptions = {',
    '    stiffness: 320,',
    '    damping: 28,',
    '  };',
    '',
    '  // Raw value — jumps instantly',
    '  readonly rawX = useMotionValue(0);',
    '',
    '  // Spring value — follows rawX with physics',
    '  readonly x = useSpring(this.rawX, this.springOpts);',
    '',
    '  // You can also spring a static number',
    '  readonly scale = useSpring(1, { stiffness: 200, damping: 15 });',
    '}',
  ].join('\n');

  readonly useTransformCode = [
    "import { useMotionValue, useTransform } from 'ng-motion';",
    '',
    'export class TransformComponent {',
    '  readonly x = useMotionValue(0);',
    '',
    '  // Range mapping: input 0–300 → opacity 0–1',
    '  readonly opacity = useTransform(this.x, [0, 300], [0, 1]);',
    '',
    '  // Function transform: any custom logic',
    '  readonly rounded = useTransform(this.x, (v) => Math.round(v));',
    '',
    '  // Multi-input: combine multiple values',
    '  readonly y = useMotionValue(0);',
    '  readonly distance = useTransform(',
    '    [this.x, this.y],',
    '    (px, py) => Math.sqrt(px * px + py * py)',
    '  );',
    '}',
  ].join('\n');

  readonly fullExampleCode = [
    "import { Component } from '@angular/core';",
    "import { NgmMotionDirective } from 'ng-motion';",
    'import {',
    '  useMotionValue,',
    '  useSpring,',
    '  useTransform,',
    "} from 'ng-motion';",
    "import type { MotionStyle, SpringOptions } from 'ng-motion';",
    '',
    '@Component({',
    '  standalone: true,',
    '  imports: [NgmMotionDirective],',
    '  template: `',
    '    <div ngmMotion [style]="style" class="dot"></div>',
    '    <input',
    '      type="range"',
    '      min="0" max="300"',
    '      [value]="150"',
    '      (input)="setX($event)"',
    '    />',
    '  `,',
    '})',
    'export class MotionValueComponent {',
    '  readonly springOpts: SpringOptions = {',
    '    stiffness: 320,',
    '    damping: 28,',
    '  };',
    '',
    '  readonly rawX = useMotionValue(150);',
    '  readonly x = useSpring(this.rawX, this.springOpts);',
    '  readonly opacity = useTransform(',
    '    this.x, [0, 150, 300], [0.3, 1, 0.3]',
    '  );',
    '  readonly style: MotionStyle = {',
    '    x: this.x,',
    '    opacity: this.opacity,',
    '  };',
    '',
    '  setX(event: Event): void {',
    '    const value = Number(',
    '      (event.target as HTMLInputElement).value',
    '    );',
    '    this.rawX.set(value);',
    '  }',
    '}',
  ].join('\n');

  readonly injectionContextCode = [
    '// Field initializer — preferred',
    'export class MyComponent {',
    '  readonly x = useMotionValue(0);       // injection context',
    '  readonly springX = useSpring(this.x);  // injection context',
    '}',
    '',
    '// Constructor body',
    'export class MyComponent {',
    '  readonly x: MotionValue<number>;',
    '  constructor() {',
    '    this.x = useMotionValue(0);          // injection context',
    '  }',
    '}',
    '',
    '// Deferred with runInInjectionContext',
    'export class MyComponent {',
    '  private injector = inject(Injector);',
    '',
    '  ngAfterViewInit(): void {',
    '    runInInjectionContext(this.injector, () => {',
    '      const x = useMotionValue(0);       // injection context',
    '    });',
    '  }',
    '}',
  ].join('\n');

  // ── Hook mini-section code examples ──
  readonly useVelocityCode = [
    "import { useMotionValue, useVelocity, useTransform } from 'ng-motion';",
    '',
    'export class DragSkewComponent {',
    '  readonly x = useMotionValue(0);',
    '  readonly xVelocity = useVelocity(this.x);',
    '  // Map velocity to skew: fast drags tilt the element',
    '  readonly skew = useTransform(this.xVelocity, [-1000, 0, 1000], [-15, 0, 15]);',
    '}',
  ].join('\n');

  readonly useTimeCode = [
    "import { useTime, useTransform } from 'ng-motion';",
    '',
    'export class SpinnerComponent {',
    '  readonly time = useTime(); // ms since mount, updates every frame',
    "  readonly rotate = useTransform(this.time, (t) => (t / 1000) * 360 % 360);",
    "  // Continuous rotation: bind [style]=\"{ rotate }\"",
    '}',
  ].join('\n');

  readonly useMotionTemplateCode = [
    "import { useMotionValue, useMotionTemplate } from 'ng-motion';",
    "import type { MotionStyle } from 'ng-motion';",
    '',
    'export class HueShiftComponent {',
    '  readonly hue = useMotionValue(0);',
    '  readonly background = useMotionTemplate`hsl(${this.hue}, 70%, 50%)`;',
    '  readonly style: MotionStyle = { background: this.background };',
    '}',
  ].join('\n');

  readonly useAnimationFrameCode = [
    "import { useAnimationFrame } from 'ng-motion';",
    '',
    'export class ParticleComponent {',
    '  constructor() {',
    '    useAnimationFrame((time, delta) => {',
    '      // Runs every frame — use delta for frame-rate-independent updates',
    '      // Automatically stopped on component destroy',
    '    });',
    '  }',
    '}',
  ].join('\n');

  readonly useMotionValueEventCode = [
    "import { signal, inject, NgZone } from '@angular/core';",
    "import { useMotionValue, useMotionValueEvent } from 'ng-motion';",
    '',
    'export class ThresholdComponent {',
    '  private readonly zone = inject(NgZone);',
    '  readonly x = useMotionValue(0);',
    '  readonly pastThreshold = signal(false);',
    '',
    '  constructor() {',
    '    // "change" fires on every value update (outside Angular zone)',
    "    useMotionValueEvent(this.x, 'change', (latest) => {",
    '      const crossed = latest > 200;',
    '      if (crossed !== this.pastThreshold()) {',
    '        // Enter Angular zone only when the flag changes',
    '        this.zone.run(() => this.pastThreshold.set(crossed));',
    '      }',
    '    });',
    '',
    '    // Track animation lifecycle',
    "    useMotionValueEvent(this.x, 'animationStart', () => {",
    "      console.log('Animation started');",
    '    });',
    "    useMotionValueEvent(this.x, 'animationComplete', () => {",
    "      console.log('Animation settled');",
    '    });',
    '  }',
    '}',
  ].join('\n');

  readonly useWillChangeCode = [
    "import { useMotionValue, useWillChange } from 'ng-motion';",
    "import type { MotionStyle } from 'ng-motion';",
    '',
    'export class OptimizedComponent {',
    '  readonly x = useMotionValue(0);',
    '  readonly willChange = useWillChange();',
    '',
    '  // willChange automatically adds/removes CSS will-change during animations',
    '  readonly style: MotionStyle = { x: this.x, willChange: this.willChange };',
    '}',
  ].join('\n');

  readonly useReducedMotionCode = [
    "import { computed } from '@angular/core';",
    "import { useReducedMotion } from 'ng-motion';",
    '',
    'export class AccessibleComponent {',
    '  readonly prefersReduced = useReducedMotion();',
    '  // Signal<boolean> — true when reduced motion is enabled',
    '  readonly transition = computed(() =>',
    "    this.prefersReduced() ? { duration: 0 } : { type: 'spring' }",
    '  );',
    '}',
  ].join('\n');

  // ── Hook reference table ──
  readonly hooks = [
    {
      name: 'useMotionValue',
      description: 'Create a mutable value that drives animation and style.',
    },
    {
      name: 'useSpring',
      description:
        'Wrap a value or MotionValue with spring physics for natural easing.',
    },
    {
      name: 'useTransform',
      description:
        'Derive values via mapping function, input/output ranges, or multi-input combiner.',
    },
    {
      name: 'useVelocity',
      description:
        'Track the instantaneous velocity of a MotionValue (px/s).',
    },
    {
      name: 'useMotionTemplate',
      description:
        'Build CSS strings from motion values: useMotionTemplate`hsl(${hue}, 70%, 50%)`.',
    },
    {
      name: 'useTime',
      description:
        'Animation-frame timestamp as a MotionValue. Useful for continuous effects.',
    },
    {
      name: 'useAnimationFrame',
      description:
        'Per-frame callback with (time, delta). For advanced manual animation loops.',
    },
    {
      name: 'useMotionValueEvent',
      description:
        'Subscribe to change, animationStart, animationComplete, or animationCancel events.',
    },
    {
      name: 'useCycle',
      description:
        'Rotate between a list of values. Returns [signal, cycleFn].',
    },
    {
      name: 'useReducedMotion',
      description:
        'Returns an Angular signal tracking the prefers-reduced-motion media query.',
    },
    {
      name: 'useWillChange',
      description:
        'Creates a MotionValue for manual will-change CSS property control.',
    },
  ];

  // ── Next steps ──
  readonly nextLinks = [
    {
      path: '/docs/gestures',
      title: 'Gestures',
      description: 'Hover, tap, drag, and focus interactions',
    },
    {
      path: '/docs/scroll',
      title: 'Scroll Animations',
      description: 'Drive motion values with scroll position',
    },
    {
      path: '/docs/motion-directive',
      title: 'Motion Directive',
      description: 'All directive inputs and outputs',
    },
    {
      path: '/docs/presence',
      title: 'Presence & Exit',
      description: 'Animate elements entering and leaving the DOM',
    },
  ];
}
