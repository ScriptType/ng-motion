import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  NgmMotionDirective,
  useMotionValue,
  useTransform,
  type MotionValue,
} from 'ng-motion';
import { CodeBlockComponent } from '../../components/code-block.component';

@Component({
  selector: 'app-use-transform',
  imports: [RouterLink, NgmMotionDirective, CodeBlockComponent],
  template: `
    <article class="max-w-3xl pb-16">
      <!-- Header -->
      <div
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
      >
        <h1 class="font-display font-bold text-4xl mb-4">useTransform</h1>
        <p class="text-lg text-secondary mb-12 leading-relaxed">
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >useTransform</code
          >
          creates derived
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >MotionValue</code
          >s
          from other motion values. Map input ranges to output ranges, apply
          custom functions, or combine multiple values into one &mdash; all
          updating automatically in sync with the source.
        </p>
      </div>

      <!-- ═══════════════ Range Mapping ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.1 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Range mapping</h2>
        <p class="text-secondary mb-6">
          The most common form: map a numeric input range to an output range.
          As the source value moves through the input range, the output
          interpolates proportionally through the output range.
        </p>

        <app-code-block [code]="rangeMappingCode" lang="typescript" filename="component.ts" class="mb-6" />

        <!-- Live range mapping demo -->
        <div
          class="rounded-xl border border-border p-10 bg-surface/30 flex flex-col items-center justify-center gap-6"
        >
          <p class="text-sm text-muted font-mono mb-2">
            drag the box horizontally
          </p>
          <div
            ngmMotion
            [drag]="'x'"
            [dragConstraints]="{ left: -150, right: 150, top: 0, bottom: 0 }"
            [dragElastic]="0.1"
            [style]="{ x: demoX, opacity: demoOpacity, rotate: demoRotate }"
            class="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent to-accent-purple cursor-grab active:cursor-grabbing shadow-lg shadow-accent/20"
          ></div>
          <div class="flex gap-6 text-xs text-muted font-mono">
            <span>opacity: x [-200..200] &rarr; [0..1..0]</span>
            <span>rotate: x &times; 0.5</span>
          </div>
        </div>
      </section>

      <!-- ═══════════════ Function Mapping ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.2 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Function mapping
        </h2>
        <p class="text-secondary mb-6">
          For custom transformations, pass a function instead of ranges. The
          function receives the latest value and returns the derived output.
          This is ideal for calculations that don't fit a simple linear mapping.
        </p>

        <app-code-block [code]="functionMappingCode" lang="typescript" filename="component.ts" class="mb-6" />

        <p class="text-secondary">
          The transform function runs on every frame the source changes, so
          keep it lightweight. Avoid allocations or complex logic &mdash;
          simple math is ideal.
        </p>
      </section>

      <!-- ═══════════════ Multiple Inputs ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.3 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Multiple inputs
        </h2>
        <p class="text-secondary mb-6">
          Combine multiple
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >MotionValue</code
          >s
          into a single derived value. Pass an array of sources and a combiner
          function that receives all latest values:
        </p>

        <app-code-block [code]="multiInputCode" lang="typescript" filename="component.ts" class="mb-6" />

        <p class="text-secondary">
          This is powerful for composing independent motion values &mdash; for
          example, combining separate x and y drag values into a single
          distance or angle calculation.
        </p>
      </section>

      <!-- ═══════════════ Color Transforms ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.4 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Color transforms
        </h2>
        <p class="text-secondary mb-6">
          Range mapping works with colors too. Pass hex, rgb, or hsl strings
          in the output range and
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >useTransform</code
          >
          will interpolate smoothly between them via the
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >motion-dom</code
          >
          color engine.
        </p>

        <app-code-block [code]="colorTransformCode" lang="typescript" filename="component.ts" class="mb-6" />

        <!-- Color transform demo -->
        <div
          class="rounded-xl border border-border p-10 bg-surface/30 flex flex-col items-center justify-center gap-6"
        >
          <div
            ngmMotion
            [drag]="'x'"
            [dragConstraints]="{ left: -150, right: 150, top: 0, bottom: 0 }"
            [dragElastic]="0.1"
            [style]="{ x: colorX, backgroundColor: demoColor }"
            class="w-24 h-24 rounded-2xl cursor-grab active:cursor-grabbing shadow-lg"
          ></div>
          <p class="text-xs text-muted font-mono">
            drag to blend: #ff0088 &larr;&rarr; #8855ff &larr;&rarr; #00ccff
          </p>
        </div>
      </section>

      <!-- ═══════════════ TransformOptions ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.45 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          TransformOptions
        </h2>
        <p class="text-secondary mb-6">
          When using range mapping, you can pass an optional
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >TransformOptions</code
          >
          object as the fourth argument to control how the interpolation
          behaves.
        </p>

        <div class="rounded-xl border border-border bg-surface/30 p-5 mb-6">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-muted">
                <th class="pb-2 pr-4 font-medium">Option</th>
                <th class="pb-2 pr-4 font-medium">Type</th>
                <th class="pb-2 pr-4 font-medium">Default</th>
                <th class="pb-2 font-medium">Description</th>
              </tr>
            </thead>
            <tbody class="text-secondary">
              <tr class="border-t border-border/30">
                <td class="py-2 pr-4"><code class="text-accent-pink font-mono text-xs">clamp</code></td>
                <td class="py-2 pr-4 font-mono text-xs">boolean</td>
                <td class="py-2 pr-4 font-mono text-xs">true</td>
                <td class="py-2">Restrict output to the defined output range. When <code class="text-accent-pink font-mono text-xs">true</code>, values beyond the input range are capped at the nearest output boundary. Set to <code class="text-accent-pink font-mono text-xs">false</code> to allow extrapolation.</td>
              </tr>
              <tr class="border-t border-border/30">
                <td class="py-2 pr-4"><code class="text-accent-pink font-mono text-xs">ease</code></td>
                <td class="py-2 pr-4 font-mono text-xs">EasingFunction | EasingFunction[]</td>
                <td class="py-2 pr-4 font-mono text-xs">linear</td>
                <td class="py-2">Easing function(s) applied between each pair of values. When provided as an array, it must have one fewer item than the ranges.</td>
              </tr>
              <tr class="border-t border-border/30">
                <td class="py-2 pr-4"><code class="text-accent-pink font-mono text-xs">mixer</code></td>
                <td class="py-2 pr-4 font-mono text-xs">(from, to) =&gt; (v) =&gt; T</td>
                <td class="py-2 pr-4 font-mono text-xs">&mdash;</td>
                <td class="py-2">Custom interpolation function between any two values in the range. Useful for non-standard value types.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <app-code-block [code]="transformOptionsCode" lang="typescript" filename="component.ts" class="mb-6" />

        <div class="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <p class="text-secondary text-sm">
            <strong class="text-amber-400">Note:</strong>
            <code
              class="text-accent-pink font-mono text-xs px-1.5 py-0.5 rounded bg-accent-pink/10"
              >clamp</code
            >
            defaults to <code class="text-accent-pink font-mono text-xs px-1.5 py-0.5 rounded bg-accent-pink/10">true</code>,
            meaning values outside the input range are capped. This is usually what you
            want, but if you need values to extrapolate beyond the defined range &mdash; for
            example, allowing an opacity to go negative or a scale to exceed the max &mdash;
            set <code class="text-accent-pink font-mono text-xs px-1.5 py-0.5 rounded bg-accent-pink/10">clamp: false</code>.
          </p>
        </div>
      </section>

      <!-- ═══════════════ Chaining Transforms ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.5 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Chaining transforms
        </h2>
        <p class="text-secondary mb-6">
          Since
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >useTransform</code
          >
          returns a
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >MotionValue</code
          >, you can chain transforms together. Each link in the chain
          updates automatically when the source changes:
        </p>

        <app-code-block [code]="chainingCode" lang="typescript" filename="component.ts" class="mb-6" />

        <p class="text-secondary">
          Chaining is allocation-free at runtime &mdash; each transform
          subscribes directly to its source with no intermediate copies. Build
          complex reactive pipelines from simple, composable steps.
        </p>
      </section>

      <!-- ═══════════════ Injection Context ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.6 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Injection context
        </h2>
        <p class="text-secondary mb-6">
          Like all ng-motion hooks,
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >useTransform</code
          >
          must be called within an Angular injection context &mdash; typically
          as a class field initializer or inside the constructor. Subscriptions
          and the derived
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >MotionValue</code
          >
          are cleaned up automatically when the component is destroyed.
        </p>

        <app-code-block [code]="injectionContextCode" lang="typescript" filename="component.ts" />

        <div
          class="mt-6 rounded-xl border border-border/50 p-5 bg-surface/30"
        >
          <p class="text-secondary text-sm">
            If you need to call
            <code
              class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
              >useTransform</code
            >
            outside a constructor or field initializer, wrap the call in
            <code
              class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
              >runInInjectionContext</code
            >
            from
            <code
              class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
              >&#64;angular/core</code
            >.
          </p>
        </div>
      </section>

      <!-- ═══════════════ Next Steps ═══════════════ -->
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
export class UseTransformPage {
  // ── Demo: drag-driven opacity + rotation ──

  readonly demoX: MotionValue<number> = useMotionValue(0);
  readonly demoOpacity = useTransform(this.demoX, [-200, 0, 200], [0, 1, 0]);
  readonly demoRotate = useTransform(this.demoX, (v: number) => v * 0.5);

  // ── Demo: color transform ──

  readonly colorX: MotionValue<number> = useMotionValue(0);
  readonly demoColor = useTransform(
    this.colorX,
    [-150, 0, 150],
    ['#ff0088', '#8855ff', '#00ccff'],
  );

  // ── Code snippets ──

  readonly rangeMappingCode = [
    "import { useMotionValue, useTransform, type MotionValue } from 'ng-motion';",
    '',
    '// Source value — bound to drag via [style]',
    'readonly x: MotionValue<number> = useMotionValue(0);',
    '',
    '// Map x to opacity: fully visible at center, fades at edges',
    'readonly opacity = useTransform(this.x, [-200, 0, 200], [0, 1, 0]);',
    '',
    '// Map x to rotation: rotate at half the drag rate',
    'readonly rotate = useTransform(this.x, (v: number) => v * 0.5);',
    '',
    '// Template: bind x so drag writes to the motion value,',
    '// then opacity + rotate react automatically',
    '// <div ngmMotion [drag]="\'x\'"',
    '//   [style]="{ x: x, opacity: opacity, rotate: rotate }">',
  ].join('\n');

  readonly functionMappingCode = [
    'readonly x = useMotionValue(0);',
    '',
    '// Rotate at half the rate of x movement',
    'readonly rotate = useTransform(this.x, v => v * 0.5);',
    '',
    '// Scale inversely based on distance from center',
    'readonly scale = useTransform(this.x, v => {',
    '  const distance = Math.abs(v);',
    '  return 1 - distance / 500;',
    '});',
    '',
    '// Derive a CSS string',
    "readonly blur = useTransform(this.x, v => `blur(${Math.abs(v) / 50}px)`);",
  ].join('\n');

  readonly multiInputCode = [
    'readonly x = useMotionValue(0);',
    'readonly y = useMotionValue(0);',
    '',
    '// Combine x and y into a single distance value',
    'readonly distance = useTransform(',
    '  [this.x, this.y],',
    '  (latestX, latestY) => Math.sqrt(latestX ** 2 + latestY ** 2),',
    ');',
    '',
    '// Combine into an angle',
    'readonly angle = useTransform(',
    '  [this.x, this.y],',
    '  (latestX, latestY) => Math.atan2(latestY, latestX) * (180 / Math.PI),',
    ');',
  ].join('\n');

  readonly colorTransformCode = [
    'readonly x: MotionValue<number> = useMotionValue(0);',
    '',
    '// Interpolate between colors based on drag position',
    'readonly bgColor = useTransform(',
    '  this.x,',
    '  [-150, 0, 150],',
    "  ['#ff0088', '#8855ff', '#00ccff'],",
    ');',
    '',
    '// Template: bind x to drag, bgColor reacts automatically',
    '// <div ngmMotion [drag]="\'x\'"',
    '//   [style]="{ x: x, backgroundColor: bgColor }">',
    '',
    '// Works with rgb and hsl too:',
    "// ['rgb(255, 0, 0)', 'rgb(0, 0, 255)']",
    "// ['hsl(0, 100%, 50%)', 'hsl(240, 100%, 50%)']",
  ].join('\n');

  readonly transformOptionsCode = [
    "import { useMotionValue, useTransform, type MotionValue } from 'ng-motion';",
    '',
    'readonly x: MotionValue<number> = useMotionValue(0);',
    '',
    '// Clamped (default): opacity stays within [0, 1]',
    'readonly opacity = useTransform(this.x, [-200, 0, 200], [0, 1, 0]);',
    '',
    '// Unclamped: scale extrapolates beyond the output range',
    '// when x goes past -200 or 200',
    'readonly scale = useTransform(',
    '  this.x,',
    '  [-200, 0, 200],',
    '  [0.5, 1, 1.5],',
    '  { clamp: false },',
    ');',
  ].join('\n');

  readonly chainingCode = [
    'readonly x = useMotionValue(0);',
    '',
    '// Step 1: Normalize x to a 0..1 progress value',
    'readonly progress = useTransform(this.x, [-200, 200], [0, 1]);',
    '',
    '// Step 2: Derive opacity from progress',
    'readonly opacity = useTransform(this.progress, [0, 0.5, 1], [0.2, 1, 0.2]);',
    '',
    '// Step 3: Derive scale from progress',
    'readonly scale = useTransform(this.progress, [0, 0.5, 1], [0.8, 1.2, 0.8]);',
    '',
    '// Step 4: Derive a display string from progress',
    "readonly label = useTransform(this.progress, v => `${(v * 100).toFixed(0)}%`);",
  ].join('\n');

  readonly injectionContextCode = [
    "import { Component } from '@angular/core';",
    "import { useMotionValue, useTransform } from 'ng-motion';",
    '',
    '@Component({ ... })',
    'export class MyComponent {',
    '  // Class field initializer = injection context',
    '  readonly x = useMotionValue(0);',
    '  readonly opacity = useTransform(this.x, [-200, 0, 200], [0, 1, 0]);',
    '  readonly rotate = useTransform(this.x, v => v * 0.5);',
    '',
    '  // All subscriptions are cleaned up automatically.',
    '}',
  ].join('\n');

  // ── Next steps ──

  readonly nextLinks = [
    {
      path: '/docs/use-spring',
      title: 'useSpring',
      description: 'Follow values with spring physics',
    },
    {
      path: '/docs/motion-values',
      title: 'Motion Values',
      description: 'Track and compose animation values reactively',
    },
    {
      path: '/docs/gestures',
      title: 'Gestures',
      description: 'Hover, tap, drag, and focus interactions',
    },
    {
      path: '/docs/transitions',
      title: 'Transitions',
      description: 'Spring, tween, and inertia configuration',
    },
  ];
}
