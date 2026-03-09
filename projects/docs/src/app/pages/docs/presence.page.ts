import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgmMotionDirective, NgmPresenceDirective, usePresenceList } from '@scripttype/ng-motion';
import { CodeBlockComponent } from '../../components/code-block.component';

let nextId = 0;

interface ListItem {
  id: number;
  label: string;
}

@Component({
  selector: 'app-presence',
  imports: [RouterLink, NgmMotionDirective, NgmPresenceDirective, CodeBlockComponent],
  template: `
    <article class="max-w-3xl pb-16">
      <!-- Header -->
      <div
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
      >
        <h1 class="font-display font-bold text-4xl mb-4">Presence & Exit</h1>
        <p class="text-lg text-secondary mb-12 leading-relaxed">
          In Angular, removing an element from the DOM is instant. There is no built-in
          way to let it animate out first. The
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >*ngmPresence</code
          >
          structural directive solves this: it keeps the element mounted while an exit
          animation plays, then removes it only after the animation completes.
        </p>
      </div>

      <!-- Basic toggle demo -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.1 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Basic exit animation</h2>
        <p class="text-secondary mb-6">
          Wrap any element with
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >*ngmPresence</code
          >
          and define an
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >exit</code
          >
          state on the inner
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >ngmMotion</code
          >
          directive. When the condition becomes
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >false</code
          >, the exit animation runs before the element is removed.
        </p>

        <app-code-block [code]="basicExitCode" lang="typescript" filename="presence-toggle.component.ts" class="mb-6" />

        <!-- Live toggle demo -->
        <div
          class="rounded-xl border border-border p-10 bg-surface/30 flex flex-col items-center justify-center gap-6"
        >
          <button
            ngmMotion
            [whileHover]="{ scale: 1.05 }"
            [whileTap]="{ scale: 0.95 }"
            [transition]="{ type: 'spring', stiffness: 400, damping: 17 }"
            (click)="toggleVisible()"
            class="px-6 py-2.5 rounded-lg bg-accent/15 border border-accent/30 text-accent font-medium cursor-pointer select-none text-sm"
          >
            {{ visible() ? 'Hide' : 'Show' }}
          </button>

          <div class="h-20 flex items-center justify-center">
            <article
              *ngmPresence="visible()"
              ngmMotion
              [initial]="{ opacity: 0, scale: 0.92, y: 12 }"
              [animate]="{ opacity: 1, scale: 1, y: 0 }"
              [exit]="{ opacity: 0, scale: 0.92, y: -12 }"
              [transition]="{ type: 'spring', stiffness: 280, damping: 24 }"
              class="px-8 py-4 rounded-xl bg-gradient-to-br from-accent/15 to-accent-purple/15 border border-accent/20 text-lg"
            >
              I animate in and out.
            </article>
          </div>
        </div>
      </section>

      <!-- How it works -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.2 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">How it works</h2>
        <p class="text-secondary mb-6">
          When the presence condition changes from
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >true</code
          >
          to
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >false</code
          >, four things happen in sequence:
        </p>

        <div class="rounded-xl border border-border bg-surface/30 p-6 space-y-4">
          <div class="flex items-start gap-4">
            <div
              class="w-7 h-7 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center flex-shrink-0 mt-0.5"
            >
              <span class="text-xs font-mono text-accent font-bold">1</span>
            </div>
            <p class="text-secondary">
              The child view stays mounted in the DOM &mdash; Angular does not remove it yet.
            </p>
          </div>
          <div class="flex items-start gap-4">
            <div
              class="w-7 h-7 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center flex-shrink-0 mt-0.5"
            >
              <span class="text-xs font-mono text-accent font-bold">2</span>
            </div>
            <p class="text-secondary">
              The presence context switches
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >isPresent</code
              >
              to
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >false</code
              >.
            </p>
          </div>
          <div class="flex items-start gap-4">
            <div
              class="w-7 h-7 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center flex-shrink-0 mt-0.5"
            >
              <span class="text-xs font-mono text-accent font-bold">3</span>
            </div>
            <p class="text-secondary">
              The
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >ngmMotion</code
              >
              directive detects the change and runs the
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >exit</code
              >
              animation.
            </p>
          </div>
          <div class="flex items-start gap-4">
            <div
              class="w-7 h-7 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center flex-shrink-0 mt-0.5"
            >
              <span class="text-xs font-mono text-accent font-bold">4</span>
            </div>
            <p class="text-secondary">
              Only after the exit animation completes is the view removed from the DOM.
            </p>
          </div>
        </div>
      </section>

      <!-- useIsPresent -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.3 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">useIsPresent</h2>
        <p class="text-secondary mb-6">
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >useIsPresent()</code
          >
          returns a
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >Signal&lt;boolean&gt;</code
          >
          that reflects whether the component is entering or exiting. Use it to
          conditionally change styles, disable interactions, or trigger side effects
          during exit.
        </p>

        <app-code-block [code]="useIsPresentCode" lang="typescript" filename="use-is-present.ts" class="mb-6" />

        <p class="text-secondary">
          If called outside a presence context (i.e. the element is not wrapped in
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >*ngmPresence</code
          >), it returns a constant
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >true</code
          >
          signal, so it is always safe to call.
        </p>
      </section>

      <!-- usePresence -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.4 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">usePresence</h2>
        <p class="text-secondary mb-6">
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >usePresence()</code
          >
          returns a tuple of
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >[Signal&lt;boolean&gt;, safeToRemove]</code
          >. The
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >safeToRemove</code
          >
          callback gives you explicit control over when the element is removed &mdash;
          useful for custom animation logic that lives outside
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >ngmMotion</code
          >.
        </p>

        <app-code-block [code]="usePresenceCode" lang="typescript" filename="use-presence.ts" class="mb-6" />
      </section>

      <!-- usePresenceList -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.45 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">usePresenceList</h2>
        <p class="text-secondary mb-6">
          Derives stable layout metadata for presence-driven lists &mdash; so spacing,
          visibility, and buttons react the moment an item starts exiting, not after
          it&apos;s gone. It bridges the gap between your data array (which hasn&apos;t
          changed yet) and the visual state (which is mid-exit-animation).
        </p>

        <app-code-block [code]="usePresenceListCode" lang="typescript" filename="use-presence-list.ts" class="mb-6" />

        <div class="rounded-xl border border-border bg-surface/30 p-6">
          <div class="flex items-start gap-3">
            <div class="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2"></div>
            <p class="text-secondary text-sm">
              Use <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">usePresenceList()</code>
              in any <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">&#64;for</code> +
              <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">*ngmPresence</code>
              list where the UI needs to respond immediately to removals &mdash; disable buttons, adjust spacing, update counters &mdash;
              instead of waiting for the data array to update after the exit animation timeout.
              See the animated list demo below for a complete example.
            </p>
          </div>
        </div>
      </section>

      <!-- Animated list removal -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.55 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Animated list removal</h2>
        <p class="text-secondary mb-6">
          Combine
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >&#64;for</code
          >
          with
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >*ngmPresence</code
          >
          to animate items as they are added and removed from a list. Each item
          gets its own presence context, so removals animate independently. For
          fixed-height rows like this demo, animate the row wrapper&apos;s
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >height</code
          >
          and
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >marginBottom</code
          >
          as part of the enter and exit states. The
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >usePresenceList()</code
          >
          helper keeps
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >visibleIds</code
          >,
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >visibleById</code
          >, and spacing metadata in sync from the moment an item starts exiting,
          so the buttons, list flow, and outer shell all react immediately instead
          of waiting for delayed data removal.
        </p>

        <app-code-block [code]="animatedListCode" lang="typescript" filename="animated-list.component.ts" class="mb-6" />

        <!-- Live list demo -->
        <div
          class="rounded-xl border border-border p-10 bg-surface/30 flex flex-col items-center gap-6"
        >
          @let visibleIds = animatedListPresence.visibleIds();
          @let visibleById = animatedListPresence.visibleById();
          @let gapAfter = animatedListPresence.gapAfter();
          <div class="flex gap-3">
            <button
              ngmMotion
              [whileHover]="{ scale: 1.05 }"
              [whileTap]="{ scale: 0.95 }"
              [transition]="{ type: 'spring', stiffness: 400, damping: 17 }"
              (click)="addItem()"
              type="button"
              class="px-5 py-2 rounded-lg bg-accent/15 border border-accent/30 text-accent font-medium cursor-pointer select-none text-sm"
            >
              Add item
            </button>
            <button
              ngmMotion
              [whileHover]="{ scale: 1.05 }"
              [whileTap]="{ scale: 0.95 }"
              [transition]="{ type: 'spring', stiffness: 400, damping: 17 }"
              (click)="removeRandom()"
              [disabled]="visibleIds.length === 0"
              [class.opacity-40]="visibleIds.length === 0"
              [class.pointer-events-none]="visibleIds.length === 0"
              type="button"
              class="px-5 py-2 rounded-lg bg-accent-pink/15 border border-accent-pink/30 text-accent-pink font-medium cursor-pointer select-none text-sm disabled:cursor-not-allowed"
            >
              Remove random
            </button>
          </div>

          <div class="flex w-full max-w-sm flex-col rounded-2xl border border-border bg-elevated/20 p-3">
            @for (item of items(); track item.id) {
              <div
                *ngmPresence="visibleById[item.id] ?? false"
                ngmMotion
                [initial]="{ opacity: 0, x: -20, height: 0, marginBottom: 0 }"
                [animate]="{
                  opacity: 1,
                  x: 0,
                  height: 56,
                  marginBottom: gapAfter[item.id] ? 12 : 0,
                }"
                [exit]="{ opacity: 0, x: 20, height: 0, marginBottom: 0 }"
                [transition]="{ type: 'spring', stiffness: 300, damping: 25 }"
                class="overflow-hidden"
              >
                <div
                  class="flex h-14 items-center justify-between px-5 rounded-xl bg-gradient-to-r from-accent-purple/10 to-accent-pink/10 border border-accent-purple/20"
                >
                  <span class="text-sm">{{ item.label }}</span>
                  <button
                    (click)="removeItem(item.id)"
                    type="button"
                    class="text-muted hover:text-accent-pink transition-colors text-xs font-mono cursor-pointer"
                  >
                    remove
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Common patterns -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.65 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Common patterns</h2>
        <p class="text-secondary mb-6">
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >*ngmPresence</code
          >
          works anywhere Angular conditionally renders content. Here are a few
          patterns you will use often:
        </p>

        <div class="rounded-xl border border-border bg-surface/30 p-6 space-y-5">
          <div class="flex items-start gap-4">
            <div class="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2"></div>
            <div>
              <p class="text-primary font-medium mb-1">Modals & Dialogs</p>
              <p class="text-secondary text-sm">
                Animate a backdrop and panel in on open, out on close. Use
                <code
                  class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                  >exit</code
                >
                with a fade and scale-down to feel natural.
              </p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2"></div>
            <div>
              <p class="text-primary font-medium mb-1">Drawers & Side Panels</p>
              <p class="text-secondary text-sm">
                Slide in from the edge with
                <code
                  class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                  >x: -300</code
                >
                or
                <code
                  class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                  >x: 300</code
                >, slide back out on exit.
              </p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2"></div>
            <div>
              <p class="text-primary font-medium mb-1">Toast & Notification Stacks</p>
              <p class="text-secondary text-sm">
                Each toast uses its own presence context. Items slide in from the top
                and fade out when dismissed, independently of each other.
              </p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2"></div>
            <div>
              <p class="text-primary font-medium mb-1">Routed Content</p>
              <p class="text-secondary text-sm">
                Animate route transitions by wrapping the routed component in
                <code
                  class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                  >*ngmPresence</code
                >
                and keying on the active route.
              </p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2"></div>
            <div>
              <p class="text-primary font-medium mb-1">Removable List Items</p>
              <p class="text-secondary text-sm">
                Combine
                <code
                  class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                  >&#64;for</code
                >
                with
                <code
                  class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                  >*ngmPresence</code
                >
                to animate individual items as they leave a list.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Best practices -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.75 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Best practices</h2>

        <div class="rounded-xl border border-border bg-surface/30 p-6 space-y-5">
          <div class="flex items-start gap-4">
            <div class="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2"></div>
            <div>
              <p class="text-primary font-medium mb-1">
                Always pair
                <code
                  class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                  >exit</code
                >
                with
                <code
                  class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                  >*ngmPresence</code
                >
              </p>
              <p class="text-secondary text-sm">
                The
                <code
                  class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                  >exit</code
                >
                input on
                <code
                  class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                  >ngmMotion</code
                >
                does nothing on its own. Without a presence context to delay removal,
                Angular destroys the element instantly and the exit animation never plays.
              </p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2"></div>
            <div>
              <p class="text-primary font-medium mb-1">
                Keep enter and exit symmetric
              </p>
              <p class="text-secondary text-sm">
                Matching
                <code
                  class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                  >initial</code
                >
                and
                <code
                  class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                  >exit</code
                >
                states (e.g. both fade to zero) feel natural. Asymmetric transitions
                are fine when intentional &mdash; for example, sliding in from the left
                but fading out in place.
              </p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2"></div>
            <div>
              <p class="text-primary font-medium mb-1">
                Use
                <code
                  class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                  >usePresence()</code
                >
                for custom exit logic
              </p>
              <p class="text-secondary text-sm">
                If your exit animation is not driven by
                <code
                  class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                  >ngmMotion</code
                >
                (e.g. a canvas or WebGL animation), call the
                <code
                  class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                  >safeToRemove</code
                >
                callback from
                <code
                  class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                  >usePresence()</code
                >
                to tell the presence context when removal is safe.
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
        [transition]="{ delay: 0.85 }"
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
export class PresencePage {
  private readonly pendingTimers: ReturnType<typeof setTimeout>[] = [];
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.destroyRef.onDestroy(() => this.pendingTimers.forEach(clearTimeout));
  }

  readonly visible = signal(true);
  readonly items = signal<ListItem[]>([
    { id: nextId++, label: 'First item' },
    { id: nextId++, label: 'Second item' },
    { id: nextId++, label: 'Third item' },
  ]);
  private readonly removingIds = signal(new Set<number>());
  readonly animatedListPresence = usePresenceList(this.items, {
    getId: (item) => item.id,
    exitingIds: this.removingIds,
  });

  toggleVisible(): void {
    this.visible.update((v) => !v);
  }

  addItem(): void {
    const id = nextId++;
    this.items.update((list) => [...list, { id, label: `Item ${id}` }]);
  }

  removeItem(id: number): void {
    if (this.removingIds().has(id)) {
      return;
    }

    this.removingIds.update((set) => {
      const next = new Set(set);
      next.add(id);
      return next;
    });
    // Allow time for exit animation, then remove from data
    this.pendingTimers.push(setTimeout(() => {
      this.items.update((list) => list.filter((item) => item.id !== id));
      this.removingIds.update((set) => {
        const next = new Set(set);
        next.delete(id);
        return next;
      });
    }, 500));
  }

  removeRandom(): void {
    const visibleIds = this.animatedListPresence.visibleIds();

    if (visibleIds.length === 0) {
      return;
    }

    const index = Math.floor(Math.random() * visibleIds.length);
    this.removeItem(visibleIds[index]);
  }

  readonly basicExitCode = [
    "import { Component, signal } from '@angular/core';",
    "import { NgmMotionDirective, NgmPresenceDirective } from '@scripttype/ng-motion';",
    "import type { Transition } from '@scripttype/ng-motion';",
    '',
    '@Component({',
    '  imports: [NgmMotionDirective, NgmPresenceDirective],',
    '  template: `',
    '    <button (click)="visible.set(!visible())">Toggle</button>',
    '',
    '    <article *ngmPresence="visible()" ngmMotion',
    '      [initial]="initialState"',
    '      [animate]="animateState"',
    '      [exit]="exitState"',
    '      [transition]="transition"',
    '    >',
    '      I animate in and out.',
    '    </article>',
    '  `,',
    '})',
    'export class PresenceComponent {',
    '  readonly visible = signal(true);',
    '  readonly initialState = { opacity: 0, scale: 0.92, y: 12 };',
    '  readonly animateState = { opacity: 1, scale: 1, y: 0 };',
    '  readonly exitState = { opacity: 0, scale: 0.92, y: -12 };',
    "  readonly transition: Transition = { type: 'spring', stiffness: 280, damping: 24 };",
    '}',
  ].join('\n');

  readonly useIsPresentCode = [
    "import { Component, computed } from '@angular/core';",
    "import { NgmMotionDirective, useIsPresent } from '@scripttype/ng-motion';",
    '',
    '@Component({',
    '  imports: [NgmMotionDirective],',
    '  template: `',
    '    <div ngmMotion',
    '      [animate]="{ opacity: isPresent() ? 1 : 0.5 }"',
    '      [style.pointer-events]="isPresent() ? \'auto\' : \'none\'"',
    '    >',
    '      {{ isPresent() ? "Entering" : "Exiting..." }}',
    '    </div>',
    '  `,',
    '})',
    'export class StatusComponent {',
    '  readonly isPresent = useIsPresent();',
    '}',
  ].join('\n');

  readonly usePresenceCode = [
    "import { Component, effect } from '@angular/core';",
    "import { usePresence } from '@scripttype/ng-motion';",
    '',
    '@Component({',
    "  template: `<canvas #canvas></canvas>`,",
    '})',
    'export class CanvasExitComponent {',
    '  private readonly presence = usePresence();',
    '  private readonly isPresent = this.presence[0];',
    '  private readonly safeToRemove = this.presence[1];',
    '',
    '  constructor() {',
    '    effect(() => {',
    '      if (!this.isPresent()) {',
    '        // Run custom exit animation, then signal removal',
    '        this.fadeOutCanvas().then(() => this.safeToRemove());',
    '      }',
    '    });',
    '  }',
    '',
    '  private async fadeOutCanvas(): Promise<void> {',
    '    // Custom canvas/WebGL exit animation logic',
    '  }',
    '}',
  ].join('\n');

  readonly usePresenceListCode = [
    "import { signal } from '@angular/core';",
    "import { usePresenceList } from '@scripttype/ng-motion';",
    '',
    'interface Item { id: number; label: string; }',
    '',
    'export class ListComponent {',
    '  readonly items = signal<Item[]>([...]);',
    '  readonly removingIds = signal(new Set<number>());',
    '',
    '  readonly presence = usePresenceList(this.items, {',
    '    getId: (item) => item.id,',
    '    exitingIds: this.removingIds,',
    '  });',
    '  // Returns:',
    '  // presence.visibleIds()   — ordered IDs excluding exiting items',
    '  // presence.visibleById()  — { [id]: boolean } for *ngmPresence binding',
    '  // presence.gapAfter()     — { [id]: boolean } which items have a sibling below',
    '}',
  ].join('\n');

  readonly animatedListCode = [
    "import { Component, signal } from '@angular/core';",
    "import { NgmMotionDirective, NgmPresenceDirective, usePresenceList } from '@scripttype/ng-motion';",
    '',
    '@Component({',
    '  imports: [NgmMotionDirective, NgmPresenceDirective],',
    '  template: `',
    '  @let visibleIds = animatedListPresence.visibleIds();',
    '  @let visibleById = animatedListPresence.visibleById();',
    '  @let gapAfter = animatedListPresence.gapAfter();',
    '',
    '  <button',
    '    (click)="removeRandom()"',
    '    [disabled]="visibleIds.length === 0"',
    '  >',
    '    Remove random',
    '  </button>',
    '',
    '  <div class="flex w-full max-w-sm flex-col rounded-2xl border border-border bg-elevated/20 p-3">',
    '    @for (item of items(); track item.id) {',
    '      <div *ngmPresence="visibleById[item.id] ?? false" ngmMotion',
    '        [initial]="{ opacity: 0, x: -20, height: 0, marginBottom: 0 }"',
    '        [animate]="{ opacity: 1, x: 0, height: 56, marginBottom: gapAfter[item.id] ? 12 : 0 }"',
    '        [exit]="{ opacity: 0, x: 20, height: 0, marginBottom: 0 }"',
    "        [transition]=\"{ type: 'spring', stiffness: 300, damping: 25 }\"",
    '        class="overflow-hidden"',
    '      >',
    '        <div class="flex h-14 items-center justify-between px-5 rounded-xl border">',
    '          {{ item.label }}',
    '          <button (click)="removeItem(item.id)">remove</button>',
    '        </div>',
    '      </div>',
    '    }',
    '  </div>',
    '`,',
    '})',
    'export class AnimatedListComponent {',
    '  readonly items = signal([{ id: 0, label: "First item" }]);',
    '  readonly removingIds = signal(new Set<number>());',
    '  readonly animatedListPresence = usePresenceList(this.items, {',
    '    getId: (item) => item.id,',
    '    exitingIds: this.removingIds,',
    '  });',
    '',
    '  removeItem(id: number): void {',
    '    if (this.removingIds().has(id)) return;',
    '',
    '    // 1. Mark the item as exiting — usePresenceList reacts immediately',
    '    this.removingIds.update((set) => {',
    '      const next = new Set(set);',
    '      next.add(id);',
    '      return next;',
    '    });',
    '',
    '    // 2. After the exit animation finishes, remove from the data array',
    '    setTimeout(() => {',
    '      this.items.update((list) => list.filter((item) => item.id !== id));',
    '      this.removingIds.update((set) => {',
    '        const next = new Set(set);',
    '        next.delete(id);',
    '        return next;',
    '      });',
    '    }, 500);',
    '  }',
    '',
    '  removeRandom(): void {',
    '    const visibleIds = this.animatedListPresence.visibleIds();',
    '    if (visibleIds.length === 0) return;',
    '    const index = Math.floor(Math.random() * visibleIds.length);',
    '    this.removeItem(visibleIds[index]);',
    '  }',
    '}',
  ].join('\n');

  readonly nextLinks = [
    {
      path: '/docs/layout',
      title: 'Layout Animation →',
      description: 'Automatic FLIP animations for layout changes',
    },
    {
      path: '/docs/gestures',
      title: 'Gestures →',
      description: 'Hover, tap, drag, and focus interactions',
    },
    {
      path: '/docs/motion-directive',
      title: 'Motion Directive →',
      description: 'Complete reference for all directive inputs and outputs',
    },
    {
      path: '/docs/getting-started',
      title: 'Getting Started →',
      description: 'Full walkthrough with springs, gestures, and more',
    },
  ];
}
