import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  NgmMotionDirective,
  NgmReorderGroupDirective,
  NgmReorderItemDirective,
} from '@scripttype/ng-motion';
import type { Transition } from '@scripttype/ng-motion';
import { CodeBlockComponent } from '../../components/code-block.component';

interface ReorderItem {
  id: string;
  label: string;
  color: string;
}

const SPRING: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
};

const INITIAL_LIST: ReorderItem[] = [
  { id: 'a', label: 'Design tokens', color: 'from-accent/20 to-accent/5' },
  { id: 'b', label: 'Component API', color: 'from-accent-pink/20 to-accent-pink/5' },
  { id: 'c', label: 'Motion values', color: 'from-accent-purple/20 to-accent-purple/5' },
  { id: 'd', label: 'Spring physics', color: 'from-accent-gold/20 to-accent-gold/5' },
];

@Component({
  selector: 'app-drag',
  imports: [
    RouterLink,
    NgmMotionDirective,
    NgmReorderGroupDirective,
    NgmReorderItemDirective,
    CodeBlockComponent,
  ],
  template: `
    <article class="max-w-3xl pb-16">
      <!-- Header -->
      <div
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
      >
        <h1 class="font-display font-bold text-4xl mb-4">Drag &amp; Reorder</h1>
        <p class="text-lg text-secondary mb-12 leading-relaxed">
          Make elements draggable with a single input. Combine drag with
          layout animations and reorder directives to build sortable lists,
          kanban boards, and any interface where users rearrange content
          by dragging.
        </p>
      </div>

      <!-- Basic drag -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.1 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Basic drag</h2>
        <p class="text-secondary mb-6">
          Set
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >[drag]="true"</code
          >
          to make any element freely draggable. Add
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >dragSnapToOrigin</code
          >
          to spring it back to its original position on release.
        </p>

        <div class="rounded-xl border border-border bg-surface/30 p-5 mb-6">
          <p class="text-sm text-secondary">
            <strong class="text-primary">Binding syntax:</strong>
            Use
            <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">[drag]="true"</code>
            to enable free drag on both axes.
            To lock to a single axis, use a plain attribute:
            <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">drag="x"</code>
            or
            <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">drag="y"</code>.
            The bracket syntax passes a boolean, while the unbracketed syntax passes
            a string literal &mdash; Angular treats them differently.
          </p>
        </div>

        <app-code-block [code]="basicDragCode" lang="html" filename="template" class="mb-6" />

        <!-- Live demo: free drag -->
        <div
          class="rounded-xl border border-border p-10 bg-surface/30 flex items-center justify-center min-h-[200px]"
        >
          <div
            ngmMotion
            [drag]="true"
            [dragSnapToOrigin]="true"
            [dragElastic]="0.2"
            [whileDrag]="{ scale: 1.08, boxShadow: '0 12px 40px rgba(99, 102, 241, 0.2)' }"
            [transition]="{ type: 'spring', stiffness: 300, damping: 20 }"
            class="w-28 h-28 rounded-2xl bg-gradient-to-br from-accent/20 to-accent-purple/20 border border-accent/20 flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
          >
            <span class="text-sm text-secondary font-mono">Drag me</span>
          </div>
        </div>
      </section>

      <!-- Axis-locked drag -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.2 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Axis-locked drag</h2>
        <p class="text-secondary mb-6">
          Pass
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >'x'</code
          >
          or
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >'y'</code
          >
          to constrain movement to a single axis. This is especially useful
          for sliders, drawers, and reorderable lists.
        </p>

        <app-code-block [code]="axisDragCode" lang="html" filename="template" class="mb-6" />

        <!-- Live demo: axis-locked -->
        <div
          class="rounded-xl border border-border p-10 bg-surface/30 flex items-center justify-center gap-12 min-h-[200px]"
        >
          <div class="text-center">
            <div
              ngmMotion
              drag="x"
              [dragSnapToOrigin]="true"
              [dragElastic]="0.15"
              [whileDrag]="{ scale: 1.05 }"
              [transition]="{ type: 'spring', stiffness: 400, damping: 25 }"
              class="w-20 h-20 rounded-xl bg-gradient-to-br from-accent-pink/20 to-accent-gold/20 border border-accent-pink/20 flex items-center justify-center cursor-grab active:cursor-grabbing select-none mx-auto mb-3"
            >
              <span class="text-xs text-secondary font-mono">x only</span>
            </div>
            <p class="text-xs text-muted font-mono">drag="x"</p>
          </div>
          <div class="text-center">
            <div
              ngmMotion
              drag="y"
              [dragSnapToOrigin]="true"
              [dragElastic]="0.15"
              [whileDrag]="{ scale: 1.05 }"
              [transition]="{ type: 'spring', stiffness: 400, damping: 25 }"
              class="w-20 h-20 rounded-xl bg-gradient-to-br from-accent-purple/20 to-accent/20 border border-accent-purple/20 flex items-center justify-center cursor-grab active:cursor-grabbing select-none mx-auto mb-3"
            >
              <span class="text-xs text-secondary font-mono">y only</span>
            </div>
            <p class="text-xs text-muted font-mono">drag="y"</p>
          </div>
        </div>
      </section>

      <!-- Constraints & elastic -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.3 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Constraints &amp; elasticity
        </h2>
        <p class="text-secondary mb-6">
          Use
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >dragConstraints</code
          >
          to limit how far the element can travel. The constraint can be a
          pixel-based bounding box or a reference to a parent element.
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >dragElastic</code
          >
          controls how much the element can stretch beyond those bounds
          (0 = rigid, 1 = fully elastic).
        </p>

        <app-code-block [code]="constraintsCode" lang="html" filename="template" class="mb-6" />
      </section>

      <!-- Drag events -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.4 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Drag events</h2>
        <p class="text-secondary mb-6">
          The directive emits
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >(dragStart)</code
          >,
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >(dragMove)</code
          >, and
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >(dragEnd)</code
          >
          events you can use to track drag state or trigger side effects.
        </p>

        <app-code-block [code]="dragEventsCode" lang="html" filename="template" class="mb-6" />
      </section>

      <!-- Drag inputs reference -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.5 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Drag inputs reference
        </h2>
        <p class="text-secondary mb-6">
          All drag-related inputs available on the
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >ngmMotion</code
          >
          directive:
        </p>

        <div
          class="rounded-xl border border-border bg-surface/30 overflow-hidden"
        >
          <div class="grid grid-cols-3 border-b border-border px-5 py-3">
            <span
              class="text-xs text-muted font-mono uppercase tracking-wider"
              >Input</span
            >
            <span
              class="text-xs text-muted font-mono uppercase tracking-wider"
              >Type</span
            >
            <span
              class="text-xs text-muted font-mono uppercase tracking-wider"
              >Description</span
            >
          </div>
          @for (row of dragInputRows; track row.name) {
            <div
              class="grid grid-cols-3 border-b border-border/50 px-5 py-3.5 items-start"
            >
              <code class="text-sm font-mono text-accent">{{ row.name }}</code>
              <code class="text-xs font-mono text-muted">{{ row.type }}</code>
              <span class="text-sm text-secondary">{{ row.desc }}</span>
            </div>
          }
        </div>
      </section>

      <!-- Reorder -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.6 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Reorder</h2>
        <p class="text-secondary mb-6">
          Combine drag with
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >ngmReorderGroup</code
          >
          and
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >ngmReorderItem</code
          >
          to build sortable lists. The group directive owns the ordered
          array and emits the new order on each reorder event. Each item
          gets
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >[layout]="'position'"</code
          >
          so displaced items animate smoothly into their new positions
          without size correction fighting the drag interaction.
        </p>

        <app-code-block [code]="reorderCode" lang="typescript" filename="component.ts" class="mb-6" />

        <!-- Live demo: reorderable list -->
        <div
          class="rounded-xl border border-border p-10 bg-surface/30 min-h-[280px]"
        >
          <p class="text-xs text-muted font-mono mb-5 text-center">
            Drag items up or down to reorder
          </p>

          <div class="max-w-sm mx-auto">
            <div
              [ngmReorderGroup]="listItems()"
              [axis]="'y'"
              (reorder)="listItems.set($event)"
              class="space-y-2"
            >
              @for (item of listItems(); track item.id) {
                <div
                  [ngmReorderItem]="item"
                  ngmMotion
                  [layout]="'position'"
                  [drag]="'y'"
                  [dragSnapToOrigin]="true"
                  [whileDrag]="{ boxShadow: '0 12px 36px rgba(99, 102, 241, 0.18)' }"
                  [transition]="spring"
                  class="flex items-center gap-4 px-5 py-3.5 rounded-xl bg-gradient-to-r border border-border/60 cursor-grab active:cursor-grabbing select-none"
                  [class]="item.color"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-4 h-4 text-muted/50 shrink-0"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M3.75 9h16.5m-16.5 6.75h16.5"
                    />
                  </svg>
                  <span
                    class="font-display text-sm font-semibold text-secondary"
                    >{{ item.label }}</span
                  >
                </div>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- Reorder API note -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.7 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Reorder API</h2>
        <p class="text-secondary mb-6">
          The reorder directives provide a minimal, composable surface:
        </p>

        <div
          class="rounded-xl border border-border bg-surface/30 overflow-hidden mb-6"
        >
          <div class="grid grid-cols-3 border-b border-border px-5 py-3">
            <span
              class="text-xs text-muted font-mono uppercase tracking-wider"
              >Directive</span
            >
            <span
              class="text-xs text-muted font-mono uppercase tracking-wider"
              >Key inputs / outputs</span
            >
            <span
              class="text-xs text-muted font-mono uppercase tracking-wider"
              >Description</span
            >
          </div>
          @for (row of reorderApiRows; track row.directive) {
            <div
              class="grid grid-cols-3 border-b border-border/50 px-5 py-3.5 items-start"
            >
              <code class="text-sm font-mono text-accent">{{
                row.directive
              }}</code>
              <code class="text-xs font-mono text-muted break-words">{{
                row.api
              }}</code>
              <span class="text-sm text-secondary">{{ row.desc }}</span>
            </div>
          }
        </div>

        <div
          class="rounded-xl border border-accent/20 bg-accent/5 p-5"
        >
          <p class="text-sm text-secondary">
            <strong class="text-primary">Note:</strong> The reorder API is
            stable but considered advanced. For most use cases you only need
            the three directives shown above. The underlying
            <code
              class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
              >checkReorder</code
            >
            and
            <code
              class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
              >autoScrollIfNeeded</code
            >
            utilities are also exported for custom implementations.
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
export class DragPage {
  readonly spring: Transition = SPRING;

  // ── Live demo: reorderable list ──
  readonly listItems = signal<ReorderItem[]>([...INITIAL_LIST]);

  // ── Code snippets ──

  readonly basicDragCode = [
    '<div',
    '  ngmMotion',
    '  [drag]="true"',
    '  [dragSnapToOrigin]="true"',
    '  [dragElastic]="0.2"',
    '  [whileDrag]="{ scale: 1.05 }"',
    '  [transition]="{',
    "    type: 'spring',",
    '    stiffness: 300,',
    '    damping: 20',
    '  }"',
    '>',
    '  Drag me',
    '</div>',
  ].join('\n');

  readonly axisDragCode = [
    '<!-- Horizontal only -->',
    '<div ngmMotion drag="x"',
    '  [dragSnapToOrigin]="true"',
    '  [whileDrag]="{ scale: 1.05 }"',
    '>',
    '  Slide left / right',
    '</div>',
    '',
    '<!-- Vertical only -->',
    '<div ngmMotion drag="y"',
    '  [dragSnapToOrigin]="true"',
    '  [whileDrag]="{ scale: 1.05 }"',
    '>',
    '  Slide up / down',
    '</div>',
  ].join('\n');

  readonly constraintsCode = [
    '<div ngmMotion',
    '  [drag]="true"',
    '  [dragConstraints]="{ top: -100, right: 100, bottom: 100, left: -100 }"',
    '  [dragElastic]="0.15"',
    '  [dragMomentum]="true"',
    '  [whileDrag]="{ scale: 1.05 }"',
    '>',
    '  Constrained drag',
    '</div>',
  ].join('\n');

  readonly dragEventsCode = [
    '<div ngmMotion',
    '  drag="x"',
    '  [dragConstraints]="bounds"',
    '  [dragElastic]="0.15"',
    '  [dragMomentum]="true"',
    '  [whileDrag]="{ scale: 1.05 }"',
    '  (dragStart)="dragging.set(true)"',
    '  (dragEnd)="dragging.set(false)"',
    '>',
    '  {{ dragging() ? "Dragging..." : "Drag me" }}',
    '</div>',
  ].join('\n');

  readonly reorderCode = [
    "import { NgmMotionDirective, NgmReorderGroupDirective, NgmReorderItemDirective } from '@scripttype/ng-motion';",
    '',
    '@Component({',
    '  imports: [NgmMotionDirective, NgmReorderGroupDirective, NgmReorderItemDirective],',
    '  template: `',
    '    <div [ngmReorderGroup]="items()" [axis]="\'y\'" (reorder)="items.set($event)">',
    '      @for (item of items(); track item.id) {',
    '        <div',
    '          [ngmReorderItem]="item"',
    '          ngmMotion',
    '          [layout]="\'position\'"',
    '          [drag]="\'y\'"',
    '          [dragSnapToOrigin]="true"',
    "          [whileDrag]=\"{ boxShadow: '0 12px 36px rgba(99, 102, 241, 0.18)' }\"",
    "          [transition]=\"{ type: 'spring', stiffness: 400, damping: 30 }\"",
    '        >',
    '          {{ item.label }}',
    '        </div>',
    '      }',
    '    </div>',
    '  `,',
    '})',
    'export class MyComponent {',
    '  readonly items = signal([',
    "    { id: 'a', label: 'First' },",
    "    { id: 'b', label: 'Second' },",
    "    { id: 'c', label: 'Third' },",
    '  ]);',
    '}',
  ].join('\n');

  // ── Reference tables ──

  readonly dragInputRows = [
    {
      name: 'drag',
      type: "true | 'x' | 'y'",
      desc: 'Enable drag. Pass an axis string to lock direction.',
    },
    {
      name: 'whileDrag',
      type: 'Target',
      desc: 'Animation target applied while the element is being dragged.',
    },
    {
      name: 'dragConstraints',
      type: 'BoundingBox | HTMLElement',
      desc: 'Pixel bounds or parent element that limits drag range.',
    },
    {
      name: 'dragElastic',
      type: 'boolean | number | Partial<BoundingBox>',
      desc: 'How much the element stretches beyond constraints (0-1).',
    },
    {
      name: 'dragMomentum',
      type: 'boolean',
      desc: 'Whether the element coasts after release based on velocity.',
    },
    {
      name: 'dragTransition',
      type: 'InertiaOptions',
      desc: 'Transition used for the momentum animation after release.',
    },
    {
      name: 'dragX',
      type: 'MotionValue<number>',
      desc: 'Bind drag x-axis offset to an external MotionValue.',
    },
    {
      name: 'dragY',
      type: 'MotionValue<number>',
      desc: 'Bind drag y-axis offset to an external MotionValue.',
    },
    {
      name: 'dragSnapToOrigin',
      type: 'boolean',
      desc: 'Spring back to the original position when released.',
    },
    {
      name: 'dragDirectionLock',
      type: 'boolean',
      desc: 'Lock to a single axis once initial drag direction is determined.',
    },
    {
      name: 'dragListener',
      type: 'boolean',
      desc: 'If false, disables the built-in pointer listener so drag can only be started programmatically.',
    },
    {
      name: 'dragPropagation',
      type: 'boolean',
      desc: 'Allow drag events to propagate to parent draggable elements.',
    },
  ];

  readonly reorderApiRows = [
    {
      directive: 'ngmReorderGroup',
      api: '[ngmReorderGroup]="items()" [axis] (reorder)',
      desc: 'Wraps the list. Binds to the source array and emits the reordered array.',
    },
    {
      directive: 'ngmReorderItem',
      api: '[ngmReorderItem]="item"',
      desc: 'Marks a child as a sortable item. Pair with ngmMotion, [layout], and [drag].',
    },
    {
      directive: 'ngmMotion',
      api: '[layout]="true" [drag]="axis" [dragSnapToOrigin]="true"',
      desc: 'Applied to each item for drag behaviour and layout-animated repositioning.',
    },
  ];

  readonly nextLinks = [
    {
      path: '/docs/gestures',
      title: 'Gestures',
      description: 'Hover, tap, focus, and in-view interactions',
    },
    {
      path: '/docs/layout',
      title: 'Layout Animation',
      description: 'Automatic FLIP animations for layout changes',
    },
    {
      path: '/docs/presence',
      title: 'Presence & Exit',
      description: 'Animate elements entering and leaving the DOM',
    },
    {
      path: '/docs/motion-directive',
      title: 'Motion Directive',
      description: 'Full API reference for ngmMotion',
    },
  ];
}
