import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  NgmMotionDirective,
  useMotionValue,
  useSpring,
  type MotionValue,
  type SpringOptions,
} from '@scripttype/ng-motion';
import { CodeBlockComponent } from '../../components/code-block.component';

@Component({
  selector: 'app-use-spring',
  imports: [RouterLink, NgmMotionDirective, CodeBlockComponent],
  template: `
    <article class="max-w-3xl pb-16">
      <!-- Header -->
      <div
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
      >
        <h1 class="font-display font-bold text-4xl mb-4">useSpring</h1>
        <p class="text-sm text-muted mb-6">
          Prerequisite: <a routerLink="/docs/motion-values" class="text-accent hover:underline">MotionValues</a>
          &mdash; useSpring creates a spring-animated MotionValue.
        </p>
        <p class="text-lg text-secondary mb-12 leading-relaxed">
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >useSpring</code
          >
          creates a spring-animated
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >MotionValue</code
          >
          that follows a raw value or another
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >MotionValue</code
          >
          with spring physics. When the source changes, the spring value
          animates smoothly toward it rather than jumping instantly.
        </p>
      </div>

      <!-- ═══════════════ Basic Usage ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.1 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Basic usage</h2>
        <p class="text-secondary mb-6">
          Pass a
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >MotionValue</code
          >
          (or a static number) as the source and an optional
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >SpringOptions</code
          >
          config. The returned value will smoothly follow the source using
          spring physics. Must be called within an Angular injection context.
        </p>

        <app-code-block [code]="basicCode" lang="typescript" filename="component.ts" class="mb-4" />

        <p class="text-secondary text-sm mb-6">
          Bind the spring value to the template:
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >[style]="&#123; x: springX &#125;"</code
          >
        </p>

        <p class="text-secondary">
          When
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >rawX</code
          >
          is updated via
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >.set()</code
          >,
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >x</code
          >
          doesn't jump &mdash; it springs toward the new value with the
          configured physics.
        </p>
      </section>

      <!-- ═══════════════ Spring Options ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.2 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Spring options</h2>
        <p class="text-secondary mb-6">
          Fine-tune the spring behavior by adjusting these parameters:
        </p>

        <div class="rounded-xl border border-border overflow-hidden">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border bg-elevated/50">
                <th class="text-left px-4 py-2.5 font-mono text-xs text-muted">
                  Property
                </th>
                <th class="text-left px-4 py-2.5 font-mono text-xs text-muted">
                  Default
                </th>
                <th class="text-left px-4 py-2.5 font-mono text-xs text-muted">
                  Description
                </th>
              </tr>
            </thead>
            <tbody class="bg-code-bg">
              @for (row of springProps; track row.name) {
                <tr class="border-b border-border/50 last:border-0">
                  <td class="px-4 py-2.5">
                    <code
                      class="text-accent-pink font-mono text-xs px-1.5 py-0.5 rounded bg-accent-pink/10"
                      >{{ row.name }}</code
                    >
                  </td>
                  <td class="px-4 py-2.5 font-mono text-xs text-muted">
                    {{ row.defaultVal }}
                  </td>
                  <td class="px-4 py-2.5 text-secondary">{{ row.desc }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <!-- ═══════════════ Comparing Spring Configs ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.3 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Comparing spring configs
        </h2>
        <p class="text-secondary mb-4">
          Different combinations of stiffness, damping, and mass produce
          dramatically different feels. Drag each box to compare:
        </p>
        <p class="text-secondary text-sm mb-6">
          These spring configurations apply to the directive's
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >[transition]</code
          >
          input. The
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >useSpring()</code
          >
          hook uses the same spring parameters but creates a standalone reactive
          spring value.
        </p>

        <app-code-block [code]="compareCode" lang="typescript" filename="component.ts" class="mb-6" />

        <div class="rounded-xl border border-border p-10 bg-surface/30">
          <p class="text-sm text-muted font-mono text-center mb-8">
            drag each box to compare spring configs
          </p>
          <div class="flex items-center justify-center gap-10 flex-wrap">
            <div class="text-center">
              <div
                ngmMotion
                [drag]="true"
                [dragSnapToOrigin]="true"
                [dragElastic]="0.2"
                [transition]="{
                  type: 'spring',
                  stiffness: 600,
                  damping: 8
                }"
                class="w-16 h-16 rounded-xl bg-gradient-to-br from-accent to-accent-purple cursor-grab active:cursor-grabbing mx-auto mb-3 shadow-lg shadow-accent/20"
              ></div>
              <p class="text-xs text-muted font-mono">bouncy</p>
              <p class="text-[10px] text-muted/60 font-mono mt-0.5">
                stiffness: 600
              </p>
              <p class="text-[10px] text-muted/60 font-mono">damping: 8</p>
            </div>
            <div class="text-center">
              <div
                ngmMotion
                [drag]="true"
                [dragSnapToOrigin]="true"
                [dragElastic]="0.2"
                [transition]="{
                  type: 'spring',
                  stiffness: 320,
                  damping: 28
                }"
                class="w-16 h-16 rounded-xl bg-gradient-to-br from-accent-pink to-accent-gold cursor-grab active:cursor-grabbing mx-auto mb-3 shadow-lg shadow-accent-pink/20"
              ></div>
              <p class="text-xs text-muted font-mono">smooth</p>
              <p class="text-[10px] text-muted/60 font-mono mt-0.5">
                stiffness: 320
              </p>
              <p class="text-[10px] text-muted/60 font-mono">damping: 28</p>
            </div>
            <div class="text-center">
              <div
                ngmMotion
                [drag]="true"
                [dragSnapToOrigin]="true"
                [dragElastic]="0.2"
                [transition]="{
                  type: 'spring',
                  stiffness: 80,
                  damping: 14,
                  mass: 3
                }"
                class="w-16 h-16 rounded-xl bg-gradient-to-br from-accent-purple to-accent-pink cursor-grab active:cursor-grabbing mx-auto mb-3 shadow-lg shadow-accent-purple/20"
              ></div>
              <p class="text-xs text-muted font-mono">heavy</p>
              <p class="text-[10px] text-muted/60 font-mono mt-0.5">
                stiffness: 80, mass: 3
              </p>
              <p class="text-[10px] text-muted/60 font-mono">damping: 14</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════ Interactive Spring Demo ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.4 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Interactive spring
        </h2>
        <p class="text-secondary mb-6">
          Combine
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >useMotionValue</code
          >
          with
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >useSpring</code
          >
          to create interactive spring-driven animations. Update the raw value
          instantly &mdash; the spring follows with natural physics.
        </p>

        <app-code-block [code]="interactiveCode" lang="typescript" filename="component.ts" class="mb-6" />

        <div
          class="rounded-xl border border-border p-10 bg-surface/30 flex flex-col items-center justify-center gap-6"
        >
          <div
            ngmMotion
            [style]="{ x: springX }"
            class="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-accent-purple shadow-lg shadow-accent/20"
          ></div>
          <div class="w-full max-w-xs flex flex-col items-center gap-3">
            <input
              type="range"
              min="-150"
              max="150"
              [value]="sliderValue()"
              (input)="onSliderInput($event)"
              class="w-full accent-accent"
            />
            <p class="text-xs text-muted font-mono">
              raw: {{ sliderValue() }} &rarr; spring follows
            </p>
          </div>
        </div>
      </section>

      <!-- ═══════════════ Injection Context ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.5 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Injection context
        </h2>
        <p class="text-secondary mb-6">
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >useSpring</code
          >
          must be called within an Angular injection context &mdash; typically
          as a class field initializer or inside the constructor. It
          automatically cleans up its internal subscription and destroys the
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >MotionValue</code
          >
          when the component is destroyed.
        </p>

        <app-code-block [code]="injectionContextCode" lang="typescript" filename="component.ts" />

        <div
          class="mt-6 rounded-xl border border-border/50 p-5 bg-surface/30"
        >
          <p class="text-secondary text-sm">
            If you need to call
            <code
              class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
              >useSpring</code
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
export class UseSpringPage {
  // ── Interactive demo state ──

  readonly sliderValue = signal(0);
  readonly rawX: MotionValue<number> = useMotionValue(0);
  readonly springX: MotionValue<number> = useSpring(this.rawX, {
    stiffness: 260,
    damping: 12,
  });

  onSliderInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.sliderValue.set(value);
    this.rawX.set(value);
  }

  // ── Spring options table ──

  readonly springProps = [
    {
      name: 'stiffness',
      defaultVal: '100',
      desc: 'Spring tension. Higher values create faster, snappier motion.',
    },
    {
      name: 'damping',
      defaultVal: '10',
      desc: 'Resistance force. Higher values reduce oscillation.',
    },
    {
      name: 'mass',
      defaultVal: '1',
      desc: 'Mass of the moving object. Higher values feel heavier and slower.',
    },
    {
      name: 'velocity',
      defaultVal: '0',
      desc: 'Initial velocity of the spring.',
    },
    {
      name: 'restSpeed',
      defaultVal: '0.01',
      desc: 'Speed threshold (units/s). Animation ends when speed drops below this and delta is below restDelta.',
    },
    {
      name: 'restDelta',
      defaultVal: '0.01',
      desc: 'Distance threshold below which the spring is considered at rest.',
    },
    {
      name: 'duration',
      defaultVal: '0.3',
      desc: 'Total duration in seconds. Overridden if stiffness/damping/mass are set.',
    },
    {
      name: 'bounce',
      defaultVal: '0.25',
      desc: 'Bounciness from 0 (none) to 1 (maximum). Only applies when duration is set.',
    },
    {
      name: 'visualDuration',
      defaultVal: '—',
      desc: 'Time in seconds for the spring to visually reach its target. Overrides duration when set.',
    },
  ];

  // ── Code snippets ──

  readonly basicCode = [
    "import {",
    "  useMotionValue,",
    "  useSpring,",
    "  type MotionValue,",
    "  type SpringOptions,",
    "} from '@scripttype/ng-motion';",
    '',
    'readonly config: SpringOptions = { stiffness: 260, damping: 12 };',
    'readonly rawX: MotionValue<number> = useMotionValue(0);',
    'readonly x: MotionValue<number> = useSpring(this.rawX, this.config);',
    '',
    '// When rawX changes, x springs toward it with bounce:',
    '// this.rawX.set(200);',
  ].join('\n');

  readonly compareCode = [
    "// Bouncy: high stiffness, low damping",
    'const bouncy = { stiffness: 600, damping: 8 };',
    '',
    "// Smooth: balanced stiffness and damping",
    'const smooth = { stiffness: 320, damping: 28 };',
    '',
    "// Heavy: low stiffness, high mass",
    'const heavy = { stiffness: 80, damping: 14, mass: 3 };',
    '',
    '// template — drag to feel each spring:',
    '<div ngmMotion [drag]="true" [dragSnapToOrigin]="true"',
    '  [transition]="{ type: \'spring\', ...bouncy }">',
    '</div>',
  ].join('\n');

  readonly interactiveCode = [
    "import { useMotionValue, useSpring, type MotionValue } from '@scripttype/ng-motion';",
    '',
    'readonly rawX: MotionValue<number> = useMotionValue(0);',
    'readonly springX: MotionValue<number> = useSpring(this.rawX, {',
    '  stiffness: 260,',
    '  damping: 12,',
    '});',
    '',
    '// template:',
    '<div ngmMotion [style]="{ x: springX }"></div>',
    '<input type="range" min="-150" max="150"',
    '  (input)="onSliderInput($event)" />',
    '',
    'onSliderInput(event: Event): void {',
    '  this.rawX.set(Number((event.target as HTMLInputElement).value));',
    '}',
  ].join('\n');

  readonly injectionContextCode = [
    "import { Component } from '@angular/core';",
    "import { useMotionValue, useSpring } from '@scripttype/ng-motion';",
    '',
    '@Component({ ... })',
    'export class MyComponent {',
    '  // Class field initializer = injection context',
    '  readonly rawX = useMotionValue(0);',
    '  readonly x = useSpring(this.rawX, { stiffness: 200, damping: 20 });',
    '',
    '  // Cleanup is automatic when the component is destroyed.',
    '}',
  ].join('\n');

  // ── Next steps ──

  readonly nextLinks = [
    {
      path: '/docs/use-transform',
      title: 'useTransform',
      description: 'Create derived values with range mapping and functions',
    },
    {
      path: '/docs/motion-values',
      title: 'Motion Values',
      description: 'Track and compose animation values reactively',
    },
    {
      path: '/docs/transitions',
      title: 'Transitions',
      description: 'Spring, tween, and inertia configuration',
    },
    {
      path: '/docs/gestures',
      title: 'Gestures',
      description: 'Hover, tap, drag, and focus interactions',
    },
  ];
}
