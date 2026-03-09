import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgmMotionDirective } from 'ng-motion';
import { CodeBlockComponent } from '../../components/code-block.component';
import { DemoReplayComponent } from '../../components/demo-replay.component';

@Component({
  selector: 'app-gestures',
  imports: [RouterLink, NgmMotionDirective, CodeBlockComponent, DemoReplayComponent],
  template: `
    <article class="max-w-3xl pb-16">
      <!-- Header -->
      <div
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
      >
        <h1 class="font-display font-bold text-4xl mb-4">Gestures</h1>
        <p class="text-lg text-secondary mb-12 leading-relaxed">
          ng-motion supports hover, tap, focus, in-view animation, and drag
          (see the <a routerLink="/docs/drag" class="text-accent hover:underline">Drag &amp; Reorder</a> page for details on drag).
          Every gesture is declarative — bind a target state and the directive
          handles transitions, cleanup, and accessibility automatically.
        </p>
      </div>

      <!-- Hover -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.1 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Hover</h2>
        <p class="text-secondary mb-6">
          Use
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >whileHover</code
          >
          to animate an element when the pointer moves over it. The element
          automatically returns to its original state when the pointer leaves.
        </p>

        <app-code-block [code]="hoverCode" lang="html" filename="template" class="mb-6" />

        <!-- Live demo -->
        <div
          class="rounded-xl border border-border p-10 bg-surface/30 flex items-center justify-center gap-6"
        >
          <div
            ngmMotion
            [whileHover]="{ scale: 1.08, y: -4 }"
            [transition]="{ type: 'spring', stiffness: 400, damping: 20 }"
            class="w-32 h-32 rounded-2xl bg-gradient-to-br from-accent/15 to-accent-purple/15 border border-accent/20 flex items-center justify-center cursor-pointer select-none"
          >
            <span class="text-sm text-secondary font-mono">hover me</span>
          </div>
          <div
            ngmMotion
            [whileHover]="{ scale: 1.04, rotate: 3, boxShadow: '0 8px 30px rgba(139, 92, 246, 0.3)' }"
            [transition]="{ type: 'spring', stiffness: 300, damping: 18 }"
            class="w-32 h-32 rounded-2xl bg-gradient-to-br from-accent-purple/15 to-accent-pink/15 border border-accent-purple/20 flex items-center justify-center cursor-pointer select-none"
          >
            <span class="text-sm text-secondary font-mono">glow</span>
          </div>
        </div>
      </section>

      <!-- Tap -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.2 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Tap</h2>
        <p class="text-secondary mb-6">
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >whileTap</code
          >
          animates while the pointer is pressed down. Combine it with the
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >(tap)</code
          >
          output to handle click events that distinguish taps from drags.
          Unlike the native
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >(click)</code
          >
          event,
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >(tap)</code
          >
          only fires if the pointer hasn't moved significantly — making it ideal
          for interactive elements that also support drag.
        </p>

        <app-code-block [code]="tapCode" lang="html" filename="template" class="mb-6" />

        <!-- Live demo -->
        <div
          class="rounded-xl border border-border p-10 bg-surface/30 flex items-center justify-center gap-6"
        >
          <button
            ngmMotion
            [whileTap]="{ scale: 0.92 }"
            [transition]="{ type: 'spring', stiffness: 500, damping: 20 }"
            class="px-8 py-3 rounded-xl bg-gradient-to-r from-accent to-accent-purple text-white font-semibold cursor-pointer select-none"
          >
            Press me
          </button>
          <button
            ngmMotion
            [whileTap]="{ scale: 0.96, y: 2 }"
            [transition]="{ type: 'spring', stiffness: 400, damping: 17 }"
            class="px-8 py-3 rounded-xl bg-gradient-to-r from-accent-pink to-accent-gold text-white font-semibold cursor-pointer select-none"
          >
            Squish
          </button>
        </div>
      </section>

      <!-- Focus -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.3 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Focus</h2>
        <p class="text-secondary mb-6">
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >whileFocus</code
          >
          triggers animations when the element receives keyboard or pointer
          focus. This is ideal for accessible, visually rich focus indicators.
        </p>

        <app-code-block [code]="focusCode" lang="html" filename="template" class="mb-6" />

        <!-- Live demo -->
        <div
          class="rounded-xl border border-border p-10 bg-surface/30 flex items-center justify-center"
        >
          <input
            ngmMotion
            [whileFocus]="{ scale: 1.03, boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.2)' }"
            [transition]="{ type: 'spring', stiffness: 300, damping: 22 }"
            type="text"
            placeholder="Click or tab to focus..."
            class="px-6 py-3 rounded-xl border border-border bg-elevated/50 text-primary outline-none w-72 text-center"
          />
        </div>
      </section>

      <!-- In-View -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.4 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          In-View Animation
        </h2>
        <p class="text-secondary mb-6">
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >whileInView</code
          >
          triggers when an element enters the viewport. Use the
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >viewport</code
          >
          input to configure intersection behavior.
        </p>

        <app-code-block [code]="inViewCode" lang="html" filename="template" class="mb-6" />

        <!-- Live demo -->
        <app-demo-replay>
          <ng-template>
            <div
              class="rounded-xl border border-border p-10 bg-surface/30 flex items-center justify-center"
            >
              <div
                ngmMotion
                [initial]="{ opacity: 0, y: 32, scale: 0.9 }"
                [whileInView]="{ opacity: 1, y: 0, scale: 1 }"
                [viewport]="{ once: true, amount: 0.4 }"
                [transition]="{ type: 'spring', stiffness: 200, damping: 20 }"
                class="px-10 py-6 rounded-2xl bg-gradient-to-br from-accent/15 to-accent-purple/15 border border-accent/20 text-lg text-center"
              >
                <p class="font-semibold mb-1">Revealed on scroll</p>
                <p class="text-sm text-muted">This element animated into view</p>
              </div>
            </div>
          </ng-template>
        </app-demo-replay>

        <div
          class="rounded-xl border border-border bg-surface/30 p-6 space-y-3 mt-6"
        >
          <p class="text-sm text-muted font-mono uppercase tracking-wider mb-3">
            Viewport config options
          </p>
          <div class="flex items-start gap-3">
            <code
              class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10 flex-shrink-0 mt-0.5"
              >once</code
            >
            <p class="text-secondary text-sm">
              When
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >true</code
              >, the animation only fires the first time the element enters the
              viewport.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <code
              class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10 flex-shrink-0 mt-0.5"
              >amount</code
            >
            <p class="text-secondary text-sm">
              A number between 0 and 1 indicating how much of the element must
              be visible to trigger. Also accepts the string values
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >'some'</code
              >
              (default) or
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >'all'</code
              >.
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >'some'</code
              >
              means the element is considered in-view when any pixel is visible.
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >'all'</code
              >
              means the element must be fully visible.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <code
              class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10 flex-shrink-0 mt-0.5"
              >margin</code
            >
            <p class="text-secondary text-sm">
              Margin around the viewport, e.g.
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >'100px 0px'</code
              >. Behaves like CSS margin on the root intersection area.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <code
              class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10 flex-shrink-0 mt-0.5"
              >root</code
            >
            <p class="text-secondary text-sm">
              A custom scrollable element to use as the intersection root
              instead of the browser viewport.
            </p>
          </div>
        </div>
      </section>

      <!-- Combining gestures -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.5 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Combining gestures
        </h2>
        <p class="text-secondary mb-6">
          Gesture inputs compose naturally. Combine
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >whileHover</code
          >,
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >whileTap</code
          >, and
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >whileFocus</code
          >
          on the same element for rich, layered interactions.
        </p>

        <app-code-block [code]="combineCode" lang="html" filename="template" class="mb-6" />

        <!-- Live demo -->
        <div
          class="rounded-xl border border-border p-10 bg-surface/30 flex items-center justify-center gap-6"
        >
          <button
            ngmMotion
            [whileHover]="{ scale: 1.04, y: -2 }"
            [whileTap]="{ scale: 0.96 }"
            [whileFocus]="{ boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.2)' }"
            [transition]="{ type: 'spring', stiffness: 400, damping: 17 }"
            class="px-8 py-4 rounded-xl bg-gradient-to-r from-accent/15 to-accent-purple/15 border border-accent/20 font-semibold cursor-pointer select-none outline-none"
          >
            Save
          </button>
          <button
            ngmMotion
            [whileHover]="{ scale: 1.04, y: -2, boxShadow: '0 8px 25px rgba(236, 72, 153, 0.2)' }"
            [whileTap]="{ scale: 0.96, y: 0 }"
            [whileFocus]="{ boxShadow: '0 0 0 4px rgba(236, 72, 153, 0.2)' }"
            [transition]="{ type: 'spring', stiffness: 400, damping: 17 }"
            class="px-8 py-4 rounded-xl bg-gradient-to-r from-accent-pink/15 to-accent-gold/15 border border-accent-pink/20 font-semibold cursor-pointer select-none outline-none"
          >
            Delete
          </button>
          <div
            ngmMotion
            [whileHover]="{ scale: 1.06, rotate: 2 }"
            [whileTap]="{ scale: 0.94, rotate: -2 }"
            [transition]="{ type: 'spring', stiffness: 500, damping: 15 }"
            class="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-purple/15 to-accent/15 border border-accent-purple/20 flex items-center justify-center cursor-pointer select-none text-xl"
          >
            +
          </div>
        </div>
      </section>

      <!-- Gesture Outputs -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.6 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Gesture outputs
        </h2>
        <p class="text-secondary mb-6">
          Every gesture emits fine-grained events through Angular outputs. Use
          these for side effects, analytics, or coordinating with other
          components.
        </p>

        <app-code-block [code]="outputsUsageCode" lang="html" filename="usage" class="mb-6" />

        <div
          class="rounded-xl border border-border bg-surface/30 overflow-hidden"
        >
          <div class="grid grid-cols-3 border-b border-border px-5 py-3">
            <span
              class="text-xs text-muted font-mono uppercase tracking-wider"
              >Gesture</span
            >
            <span
              class="text-xs text-muted font-mono uppercase tracking-wider"
              >Output</span
            >
            <span
              class="text-xs text-muted font-mono uppercase tracking-wider"
              >Description</span
            >
          </div>
          @for (row of outputRows; track row.output) {
            <div
              class="grid grid-cols-3 border-b border-border/50 px-5 py-3.5 items-center"
            >
              <span class="text-sm text-secondary">{{ row.gesture }}</span>
              <code class="text-sm font-mono text-accent">{{
                row.output
              }}</code>
              <span class="text-sm text-secondary">{{ row.description }}</span>
            </div>
          }
        </div>
      </section>

      <!-- Performance tips -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.7 }"
        class="mb-12"
      >
        <div class="rounded-xl border border-border bg-surface/30 p-5">
          <p class="text-secondary text-sm">
            For gesture animation best practices and performance tips, see the
            <a routerLink="/docs/performance" class="text-accent hover:underline">Performance</a> page.
          </p>
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
export class GesturesPage {
  readonly hoverCode = [
    '<div',
    '  ngmMotion',
    '  [whileHover]="{ scale: 1.04, y: -2 }"',
    '  [transition]="{',
    "    type: 'spring',",
    '    stiffness: 400,',
    '    damping: 20',
    '  }"',
    '>',
    '  Hover me',
    '</div>',
  ].join('\n');

  readonly tapCode = [
    '<button ngmMotion',
    '  [whileTap]="{ scale: 0.96 }"',
    '  (tap)="save()"',
    '>',
    '  Save',
    '</button>',
  ].join('\n');

  readonly focusCode = [
    '<input ngmMotion',
    '  [whileFocus]="{',
    '    scale: 1.03,',
    "    boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.2)'",
    '  }"',
    '  type="text"',
    '  placeholder="Focus me..."',
    '/>',
  ].join('\n');

  readonly inViewCode = [
    '<section ngmMotion',
    '  [initial]="{ opacity: 0, y: 32 }"',
    '  [whileInView]="{ opacity: 1, y: 0 }"',
    '  [viewport]="{ once: true, amount: 0.4 }"',
    '>',
    '  Reveal me once',
    '</section>',
  ].join('\n');

  readonly combineCode = [
    '<button ngmMotion',
    '  [whileHover]="{ scale: 1.04, y: -2 }"',
    '  [whileTap]="{ scale: 0.96 }"',
    "  [whileFocus]=\"{ boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.2)' }\"",
    '  (tap)="save()"',
    '>',
    '  Save',
    '</button>',
  ].join('\n');

  readonly outputsUsageCode = [
    '<div ngmMotion',
    '  [whileHover]="{ scale: 1.04 }"',
    '  (hoverStart)="onHoverStart($event)"',
    '  (hoverEnd)="onHoverEnd($event)"',
    '  (tap)="onTap($event)"',
    '>',
    '  Interactive element',
    '</div>',
  ].join('\n');

  readonly outputRows = [
    {
      gesture: 'Hover',
      output: '(hoverStart)',
      description: 'Pointer enters the element',
    },
    {
      gesture: 'Hover',
      output: '(hoverEnd)',
      description: 'Pointer leaves the element',
    },
    {
      gesture: 'Tap',
      output: '(tap)',
      description: 'Complete tap (pointer down + up)',
    },
    {
      gesture: 'Tap',
      output: '(tapStart)',
      description: 'Pointer pressed down',
    },
    {
      gesture: 'Tap',
      output: '(tapCancel)',
      description: 'Tap cancelled (pointer left before up)',
    },
    {
      gesture: 'Viewport',
      output: '(viewportEnter)',
      description: 'Element enters the viewport',
    },
    {
      gesture: 'Viewport',
      output: '(viewportLeave)',
      description: 'Element leaves the viewport',
    },
    {
      gesture: 'Drag',
      output: '(dragStart)',
      description: 'Drag gesture begins',
    },
    {
      gesture: 'Drag',
      output: '(dragMove)',
      description: 'Pointer moves during drag',
    },
    {
      gesture: 'Drag',
      output: '(dragEnd)',
      description: 'Drag gesture ends',
    },
    {
      gesture: 'Drag',
      output: '(directionLock)',
      description: 'Drag axis locked (x or y)',
    },
  ];

  readonly nextLinks = [
    {
      path: '/docs/drag',
      title: 'Drag →',
      description: 'Drag constraints, snap-to-origin, and elastic boundaries',
    },
    {
      path: '/docs/presence',
      title: 'Presence & Exit →',
      description: 'Animate elements entering and leaving the DOM',
    },
    {
      path: '/docs/layout',
      title: 'Layout Animation →',
      description: 'Automatic FLIP animations for layout changes',
    },
    {
      path: '/docs/motion-directive',
      title: 'Motion Directive →',
      description: 'Full API reference for all inputs and outputs',
    },
  ];
}
