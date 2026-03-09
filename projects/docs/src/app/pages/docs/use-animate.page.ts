import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgmMotionDirective } from 'ng-motion';
import { CodeBlockComponent } from '../../components/code-block.component';

@Component({
  selector: 'app-use-animate',
  imports: [RouterLink, NgmMotionDirective, CodeBlockComponent],
  template: `
    <article class="max-w-3xl pb-16">
      <!-- Header -->
      <div
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
      >
        <h1 class="font-display font-bold text-4xl mb-4">
          animate &amp; useAnimate
        </h1>
        <p class="text-lg text-secondary mb-12 leading-relaxed">
          Sometimes you need to trigger animations imperatively &mdash; in response to
          async events, user commands, or complex sequences that don't map cleanly to
          declarative state. ng-motion provides two tools for this:
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >animate()</code
          >
          for standalone imperative animations, and
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >useAnimate()</code
          >
          for scoped animations with automatic cleanup.
        </p>
      </div>

      <!-- animate() a DOM Element -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.1 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          animate() a DOM Element
        </h2>
        <p class="text-secondary mb-6">
          The
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >animate()</code
          >
          function accepts a CSS selector or element reference, a keyframes object,
          and an optional transition config. It returns playback controls with a
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >.finished</code
          >
          promise.
        </p>

        <app-code-block [code]="animateElementCode" lang="typescript" filename="component.ts" class="mb-6" />

        <p class="text-secondary">
          The selector resolves against the document. Use
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >useAnimate()</code
          >
          if you need scoped resolution within a component subtree.
        </p>
      </section>

      <!-- animate() a MotionValue -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.2 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          animate() a MotionValue
        </h2>
        <p class="text-secondary mb-6">
          You can also animate a
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >MotionValue</code
          >
          directly. This is useful for driving reactive values that are connected to
          styles via
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >useTransform</code
          >
          or bound to the
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >[style]</code
          >
          input:
        </p>

        <app-code-block [code]="animateMotionValueCode" lang="typescript" filename="component.ts" />
      </section>

      <!-- Animation Sequences -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.3 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Animation Sequences
        </h2>
        <p class="text-secondary mb-6">
          Pass an array of animation segments to
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >animate()</code
          >
          to orchestrate multi-step timelines. Each segment is a tuple of
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >[target, keyframes, options?]</code
          >. Use the
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >at</code
          >
          option to control timing relationships between segments:
        </p>

        <app-code-block [code]="sequenceCode" lang="typescript" filename="component.ts" class="mb-6" />

        <!-- Sequence timing reference -->
        <div class="space-y-4">
          <div class="rounded-xl border border-border p-5 bg-surface/30">
            <div class="flex items-start gap-3">
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10 whitespace-nowrap flex-shrink-0"
                >at: "&lt;"</code
              >
              <p class="text-secondary text-sm">
                Start at the same time as the previous segment. Runs both animations
                in parallel.
              </p>
            </div>
          </div>

          <div class="rounded-xl border border-border p-5 bg-surface/30">
            <div class="flex items-start gap-3">
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10 whitespace-nowrap flex-shrink-0"
                >at: "+0.2"</code
              >
              <p class="text-secondary text-sm">
                Start 0.2 seconds after the previous segment ends. Use negative
                values like
                <code
                  class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                  >"-0.1"</code
                >
                for overlap.
              </p>
            </div>
          </div>

          <div class="rounded-xl border border-border p-5 bg-surface/30">
            <div class="flex items-start gap-3">
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10 whitespace-nowrap flex-shrink-0"
                >at: 1.5</code
              >
              <p class="text-secondary text-sm">
                Start at an absolute time (1.5 seconds from the beginning of the
                sequence).
              </p>
            </div>
          </div>
        </div>

        <!-- Live sequence demo -->
        <div class="rounded-xl border border-border p-10 bg-surface/30 flex flex-col items-center justify-center gap-6 mt-6">
          <button
            ngmMotion
            [whileHover]="{ scale: 1.05 }"
            [whileTap]="{ scale: 0.95 }"
            [transition]="{ type: 'spring', stiffness: 400, damping: 17 }"
            (click)="replaySequence()"
            class="px-5 py-2.5 rounded-lg bg-accent-purple/10 border border-accent-purple/20 text-accent-purple text-sm font-medium cursor-pointer select-none"
          >
            Replay sequence
          </button>
          <div class="flex flex-col items-center gap-3 w-full max-w-xs">
            <div
              ngmMotion
              [animate]="seqStep() >= 1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }"
              [transition]="{ type: 'spring', stiffness: 300, damping: 20 }"
              class="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-accent-purple flex items-center justify-center text-white text-xs font-bold"
            >1</div>
            <div
              ngmMotion
              [animate]="seqStep() >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }"
              [transition]="{ duration: 0.3 }"
              class="text-sm text-secondary font-medium"
            >Title fades in</div>
            <div
              ngmMotion
              [animate]="seqStep() >= 3 ? { opacity: 1 } : { opacity: 0 }"
              [transition]="{ duration: 0.4 }"
              class="text-xs text-muted text-center"
            >Description appears last in the sequence</div>
          </div>
          <p class="text-xs text-muted font-mono">Three-step choreographed sequence</p>
        </div>
      </section>

      <!-- useAnimate() — Scoped Animation -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.4 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          useAnimate() &mdash; Scoped Animation
        </h2>
        <p class="text-secondary mb-6">
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >useAnimate()</code
          >
          returns a
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >[scope, animate]</code
          >
          tuple. The scope tracks all running animations and automatically stops them
          when the component is destroyed. String selectors resolve within the scope's
          container element. Must be called within an injection context.
        </p>

        <app-code-block [code]="useAnimateMinimalCode" lang="typescript" filename="component.ts" class="mb-4" />

        <p class="text-secondary mb-6 text-sm">
          The full example below shows scoped element references and chained animations:
        </p>

        <app-code-block [code]="useAnimateCode" lang="typescript" filename="component.ts" class="mb-6" />

        <div class="space-y-4">
          <div class="rounded-xl border border-border p-5 bg-surface/30">
            <div class="flex items-start gap-3">
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10 whitespace-nowrap flex-shrink-0"
                >scope.current</code
              >
              <p class="text-secondary text-sm">
                Assign this to the container DOM element. String selectors in
                <code
                  class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                  >animate()</code
                >
                calls are then resolved relative to this container.
              </p>
            </div>
          </div>

          <div class="rounded-xl border border-border p-5 bg-surface/30">
            <div class="flex items-start gap-3">
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10 whitespace-nowrap flex-shrink-0"
                >scope.animations</code
              >
              <p class="text-secondary text-sm">
                An array of all in-flight animations. Used internally for cleanup on
                destroy &mdash; you can also inspect it to check animation status.
              </p>
            </div>
          </div>

          <div class="rounded-xl border border-border p-5 bg-surface/30">
            <div class="flex items-start gap-3">
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10 whitespace-nowrap flex-shrink-0"
                >.finished</code
              >
              <p class="text-secondary text-sm">
                Every animation returns a promise via
                <code
                  class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                  >.finished</code
                >. Chain them with
                <code
                  class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                  >await</code
                >
                to build imperative sequences.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Declarative vs Imperative -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.5 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Declarative vs Imperative
        </h2>
        <p class="text-secondary mb-6">
          Most animations in ng-motion are best expressed declaratively with the
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >ngmMotion</code
          >
          directive. Reach for imperative animation when:
        </p>

        <div class="rounded-xl border border-border overflow-hidden mb-6">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border bg-elevated/50">
                <th class="text-left px-4 py-2.5 font-mono text-xs text-muted">
                  Use case
                </th>
                <th class="text-left px-4 py-2.5 font-mono text-xs text-muted">
                  Approach
                </th>
              </tr>
            </thead>
            <tbody class="bg-code-bg">
              @for (row of comparisonRows; track row.useCase) {
                <tr class="border-b border-border/50 last:border-0">
                  <td class="px-4 py-2.5 text-secondary">{{ row.useCase }}</td>
                  <td class="px-4 py-2.5">
                    <code
                      class="text-accent-pink font-mono text-xs px-1.5 py-0.5 rounded bg-accent-pink/10"
                      >{{ row.approach }}</code
                    >
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <!-- stagger() -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.6 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">stagger()</h2>
        <p class="text-secondary mb-6">
          When animating multiple elements with
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >animate()</code
          >, use
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >stagger()</code
          >
          to add incremental delay between each element. Pass it as the
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >delay</code
          >
          option:
        </p>

        <app-code-block [code]="staggerCode" lang="typescript" filename="component.ts" />

        <!-- Live stagger demo -->
        <div class="rounded-xl border border-border p-10 bg-surface/30 flex flex-col items-center justify-center gap-6 mt-6">
          <button
            ngmMotion
            [whileHover]="{ scale: 1.05 }"
            [whileTap]="{ scale: 0.95 }"
            [transition]="{ type: 'spring', stiffness: 400, damping: 17 }"
            (click)="replayStagger()"
            class="px-5 py-2.5 rounded-lg bg-accent/10 border border-accent/20 text-accent text-sm font-medium cursor-pointer select-none"
          >
            Replay stagger
          </button>
          <div class="flex gap-3">
            @for (i of staggerItems; track i) {
              <div
                ngmMotion
                [animate]="staggerVisible() ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.8 }"
                [transition]="staggerVisible() ? { type: 'spring', stiffness: 300, damping: 20, delay: i * 0.08 } : { duration: 0.15 }"
                class="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent-purple"
              ></div>
            }
          </div>
          <p class="text-xs text-muted font-mono">Elements stagger in with 80ms intervals</p>
          <p class="text-secondary text-sm mt-3">
            This demo uses manual
            <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">delay: i * 0.08</code>
            offsets for staggering. The
            <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">stagger()</code>
            utility (shown above) provides a more concise approach with additional options like
            <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">from</code> and
            <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">startDelay</code>.
          </p>

          <app-code-block [code]="staggerAlternativeCode" lang="typescript" filename="component.ts" class="mt-3" />
        </div>

        <div class="rounded-xl border border-border p-5 bg-surface/30 mt-6">
          <p class="text-secondary text-sm">
            <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">stagger(duration, {{ '{' }} from?, startDelay? {{ '}' }})</code>
            &mdash;
            <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">from</code>
            controls the stagger origin
            (<code class="text-accent-pink font-mono text-xs px-1.5 py-0.5 rounded bg-accent-pink/10">'first'</code> |
            <code class="text-accent-pink font-mono text-xs px-1.5 py-0.5 rounded bg-accent-pink/10">'last'</code> |
            <code class="text-accent-pink font-mono text-xs px-1.5 py-0.5 rounded bg-accent-pink/10">'center'</code> |
            <code class="text-accent-pink font-mono text-xs px-1.5 py-0.5 rounded bg-accent-pink/10">number</code>),
            <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">startDelay</code>
            adds initial delay before the stagger begins.
          </p>
        </div>
      </section>

      <!-- Playback Controls -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.7 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Playback Controls
        </h2>
        <p class="text-secondary mb-6">
          Every
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >animate()</code
          >
          call returns playback controls. Use them to pause, resume, stop, or await
          completion:
        </p>

        <app-code-block [code]="playbackCode" lang="typescript" filename="component.ts" />
      </section>

      <!-- When to use which API -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.8 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          When to use which API
        </h2>
        <p class="text-secondary mb-6">
          ng-motion offers three ways to animate. Pick the simplest one that fits your use case:
        </p>

        <div class="rounded-xl border border-border bg-surface/30 p-6 space-y-5">
          <div class="flex items-start gap-4">
            <div class="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2"></div>
            <div>
              <p class="text-primary font-medium mb-1">
                <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">ngmMotion</code> directive
              </p>
              <p class="text-secondary text-sm">
                Best for most animations. Declarative, reactive, and handles enter/exit/gesture states automatically.
                Use it when animation state maps directly to component state.
              </p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2"></div>
            <div>
              <p class="text-primary font-medium mb-1">
                <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">animate()</code> function
              </p>
              <p class="text-secondary text-sm">
                Fire-and-forget imperative animations. Use for one-off effects after async events, multi-step
                sequences, or animating MotionValues. No cleanup needed.
              </p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2"></div>
            <div>
              <p class="text-primary font-medium mb-1">
                <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">useAnimate()</code> hook
              </p>
              <p class="text-secondary text-sm">
                Scoped imperative animations with auto-cleanup. Use when you need to animate elements within a
                component subtree and want all animations cancelled when the component is destroyed.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Next steps -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.9 }"
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
export class UseAnimatePage {
  private readonly pendingTimers: ReturnType<typeof setTimeout>[] = [];
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.destroyRef.onDestroy(() => this.pendingTimers.forEach(clearTimeout));
  }

  // ── Code examples ──

  readonly animateElementCode = [
    "import { animate } from 'ng-motion';",
    '',
    '// Animate by CSS selector',
    "animate('.card', { opacity: [0, 1], y: [24, 0] }, { duration: 0.5 });",
    '',
    '// Animate a direct element reference',
    'const el = this.elementRef.nativeElement;',
    "animate(el, { scale: [0.9, 1], opacity: [0, 1] }, { duration: 0.4, ease: 'easeOut' });",
    '',
    '// Animate multiple elements matching a selector',
    "animate('.list-item', { opacity: 1, x: 0 }, {",
    '  duration: 0.3,',
    "  delay: stagger(0.08),  // see stagger() below",
    '});',
  ].join('\n');

  readonly animateMotionValueCode = [
    "import { animate, useMotionValue, useTransform } from 'ng-motion';",
    '',
    '@Component({',
    '  imports: [NgmMotionDirective],',
    '  template: `<div ngmMotion [style]="{ opacity: opacity }">...</div>`,',
    '})',
    'export class FadeComponent {',
    '  readonly opacity = useMotionValue(0);',
    '',
    '  show(): void {',
    '    // Animate the MotionValue from its current value to 1',
    '    animate(this.opacity, 1, { duration: 0.3 });',
    '  }',
    '',
    '  hide(): void {',
    "    animate(this.opacity, 0, { duration: 0.2, ease: 'easeIn' });",
    '  }',
    '}',
  ].join('\n');

  readonly sequenceCode = [
    "import { animate, type AnimationSequence } from 'ng-motion';",
    '',
    'async playEntrance(): Promise<void> {',
    '  const sequence: AnimationSequence = [',
    '    // Step 1: badge scales in',
    "    ['.badge', { scale: [0, 1.2, 1] }, { duration: 0.3 }],",
    '',
    '    // Step 2: label fades in at the same time as step 1',
    "    ['.label', { opacity: [0, 1], y: [8, 0] }, { at: '<', duration: 0.2 }],",
    '',
    '    // Step 3: description fades in 0.1s after step 2 ends',
    "    ['.description', { opacity: [0, 1] }, { at: '+0.1', duration: 0.3 }],",
    '',
    '    // Step 4: CTA button slides up',
    "    ['.cta', { opacity: [0, 1], y: [16, 0] }, { duration: 0.25 }],",
    '  ];',
    '',
    '  await animate(sequence).finished;',
    "  console.log('Entrance complete');",
    '}',
  ].join('\n');

  readonly useAnimateMinimalCode = [
    "import { useAnimate } from 'ng-motion';",
    '',
    '// Minimal useAnimate example',
    'export class MyComponent {',
    '  private readonly [scope, animate] = useAnimate();',
    '',
    '  run(): void {',
    "    this.animate('.box', { rotate: 360 }, { duration: 0.5 });",
    '  }',
    '}',
  ].join('\n');

  readonly useAnimateCode = [
    "import { afterNextRender, Component, ElementRef, viewChild } from '@angular/core';",
    "import { useAnimate, type ScopedAnimate } from 'ng-motion';",
    '',
    '@Component({',
    '  template: `',
    '    <div #container>',
    '      <div #box class="box"></div>',
    '      <button (click)="run()">Animate</button>',
    '    </div>',
    '  `,',
    '})',
    'export class ScopedAnimationComponent {',
    "  private readonly containerRef = viewChild<ElementRef<HTMLElement>>('container');",
    "  private readonly boxRef = viewChild<ElementRef<HTMLElement>>('box');",
    '',
    '  // Returns [scope, scopedAnimate]',
    '  private readonly animateApi = useAnimate<HTMLElement>();',
    '  private readonly scope = this.animateApi[0];',
    '  private readonly animateInScope: ScopedAnimate = this.animateApi[1];',
    '',
    '  constructor() {',
    '    afterNextRender(() => {',
    '      const container = this.containerRef();',
    '      if (container) this.scope.current = container.nativeElement;',
    '    });',
    '  }',
    '',
    '  async run(): Promise<void> {',
    '    const box = this.boxRef()?.nativeElement;',
    '    if (!box) return;',
    '',
    '    // Animations are scoped and auto-cleaned on destroy',
    '    await this.animateInScope(box, { scale: 1.2 }, { duration: 0.2 }).finished;',
    '    await this.animateInScope(box, { rotate: 180 }, { duration: 0.3 }).finished;',
    "    await this.animateInScope(box, { scale: 1, rotate: 0 }, { duration: 0.2, ease: 'easeOut' }).finished;",
    '  }',
    '}',
  ].join('\n');

  readonly staggerCode = [
    "import { animate, stagger } from 'ng-motion';",
    '',
    '// Stagger by 80ms between each element',
    "animate('.card', { opacity: [0, 1], y: [20, 0] }, {",
    '  duration: 0.4,',
    '  delay: stagger(0.08),',
    '});',
    '',
    '// Stagger from the center outward',
    "animate('.grid-item', { scale: [0, 1] }, {",
    '  duration: 0.3,',
    "  delay: stagger(0.05, { from: 'center' }),",
    '});',
    '',
    '// Stagger with a starting delay',
    "animate('.list-item', { x: [24, 0], opacity: [0, 1] }, {",
    '  duration: 0.3,',
    '  delay: stagger(0.06, { startDelay: 0.2 }),',
    '});',
  ].join('\n');

  readonly staggerAlternativeCode = [
    '// Using stagger utility instead of manual delay offsets',
    "animate('.item', { opacity: 1 }, { delay: stagger(0.08) })",
  ].join('\n');

  readonly playbackCode = [
    "import { animate } from 'ng-motion';",
    '',
    '// Get playback controls',
    "const controls = animate('.box', { x: 200 }, { duration: 2 });",
    '',
    '// Pause and resume',
    'controls.pause();',
    'controls.play();',
    '',
    '// Stop at current state (freezes in place)',
    'controls.stop();',
    '',
    '// Complete immediately (jumps to final state)',
    'controls.complete();',
    '',
    '// Cancel (revert to initial state)',
    'controls.cancel();',
    '',
    '// Set playback speed (0.5 = half speed, 2 = double)',
    'controls.speed = 0.5;',
    '',
    '// Await completion',
    'await controls.finished;',
    '',
    '// Chain multiple animations',
    "await animate('.step-1', { opacity: 1 }, { duration: 0.3 }).finished;",
    "await animate('.step-2', { x: 0 }, { duration: 0.2 }).finished;",
    "await animate('.step-3', { scale: 1 }, { duration: 0.25 }).finished;",
  ].join('\n');

  // ── Live demo state ──

  readonly staggerItems = [0, 1, 2, 3, 4];
  readonly staggerVisible = signal(true);

  replayStagger(): void {
    this.staggerVisible.set(false);
    this.pendingTimers.push(setTimeout(() => this.staggerVisible.set(true), 300));
  }

  readonly seqStep = signal(0);

  replaySequence(): void {
    this.seqStep.set(0);
    this.pendingTimers.push(setTimeout(() => this.seqStep.set(1), 200));
    this.pendingTimers.push(setTimeout(() => this.seqStep.set(2), 600));
    this.pendingTimers.push(setTimeout(() => this.seqStep.set(3), 1000));
  }

  // ── Comparison table ──

  readonly comparisonRows = [
    {
      useCase: 'Animate on mount, hover, tap, drag, focus',
      approach: 'ngmMotion directive',
    },
    {
      useCase: 'Toggle between named states',
      approach: 'ngmMotion + variants',
    },
    {
      useCase: 'Multi-step timeline or choreographed sequence',
      approach: 'animate() sequence',
    },
    {
      useCase: 'Fire-and-forget after an async event',
      approach: 'animate()',
    },
    {
      useCase: 'Animate within a component with auto-cleanup',
      approach: 'useAnimate()',
    },
    {
      useCase: 'Coordinate animations across many elements',
      approach: 'animate() + stagger()',
    },
    {
      useCase: 'Drive a MotionValue programmatically',
      approach: 'animate(motionValue, target)',
    },
  ];

  // ── Next steps ──

  readonly nextLinks = [
    {
      path: '/docs/use-cycle',
      title: 'useCycle',
      description: 'Cycle through a list of animation values',
    },
    {
      path: '/docs/motion-values',
      title: 'Motion Values',
      description: 'Track and transform animation values reactively',
    },
    {
      path: '/docs/transitions',
      title: 'Transitions',
      description: 'Springs, tweens, and per-property overrides',
    },
    {
      path: '/docs/motion-directive',
      title: 'Motion Directive',
      description: 'Full declarative API reference',
    },
  ];
}
