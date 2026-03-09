import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { EasingDefinition } from 'motion-utils';
import { NgmMotionDirective } from 'ng-motion';
import { CodeBlockComponent } from '../../components/code-block.component';
import { DemoReplayComponent } from '../../components/demo-replay.component';

@Component({
  selector: 'app-transitions',
  imports: [RouterLink, NgmMotionDirective, CodeBlockComponent, DemoReplayComponent],
  template: `
    <article class="max-w-3xl pb-16">
      <!-- Header -->
      <div
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
      >
        <h1 class="font-display font-bold text-4xl mb-4">Transitions</h1>
        <p class="text-lg text-secondary mb-12 leading-relaxed">
          Transitions control <em>how</em> an animation moves between values &mdash; the
          timing, easing, and physics. While
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >animate</code
          >
          describes <em>where</em> to go, the
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >transition</code
          >
          input describes how to get there.
        </p>
      </div>

      <!-- ═══════════════ Tween Transitions ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.1 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Tween (duration-based)</h2>
        <p class="text-secondary mb-6">
          The default transition type. Tween animations interpolate between values over a
          fixed
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >duration</code
          >
          using an
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >ease</code
          >
          curve.
        </p>

        <app-code-block [code]="tweenCode" lang="html" filename="template" class="mb-6" />

        <!-- Tween live demo -->
        <div
          class="rounded-xl border border-border p-10 bg-surface/30 flex flex-col items-center gap-6"
        >
          <p class="text-sm text-muted font-mono mb-2">hover to see the tween</p>
          <div
            ngmMotion
            [whileHover]="{ x: 80, opacity: 1 }"
            [transition]="{ duration: 0.8, ease: 'easeInOut' }"
            class="w-20 h-20 rounded-xl bg-gradient-to-br from-accent to-accent-purple cursor-pointer shadow-lg shadow-accent/20"
          ></div>
        </div>
      </section>

      <!-- ═══════════════ Spring Transitions ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.2 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Spring (physics-based)</h2>
        <p class="text-secondary mb-6">
          Springs simulate real-world physics for natural-feeling motion. Control the feel
          with
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
          >.
        </p>

        <app-code-block [code]="springCode" lang="html" filename="template" class="mb-6" />

        <!-- Spring comparison demo -->
        <div
          class="rounded-xl border border-border p-10 bg-surface/30"
        >
          <p class="text-sm text-muted font-mono text-center mb-8">
            hover &amp; tap each box to compare spring configs
          </p>
          <div class="flex items-center justify-center gap-10 flex-wrap">
            <div class="text-center">
              <div
                ngmMotion
                [whileHover]="{ scale: 1.35, rotate: 8 }"
                [whileTap]="{ scale: 0.85, rotate: -4 }"
                [transition]="{ type: 'spring', stiffness: 600, damping: 10 }"
                class="w-16 h-16 rounded-xl bg-gradient-to-br from-accent to-accent-purple cursor-pointer mx-auto mb-3 shadow-lg shadow-accent/20"
              ></div>
              <p class="text-xs text-muted font-mono">bouncy</p>
              <p class="text-[10px] text-muted/60 font-mono mt-0.5">stiffness: 600</p>
              <p class="text-[10px] text-muted/60 font-mono">damping: 10</p>
            </div>
            <div class="text-center">
              <div
                ngmMotion
                [whileHover]="{ scale: 1.35, rotate: 8 }"
                [whileTap]="{ scale: 0.85, rotate: -4 }"
                [transition]="{ type: 'spring', stiffness: 300, damping: 24 }"
                class="w-16 h-16 rounded-xl bg-gradient-to-br from-accent-pink to-accent-gold cursor-pointer mx-auto mb-3 shadow-lg shadow-accent-pink/20"
              ></div>
              <p class="text-xs text-muted font-mono">smooth</p>
              <p class="text-[10px] text-muted/60 font-mono mt-0.5">stiffness: 300</p>
              <p class="text-[10px] text-muted/60 font-mono">damping: 24</p>
            </div>
            <div class="text-center">
              <div
                ngmMotion
                [whileHover]="{ scale: 1.35, rotate: 8 }"
                [whileTap]="{ scale: 0.85, rotate: -4 }"
                [transition]="{ type: 'spring', stiffness: 80, damping: 14, mass: 2 }"
                class="w-16 h-16 rounded-xl bg-gradient-to-br from-accent-purple to-accent-pink cursor-pointer mx-auto mb-3 shadow-lg shadow-accent-purple/20"
              ></div>
              <p class="text-xs text-muted font-mono">heavy</p>
              <p class="text-[10px] text-muted/60 font-mono mt-0.5">stiffness: 80</p>
              <p class="text-[10px] text-muted/60 font-mono">damping: 14, mass: 2</p>
            </div>
          </div>
        </div>

        <!-- Spring properties table -->
        <div class="mt-6 rounded-xl border border-border overflow-hidden">
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

      <!-- ═══════════════ Inertia Transitions ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.3 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Inertia (momentum-based)</h2>
        <p class="text-secondary mb-6">
          Inertia animations decelerate a value based on its initial velocity, like
          flicking a list. Useful after drag gestures to create a natural
          &ldquo;throw&rdquo; effect. Use
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >min</code
          >
          and
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >max</code
          >
          to set boundaries.
        </p>

        <app-code-block [code]="inertiaCode" lang="html" filename="template" class="mb-6" />

        <!-- Inertia live demo -->
        <div
          class="rounded-xl border border-border p-10 bg-surface/30 flex flex-col items-center gap-4 mb-6"
        >
          <p class="text-sm text-muted font-mono mb-2">drag &amp; fling the box — it decelerates with inertia</p>
          <div class="relative w-72 h-24 rounded-xl border border-border/30 bg-code-bg flex items-center">
            <div class="absolute inset-y-0 left-0 w-px border-l border-dashed border-accent/30"></div>
            <div class="absolute inset-y-0 right-0 w-px border-r border-dashed border-accent/30"></div>
            <div
              ngmMotion
              [drag]="'x'"
              [dragConstraints]="{ left: -100, right: 100, top: 0, bottom: 0 }"
              [dragElastic]="0.15"
              [dragMomentum]="true"
              [whileDrag]="{ scale: 1.1 }"
              [transition]="{ type: 'inertia', power: 0.6, timeConstant: 400 }"
              class="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-accent-purple cursor-grab active:cursor-grabbing shadow-lg shadow-accent/20 mx-auto"
            ></div>
          </div>
          <p class="text-xs text-muted max-w-xs text-center">
            power: 0.6 &middot; timeConstant: 400 &middot; constrained to the track
          </p>
        </div>

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
              @for (row of inertiaProps; track row.name) {
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

        <div class="rounded-xl border border-border bg-surface/30 p-5 mt-6">
          <p class="text-secondary text-sm">
            Inertia transitions are most commonly used with drag gestures. For drag-specific
            inputs like
            <code class="text-accent-pink font-mono text-xs px-1.5 py-0.5 rounded bg-accent-pink/10">dragConstraints</code>,
            <code class="text-accent-pink font-mono text-xs px-1.5 py-0.5 rounded bg-accent-pink/10">dragElastic</code>, and
            <code class="text-accent-pink font-mono text-xs px-1.5 py-0.5 rounded bg-accent-pink/10">dragMomentum</code>,
            see the <a routerLink="/docs/drag" class="text-accent hover:underline font-medium">Drag page</a>.
          </p>
        </div>
      </section>

      <!-- ═══════════════ Per-Property Transitions ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.4 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Per-property transitions</h2>
        <p class="text-secondary mb-6">
          Different properties can use different transition configs. Define a transition for
          each property key &mdash; any property without a specific transition falls back to
          the top-level config.
        </p>

        <app-code-block [code]="perPropertyCode" lang="html" filename="template" class="mb-6" />

        <!-- Per-property live demo -->
        <div
          class="rounded-xl border border-border p-10 bg-surface/30 flex flex-col items-center gap-4"
        >
          <p class="text-sm text-muted font-mono mb-2">hover to see split transitions</p>
          <div
            ngmMotion
            [initial]="{ opacity: 0.4, x: -60 }"
            [animate]="{ opacity: 1, x: 0 }"
            [whileHover]="{ scale: 1.15, rotate: 8 }"
            [transition]="{
              x: { type: 'spring', stiffness: 300, damping: 20 },
              opacity: { duration: 1.2, ease: 'easeOut' },
              scale: { type: 'spring', stiffness: 500, damping: 15 },
              rotate: { type: 'spring', stiffness: 200, damping: 10 }
            }"
            class="w-20 h-20 rounded-xl bg-gradient-to-br from-accent-pink to-accent-gold cursor-pointer shadow-lg shadow-accent-pink/20"
          ></div>
          <p class="text-xs text-muted max-w-sm text-center mt-2">
            x uses a spring, opacity uses a slow tween, scale uses a stiff spring, rotate
            uses a bouncy spring
          </p>
        </div>
      </section>

      <!-- ═══════════════ Delay & Stagger ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.5 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Delay & stagger</h2>
        <p class="text-secondary mb-6">
          Use
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >delay</code
          >
          to postpone the start of an animation (in seconds). For staggered lists, combine
          delay with an index multiplier or use
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >staggerChildren</code
          >
          inside variant transitions.
        </p>

        <app-code-block [code]="staggerCode" lang="html" filename="template" class="mb-6" />

        <!-- Stagger live demo -->
        <app-demo-replay>
          <ng-template>
            <div
              class="rounded-xl border border-border p-10 bg-surface/30 flex flex-col items-center gap-4"
            >
              <p class="text-sm text-muted font-mono mb-4">staggered entrance</p>
              <div class="flex gap-4">
                @for (i of staggerItems; track i) {
                  <div
                    ngmMotion
                    [initial]="{ opacity: 0, y: 30, scale: 0.5 }"
                    [whileInView]="{ opacity: 1, y: 0, scale: 1 }"
                    [viewport]="{ once: true }"
                    [transition]="{
                      delay: i * 0.12,
                      type: 'spring',
                      stiffness: 300,
                      damping: 20
                    }"
                    [whileHover]="{ y: -6, scale: 1.1 }"
                    class="w-12 h-12 rounded-lg cursor-pointer"
                    [class]="staggerColors[i]"
                  ></div>
                }
              </div>
            </div>
          </ng-template>
        </app-demo-replay>

        <div class="rounded-xl border border-border bg-surface/30 p-5 mt-6">
          <p class="text-secondary text-sm">
            Transitions also support orchestration properties &mdash;
            <code class="text-accent-pink font-mono text-xs px-1.5 py-0.5 rounded bg-accent-pink/10">when</code>,
            <code class="text-accent-pink font-mono text-xs px-1.5 py-0.5 rounded bg-accent-pink/10">staggerChildren</code>, and
            <code class="text-accent-pink font-mono text-xs px-1.5 py-0.5 rounded bg-accent-pink/10">delayChildren</code>
            &mdash; which control the order that parent and child animations play.
            These are covered in depth on the
            <a routerLink="/docs/variants" class="text-accent hover:underline font-medium">Variants page</a>.
          </p>
        </div>
      </section>

      <!-- ═══════════════ Repeat Animations ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.6 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Repeat animations</h2>
        <p class="text-secondary mb-6">
          Loop, reverse, or mirror animations using
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >repeat</code
          >,
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >repeatType</code
          >, and
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >repeatDelay</code
          >. Set
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >repeat</code
          >
          to
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >Infinity</code
          >
          for endless loops.
        </p>

        <app-code-block [code]="repeatCode" lang="typescript" filename="component.ts" class="mb-6" />

        <!-- Repeat live demos -->
        <div
          class="rounded-xl border border-border p-10 bg-surface/30"
        >
          <div class="flex items-center justify-center gap-12 flex-wrap">
            <div class="text-center">
              <div
                ngmMotion
                [animate]="{ rotate: 360 }"
                [transition]="{
                  duration: 2,
                  repeat: inf,
                  ease: 'linear'
                }"
                class="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-accent-purple mx-auto mb-3"
              ></div>
              <p class="text-xs text-muted font-mono">loop</p>
              <p class="text-[10px] text-muted/60 font-mono mt-0.5">
                repeatType: 'loop'
              </p>
            </div>
            <div class="text-center">
              <div
                ngmMotion
                [animate]="{ x: 60 }"
                [transition]="{
                  duration: 1,
                  repeat: inf,
                  repeatType: 'reverse',
                  ease: 'easeInOut'
                }"
                class="w-14 h-14 rounded-xl bg-gradient-to-br from-accent-pink to-accent-gold mx-auto mb-3"
              ></div>
              <p class="text-xs text-muted font-mono">reverse</p>
              <p class="text-[10px] text-muted/60 font-mono mt-0.5">
                repeatType: 'reverse'
              </p>
            </div>
            <div class="text-center">
              <div
                ngmMotion
                [animate]="{ scale: [1, 1.4, 1] }"
                [transition]="{
                  duration: 1.5,
                  repeat: inf,
                  repeatType: 'mirror',
                  ease: 'easeInOut'
                }"
                class="w-14 h-14 rounded-full bg-gradient-to-br from-accent-purple to-accent-pink mx-auto mb-3"
              ></div>
              <p class="text-xs text-muted font-mono">mirror</p>
              <p class="text-[10px] text-muted/60 font-mono mt-0.5">
                repeatType: 'mirror'
              </p>
            </div>
          </div>
        </div>

        <!-- Repeat properties -->
        <div class="mt-6 rounded-xl border border-border overflow-hidden">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border bg-elevated/50">
                <th class="text-left px-4 py-2.5 font-mono text-xs text-muted">
                  Property
                </th>
                <th class="text-left px-4 py-2.5 font-mono text-xs text-muted">
                  Type
                </th>
                <th class="text-left px-4 py-2.5 font-mono text-xs text-muted">
                  Description
                </th>
              </tr>
            </thead>
            <tbody class="bg-code-bg">
              @for (row of repeatProps; track row.name) {
                <tr class="border-b border-border/50 last:border-0">
                  <td class="px-4 py-2.5">
                    <code
                      class="text-accent-pink font-mono text-xs px-1.5 py-0.5 rounded bg-accent-pink/10"
                      >{{ row.name }}</code
                    >
                  </td>
                  <td class="px-4 py-2.5 font-mono text-xs text-muted">
                    {{ row.type }}
                  </td>
                  <td class="px-4 py-2.5 text-secondary">{{ row.desc }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <!-- ═══════════════ Ease Curves ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.7 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Ease curves</h2>
        <p class="text-secondary mb-6">
          Easing functions control the acceleration curve of tween animations. Pass a named
          string or a
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >[n, n, n, n]</code
          >
          cubic bezier array.
        </p>

        <!-- Ease visual reference -->
        <app-demo-replay>
          <ng-template>
            <div class="rounded-xl border border-border p-8 bg-surface/30">
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                @for (ease of easeCurves; track ease.name; let i = $index) {
                  <div
                    ngmMotion
                    [initial]="{ opacity: 0, y: 16 }"
                    [whileInView]="{ opacity: 1, y: 0 }"
                    [viewport]="{ once: true }"
                    [transition]="{ delay: i * 0.05 }"
                    class="group text-center"
                  >
                    <div
                      class="rounded-lg border border-border/50 bg-code-bg p-4 mb-2 overflow-hidden"
                    >
                      <div
                        ngmMotion
                        [animate]="{ x: [0, 40, 0] }"
                        [transition]="{
                          duration: 2,
                          repeat: inf,
                          ease: ease.value
                        }"
                        class="w-3 h-3 rounded-full"
                        [class]="ease.color"
                      ></div>
                    </div>
                    <p class="text-[11px] text-muted font-mono">{{ ease.name }}</p>
                  </div>
                }
              </div>
            </div>
          </ng-template>
        </app-demo-replay>

        <app-code-block [code]="cubicBezierCode" lang="html" filename="template" class="mt-6" />
      </section>

      <!-- ═══════════════ Next Steps ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.8 }"
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
export class TransitionsPage {
  protected readonly inf = Infinity;

  readonly staggerItems = [0, 1, 2, 3, 4];
  readonly staggerColors = [
    'bg-gradient-to-br from-accent to-accent-purple',
    'bg-gradient-to-br from-accent-purple to-accent-pink',
    'bg-gradient-to-br from-accent-pink to-accent-gold',
    'bg-gradient-to-br from-accent-gold to-accent',
    'bg-gradient-to-br from-accent to-accent-pink',
  ];

  // ── Code snippets ──────────────────────────────────────────────

  readonly tweenCode = [
    '<div',
    '  ngmMotion',
    '  [animate]="{ opacity: 1, x: 0 }"',
    '  [transition]="{',
    '    duration: 0.8,',
    "    ease: 'easeInOut'",
    '  }"',
    '>',
  ].join('\n');

  readonly springCode = [
    '<div',
    '  ngmMotion',
    '  [whileHover]="{ scale: 1.35, rotate: 8 }"',
    '  [whileTap]="{ scale: 0.85, rotate: -4 }"',
    '  [transition]="{',
    "    type: 'spring',",
    '    stiffness: 300,',
    '    damping: 24,',
    '    mass: 1',
    '  }"',
    '>',
  ].join('\n');

  readonly inertiaCode = [
    '<div',
    '  ngmMotion',
    '  [drag]="\'x\'"',
    '  [dragConstraints]="{ left: -100, right: 100, top: 0, bottom: 0 }"',
    '  [dragElastic]="0.15"',
    '  [dragMomentum]="true"',
    '  [whileDrag]="{ scale: 1.1 }"',
    '  [transition]="{',
    "    type: 'inertia',",
    '    power: 0.6,',
    '    timeConstant: 400',
    '  }"',
    '>',
  ].join('\n');

  readonly perPropertyCode = [
    '<div',
    '  ngmMotion',
    '  [animate]="{ x: 0, opacity: 1, scale: 1 }"',
    '  [transition]="{',
    "    x: { type: 'spring', stiffness: 300, damping: 20 },",
    "    opacity: { duration: 1.2, ease: 'easeOut' },",
    "    scale: { type: 'spring', stiffness: 500, damping: 15 }",
    '  }"',
    '>',
  ].join('\n');

  readonly staggerCode = [
    '<!-- Using delay with index -->',
    '@for (item of items; track item; let i = $index) {',
    '  <div',
    '    ngmMotion',
    '    [initial]="{ opacity: 0, y: 30 }"',
    '    [animate]="{ opacity: 1, y: 0 }"',
    '    [transition]="{',
    '      delay: i * 0.12,',
    "      type: 'spring',",
    '      stiffness: 300,',
    '      damping: 20',
    '    }"',
    '  >',
    '    {{ item }}',
    '  </div>',
    '}',
    '',
    '<!-- Or using variants with manual delay -->',
    '@for (item of items; track item; let i = $index) {',
    '  <div ngmMotion',
    '    [animate]="visible() ? \'visible\' : \'hidden\'"',
    '    [variants]="itemVariants"',
    '    [transition]="{ delay: i * 0.12 }"',
    '  >{{ item }}</div>',
    '}',
  ].join('\n');

  readonly repeatCode = [
    '// In your component class:',
    'readonly repeatCount = Infinity;',
    '',
    '<!-- Infinite rotation -->',
    '<div',
    '  ngmMotion',
    '  [animate]="{ rotate: 360 }"',
    '  [transition]="{',
    '    duration: 2,',
    '    repeat: repeatCount,',
    "    ease: 'linear'",
    '  }"',
    '>',
    '',
    '<!-- Reverse bounce -->',
    '<div',
    '  ngmMotion',
    '  [animate]="{ x: 100 }"',
    '  [transition]="{',
    '    duration: 1,',
    '    repeat: repeatCount,',
    "    repeatType: 'reverse',",
    "    ease: 'easeInOut'",
    '  }"',
    '>',
  ].join('\n');

  readonly cubicBezierCode = [
    '<!-- Named ease -->',
    "[transition]=\"{ ease: 'easeInOut' }\"",
    '',
    '<!-- Cubic bezier array -->',
    '[transition]="{ ease: [0.33, 1, 0.68, 1] }"',
  ].join('\n');

  // ── Table data ─────────────────────────────────────────────────

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
      name: 'restDelta',
      defaultVal: '0.01',
      desc: 'Distance threshold below which the spring is considered at rest.',
    },
    {
      name: 'restSpeed',
      defaultVal: '0.01',
      desc: 'Speed threshold below which the spring is considered at rest.',
    },
  ];

  readonly inertiaProps = [
    {
      name: 'velocity',
      defaultVal: '0',
      desc: 'Initial velocity to decelerate from.',
    },
    {
      name: 'power',
      defaultVal: '0.8',
      desc: 'Multiplier for the velocity. Higher values carry farther.',
    },
    {
      name: 'timeConstant',
      defaultVal: '325',
      desc: 'Time constant for the exponential decay (ms).',
    },
    {
      name: 'min',
      defaultVal: '-',
      desc: 'Minimum allowed value. Applies a spring boundary.',
    },
    {
      name: 'max',
      defaultVal: '-',
      desc: 'Maximum allowed value. Applies a spring boundary.',
    },
    {
      name: 'bounceStiffness',
      defaultVal: '500',
      desc: 'Stiffness of the bounce spring when hitting a min/max boundary.',
    },
    {
      name: 'bounceDamping',
      defaultVal: '10',
      desc: 'Damping of the bounce spring when hitting a min/max boundary.',
    },
    {
      name: 'restDelta',
      defaultVal: '0.5',
      desc: 'Distance threshold below which the animation is considered at rest.',
    },
    {
      name: 'modifyTarget',
      defaultVal: '-',
      desc: 'A function that receives the auto-calculated target and returns a new one. Useful for snapping to a grid.',
    },
  ];

  readonly repeatProps = [
    {
      name: 'repeat',
      type: 'number',
      desc: 'Number of times to repeat. Use Infinity for endless loops.',
    },
    {
      name: 'repeatType',
      type: "'loop' | 'reverse' | 'mirror'",
      desc: 'How to repeat: restart from beginning, reverse direction, or mirror.',
    },
    {
      name: 'repeatDelay',
      type: 'number',
      desc: 'Seconds to wait between each repetition.',
    },
  ];

  readonly easeCurves: readonly { name: string; value: EasingDefinition; color: string }[] = [
    { name: 'linear', value: 'linear', color: 'bg-accent' },
    { name: 'easeIn', value: 'easeIn', color: 'bg-accent-purple' },
    { name: 'easeOut', value: 'easeOut', color: 'bg-accent-pink' },
    { name: 'easeInOut', value: 'easeInOut', color: 'bg-accent-gold' },
    { name: 'circIn', value: 'circIn', color: 'bg-accent' },
    { name: 'circOut', value: 'circOut', color: 'bg-accent-purple' },
    { name: 'circInOut', value: 'circInOut', color: 'bg-accent-pink' },
    { name: 'backIn', value: 'backIn', color: 'bg-accent-gold' },
    { name: 'backOut', value: 'backOut', color: 'bg-accent' },
    { name: 'backInOut', value: 'backInOut', color: 'bg-accent-purple' },
    { name: 'anticipate', value: 'anticipate', color: 'bg-accent-pink' },
  ];

  readonly nextLinks = [
    {
      path: '/docs/variants',
      title: 'Variants \u2192',
      description: 'Orchestrate complex animations with named states',
    },
    {
      path: '/docs/gestures',
      title: 'Gestures \u2192',
      description: 'Hover, tap, drag, and focus interactions',
    },
    {
      path: '/docs/motion-values',
      title: 'Motion Values \u2192',
      description: 'Track and transform animation values reactively',
    },
    {
      path: '/docs/motion-directive',
      title: 'Motion Directive \u2192',
      description: 'Full API reference for the core directive',
    },
  ];
}
