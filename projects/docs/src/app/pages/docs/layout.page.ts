import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgmLayoutGroupDirective, NgmMotionDirective } from '@scripttype/ng-motion';
import { CodeBlockComponent } from '../../components/code-block.component';

interface LayoutGroupDemoItem {
  id: string;
  label: string;
  accent: string;
  note: string;
}

interface ScrollLayoutDemoItem {
  id: string;
  title: string;
  accent: string;
  summary: string;
}


@Component({
  selector: 'app-layout',
  imports: [RouterLink, NgmMotionDirective, NgmLayoutGroupDirective, CodeBlockComponent],
  template: `
    <article class="max-w-3xl pb-16">
      <!-- Header -->
      <div
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
      >
        <h1 class="font-display font-bold text-4xl mb-4">Layout Animation</h1>
        <p class="text-lg text-secondary mb-6 leading-relaxed">
          Layout animations automatically animate elements when their position or size
          changes due to a DOM layout shift. ng-motion uses the
          <strong class="text-primary">FLIP</strong> technique under the hood —
          <strong class="text-primary">F</strong>irst (snapshot the old layout),
          <strong class="text-primary">L</strong>ast (let the DOM settle into the new layout),
          <strong class="text-primary">I</strong>nvert (apply transforms to make the element look like it's still in the old position),
          <strong class="text-primary">P</strong>lay (animate the transforms back to zero with spring physics).
        </p>
        <p class="text-lg text-secondary mb-12 leading-relaxed">
          This means you never have to calculate positions or write keyframes —
          just change your data, and ng-motion handles the rest.
        </p>
      </div>

      <!-- Basic layout -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.1 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Basic layout animation</h2>
        <p class="text-secondary mb-6">
          Add the
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >layout</code
          >
          input to any element with
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >ngmMotion</code
          >. When the element's position or size changes in the DOM, it will
          automatically animate to its new layout using a spring transition.
        </p>

        <div class="rounded-xl border border-border bg-surface/30 p-5 mb-6">
          <p class="text-sm text-secondary">
            All examples on this page use
            <code
              class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
              >NgmMotionDirective</code
            >
            from
            <code
              class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
              >ng-motion</code
            >. Add it to your component's
            <code
              class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
              >imports</code
            >
            array. The
            <code
              class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
              >layout</code
            >,
            <code
              class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
              >layoutId</code
            >,
            <code
              class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
              >layoutDependency</code
            >, and
            <code
              class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
              >layoutScroll</code
            >
            inputs are all part of
            <code
              class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
              >NgmMotionDirective</code
            >.
          </p>
        </div>

        <app-code-block [code]="basicLayoutCode" lang="html" filename="template" class="mb-6" />

        <p class="text-secondary mb-4">
          Set
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >layout</code
          >
          to
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >true</code
          >
          to animate both position and size. You can also pass a spring
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >transition</code
          >
          to control the feel of the animation.
        </p>
      </section>

      <!-- layoutDependency -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.2 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Layout dependency</h2>
        <p class="text-secondary mb-6">
          Use
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >layoutDependency</code
          >
          to tell ng-motion which state drives the layout change. When the dependency
          value changes, ng-motion snapshots the current layout, waits for the DOM to
          update, then animates the difference. This prevents false animations from
          external page shifts.
        </p>

        <app-code-block [code]="layoutDependencyCode" lang="html" filename="template" class="mb-6" />

        <!-- Live demo: expanding card -->
        <p class="text-sm text-muted mb-3 font-mono">Click the card to toggle</p>
        <div
          ngmMotion
          [layout]="true"
          [layoutDependency]="expanded()"
          [transition]="demoSpring"
          class="rounded-xl border border-border p-10 bg-surface/30 flex items-center justify-center"
        >
          <div
            ngmMotion
            [layout]="true"
            [layoutDependency]="expanded()"
            [transition]="demoSpring"
            (click)="expanded.set(!expanded())"
            class="rounded-xl bg-gradient-to-br from-accent/15 to-accent-purple/15 border border-accent/20 cursor-pointer select-none overflow-hidden"
            [class]="expanded() ? 'w-80' : 'w-52'"
          >
            <div
              ngmMotion
              [layout]="'position'"
              [layoutDependency]="expanded()"
              [transition]="demoSpring"
              [class]="expanded() ? 'p-6' : 'p-4'"
            >
              <div
                ngmMotion
                [layout]="'position'"
                [layoutDependency]="expanded()"
                [transition]="demoSpring"
                class="font-display font-semibold"
              >
                Expanding Card
              </div>
              <p
                ngmMotion
                [layout]="'position'"
                [layoutDependency]="expanded()"
                [transition]="demoSpring"
                class="mt-1 text-sm text-secondary leading-relaxed"
              >
                {{
                  expanded()
                    ? 'Width and height now animate together while the content keeps its own position, so collapse does not smear or stretch.'
                    : 'Click to expand'
                }}
              </p>
              @if (expanded()) {
                <div
                  class="mt-3 rounded-lg border border-border/70 bg-black/10 px-3 py-2 text-xs text-secondary"
                >
                  Use a layout-animated shell with position-only content wrappers for cleaner layout transitions.
                </div>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- Shared layout with layoutId -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.3 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Shared layout with layoutId
        </h2>
        <p class="text-secondary mb-6">
          Give two elements the same
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >layoutId</code
          >
          and ng-motion will automatically animate between them when one is removed
          and the other is added. This is perfect for tab indicators, selection
          highlights, and shared element transitions.
        </p>

        <app-code-block [code]="sharedLayoutCode" lang="html" filename="template" class="mb-6" />

        <!-- Live demo: tab indicator -->
        <p class="text-sm text-muted mb-3 font-mono">Click a tab</p>
        <div
          class="rounded-xl border border-border p-10 bg-surface/30 flex items-center justify-center"
        >
          <div class="flex gap-1 p-1.5 rounded-xl bg-elevated/50 border border-border">
            @for (tab of tabs; track tab.id) {
              <button
                (click)="activeTab.set(tab.id)"
                class="relative px-5 py-2.5 text-sm font-medium rounded-lg transition-colors z-10"
                [class]="activeTab() === tab.id ? 'text-primary' : 'text-secondary hover:text-primary'"
              >
                @if (activeTab() === tab.id) {
                  <div
                    ngmMotion
                    [layoutId]="'tab-indicator'"
                    [transition]="{ type: 'spring', stiffness: 500, damping: 36 }"
                    class="absolute inset-0 rounded-lg bg-accent/10 border border-accent/20"
                  ></div>
                }
                <span class="relative">{{ tab.label }}</span>
              </button>
            }
          </div>
        </div>
      </section>

      <!-- Layout values reference -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.4 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Layout values</h2>
        <p class="text-secondary mb-6">
          The
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >layout</code
          >
          input accepts several values to control which aspects of layout are animated:
        </p>

        <div
          class="rounded-xl border border-border bg-surface/30 overflow-hidden"
        >
          <div class="grid grid-cols-[140px_1fr] border-b border-border px-5 py-3">
            <span class="text-xs text-muted font-mono uppercase tracking-wider"
              >Value</span
            >
            <span class="text-xs text-muted font-mono uppercase tracking-wider"
              >Behavior</span
            >
          </div>
          <div
            class="grid grid-cols-[140px_1fr] border-b border-border/50 px-5 py-3.5 items-center"
          >
            <code class="text-sm font-mono text-accent">true</code>
            <span class="text-sm text-secondary"
              >Animate both position and size changes</span
            >
          </div>
          <div
            class="grid grid-cols-[140px_1fr] border-b border-border/50 px-5 py-3.5 items-center"
          >
            <code class="text-sm font-mono text-accent">'position'</code>
            <span class="text-sm text-secondary"
              >Only animate position changes, ignore size</span
            >
          </div>
          <div
            class="grid grid-cols-[140px_1fr] border-b border-border/50 px-5 py-3.5 items-center"
          >
            <code class="text-sm font-mono text-accent">'size'</code>
            <span class="text-sm text-secondary"
              >Only animate size changes, ignore position</span
            >
          </div>
          <div class="grid grid-cols-[140px_1fr] px-5 py-3.5 items-center">
            <code class="text-sm font-mono text-accent">'preserve-aspect'</code>
            <span class="text-sm text-secondary"
              >Animate layout while preserving the element's aspect ratio</span
            >
          </div>
        </div>

        <app-code-block [code]="layoutValuesCode" lang="html" filename="template" class="mt-6" />
      </section>

      <!-- ngmLayoutGroup -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.5 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          ngmLayoutGroup
        </h2>
        <p class="text-secondary mb-6">
          When shared layout elements (using
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >layoutId</code
          >) live in different component subtrees, wrap them in an
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >ngmLayoutGroup</code
          >
          to tell ng-motion they belong to the same animation scope. Without this,
          ng-motion cannot detect that two elements with the same
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >layoutId</code
          >
          are related.
        </p>

        <div class="rounded-xl border border-border bg-surface/30 p-5 mb-6">
          <p class="text-sm text-secondary">
            <strong class="text-primary">Import note:</strong>
            <code
              class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
              >NgmLayoutGroupDirective</code
            >
            is a separate directive. Add it alongside
            <code
              class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
              >NgmMotionDirective</code
            >
            in your component's
            <code
              class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
              >imports</code
            >
            array.
          </p>
        </div>

        <app-code-block [code]="layoutGroupCode" lang="typescript" filename="component.ts" class="mb-6" />

        <p class="text-sm text-muted mb-3 font-mono">
          Live demo: click a card to move it across the group
        </p>
        <div
          ngmLayoutGroup="docs-layout-group"
          class="rounded-xl border border-border bg-surface/30 p-6 mb-6"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="rounded-xl border border-border bg-elevated/30 p-4">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-display font-semibold text-sm">Backlog</h3>
                <span class="text-xs text-muted font-mono">{{ layoutGroupLeft().length }} items</span>
              </div>
              <div class="space-y-2 min-h-[176px]">
                @for (item of layoutGroupLeft(); track item.id) {
                  <button
                    ngmMotion
                    [layout]="true"
                    [layoutId]="'docs-group-' + item.id"
                    [transition]="demoSpring"
                    (click)="moveLayoutGroupItem(item.id, 'left')"
                    class="w-full text-left rounded-lg border border-transparent px-4 py-3 transition-colors hover:border-border-hover"
                    [class]="item.accent"
                  >
                    <div class="flex items-center justify-between gap-3">
                      <span class="font-medium text-sm text-primary">{{ item.label }}</span>
                      <span class="text-[11px] font-mono text-muted">{{ item.note }}</span>
                    </div>
                  </button>
                }
                @if (layoutGroupLeft().length === 0) {
                  <div class="flex items-center justify-center rounded-lg border border-dashed border-border py-8 text-xs text-muted">
                    Empty. Click items in Review.
                  </div>
                }
              </div>
            </div>

            <div class="rounded-xl border border-border bg-elevated/30 p-4">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-display font-semibold text-sm">Review</h3>
                <span class="text-xs text-muted font-mono">{{ layoutGroupRight().length }} items</span>
              </div>
              <div class="space-y-2 min-h-[176px]">
                @for (item of layoutGroupRight(); track item.id) {
                  <button
                    ngmMotion
                    [layout]="true"
                    [layoutId]="'docs-group-' + item.id"
                    [transition]="demoSpring"
                    (click)="moveLayoutGroupItem(item.id, 'right')"
                    class="w-full text-left rounded-lg border border-transparent px-4 py-3 transition-colors hover:border-border-hover"
                    [class]="item.accent"
                  >
                    <div class="flex items-center justify-between gap-3">
                      <span class="font-medium text-sm text-primary">{{ item.label }}</span>
                      <span class="text-[11px] font-mono text-muted">{{ item.note }}</span>
                    </div>
                  </button>
                }
                @if (layoutGroupRight().length === 0) {
                  <div class="flex items-center justify-center rounded-lg border border-dashed border-border py-8 text-xs text-muted">
                    Empty. Click items in Backlog.
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

        <p class="text-secondary mb-4">
          The group directive also accepts an
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >[inherit]</code
          >
          input. Set it to
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >true</code
          >
          (the default) to share the projection node group with any parent layout
          group, or
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >'id'</code
          >
          to only inherit the group ID namespace.
        </p>

        <app-code-block [code]="inheritCode" lang="html" filename="template" />
      </section>

      <!-- layoutScroll -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.6 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">layoutScroll</h2>
        <p class="text-secondary mb-6">
          Put
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >layoutScroll</code
          >
          on the scrollable container itself so layout measurements include its current
          scroll offset. Without it, items inside the scroller can animate from stale
          geometry when content expands or collapses while the container is scrolled.
        </p>

        <app-code-block [code]="layoutScrollCode" lang="html" filename="template" class="mt-6" />

        <p class="text-sm text-muted mt-6 mb-3 font-mono">
          Live demo: scroll-aware stack
        </p>
        <div class="rounded-xl border border-border bg-surface/30 p-4">
          <div class="flex items-center justify-between mb-3 gap-3">
            <div>
              <h3 class="font-display font-semibold text-sm">Scroll-aware stack</h3>
              <p class="text-xs text-secondary">Scroll inside, then click a card.</p>
            </div>
            <button
              ngmMotion
              type="button"
              (click)="scrollFocused.set(scrollFocused() === 'polish' ? 'measure' : 'polish')"
              class="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-secondary hover:border-border-hover"
            >
              Toggle focus
            </button>
          </div>

          <div
            ngmMotion
            [layoutScroll]="true"
            class="h-64 overflow-y-auto rounded-xl border border-border bg-elevated/30 p-3 space-y-3 [overflow-anchor:none]"
          >
            <div class="h-12 flex items-center px-2 text-[11px] uppercase tracking-wider text-muted">
              scroll offset context
            </div>
            @for (item of scrollDemoItems; track item.id) {
              <button
                ngmMotion
                [layout]="true"
                [layoutDependency]="scrollFocused()"
                [transition]="demoSpring"
                type="button"
                (click)="scrollFocused.set(item.id)"
                class="w-full text-left rounded-lg border px-4 py-3 transition-colors"
                [class]="scrollFocused() === item.id ? item.accent + ' border-accent/30' : 'border-border bg-surface/40 hover:border-border-hover'"
              >
                <div class="flex items-center justify-between gap-3">
                  <span class="font-medium text-sm text-primary">{{ item.title }}</span>
                  <span class="text-[11px] font-mono text-muted">
                    {{ scrollFocused() === item.id ? 'expanded' : 'collapsed' }}
                  </span>
                </div>
                <p class="mt-1 text-xs text-secondary">{{ item.summary }}</p>
                @if (scrollFocused() === item.id) {
                  <div class="mt-3 rounded-md bg-black/10 px-3 py-2 text-xs text-secondary">
                    This card grows while the scroll container keeps its measurements in sync.
                  </div>
                }
              </button>
            }
            <div class="h-16"></div>
          </div>
        </div>
      </section>

      <!-- When to use -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.7 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          When to use layout animation
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div class="rounded-xl border border-border bg-surface/30 p-6">
            <h3
              class="font-display font-semibold text-base mb-3 text-accent"
            >
              Good fits
            </h3>
            <ul class="space-y-2.5">
              <li class="flex items-start gap-2.5">
                <div
                  class="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 mt-2"
                ></div>
                <span class="text-sm text-secondary">Tab indicators and selection highlights</span>
              </li>
              <li class="flex items-start gap-2.5">
                <div
                  class="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 mt-2"
                ></div>
                <span class="text-sm text-secondary">Expanding and collapsing cards</span>
              </li>
              <li class="flex items-start gap-2.5">
                <div
                  class="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 mt-2"
                ></div>
                <span class="text-sm text-secondary">Filtering and reordering lists</span>
              </li>
              <li class="flex items-start gap-2.5">
                <div
                  class="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 mt-2"
                ></div>
                <span class="text-sm text-secondary">Shared element transitions between views</span>
              </li>
              <li class="flex items-start gap-2.5">
                <div
                  class="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 mt-2"
                ></div>
                <span class="text-sm text-secondary">Accordion and disclosure panels</span>
              </li>
            </ul>
          </div>

          <div class="rounded-xl border border-border bg-surface/30 p-6">
            <h3
              class="font-display font-semibold text-base mb-3 text-accent-pink"
            >
              Poor fits
            </h3>
            <ul class="space-y-2.5">
              <li class="flex items-start gap-2.5">
                <div
                  class="w-1.5 h-1.5 rounded-full bg-accent-pink flex-shrink-0 mt-2"
                ></div>
                <span class="text-sm text-secondary">Continuous drag tracking (use drag gestures instead)</span>
              </li>
              <li class="flex items-start gap-2.5">
                <div
                  class="w-1.5 h-1.5 rounded-full bg-accent-pink flex-shrink-0 mt-2"
                ></div>
                <span class="text-sm text-secondary">Frame-by-frame physics simulations</span>
              </li>
              <li class="flex items-start gap-2.5">
                <div
                  class="w-1.5 h-1.5 rounded-full bg-accent-pink flex-shrink-0 mt-2"
                ></div>
                <span class="text-sm text-secondary">Animations not triggered by layout changes</span>
              </li>
              <li class="flex items-start gap-2.5">
                <div
                  class="w-1.5 h-1.5 rounded-full bg-accent-pink flex-shrink-0 mt-2"
                ></div>
                <span class="text-sm text-secondary">High-frequency DOM updates (e.g., live tickers)</span>
              </li>
            </ul>
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
export class LayoutPage {
  readonly demoSpring = {
    type: 'spring',
    stiffness: 420,
    damping: 34,
  } as const;



  // ── Interactive demo state ──
  readonly expanded = signal(false);
  readonly activeTab = signal('design');
  readonly layoutGroupLeft = signal<LayoutGroupDemoItem[]>([
    {
      id: 'wireframes',
      label: 'Wireframes',
      accent: 'bg-accent/8',
      note: 'draft',
    },
    {
      id: 'tokens',
      label: 'Design tokens',
      accent: 'bg-accent-purple/8',
      note: 'theme',
    },
    {
      id: 'copy',
      label: 'Landing copy',
      accent: 'bg-accent-pink/8',
      note: 'content',
    },
  ]);
  readonly layoutGroupRight = signal<LayoutGroupDemoItem[]>([
    {
      id: 'prototype',
      label: 'Prototype',
      accent: 'bg-accent-amber/8',
      note: 'review',
    },
    {
      id: 'qa-pass',
      label: 'QA pass',
      accent: 'bg-accent/8',
      note: 'verify',
    },
  ]);
  readonly scrollFocused = signal('polish');

  readonly tabs = [
    { id: 'design', label: 'Design' },
    { id: 'develop', label: 'Develop' },
    { id: 'deploy', label: 'Deploy' },
    { id: 'monitor', label: 'Monitor' },
  ];

  // ── Code examples ──
  readonly basicLayoutCode = [
    '<div',
    '  ngmMotion',
    '  [layout]="true"',
    '  [transition]="{',
    "    type: 'spring',",
    '    stiffness: 360,',
    '    damping: 30',
    '  }"',
    '>',
    '  This element animates when its layout changes.',
    '</div>',
  ].join('\n');

  readonly layoutDependencyCode = [
    '<!-- Component class: expanded = signal(false); -->',
    "<!-- Component class: demoSpring = { type: 'spring', stiffness: 420, damping: 34 } as const; -->",
    '',
    '<div',
    '  ngmMotion',
    '  [layout]="true"',
    '  [layoutDependency]="expanded()"',
    '  [transition]="demoSpring"',
    '  class="rounded-xl border border-border p-10 bg-surface/30 flex items-center justify-center"',
    '>',
    '  <section',
    '    ngmMotion',
    '    [layout]="true"',
    '    [layoutDependency]="expanded()"',
    '    [transition]="demoSpring"',
    '    (click)="expanded.set(!expanded())"',
    '    class="rounded-xl bg-gradient-to-br from-accent/15 to-accent-purple/15 border border-accent/20 cursor-pointer select-none overflow-hidden"',
    '    [class]="expanded() ? \'w-80\' : \'w-52\'"',
    '  >',
    '    <div',
    '      ngmMotion',
    '      [layout]="\'position\'"',
    '      [layoutDependency]="expanded()"',
    '      [transition]="demoSpring"',
    '      [class]="expanded() ? \'p-6\' : \'p-4\'"',
    '    >',
    '      <h3 ngmMotion [layout]="\'position\'" [layoutDependency]="expanded()" [transition]="demoSpring">',
    '        Expanding Card',
    '      </h3>',
    '      <p ngmMotion [layout]="\'position\'" [layoutDependency]="expanded()" [transition]="demoSpring">',
    '        {{ expanded() ? \'Expanded content...\' : \'Click to expand\' }}',
    '      </p>',
    '      @if (expanded()) {',
    '        <div class="mt-3 rounded-lg border border-border/70 bg-black/10 px-3 py-2 text-xs text-secondary">',
    '          Use a layout-animated shell with position-only content wrappers.',
    '        </div>',
    '      }',
    '    </div>',
    '  </section>',
    '</div>',
  ].join('\n');

  readonly sharedLayoutCode = [
    '<!-- Component class: activeTab = signal(tabs[0].id); -->',
    '',
    '@for (tab of tabs; track tab.id) {',
    '  <button (click)="activeTab.set(tab.id)">',
    '    @if (activeTab() === tab.id) {',
    '      <div',
    '        ngmMotion',
    "        [layoutId]=\"'active-indicator'\"",
    '        [transition]="{',
    "          type: 'spring',",
    '          stiffness: 500,',
    '          damping: 36',
    '        }"',
    '        class="indicator"',
    '      ></div>',
    '    }',
    '    {{ tab.label }}',
    '  </button>',
    '}',
  ].join('\n');

  readonly layoutValuesCode = [
    '<!-- Animate position only (ignore size changes) -->',
    '<div ngmMotion [layout]="\'position\'">...</div>',
    '',
    '<!-- Animate size only (ignore position changes) -->',
    '<div ngmMotion [layout]="\'size\'">...</div>',
    '',
    '<!-- Preserve aspect ratio during layout animation -->',
    '<img ngmMotion [layout]="\'preserve-aspect\'" />',
  ].join('\n');

  readonly layoutGroupCode = [
    "import { NgmMotionDirective, NgmLayoutGroupDirective } from '@scripttype/ng-motion';",
    '',
    '@Component({',
    '  imports: [NgmMotionDirective, NgmLayoutGroupDirective],',
    '  template: `',
    '    <!-- Wrap sibling regions that share layoutId elements -->',
    '    <div ngmLayoutGroup>',
    '      <app-sidebar>',
    '        <!-- contains: <div ngmMotion [layoutId]="\'highlight\'"> -->',
    '      </app-sidebar>',
    '',
    '      <app-main-content>',
    '        <!-- contains: <div ngmMotion [layoutId]="\'highlight\'"> -->',
    '      </app-main-content>',
    '    </div>',
    '',
    '    <!-- Nested group that only inherits the ID namespace -->',
    '    <div ngmLayoutGroup="panel-scope" [inherit]="\'id\'">',
    '      ...',
    '    </div>',
    '  `,',
    '})',
  ].join('\n');

  readonly inheritCode = [
    '<!-- Default: shares projection node group with parent -->',
    '<div ngmLayoutGroup="section-a" [inherit]="true">',
    '  ...',
    '</div>',
    '',
    '<!-- Only inherit the ID namespace, not the node group -->',
    '<div ngmLayoutGroup="section-b" [inherit]="\'id\'">',
    '  ...',
    '</div>',
  ].join('\n');

  readonly layoutScrollCode = [
    '<!-- Component class:',
    'readonly scrollFocused = signal(\'polish\');',
    'readonly demoSpring = { type: \'spring\', stiffness: 420, damping: 34 } as const;',
    '-->',
    '',
    '<div',
    '  ngmMotion',
    '  [layoutScroll]="true"',
    '  class="h-64 overflow-y-auto space-y-3 [overflow-anchor:none]"',
    '>',
    '  @for (item of scrollDemoItems; track item.id) {',
    '    <button',
    '      ngmMotion',
    '      [layout]="true"',
    '      [layoutDependency]="scrollFocused()"',
    '      [transition]="demoSpring"',
    "      type=\"button\"",
    '      (click)="scrollFocused.set(item.id)"',
    "      [class]=\"scrollFocused() === item.id ? item.accent + ' border-accent/30' : 'border-border bg-surface/40'\"",
    '    >',
    '      <span>{{ item.title }}</span>',
    '      <span>{{ scrollFocused() === item.id ? \'expanded\' : \'collapsed\' }}</span>',
    '      @if (scrollFocused() === item.id) {',
    '        <div>This card grows while the container is scrolled.</div>',
    '      }',
    '    </button>',
    '  }',
    '</div>',
  ].join('\n');

  readonly scrollDemoItems: ScrollLayoutDemoItem[] = [
    {
      id: 'measure',
      title: 'Measure',
      accent: 'bg-accent/8',
      summary: 'Snapshot the current layout before the DOM changes.',
    },
    {
      id: 'invert',
      title: 'Invert',
      accent: 'bg-accent-purple/8',
      summary: 'Apply the inverse delta as a transform.',
    },
    {
      id: 'polish',
      title: 'Play',
      accent: 'bg-accent-amber/8',
      summary: 'Animate the delta away with spring physics.',
    },
    {
      id: 'settle',
      title: 'Settle',
      accent: 'bg-accent-pink/8',
      summary: 'Land in the new layout without a visual jump.',
    },
  ];


  readonly nextLinks = [
    {
      path: '/docs/scroll',
      title: 'Scroll Animation',
      description: 'Drive animations from scroll position and progress',
    },
    {
      path: '/docs/drag',
      title: 'Drag & Reorder',
      description: 'Drag gestures with constraints, snapping, and reorder lists',
    },
    {
      path: '/docs/presence',
      title: 'Presence & Exit',
      description: 'Animate elements entering and leaving the DOM',
    },
    {
      path: '/docs/motion-directive',
      title: 'Motion Directive',
      description: 'Full reference for all directive inputs and outputs',
    },
  ];

  moveLayoutGroupItem(id: string, source: 'left' | 'right'): void {
    if (source === 'left') {
      const left = this.layoutGroupLeft();
      const item = left.find((entry) => entry.id === id);
      if (!item) return;
      this.layoutGroupLeft.set(left.filter((entry) => entry.id !== id));
      this.layoutGroupRight.set([...this.layoutGroupRight(), item]);
      return;
    }

    const right = this.layoutGroupRight();
    const item = right.find((entry) => entry.id === id);
    if (!item) return;
    this.layoutGroupRight.set(right.filter((entry) => entry.id !== id));
    this.layoutGroupLeft.set([...this.layoutGroupLeft(), item]);
  }
}
