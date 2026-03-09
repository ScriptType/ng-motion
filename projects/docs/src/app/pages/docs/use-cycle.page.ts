import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgmMotionDirective, useCycle } from 'ng-motion';
import { CodeBlockComponent } from '../../components/code-block.component';

@Component({
  selector: 'app-use-cycle',
  imports: [RouterLink, NgmMotionDirective, CodeBlockComponent],
  template: `
    <article class="max-w-3xl pb-16">
      <!-- Header -->
      <div
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
      >
        <h1 class="font-display font-bold text-4xl mb-4">useCycle</h1>
        <p class="text-lg text-secondary mb-12 leading-relaxed">
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >useCycle</code
          >
          rotates through a fixed list of values. It returns a tuple of
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >[currentValue, cycleFn]</code
          >
          &mdash; calling the cycle function advances to the next value in the list,
          wrapping back to the start when it reaches the end.
        </p>
      </div>

      <!-- Basic Usage -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.1 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Basic Usage</h2>
        <p class="text-secondary mb-6">
          Pass any number of values to
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >useCycle</code
          >. It returns an Angular
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >Signal</code
          >
          holding the current value and a function to advance to the next one.
        </p>

        <app-code-block [code]="basicUsageCode" lang="typescript" filename="component.ts" class="mb-6" />

        <div class="rounded-xl border border-border/50 p-5 bg-surface/30 mb-6">
          <p class="text-secondary text-sm">
            <strong>Why index access instead of destructuring?</strong>
            TypeScript does not allow array destructuring in class field declarations
            (<code class="text-accent-pink font-mono text-xs px-1.5 py-0.5 rounded bg-accent-pink/10">readonly [a, b] = ...</code> is a syntax error).
            Use <code class="text-accent-pink font-mono text-xs px-1.5 py-0.5 rounded bg-accent-pink/10">_cycle[0]</code> /
            <code class="text-accent-pink font-mono text-xs px-1.5 py-0.5 rounded bg-accent-pink/10">_cycle[1]</code> at the class level.
            Inside constructors and local functions, <code class="text-accent-pink font-mono text-xs px-1.5 py-0.5 rounded bg-accent-pink/10">const [val, next] = useCycle(...)</code> works fine.
          </p>
        </div>

        <!-- Live rotation demo -->
        <div
          class="rounded-xl border border-border p-10 bg-surface/30 flex flex-col items-center justify-center gap-6"
        >
          <div
            ngmMotion
            [animate]="{ rotate: currentRotation() }"
            [transition]="{ type: 'spring', stiffness: 260, damping: 20 }"
            class="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent/15 to-accent-purple/15 border border-accent/20 flex items-center justify-center"
          >
            <span class="font-mono text-sm text-accent">{{ currentRotation() }}&deg;</span>
          </div>
          <div class="flex items-center gap-4">
            <button
              (click)="cycleRotation()"
              ngmMotion
              [whileHover]="{ scale: 1.05 }"
              [whileTap]="{ scale: 0.95 }"
              [transition]="{ type: 'spring', stiffness: 400, damping: 17 }"
              class="px-5 py-2.5 rounded-lg bg-accent/10 border border-accent/20 text-accent text-sm font-medium cursor-pointer select-none"
            >
              Cycle rotation
            </button>
            <span class="text-xs text-muted font-mono">
              {{ currentRotation() }}&deg; of [0, 90, 180, 270]
            </span>
          </div>
        </div>
      </section>

      <!-- Cycling Through Colors -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.2 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Cycling Through Colors
        </h2>
        <p class="text-secondary mb-6">
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >useCycle</code
          >
          works with any value type &mdash; strings, objects, numbers, or colors.
          Click the element below to cycle through background colors:
        </p>

        <app-code-block [code]="colorCycleCode" lang="typescript" filename="component.ts" class="mb-6" />

        <!-- Live color demo -->
        <div
          class="rounded-xl border border-border p-10 bg-surface/30 flex flex-col items-center justify-center gap-6"
        >
          <div
            (click)="cycleColor()"
            ngmMotion
            [animate]="{ backgroundColor: currentColor() }"
            [whileHover]="{ scale: 1.08 }"
            [whileTap]="{ scale: 0.95 }"
            [transition]="{ type: 'spring', stiffness: 300, damping: 20 }"
            class="w-32 h-32 rounded-2xl cursor-pointer flex items-center justify-center shadow-lg"
          >
            <span class="font-mono text-xs text-white/80 mix-blend-difference">
              click me
            </span>
          </div>
          <p class="text-xs text-muted font-mono">
            {{ currentColor() }}
          </p>
        </div>
      </section>

      <!-- Cycling Animation States -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.3 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Cycling Animation States with ngmMotion
        </h2>
        <p class="text-secondary mb-6">
          Combine
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >useCycle</code
          >
          with
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >ngmMotion</code
          >
          to cycle through complete animation state objects. Each click advances to the
          next state and the directive smoothly animates the transition:
        </p>

        <app-code-block [code]="statesCycleCode" lang="typescript" filename="component.ts" class="mb-6" />

        <!-- Live states demo -->
        <div
          class="rounded-xl border border-border p-10 bg-surface/30 flex flex-col items-center justify-center gap-6"
        >
          <div
            ngmMotion
            [animate]="currentState()"
            [transition]="{ type: 'spring', stiffness: 300, damping: 22 }"
            class="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-pink/20 to-accent-gold/20 border border-accent-pink/20"
          ></div>
          <div class="flex items-center gap-3">
            <button
              (click)="cycleState()"
              ngmMotion
              [whileHover]="{ scale: 1.05 }"
              [whileTap]="{ scale: 0.95 }"
              [transition]="{ type: 'spring', stiffness: 400, damping: 17 }"
              class="px-5 py-2.5 rounded-lg bg-accent-pink/10 border border-accent-pink/20 text-accent-pink text-sm font-medium cursor-pointer select-none"
            >
              Next state
            </button>
            <span class="text-xs text-muted font-mono">
              state {{ currentStateIndex() + 1 }} of {{ stateCount }}
            </span>
          </div>
        </div>
      </section>

      <!-- Jumping to a Specific Index -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.4 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Jumping to a Specific Index
        </h2>
        <p class="text-secondary mb-6">
          Pass a number to the cycle function to jump directly to a specific index
          instead of advancing sequentially:
        </p>

        <app-code-block [code]="jumpIndexCode" lang="typescript" filename="component.ts" />
      </section>

      <!-- Injection Context -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.5 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Injection Context
        </h2>
        <p class="text-secondary mb-6">
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >useCycle</code
          >
          is a plain function with no Angular dependencies &mdash; it can be called
          anywhere, not just within an injection context. It creates a standalone
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >signal()</code
          >
          internally and returns it as a readonly signal. This means you can safely use
          it in field initializers, constructors, or helper functions.
        </p>

        <app-code-block [code]="injectionContextCode" lang="typescript" filename="component.ts" />
      </section>

      <!-- Next steps -->
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
export class UseCyclePage {
  // ── Rotation demo ──
  private readonly _rotationCycle = useCycle(0, 90, 180, 270);
  readonly currentRotation = this._rotationCycle[0];
  readonly cycleRotation = this._rotationCycle[1];

  // ── Color demo ──
  private readonly _colorCycle = useCycle(
    '#6366f1',
    '#ec4899',
    '#f59e0b',
    '#10b981',
    '#8b5cf6',
  );
  readonly currentColor = this._colorCycle[0];
  readonly cycleColor = this._colorCycle[1];

  // ── States demo ──
  readonly stateCount = 4;
  readonly currentStateIndex = signal(0);

  private readonly _stateCycle = useCycle(
    { scale: 1, rotate: 0, borderRadius: '16px' },
    { scale: 1.3, rotate: 45, borderRadius: '50%' },
    { scale: 0.8, rotate: -30, borderRadius: '8px' },
    { scale: 1.1, rotate: 180, borderRadius: '24px' },
  );
  readonly currentState = this._stateCycle[0];
  private readonly _cycleStateRaw = this._stateCycle[1];

  cycleState(): void {
    this._cycleStateRaw();
    this.currentStateIndex.update((i) => (i + 1) % this.stateCount);
  }

  // ── Code examples ──

  readonly basicUsageCode = [
    "import { useCycle } from 'ng-motion';",
    '',
    '@Component({',
    '  template: `',
    '    <div ngmMotion',
    '      [animate]="{ rotate: currentRotation() }"',
    "      [transition]=\"{ type: 'spring', stiffness: 260, damping: 20 }\"",
    '    ></div>',
    '    <button (click)="cycleRotation()">Rotate</button>',
    '  `,',
    '})',
    'export class RotateComponent {',
    '  // Returns [Signal<T>, (next?: number) => void]',
    '  private readonly _cycle = useCycle(0, 90, 180, 270);',
    '  readonly currentRotation = this._cycle[0];',
    '  readonly cycleRotation = this._cycle[1];',
    '}',
  ].join('\n');

  readonly colorCycleCode = [
    "import { useCycle } from 'ng-motion';",
    '',
    '@Component({',
    '  template: `',
    '    <div ngmMotion',
    '      (click)="cycleColor()"',
    '      [animate]="{ backgroundColor: currentColor() }"',
    '    ></div>',
    '  `,',
    '})',
    'export class ColorCycleComponent {',
    '  private readonly _cycle = useCycle(',
    "    '#6366f1',  // indigo",
    "    '#ec4899',  // pink",
    "    '#f59e0b',  // amber",
    "    '#10b981',  // emerald",
    '  );',
    '  readonly currentColor = this._cycle[0];',
    '  readonly cycleColor = this._cycle[1];',
    '}',
  ].join('\n');

  readonly statesCycleCode = [
    "import { useCycle } from 'ng-motion';",
    '',
    '@Component({',
    '  template: `',
    '    <div ngmMotion',
    '      [animate]="currentState()"',
    "      [transition]=\"{ type: 'spring', stiffness: 300, damping: 22 }\"",
    '    ></div>',
    '    <button (click)="cycleState()">Next state</button>',
    '  `,',
    '})',
    'export class StateCycleComponent {',
    '  private readonly _cycle = useCycle(',
    "    { scale: 1, rotate: 0, borderRadius: '16px' },",
    "    { scale: 1.3, rotate: 45, borderRadius: '50%' },",
    "    { scale: 0.8, rotate: -30, borderRadius: '8px' },",
    "    { scale: 1.1, rotate: 180, borderRadius: '24px' },",
    '  );',
    '  readonly currentState = this._cycle[0];',
    '  readonly cycleState = this._cycle[1];',
    '}',
  ].join('\n');

  readonly jumpIndexCode = [
    'private readonly _sizeCycle = useCycle(100, 200, 300);',
    'readonly currentSize = this._sizeCycle[0];',
    'readonly cycleSize = this._sizeCycle[1];',
    '',
    '// Advance to next value',
    'this.cycleSize();       // 100 -> 200',
    'this.cycleSize();       // 200 -> 300',
    'this.cycleSize();       // 300 -> 100 (wraps)',
    '',
    '// Jump to specific index',
    'this.cycleSize(0);      // -> 100',
    'this.cycleSize(2);      // -> 300',
  ].join('\n');

  readonly injectionContextCode = [
    "import { useCycle } from 'ng-motion';",
    '',
    '@Component({ ... })',
    'export class MyComponent {',
    '  // Field initializer — works anywhere',
    "  private readonly _modeCycle = useCycle('light', 'dark', 'auto');",
    '  readonly mode = this._modeCycle[0];',
    '  readonly cycleMode = this._modeCycle[1];',
    '',
    '  // Also works in constructors and helper functions',
    '  constructor() {',
    '    // Local destructuring is valid TypeScript',
    '    const [val, next] = useCycle(1, 2, 3);',
    '  }',
    '}',
  ].join('\n');

  // ── Next steps ──

  readonly nextLinks = [
    {
      path: '/docs/use-animate',
      title: 'useAnimate',
      description: 'Imperative animation control with scoped cleanup',
    },
    {
      path: '/docs/motion-values',
      title: 'Motion Values',
      description: 'Track and transform animation values reactively',
    },
    {
      path: '/docs/variants',
      title: 'Variants',
      description: 'Named states, orchestration, and propagation',
    },
    {
      path: '/docs/transitions',
      title: 'Transitions',
      description: 'Springs, tweens, and per-property overrides',
    },
  ];
}
