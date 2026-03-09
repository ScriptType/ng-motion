import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { CodeBlockComponent } from '../../components/code-block.component';
import { DemoReplayComponent } from '../../components/demo-replay.component';

@Component({
  selector: 'app-scroll',
  imports: [RouterLink, NgmMotionDirective, CodeBlockComponent, DemoReplayComponent],
  template: `
    <article class="max-w-3xl pb-16">
      <!-- Header -->
      <div
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
      >
        <h1 class="font-display font-bold text-4xl mb-4">Scroll Animation</h1>
        <p class="text-lg text-secondary mb-12 leading-relaxed">
          ng-motion supports declarative and imperative scroll-driven animation.
          Track scroll position with reactive
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >MotionValues</code
          >, build smooth progress bars, parallax effects, and viewport-triggered
          animations.
        </p>
      </div>

      <!-- ═══════════════ useScroll() Basics ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.1 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">useScroll()</h2>
        <p class="text-secondary mb-6">
          Returns
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >MotionValues</code
          >
          for scroll position and normalized progress. By default it tracks the
          page scroll.
        </p>

        <div class="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 mb-6">
          <div class="flex items-start gap-3">
            <span class="text-amber-500 text-lg leading-none mt-0.5">&#9888;</span>
            <p class="text-secondary text-sm">
              <strong class="text-amber-400">Injection context required.</strong>
              <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">useScroll()</code>,
              <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">useSpring()</code>, and
              <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">useTransform()</code>
              must be called within an Angular injection context &mdash; for example,
              a class field initializer or constructor. Calling them outside an
              injection context will throw a runtime error.
            </p>
          </div>
        </div>

        <app-code-block [code]="useScrollCode" lang="typescript" filename="scroll.component.ts" class="mb-6" />
      </section>

      <!-- ═══════════════ Returned Motion Values ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.2 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Returned motion values</h2>
        <p class="text-secondary mb-6">
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >useScroll()</code
          >
          returns four
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >MotionValue&lt;number&gt;</code
          >
          properties, each updating reactively as the user scrolls:
        </p>

        <div
          class="rounded-xl border border-border bg-surface/30 overflow-hidden"
        >
          <div class="grid grid-cols-2 border-b border-border px-5 py-3">
            <span class="text-xs text-muted font-mono uppercase tracking-wider"
              >Value</span
            >
            <span class="text-xs text-muted font-mono uppercase tracking-wider"
              >Description</span
            >
          </div>
          <div
            class="grid grid-cols-2 border-b border-border/50 px-5 py-3.5 items-center"
          >
            <code class="text-sm font-mono text-accent">scrollX</code>
            <span class="text-sm text-secondary"
              >Horizontal scroll position in pixels</span
            >
          </div>
          <div
            class="grid grid-cols-2 border-b border-border/50 px-5 py-3.5 items-center"
          >
            <code class="text-sm font-mono text-accent">scrollY</code>
            <span class="text-sm text-secondary"
              >Vertical scroll position in pixels</span
            >
          </div>
          <div
            class="grid grid-cols-2 border-b border-border/50 px-5 py-3.5 items-center"
          >
            <code class="text-sm font-mono text-accent">scrollXProgress</code>
            <span class="text-sm text-secondary"
              >Horizontal progress from 0 to 1</span
            >
          </div>
          <div class="grid grid-cols-2 px-5 py-3.5 items-center">
            <code class="text-sm font-mono text-accent">scrollYProgress</code>
            <span class="text-sm text-secondary"
              >Vertical progress from 0 to 1</span
            >
          </div>
        </div>
      </section>

      <!-- ═══════════════ Scroll Progress Bar ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.3 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Scroll progress bar</h2>
        <p class="text-secondary mb-6">
          A common pattern is driving a progress bar with
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >scrollYProgress</code
          >. Pipe it through
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >useSpring()</code
          >
          to add smooth spring-based easing, then bind the resulting value to
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >scaleX</code
          >
          via a
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >MotionStyle</code
          >.
        </p>

        <app-code-block [code]="progressBarCode" lang="typescript" filename="progress-bar.component.ts" class="mb-6" />

        <div
          class="rounded-xl border border-border bg-surface/30 p-6"
        >
          <div class="flex items-start gap-3">
            <div
              class="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1.5"
            ></div>
            <p class="text-secondary text-sm">
              The
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >transformOrigin: '0% 50%'</code
              >
              anchors the bar to the left edge so
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >scaleX</code
              >
              grows from left to right. The spring smooths out rapid scroll jumps,
              giving the bar a satisfying organic feel.
            </p>
          </div>
        </div>
      </section>

      <!-- ═══════════════ Targeted Scroll Tracking ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.4 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Targeted scroll tracking
        </h2>
        <p class="text-secondary mb-6">
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >useScroll()</code
          >
          accepts
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >container</code
          >
          and
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >target</code
          >
          options, each accepting an
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >ElementRef</code
          >
          or native
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >HTMLElement</code
          >. Use
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >container</code
          >
          to track a scrollable element instead of the page, and
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >target</code
          >
          to track the progress of a specific element within that container.
        </p>

        <app-code-block [code]="targetedScrollCode" lang="typescript" filename="targeted-scroll.component.ts" class="mb-6" />

        <div
          class="rounded-xl border border-border bg-surface/30 p-6 space-y-3"
        >
          <div class="flex items-start gap-3">
            <div
              class="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1.5"
            ></div>
            <p class="text-secondary text-sm">
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >offset</code
              >
              controls when tracking starts and ends. For example,
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >['start end', 'end start']</code
              >
              tracks from the moment the target enters the viewport to when it
              leaves completely.
            </p>
          </div>
        </div>
      </section>

      <!-- ═══════════════ whileInView vs useInView ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.5 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          whileInView vs useInView
        </h2>
        <p class="text-secondary mb-6">
          ng-motion provides two approaches for viewport-triggered behavior.
          Choose based on whether you need pure animation or programmatic
          control.
        </p>

        <!-- whileInView -->
        <h3 class="font-display font-semibold text-lg mb-3 text-primary">
          whileInView &mdash; declarative animation
        </h3>
        <p class="text-secondary mb-4">
          Animate elements when they enter or leave the viewport, directly in the
          template. Use the
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >viewport</code
          >
          input to configure
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >once</code
          >,
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >margin</code
          >, and
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >amount</code
          >.
        </p>

        <app-code-block [code]="whileInViewCode" lang="html" filename="template" class="mb-6" />

        <!-- Live demo: whileInView -->
        <app-demo-replay>
          <ng-template>
            <div
              class="rounded-xl border border-border p-10 bg-surface/30 flex items-center justify-center gap-6"
            >
              @for (i of demoItems; track i) {
                <div
                  ngmMotion
                  [initial]="{ opacity: 0, y: 30, scale: 0.9 }"
                  [whileInView]="{ opacity: 1, y: 0, scale: 1 }"
                  [viewport]="{ once: true, margin: '-50px' }"
                  [transition]="{ type: 'spring', stiffness: 200, damping: 20, delay: i * 0.1 }"
                  class="w-16 h-16 rounded-xl bg-gradient-to-br from-accent/15 to-accent-purple/15 border border-accent/20 flex items-center justify-center"
                >
                  <span class="text-sm font-mono text-accent">{{ i + 1 }}</span>
                </div>
              }
            </div>
          </ng-template>
        </app-demo-replay>

        <!-- useInView -->
        <h3
          class="font-display font-semibold text-lg mb-3 text-primary mt-10"
        >
          useInView() &mdash; imperative signal
        </h3>
        <p class="text-secondary mb-4">
          Returns an Angular
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >Signal&lt;boolean&gt;</code
          >
          that you can use in computed expressions, effects, or conditional
          logic. Requires a reference to the target element.
        </p>

        <app-code-block [code]="useInViewCode" lang="typescript" filename="in-view.component.ts" class="mb-6" />

        <!-- Comparison table -->
        <div
          class="rounded-xl border border-border bg-surface/30 overflow-hidden"
        >
          <div class="grid grid-cols-3 border-b border-border px-5 py-3">
            <span class="text-xs text-muted font-mono uppercase tracking-wider"
              >&nbsp;</span
            >
            <span class="text-xs text-muted font-mono uppercase tracking-wider"
              >whileInView</span
            >
            <span class="text-xs text-muted font-mono uppercase tracking-wider"
              >useInView()</span
            >
          </div>
          <div
            class="grid grid-cols-3 border-b border-border/50 px-5 py-3.5 items-center"
          >
            <span class="text-sm text-secondary font-medium">Type</span>
            <span class="text-sm text-secondary">Directive input</span>
            <span class="text-sm text-secondary">Function (injection context)</span>
          </div>
          <div
            class="grid grid-cols-3 border-b border-border/50 px-5 py-3.5 items-center"
          >
            <span class="text-sm text-secondary font-medium">Returns</span>
            <span class="text-sm text-secondary">Animation target</span>
            <code class="text-sm font-mono text-accent">Signal&lt;boolean&gt;</code>
          </div>
          <div
            class="grid grid-cols-3 border-b border-border/50 px-5 py-3.5 items-center"
          >
            <span class="text-sm text-secondary font-medium">Best for</span>
            <span class="text-sm text-secondary">Pure animation on enter/leave</span>
            <span class="text-sm text-secondary">Conditional logic, computed state</span>
          </div>
          <div class="grid grid-cols-3 px-5 py-3.5 items-center">
            <span class="text-sm text-secondary font-medium">Cleanup</span>
            <span class="text-sm text-secondary">Automatic</span>
            <span class="text-sm text-secondary">Automatic (injection context)</span>
          </div>
        </div>
      </section>

      <!-- ═══════════════ Imperative Scroll APIs ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.6 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Imperative scroll APIs
        </h2>
        <p class="text-secondary mb-6">
          For advanced use cases, ng-motion re-exports two low-level functions
          from the scroll engine. These give you raw scroll data or let you
          link a scroll container to an animation timeline.
        </p>

        <app-code-block [code]="imperativeScrollCode" lang="typescript" filename="imperative-scroll.ts" class="mb-6" />

        <div
          class="rounded-xl border border-border bg-surface/30 p-6 space-y-3"
        >
          <div class="flex items-start gap-3">
            <div
              class="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1.5"
            ></div>
            <p class="text-secondary text-sm">
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >scroll()</code
              >
              accepts either a callback or an
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >AnimationPlaybackControls</code
              >
              instance. When given an animation, it maps scroll progress directly
              to the animation timeline.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <div
              class="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1.5"
            ></div>
            <p class="text-secondary text-sm">
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >scrollInfo()</code
              >
              provides detailed
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >ScrollInfo</code
              >
              per axis (current position, progress, velocity) and supports
              content size tracking.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <div
              class="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1.5"
            ></div>
            <p class="text-secondary text-sm">
              Both functions return a cleanup
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >VoidFunction</code
              >. Call it on destroy to remove the scroll listener.
            </p>
          </div>
        </div>
      </section>

      <!-- ═══════════════ Best Practices ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.7 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Best practices</h2>

        <div
          class="rounded-xl border border-border bg-surface/30 p-6 space-y-4"
        >
          <div class="flex items-start gap-3">
            <div
              class="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1.5"
            ></div>
            <p class="text-secondary text-sm">
              <strong class="text-primary">Smooth scroll values with useSpring().</strong>
              Raw scroll positions update every frame and can feel jittery. Wrap
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >scrollYProgress</code
              >
              in
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >useSpring()</code
              >
              for buttery animation.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <div
              class="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1.5"
            ></div>
            <p class="text-secondary text-sm">
              <strong class="text-primary">Use useTransform() for mapping.</strong>
              Convert normalized progress into pixel offsets, opacity values, or
              color strings with range mapping:
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >useTransform(scrollYProgress, [0, 1], [0, -180])</code
              >.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <div
              class="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1.5"
            ></div>
            <p class="text-secondary text-sm">
              <strong class="text-primary">Prefer whileInView for simple reveals.</strong>
              It requires no imperative code, handles cleanup automatically, and
              supports
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >viewport.once</code
              >
              for one-shot entrance animations.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <div
              class="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1.5"
            ></div>
            <p class="text-secondary text-sm">
              <strong class="text-primary">Respect reduced motion.</strong>
              Scroll-driven position changes (parallax) should be subtle or
              disabled when the user prefers reduced motion. Use
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >useReducedMotion()</code
              >
              to conditionally skip parallax offsets.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <div
              class="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1.5"
            ></div>
            <p class="text-secondary text-sm">
              <strong class="text-primary">Cleanup is automatic.</strong>
              All scroll hooks (useScroll, useInView) run inside Angular's
              injection context, so listeners are torn down when the component is
              destroyed.
            </p>
          </div>
        </div>
      </section>

      <!-- Next steps -->
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
export class ScrollPage {
  readonly demoItems = [0, 1, 2, 3];

  readonly useScrollCode = [
    "import { Component } from '@angular/core';",
    'import {',
    '  NgmMotionDirective,',
    '  useScroll, useSpring, useTransform,',
    '  type MotionStyle, type SpringOptions,',
    "} from '@scripttype/ng-motion';",
    '',
    '@Component({',
    '  standalone: true,',
    '  imports: [NgmMotionDirective],',
    '  template: `',
    '    <div ngmMotion [style]="progressStyle" class="progress"></div>',
    '    <section ngmMotion [style]="heroStyle">Parallax content</section>',
    '  `,',
    '})',
    'export class ScrollComponent {',
    '  readonly spring: SpringOptions = { stiffness: 200, damping: 30 };',
    '',
    '  private readonly scroll = useScroll();',
    '  readonly smoothProgress = useSpring(this.scroll.scrollYProgress, this.spring);',
    '',
    '  readonly heroY = useTransform(',
    '    this.scroll.scrollYProgress, [0, 1], [0, -180]',
    '  );',
    '',
    "  readonly progressStyle: MotionStyle = {",
    "    scaleX: this.smoothProgress,",
    "    transformOrigin: '0% 50%',",
    '  };',
    '',
    '  readonly heroStyle: MotionStyle = { y: this.heroY };',
    '}',
  ].join('\n');

  readonly progressBarCode = [
    '@Component({',
    '  standalone: true,',
    '  imports: [NgmMotionDirective],',
    '  template: `',
    '    <!-- Fixed progress bar at the top of the page -->',
    '    <div',
    '      ngmMotion',
    '      [style]="barStyle"',
    '      class="fixed top-0 left-0 right-0 h-1 bg-accent origin-left z-50"',
    '    ></div>',
    '  `,',
    '})',
    'export class ProgressBarComponent {',
    '  private readonly scroll = useScroll();',
    '  readonly smooth = useSpring(this.scroll.scrollYProgress, {',
    '    stiffness: 200,',
    '    damping: 30,',
    '  });',
    '',
    '  readonly barStyle: MotionStyle = {',
    '    scaleX: this.smooth,',
    "    transformOrigin: '0% 50%',",
    '  };',
    '}',
  ].join('\n');

  readonly targetedScrollCode = [
    '@Component({',
    '  standalone: true,',
    '  imports: [NgmMotionDirective],',
    '  template: `',
    '    <div #scrollContainer class="overflow-y-auto h-96">',
    '      <div #target class="h-[200vh]">',
    '        <div ngmMotion [style]="fadeStyle">Tracked element</div>',
    '      </div>',
    '    </div>',
    '  `,',
    '})',
    'export class TargetedScrollComponent {',
    "  readonly scrollContainer = viewChild.required<ElementRef>('scrollContainer');",
    "  readonly target = viewChild.required<ElementRef>('target');",
    '',
    '  private readonly scroll = useScroll({',
    '    container: this.scrollContainer,',
    '    target: this.target,',
    "    offset: ['start end', 'end start'],",
    '  });',
    '',
    '  readonly opacity = useTransform(',
    '    this.scroll.scrollYProgress, [0, 0.5, 1], [0, 1, 0]',
    '  );',
    '',
    '  readonly fadeStyle: MotionStyle = { opacity: this.opacity };',
    '}',
  ].join('\n');

  readonly whileInViewCode = [
    '<div',
    '  ngmMotion',
    '  [initial]="{ opacity: 0, y: 30 }"',
    '  [whileInView]="{ opacity: 1, y: 0 }"',
    '  [viewport]="{ once: true, margin: \'-50px\' }"',
    '  [transition]="{',
    "    type: 'spring',",
    '    stiffness: 200,',
    '    damping: 20',
    '  }"',
    '>',
    '  I fade in when scrolled into view!',
    '</div>',
  ].join('\n');

  readonly useInViewCode = [
    '@Component({',
    '  standalone: true,',
    '  imports: [NgmMotionDirective],',
    '  template: `',
    '    <section #section>',
    '      @if (isVisible()) {',
    '        <p>This section is in the viewport!</p>',
    '      }',
    '    </section>',
    '  `,',
    '})',
    'export class InViewComponent {',
    "  readonly sectionRef = viewChild.required<ElementRef>('section');",
    '',
    '  // Returns Signal<boolean> — true when the element is in the viewport',
    '  readonly isVisible = useInView(this.sectionRef, {',
    "    amount: 'some',",
    '    once: true,',
    '  });',
    '}',
  ].join('\n');

  readonly imperativeScrollCode = [
    "import { animate, scroll, scrollInfo } from '@scripttype/ng-motion';",
    '',
    '// Link an animation to scroll progress',
    'const controls = animate(element, { opacity: [0, 1] }, { duration: 1 });',
    'const cleanup = scroll(controls);',
    '',
    '// Get detailed scroll info with a callback',
    'const cleanup2 = scrollInfo((info) => {',
    '  console.log(info.y.current);   // px position',
    '  console.log(info.y.progress);  // 0..1 normalized',
    '  console.log(info.y.velocity);  // px/s',
    '});',
    '',
    "// Don't forget to call cleanup() on destroy",
  ].join('\n');

  readonly nextLinks = [
    {
      path: '/docs/gestures',
      title: 'Gestures',
      description: 'Hover, tap, drag, and focus interactions',
    },
    {
      path: '/docs/layout',
      title: 'Layout Animation',
      description: 'Automatic FLIP animations for layout changes',
    },
    {
      path: '/docs/transitions',
      title: 'Transitions',
      description: 'Control timing, easing, and spring physics',
    },
    {
      path: '/docs/presence',
      title: 'Presence & Exit',
      description: 'Animate elements entering and leaving the DOM',
    },
  ];
}
