import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { CodeBlockComponent } from '../../components/code-block.component';

@Component({
  selector: 'app-use-in-view',
  imports: [RouterLink, NgmMotionDirective, CodeBlockComponent],
  template: `
    <article class="max-w-3xl pb-16">
      <!-- Header -->
      <div
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
      >
        <h1 class="font-display font-bold text-4xl mb-4">useInView</h1>
        <p class="text-lg text-secondary mb-12 leading-relaxed">
          Detect when an element enters or leaves the viewport. Returns a
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >Signal&lt;boolean&gt;</code
          >
          that you can use to trigger animations, lazy-load content, or track
          impressions &mdash; without manual
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >IntersectionObserver</code
          >
          boilerplate.
        </p>
      </div>

      <!-- ═══════════════ Tip: whileInView vs useInView ═══════════════ -->
      <div class="rounded-xl border border-border bg-surface/30 p-5 mb-12">
        <p class="text-secondary text-sm leading-relaxed">
          <strong class="text-primary">Tip:</strong> For most "animate when visible" use cases,
          the declarative
          <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">whileInView</code>
          input on the
          <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">ngmMotion</code>
          directive is the simplest approach &mdash; no hook, no
          <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">afterNextRender</code>,
          just a template binding. Use the
          <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">useInView()</code>
          hook when you need programmatic control: analytics tracking, conditional data fetching,
          or any logic beyond triggering an animation.
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
          The easiest way to animate on viewport entry is the directive's
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >whileInView</code
          >
          input. For programmatic control, call the
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >useInView()</code
          >
          hook with an
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >ElementRef</code
          >
          or
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >HTMLElement</code
          >
          &mdash; it returns a readonly
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >Signal&lt;boolean&gt;</code
          >.
        </p>

        <app-code-block [code]="basicCode" lang="typescript" filename="component.ts" class="mb-6" />

        <p class="text-secondary">
          When the element scrolls into the viewport,
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >inView()</code
          >
          becomes
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >true</code
          >. When it scrolls out,
          it flips back to
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >false</code
          >.
        </p>
      </section>

      <!-- ═══════════════ Options ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.2 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Options</h2>
        <p class="text-secondary mb-6">
          Pass an optional
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >UseInViewOptions</code
          >
          object to fine-tune intersection behavior:
        </p>

        <div class="rounded-xl border border-border overflow-hidden mb-6">
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
              @for (row of optionProps; track row.name) {
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

        <app-code-block [code]="optionsCode" lang="typescript" filename="component.ts" />
      </section>

      <!-- ═══════════════ Live Demo ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.3 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Live demo</h2>
        <p class="text-secondary mb-6">
          Scroll inside the container below to reveal each card. This demo uses
          the directive's built-in
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >whileInView</code
          >
          and
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >viewport</code
          >
          inputs for a purely declarative approach.
        </p>

        <app-code-block [code]="demoCode" lang="html" filename="template.html" class="mb-6" />

        <div class="rounded-xl border border-border bg-surface/30 overflow-hidden">
          <div class="h-[300px] overflow-y-auto p-6 space-y-6">
            <p class="text-sm text-muted text-center mb-4 font-mono">Scroll down to reveal cards</p>
            <div class="h-32"></div>
            @for (card of demoCards; track card.title; let i = $index) {
              <div
                ngmMotion
                [whileInView]="{ opacity: 1, y: 0 }"
                [initial]="{ opacity: 0, y: 30 }"
                [transition]="{ duration: 0.5, delay: i * 0.1 }"
                [viewport]="{ once: true, amount: 0.3 }"
                class="p-6 rounded-xl bg-gradient-to-br from-accent/10 to-accent-purple/10 border border-accent/20"
              >
                <h3 class="font-display font-semibold mb-1">{{ card.title }}</h3>
                <p class="text-sm text-secondary">{{ card.description }}</p>
              </div>
            }
            <div class="h-16"></div>
          </div>
        </div>
      </section>

      <!-- ═══════════════ Programmatic useInView ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.35 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Programmatic useInView</h2>
        <p class="text-secondary mb-6">
          For logic beyond animation &mdash; analytics tracking, lazy-loading content, or conditional
          rendering &mdash; use the
          <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">useInView()</code>
          hook. It returns a
          <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">Signal&lt;boolean&gt;</code>
          you can read anywhere in your component.
        </p>

        <div class="rounded-xl border border-border bg-surface/30 p-5 mb-6">
          <p class="text-secondary text-sm leading-relaxed">
            <strong class="text-primary">Why afterNextRender?</strong>
            <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">useInView()</code>
            needs a real DOM element to observe via
            <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">IntersectionObserver</code>.
            During construction, Angular hasn't rendered the template yet, so element references
            (from
            <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">viewChild()</code>
            or
            <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">ElementRef</code>)
            may not point to a mounted DOM node.
            Wrapping the call in
            <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">afterNextRender()</code>
            guarantees the element exists in the DOM before the observer attaches.
          </p>
        </div>

        <app-code-block [code]="hookCode" lang="typescript" filename="analytics-tracker.component.ts" class="mb-6" />

        <p class="text-secondary mb-4 text-sm">
          The directive approach uses
          <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">(viewportEnter)</code>
          and
          <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">(viewportLeave)</code>
          outputs to track visibility. Scroll inside the container to see the status badges update:
        </p>

        <div class="rounded-xl border border-border bg-surface/30 overflow-hidden">
          <div class="h-[280px] overflow-y-auto p-6 space-y-6">
            <p class="text-sm text-muted text-center mb-4 font-mono">Scroll to track visibility</p>
            <div class="h-24"></div>
            @for (item of trackItems; track item.id; let i = $index) {
              <div
                ngmMotion
                [whileInView]="{ opacity: 1, x: 0 }"
                [initial]="{ opacity: 0.4, x: -12 }"
                [transition]="{ type: 'spring', stiffness: 200, damping: 20 }"
                [viewport]="{ amount: 0.5 }"
                (viewportEnter)="itemVisible[i].set(true); itemViewCount[i].update(c => c + 1)"
                (viewportLeave)="itemVisible[i].set(false)"
                class="p-5 rounded-xl border border-border/50 bg-elevated/30 flex items-center justify-between"
              >
                <div>
                  <h4 class="font-semibold text-sm">{{ item.title }}</h4>
                  <p class="text-xs text-muted mt-1">{{ item.description }}</p>
                </div>
                <div class="flex flex-col items-end gap-1">
                  <span
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase tracking-wider"
                    [class]="itemVisible[i]() ? 'bg-green-500/15 text-green-400 border border-green-500/25' : 'bg-zinc-500/15 text-zinc-400 border border-zinc-500/25'"
                  >
                    {{ itemVisible[i]() ? 'Visible' : 'Hidden' }}
                  </span>
                  <span class="text-[10px] text-muted font-mono">
                    views: {{ itemViewCount[i]() }}
                  </span>
                </div>
              </div>
            }
            <div class="h-16"></div>
          </div>
        </div>
      </section>

      <!-- ═══════════════ useInView vs useScroll ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.45 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          useInView vs useScroll
        </h2>
        <p class="text-secondary mb-6">
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >useInView</code
          >
          gives you a boolean &mdash; is the element visible or not.
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >useScroll</code
          >
          gives you continuous
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >MotionValues</code
          >
          tracking scroll progress. Use
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >useInView</code
          >
          for triggering one-shot entrance animations or lazy loading; use
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >useScroll</code
          >
          for parallax, progress bars, and scroll-linked effects.
        </p>

        <div
          class="rounded-xl border border-border bg-surface/30 overflow-hidden"
        >
          <div class="grid grid-cols-3 border-b border-border px-5 py-3">
            <span class="text-xs text-muted font-mono uppercase tracking-wider"
              >&nbsp;</span
            >
            <span class="text-xs text-muted font-mono uppercase tracking-wider"
              >useInView</span
            >
            <span class="text-xs text-muted font-mono uppercase tracking-wider"
              >useScroll</span
            >
          </div>
          <div
            class="grid grid-cols-3 border-b border-border/50 px-5 py-3.5 items-center"
          >
            <span class="text-sm text-secondary font-medium">Returns</span>
            <code class="text-sm font-mono text-accent">Signal&lt;boolean&gt;</code>
            <span class="text-sm text-secondary">MotionValues (scrollX, scrollY, etc.)</span>
          </div>
          <div
            class="grid grid-cols-3 border-b border-border/50 px-5 py-3.5 items-center"
          >
            <span class="text-sm text-secondary font-medium">Data</span>
            <span class="text-sm text-secondary">Binary: visible or not</span>
            <span class="text-sm text-secondary">Continuous: 0&ndash;1 progress</span>
          </div>
          <div
            class="grid grid-cols-3 border-b border-border/50 px-5 py-3.5 items-center"
          >
            <span class="text-sm text-secondary font-medium">Best for</span>
            <span class="text-sm text-secondary">Entrance animations, lazy loading</span>
            <span class="text-sm text-secondary">Parallax, progress bars, scroll-linked FX</span>
          </div>
          <div class="grid grid-cols-3 px-5 py-3.5 items-center">
            <span class="text-sm text-secondary font-medium">Engine</span>
            <span class="text-sm text-secondary">IntersectionObserver</span>
            <span class="text-sm text-secondary">Scroll event / ScrollTimeline</span>
          </div>
        </div>
      </section>

      <!-- ═══════════════ Next Steps ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.55 }"
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
export class UseInViewPage {
  // ── Options table ──

  readonly optionProps = [
    {
      name: 'root',
      type: 'Element | null',
      desc: 'Intersection root element. Defaults to the browser viewport.',
    },
    {
      name: 'margin',
      type: 'string',
      desc: "Margin around root, e.g. '-100px' to trigger 100px before the element enters the viewport.",
    },
    {
      name: 'amount',
      type: "number | 'some' | 'all'",
      desc: "Visibility threshold. A number between 0 and 1, or the keywords 'some' (any part) or 'all' (fully visible).",
    },
    {
      name: 'once',
      type: 'boolean',
      desc: 'If true, the signal stays true after the first intersection and the observer is disconnected.',
    },
  ];

  // ── Demo data ──

  readonly demoCards = [
    { title: 'Spring Physics', description: 'Natural motion with configurable stiffness and damping.' },
    { title: 'Gesture Handling', description: 'Hover, tap, drag, and focus with zero boilerplate.' },
    { title: 'Layout Animation', description: 'Automatic FLIP animations when layout changes.' },
    { title: 'Exit Animations', description: 'Animate elements out before Angular removes them.' },
  ];

  // ── Programmatic demo data ──

  readonly trackItems = [
    { id: 0, title: 'Analytics Card', description: 'Impression tracked on each viewport entry' },
    { id: 1, title: 'Lazy Content', description: 'Load expensive content only when visible' },
    { id: 2, title: 'Ad Viewability', description: 'Count verified impressions for reporting' },
  ];

  readonly itemVisible = [signal(false), signal(false), signal(false)];
  readonly itemViewCount = [signal(0), signal(0), signal(0)];

  // ── Code snippets ──

  readonly basicCode = [
    "import { Component } from '@angular/core';",
    "import { NgmMotionDirective } from '@scripttype/ng-motion';",
    '',
    '// Declarative: use the whileInView directive input',
    '@Component({',
    '  imports: [NgmMotionDirective],',
    '  template: `',
    '    <div ngmMotion',
    '      [initial]="{ opacity: 0, y: 30 }"',
    '      [whileInView]="{ opacity: 1, y: 0 }"',
    '      [viewport]="{ once: true, amount: 0.3 }"',
    '      [transition]="{ duration: 0.6 }"',
    '    >',
    '      I fade in when scrolled into view.',
    '    </div>',
    '  `,',
    '})',
    'export class FadeInComponent {}',
    '',
    '// Programmatic: use the useInView() hook',
    "import { afterNextRender, inject, Injector, ElementRef, runInInjectionContext, type Signal } from '@angular/core';",
    "import { useInView } from '@scripttype/ng-motion';",
    '',
    'export class TrackerComponent {',
    "  private readonly el = inject(ElementRef<HTMLElement>);",
    '  private readonly injector = inject(Injector);',
    '  inView!: Signal<boolean>;',
    '',
    '  constructor() {',
    '    // afterNextRender ensures the DOM element exists before',
    '    // the IntersectionObserver is attached.',
    '    afterNextRender(() => {',
    '      runInInjectionContext(this.injector, () => {',
    '        this.inView = useInView(this.el.nativeElement, { once: true });',
    '      });',
    '    });',
    '  }',
    '}',
  ].join('\n');

  readonly optionsCode = [
    '// Hook API with options',
    "const inView = useInView(element, {",
    '  once: true,          // only trigger once',
    "  margin: '-100px',    // trigger 100px before element enters viewport",
    '  amount: 0.5,         // at least 50% visible',
    '});',
    '',
    '// Directive equivalent — declarative approach',
    '// <div ngmMotion',
    '//   [whileInView]="{ opacity: 1, y: 0 }"',
    '//   [viewport]="{ once: true, amount: 0.5, margin: \'-100px\' }"',
    '// >',
  ].join('\n');

  readonly demoCode = [
    '@for (card of cards; track card.title; let i = $index) {',
    '  <div',
    '    ngmMotion',
    '    [whileInView]="{ opacity: 1, y: 0 }"',
    '    [initial]="{ opacity: 0, y: 30 }"',
    '    [transition]="{ duration: 0.5, delay: i * 0.1 }"',
    '    [viewport]="{ once: true, amount: 0.3 }"',
    '    class="card"',
    '  >',
    '    {{ card.title }}',
    '  </div>',
    '}',
  ].join('\n');

  readonly hookCode = [
    "import { afterNextRender, inject, Injector, ElementRef, viewChild, runInInjectionContext, type Signal } from '@angular/core';",
    "import { useInView } from '@scripttype/ng-motion';",
    '',
    '@Component({ ... })',
    'export class AnalyticsTrackerComponent {',
    "  private readonly cardRef = viewChild('card', { read: ElementRef });",
    '  private readonly injector = inject(Injector);',
    '',
    '  inView!: Signal<boolean>;',
    '',
    '  constructor() {',
    '    // Wait for the DOM — viewChild() signals resolve after render.',
    '    afterNextRender(() => {',
    '      const el = this.cardRef()?.nativeElement;',
    '      if (!el) return;',
    '      runInInjectionContext(this.injector, () => {',
    '        this.inView = useInView(el, { amount: 0.5 });',
    '      });',
    '    });',
    '  }',
    '',
    '  // Or use directive outputs for simpler tracking:',
    '  // (viewportEnter)="trackImpression()"',
    '  // (viewportLeave)="logExit()"',
    '}',
  ].join('\n');

  // ── Next steps ──

  readonly nextLinks = [
    {
      path: '/docs/scroll',
      title: 'useScroll',
      description: 'Track scroll progress with continuous MotionValues',
    },
    {
      path: '/docs/motion-values',
      title: 'Motion Values',
      description: 'Track and compose animation values reactively',
    },
    {
      path: '/docs/use-transform',
      title: 'useTransform',
      description: 'Create derived values with range mapping and functions',
    },
    {
      path: '/docs/gestures',
      title: 'Gestures',
      description: 'Hover, tap, drag, and focus interactions',
    },
  ];
}
