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
          Add
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >[exit]</code
          >
          to any
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >ngmMotion</code
          >
          element and exit animations work automatically with
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >&#64;if</code
          >,
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >&#64;for</code
          >, and
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >&#64;switch</code
          >. When Angular removes an element, ng-motion creates a clone
          and plays the exit animation before cleaning up. For coordinated exits
          and presence hooks,
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >*ngmPresence</code
          >
          keeps the original element mounted instead.
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
          Add an
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >[exit]</code
          >
          input to your
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >ngmMotion</code
          >
          element inside
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >&#64;if</code
          >. When the condition becomes
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >false</code
          >, ng-motion clones the element and plays the exit animation
          before removing it. No wrapper needed.
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
            @if (visible()) {
              <article
                ngmMotion
                [initial]="{ opacity: 0, scale: 0.92, y: 12 }"
                [animate]="{ opacity: 1, scale: 1, y: 0 }"
                [exit]="{ opacity: 0, scale: 0.92, y: -12 }"
                [transition]="{ type: 'spring', stiffness: 280, damping: 24 }"
                class="px-8 py-4 rounded-xl bg-gradient-to-br from-accent/15 to-accent-purple/15 border border-accent/20 text-lg"
              >
                I animate in and out.
              </article>
            }
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
          When Angular destroys an element that has an
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >[exit]</code
          >
          input (via
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >&#64;if</code
          >,
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >&#64;for</code
          >, or
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >&#64;switch</code
          >), four things happen:
        </p>

        <div class="rounded-xl border border-border bg-surface/30 p-6 space-y-4">
          <div class="flex items-start gap-4">
            <div
              class="w-7 h-7 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center flex-shrink-0 mt-0.5"
            >
              <span class="text-xs font-mono text-accent font-bold">1</span>
            </div>
            <p class="text-secondary">
              Angular removes the original element from the DOM (normal
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >&#64;if</code
              >
              behavior).
            </p>
          </div>
          <div class="flex items-start gap-4">
            <div
              class="w-7 h-7 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center flex-shrink-0 mt-0.5"
            >
              <span class="text-xs font-mono text-accent font-bold">2</span>
            </div>
            <p class="text-secondary">
              The
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >ngmMotion</code
              >
              directive intercepts destruction and creates an in-flow clone at the
              original position.
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
                >exit</code
              >
              animation plays on the clone.
            </p>
          </div>
          <div class="flex items-start gap-4">
            <div
              class="w-7 h-7 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center flex-shrink-0 mt-0.5"
            >
              <span class="text-xs font-mono text-accent font-bold">4</span>
            </div>
            <p class="text-secondary">
              Once the animation completes, the clone is removed from the DOM.
            </p>
          </div>
        </div>

        <div class="rounded-xl border border-border bg-surface/30 p-5 mt-6 text-sm text-secondary">
          <strong class="text-primary">Auto-derive initial from exit</strong> &mdash;
          When
          <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">[exit]</code>
          is set but
          <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">[initial]</code>
          is not, the exit values become the initial state automatically. This means
          you only need
          <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">[animate]</code>
          +
          <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">[exit]</code>
          for symmetric enter/exit animations. Set
          <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">[initial]</code>
          explicitly when you want different enter and exit directions (e.g. slide in
          from below, exit upward).
        </div>
      </section>

      <!-- List exit animation -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.2 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">List exit animation</h2>
        <p class="text-secondary mb-6">
          Exit animations work the same way in
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >&#64;for</code
          >
          loops. Remove an item from the array and each removed element gets its
          own exit clone that animates independently. No wrapper or helper needed.
        </p>

        <app-code-block [code]="simpleForExitCode" lang="typescript" filename="simple-list.component.ts" class="mb-6" />

        <!-- Live @for demo without *ngmPresence -->
        <div
          class="rounded-xl border border-border p-10 bg-surface/30 flex flex-col items-center gap-6"
        >
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
              [disabled]="items().length === 0"
              [class.opacity-40]="items().length === 0"
              [class.pointer-events-none]="items().length === 0"
              type="button"
              class="px-5 py-2 rounded-lg bg-accent-pink/15 border border-accent-pink/30 text-accent-pink font-medium cursor-pointer select-none text-sm disabled:cursor-not-allowed"
            >
              Remove random
            </button>
          </div>

          <div class="flex w-full max-w-sm flex-col rounded-2xl border border-border bg-elevated/20 p-3">
            @for (item of items(); track item.id; let last = $last) {
              <div
                ngmMotion
                [initial]="{ opacity: 0, x: -20, height: 0, marginBottom: 0 }"
                [animate]="{ opacity: 1, x: 0, height: 56, marginBottom: last ? 0 : 12 }"
                [exit]="{ opacity: 0, x: 20, height: 0, marginBottom: 0 }"
                [transition]="{ type: 'spring', stiffness: 300, damping: 25 }"
                class="overflow-hidden"
              >
                <div
                  class="flex h-14 items-center justify-between px-5 rounded-xl bg-gradient-to-r from-accent/10 to-accent-purple/10 border border-accent/20"
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

      <!-- *ngmPresence (advanced) -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.25 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">*ngmPresence (advanced)</h2>
        <p class="text-secondary mb-6">
          For most cases,
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >&#64;if</code
          >
          +
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >[exit]</code
          >
          is all you need. But when you need coordinated exits, presence
          hooks, or animated lists with immediate UI reactions, use the
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >*ngmPresence</code
          >
          structural directive. Instead of cloning, it keeps the original
          element mounted while the exit animation plays, then removes it
          after completion.
        </p>

        <app-code-block [code]="ngmPresenceCode" lang="typescript" filename="presence-toggle.component.ts" class="mb-6" />

        <div class="rounded-xl border border-border bg-surface/30 p-5 text-sm text-secondary">
          <strong class="text-primary">When to use *ngmPresence</strong> &mdash;
          Prefer
          <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">*ngmPresence</code>
          when you need
          <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">useIsPresent()</code>,
          <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">usePresence()</code>,
          or
          <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">usePresenceList()</code>
          hooks, or when you need to coordinate multi-child exit animations.
          For simple show/hide with
          <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">&#64;if</code>
          or item removal with
          <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">&#64;for</code>,
          just use
          <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">[exit]</code>
          directly.
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
              (click)="addPresenceItem()"
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
              (click)="removePresenceRandom()"
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
            @for (item of presenceItems(); track item.id) {
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
                    (click)="removePresenceItem(item.id)"
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
            >[exit]</code
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
                Animate route transitions with
                <code
                  class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                  >[exit]</code
                >
                on the routed component, or use
                <code
                  class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                  >withMotionTransitions()</code
                >
                for declarative route transitions.
              </p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2"></div>
            <div>
              <p class="text-primary font-medium mb-1">Removable List Items</p>
              <p class="text-secondary text-sm">
                Add
                <code
                  class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                  >[exit]</code
                >
                to items in
                <code
                  class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                  >&#64;for</code
                >
                &mdash; each item animates out independently when removed from the array.
                For immediate UI reactions (disable buttons, adjust spacing), use
                <code
                  class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                  >usePresenceList</code
                >
                +
                <code
                  class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                  >*ngmPresence</code
                >.
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
                <code
                  class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                  >[exit]</code
                >
                works with
                <code
                  class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                  >&#64;if</code
                >,
                <code
                  class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                  >&#64;for</code
                >, and
                <code
                  class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                  >&#64;switch</code
                >
                out of the box
              </p>
              <p class="text-secondary text-sm">
                No wrapper needed. When Angular removes the element, the directive
                clones it and plays the exit animation automatically. Use
                <code
                  class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                  >*ngmPresence</code
                >
                only when you need presence hooks or coordinated multi-child exits.
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

  // @for + [exit] demo (direct removal, no *ngmPresence)
  readonly items = signal<ListItem[]>([
    { id: nextId++, label: 'First item' },
    { id: nextId++, label: 'Second item' },
    { id: nextId++, label: 'Third item' },
  ]);

  addItem(): void {
    const id = nextId++;
    this.items.update((list) => [...list, { id, label: `Item ${id}` }]);
  }

  removeItem(id: number): void {
    this.items.update((list) => list.filter((item) => item.id !== id));
  }

  removeRandom(): void {
    const list = this.items();
    if (list.length === 0) return;
    const index = Math.floor(Math.random() * list.length);
    this.removeItem(list[index].id);
  }

  // *ngmPresence + usePresenceList demo
  readonly presenceItems = signal<ListItem[]>([
    { id: nextId++, label: 'Item A' },
    { id: nextId++, label: 'Item B' },
    { id: nextId++, label: 'Item C' },
  ]);
  private readonly removingIds = signal(new Set<number>());
  readonly animatedListPresence = usePresenceList(this.presenceItems, {
    getId: (item) => item.id,
    exitingIds: this.removingIds,
  });

  toggleVisible(): void {
    this.visible.update((v) => !v);
  }

  addPresenceItem(): void {
    const id = nextId++;
    this.presenceItems.update((list) => [...list, { id, label: `Item ${id}` }]);
  }

  removePresenceItem(id: number): void {
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
      this.presenceItems.update((list) => list.filter((item) => item.id !== id));
      this.removingIds.update((set) => {
        const next = new Set(set);
        next.delete(id);
        return next;
      });
    }, 500));
  }

  removePresenceRandom(): void {
    const visibleIds = this.animatedListPresence.visibleIds();

    if (visibleIds.length === 0) {
      return;
    }

    const index = Math.floor(Math.random() * visibleIds.length);
    this.removePresenceItem(visibleIds[index]);
  }

  readonly simpleForExitCode = [
    "import { Component, signal } from '@angular/core';",
    "import { NgmMotionDirective } from '@scripttype/ng-motion';",
    '',
    '@Component({',
    '  imports: [NgmMotionDirective],',
    '  template: `',
    '    <button (click)="addItem()">Add</button>',
    '    <button (click)="removeRandom()">Remove random</button>',
    '',
    '    <div class="list-container">',
    '      @for (item of items(); track item.id; let last = $last) {',
    '        <div ngmMotion',
    '          [initial]="{ opacity: 0, x: -20, height: 0, marginBottom: 0 }"',
    '          [animate]="{ opacity: 1, x: 0, height: 56, marginBottom: last ? 0 : 12 }"',
    '          [exit]="{ opacity: 0, x: 20, height: 0, marginBottom: 0 }"',
    "          [transition]=\"{ type: 'spring', stiffness: 300, damping: 25 }\"",
    '          class="overflow-hidden"',
    '        >',
    '          <div class="row">',
    '            {{ item.label }}',
    '            <button (click)="removeItem(item.id)">remove</button>',
    '          </div>',
    '        </div>',
    '      }',
    '    </div>',
    '  `,',
    '})',
    'export class ForExitListComponent {',
    '  readonly items = signal([',
    "    { id: 0, label: 'Apple' },",
    "    { id: 1, label: 'Banana' },",
    "    { id: 2, label: 'Cherry' },",
    '  ]);',
    '',
    '  removeItem(id: number) {',
    '    this.items.update(list => list.filter(i => i.id !== id));',
    '  }',
    '}',
  ].join('\n');

  readonly basicExitCode = [
    "import { Component, signal } from '@angular/core';",
    "import { NgmMotionDirective } from '@scripttype/ng-motion';",
    "import type { Transition } from '@scripttype/ng-motion';",
    '',
    '@Component({',
    '  imports: [NgmMotionDirective],',
    '  template: `',
    '    <button (click)="visible.set(!visible())">Toggle</button>',
    '',
    '    @if (visible()) {',
    '      <article ngmMotion',
    '        [initial]="initialState"',
    '        [animate]="animateState"',
    '        [exit]="exitState"',
    '        [transition]="transition"',
    '      >',
    '        I animate in and out.',
    '      </article>',
    '    }',
    '  `,',
    '})',
    'export class ExitComponent {',
    '  readonly visible = signal(true);',
    '  readonly initialState = { opacity: 0, scale: 0.92, y: 12 };',
    '  readonly animateState = { opacity: 1, scale: 1, y: 0 };',
    '  readonly exitState = { opacity: 0, scale: 0.92, y: -12 };',
    "  readonly transition: Transition = { type: 'spring', stiffness: 280, damping: 24 };",
    '}',
  ].join('\n');

  readonly ngmPresenceCode = [
    "import { Component, signal } from '@angular/core';",
    "import { NgmMotionDirective, NgmPresenceDirective } from '@scripttype/ng-motion';",
    '',
    '@Component({',
    '  imports: [NgmMotionDirective, NgmPresenceDirective],',
    '  template: `',
    '    <button (click)="visible.set(!visible())">Toggle</button>',
    '',
    '    <!-- Keeps element mounted during exit — needed for presence hooks -->',
    '    <article *ngmPresence="visible()" ngmMotion',
    '      [initial]="{ opacity: 0, scale: 0.92 }"',
    '      [animate]="{ opacity: 1, scale: 1 }"',
    '      [exit]="{ opacity: 0, scale: 0.92 }"',
    '      [transition]="{ type: \'spring\', stiffness: 280, damping: 24 }"',
    '    >',
    '      I animate in and out.',
    '    </article>',
    '  `,',
    '})',
    'export class PresenceComponent {',
    '  readonly visible = signal(true);',
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
