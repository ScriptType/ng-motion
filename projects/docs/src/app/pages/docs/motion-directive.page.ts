import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  NgmMotionDirective,
  NgmPresenceDirective,
  useMotionValue,
  usePresenceList,
  useTransform,
} from '@scripttype/ng-motion';
import { CodeBlockComponent } from '../../components/code-block.component';

@Component({
  selector: 'app-motion-directive',
  imports: [RouterLink, NgmMotionDirective, NgmPresenceDirective, CodeBlockComponent],
  template: `
    <article class="max-w-3xl pb-16">
      <!-- ── 1. Header ── -->
      <div
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
      >
        <h1 class="font-display font-bold text-4xl mb-4">Motion Directive</h1>
        <p class="text-lg text-secondary mb-12 leading-relaxed">
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >NgmMotionDirective</code
          >
          is the center of the library. Add
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >ngmMotion</code
          >
          to any element, then bind animation state through directive inputs. It bridges
          Angular's signal-based reactivity to motion-dom's animation engine, giving you
          declarative control over enter animations, gestures, layout transitions, and exit
          states.
        </p>
      </div>

      <!-- ── 2. Core Inputs Reference Table ── -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.1 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Core Inputs</h2>
        <p class="text-secondary mb-6">
          Every input is a signal-based Angular
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >input()</code
          >. Changes are tracked reactively and applied to the underlying
          VisualElement.
        </p>

        <div class="rounded-xl border border-border overflow-hidden mb-6">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border bg-elevated/50">
                  <th class="text-left px-4 py-3 font-mono text-xs text-muted font-semibold">Input</th>
                  <th class="text-left px-4 py-3 font-mono text-xs text-muted font-semibold">Type</th>
                  <th class="text-left px-4 py-3 font-mono text-xs text-muted font-semibold">Description</th>
                </tr>
              </thead>
              <tbody class="text-secondary">
                @for (row of coreInputRows; track row.name) {
                  <tr class="border-b border-border/50 last:border-b-0">
                    <td class="px-4 py-2.5 font-mono text-accent-pink text-xs">{{ row.name }}</td>
                    <td class="px-4 py-2.5 font-mono text-xs whitespace-nowrap">{{ row.type }}</td>
                    <td class="px-4 py-2.5 text-xs">{{ row.description }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ── 3. Basic State Animation ── -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.2 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Basic State Animation</h2>
        <p class="text-secondary mb-6">
          Combine
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >initial</code
          >,
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >animate</code
          >,
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >variants</code
          >, and
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >transition</code
          >
          to drive state-based animations. Use variant labels to switch between
          named states reactively.
        </p>

        <div class="rounded-xl border border-border bg-surface/30 p-5 mb-6 text-sm text-secondary">
          <strong class="text-primary">Variant labels</strong> like
          <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">'open'</code>
          and
          <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">'closed'</code>
          let you define named animation states and switch between them with simple strings.
          For orchestration, staggered children, and advanced propagation patterns, see the
          <a routerLink="/docs/variants" class="text-accent hover:underline font-medium">Variants</a>
          page.
        </div>

        <app-code-block [code]="basicStateCode" lang="typescript" filename="sidebar.component.ts" class="mb-6" />

        <!-- Live demo: toggle animation -->
        <div
          class="rounded-xl border border-border p-10 bg-surface/30 flex flex-col items-center justify-center gap-6"
        >
          <div class="flex items-center gap-4">
            <button
              (click)="toggleOpen()"
              ngmMotion
              [whileHover]="{ scale: 1.05 }"
              [whileTap]="{ scale: 0.95 }"
              [transition]="{ type: 'spring', stiffness: 400, damping: 17 }"
              class="px-5 py-2.5 rounded-lg bg-accent/10 border border-accent/20 text-accent text-sm font-medium cursor-pointer select-none"
            >
              {{ demoOpen() ? 'Close' : 'Open' }} Sidebar
            </button>
          </div>
          <div
            ngmMotion
            [animate]="demoOpen() ? 'open' : 'closed'"
            [variants]="demoVariants"
            [transition]="demoTransition"
            class="w-64 px-6 py-4 rounded-xl bg-gradient-to-br from-accent/15 to-accent-purple/15 border border-accent/20 text-sm"
          >
            <div class="font-semibold mb-1">Sidebar</div>
            <div class="text-xs text-secondary">Spring-animated open/close with variant labels.</div>
          </div>
        </div>
      </section>

      <!-- ── 4. Binding Signals ── -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.3 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Binding Angular Signals</h2>
        <p class="text-secondary mb-6">
          Since every directive input is a signal-based
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >input()</code
          >, you can drive animations directly from component signals. When the
          signal changes, the directive reactively picks it up and re-animates.
        </p>

        <app-code-block [code]="signalBindingCode" lang="typescript" filename="tabs.component.ts" class="mb-6" />

        <!-- Live demo: tabs -->
        <div
          class="rounded-xl border border-border p-10 bg-surface/30 flex flex-col items-center justify-center gap-6"
        >
          <div class="flex gap-1 rounded-lg bg-elevated/50 p-1">
            @for (tab of tabs; track tab; let i = $index) {
              <button
                (click)="activeTab.set(i)"
                ngmMotion
                [whileHover]="{ scale: 1.05 }"
                [whileTap]="{ scale: 0.95 }"
                [transition]="{ type: 'spring', stiffness: 400, damping: 20 }"
                class="px-4 py-1.5 rounded-md text-sm cursor-pointer select-none transition-colors"
                [class.bg-accent]="activeTab() === i"
                [class.text-white]="activeTab() === i"
                [class.text-secondary]="activeTab() !== i"
              >
                {{ tab }}
              </button>
            }
          </div>
          <div
            ngmMotion
            [animate]="{ x: (activeTab() - 1) * 40, opacity: 1 }"
            [transition]="{ type: 'spring', stiffness: 300, damping: 25 }"
            class="text-sm text-secondary"
          >
            Active tab index: <span class="font-mono text-accent">{{ activeTab() }}</span>
          </div>
        </div>
      </section>

      <!-- ── 5. Control Flow ── -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.4 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Control Flow</h2>
        <p class="text-secondary mb-6">
          Angular's built-in control flow —
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
          — works naturally with
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >ngmMotion</code
          >. For add/remove lists, pair
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >&#64;for</code
          >
          with
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >*ngmPresence</code
          >
          if you want the container to grow and shrink smoothly too.
        </p>

        <app-code-block [code]="controlFlowIfCode" lang="html" filename="template" class="mb-6" />

        <app-code-block [code]="controlFlowForCode" lang="html" filename="template — &#64;for loop" class="mb-6" />

        <!-- Live demo: @if toggle + @for list -->
        <div
          class="rounded-xl border border-border p-10 bg-surface/30 flex flex-col items-center"
        >
          <div class="flex gap-3 mb-6">
            <button
              (click)="showPanel.set(!showPanel())"
              ngmMotion
              [whileHover]="{ scale: 1.05 }"
              [whileTap]="{ scale: 0.95 }"
              [transition]="{ type: 'spring', stiffness: 400, damping: 17 }"
              class="px-5 py-2.5 rounded-lg bg-accent/10 border border-accent/20 text-accent text-sm font-medium cursor-pointer select-none"
            >
              {{ showPanel() ? 'Hide' : 'Show' }} Panel
            </button>
            <button
              (click)="addForItem()"
              ngmMotion
              [whileHover]="{ scale: 1.05 }"
              [whileTap]="{ scale: 0.95 }"
              [transition]="{ type: 'spring', stiffness: 400, damping: 17 }"
              class="px-5 py-2.5 rounded-lg bg-accent-purple/10 border border-accent-purple/20 text-accent-purple text-sm font-medium cursor-pointer select-none"
            >
              Add item
            </button>
          </div>

          <!-- @if demo with exit animation — collapses height + margin so siblings slide up -->
          <div
            *ngmPresence="showPanel()"
            ngmMotion
            [initial]="{ opacity: 0, height: 0, marginBottom: 0 }"
            [animate]="{ opacity: 1, height: 'auto', marginBottom: 24 }"
            [exit]="{ opacity: 0, height: 0, marginBottom: 0 }"
            [transition]="{ type: 'spring', stiffness: 300, damping: 26 }"
            class="w-72 overflow-hidden"
          >
            <div class="px-5 py-4 rounded-xl bg-gradient-to-br from-accent/10 to-accent-purple/10 border border-accent/20 text-sm">
              <div class="font-semibold mb-1 text-accent">&#64;if panel</div>
              <div class="text-xs text-secondary">This element animates in and out with spring physics.</div>
            </div>
          </div>

          <!-- @for demo -->
          <div class="w-72 flex flex-col">
            @let visibleById = forItemPresence.visibleById();
            @let gapAfter = forItemPresence.gapAfter();
            @for (item of forItems(); track item.id) {
              <div
                *ngmPresence="visibleById[item.id] ?? false"
                ngmMotion
                [initial]="{ opacity: 0, x: -16, height: 0, marginBottom: 0 }"
                [animate]="{
                  opacity: 1,
                  x: 0,
                  height: 44,
                  marginBottom: gapAfter[item.id] ? 8 : 0,
                }"
                [exit]="{ opacity: 0, x: 16, height: 0, marginBottom: 0 }"
                [transition]="{ type: 'spring', stiffness: 300, damping: 24 }"
                class="overflow-hidden"
              >
                <div
                  class="h-11 px-4 rounded-lg bg-gradient-to-r from-accent-purple/10 to-accent-pink/10 border border-accent-purple/15 text-sm flex items-center justify-between"
                >
                  <span>{{ item.label }}</span>
                  <button
                    (click)="removeForItem(item.id)"
                    class="text-xs text-muted hover:text-accent-pink transition-colors cursor-pointer"
                  >&times;</button>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- ── 6. Variant Propagation ── -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.5 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Variant Propagation</h2>
        <p class="text-secondary mb-6">
          When a parent element uses variant labels in
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >animate</code
          >, all children with matching
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >variants</code
          >
          automatically inherit the active label. Combined with staggered
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >transition</code
          >
          delays, this creates orchestrated animations with minimal code.
        </p>

        <app-code-block [code]="variantPropagationCode" lang="typescript" filename="staggered-list.component.ts" class="mb-6" />

        <!-- Live demo: staggered list -->
        <div
          class="rounded-xl border border-border p-10 bg-surface/30 flex flex-col items-center justify-center gap-6"
        >
          <button
            (click)="toggleList()"
            ngmMotion
            [whileHover]="{ scale: 1.05 }"
            [whileTap]="{ scale: 0.95 }"
            [transition]="{ type: 'spring', stiffness: 400, damping: 17 }"
            class="px-5 py-2.5 rounded-lg bg-accent-purple/10 border border-accent-purple/20 text-accent-purple text-sm font-medium cursor-pointer select-none"
          >
            {{ listVisible() ? 'Hide' : 'Show' }} List
          </button>

          <div class="flex flex-col gap-2 w-64">
            @for (item of staggerItems; track item; let i = $index) {
              <div
                ngmMotion
                [animate]="listVisible() ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }"
                [transition]="{ type: 'spring', stiffness: 300, damping: 24, delay: i * 0.06 }"
                class="px-4 py-3 rounded-lg bg-gradient-to-r from-accent-purple/10 to-accent-pink/10 border border-accent-purple/15 text-sm"
              >
                {{ item }}
              </div>
            }
          </div>
        </div>
      </section>

      <!-- ── 7. MotionValue Styles ── -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.6 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">MotionValue Styles</h2>
        <p class="text-secondary mb-6">
          Pass
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >MotionValue</code
          >
          instances through the
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >style</code
          >
          input for per-frame reactive updates that bypass Angular's change detection.
          This is ideal for scroll-linked effects, parallax, and continuous animations.
        </p>

        <app-code-block [code]="motionValueCode" lang="typescript" filename="slider-demo.component.ts" class="mb-6" />

        <!-- Live demo: MotionValue slider -->
        <div
          class="rounded-xl border border-border p-10 bg-surface/30 flex flex-col items-center justify-center gap-8"
        >
          <input
            type="range"
            min="0"
            max="200"
            value="100"
            (input)="onSliderInput($event)"
            class="w-64 accent-accent cursor-pointer"
          />
          <div class="text-xs text-muted font-mono">Drag the slider — no change detection triggered</div>
          <div
            ngmMotion
            [style]="{ x: sliderX, rotate: sliderRotate, scale: sliderScale }"
            class="w-20 h-20 rounded-xl bg-gradient-to-br from-accent to-accent-purple"
          ></div>
        </div>
      </section>

      <!-- ── 8. Outputs Reference ── -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.7 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Outputs</h2>
        <p class="text-secondary mb-6">
          The directive emits events for animation lifecycle, gesture interactions,
          and layout changes. Subscribe in the template with
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >(outputName)</code
          >.
        </p>

        <div class="rounded-xl border border-border overflow-hidden mb-6">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border bg-elevated/50">
                  <th class="text-left px-4 py-3 font-mono text-xs text-muted font-semibold">Output</th>
                  <th class="text-left px-4 py-3 font-mono text-xs text-muted font-semibold">Payload</th>
                  <th class="text-left px-4 py-3 font-mono text-xs text-muted font-semibold">Fires when</th>
                </tr>
              </thead>
              <tbody class="text-secondary">
                @for (row of outputRows; track row.name) {
                  <tr class="border-b border-border/50 last:border-b-0">
                    <td class="px-4 py-2.5 font-mono text-accent-pink text-xs">{{ row.name }}</td>
                    <td class="px-4 py-2.5 font-mono text-xs whitespace-nowrap">{{ row.payload }}</td>
                    <td class="px-4 py-2.5 text-xs">{{ row.description }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <app-code-block [code]="outputsExampleCode" lang="html" filename="template" class="mb-6" />
      </section>

      <!-- ── 9. SVG Support ── -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.8 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">SVG Support</h2>
        <p class="text-secondary mb-6">
          The
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >ngmMotion</code
          >
          directive works on SVG elements just like HTML elements. Animate SVG-specific
          attributes like
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >cx</code
          >,
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >cy</code
          >,
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >r</code
          >,
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >pathLength</code
          >,
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >fill</code
          >,
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >stroke</code
          >, and
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >opacity</code
          >
          directly.
        </p>

        <div class="rounded-xl border border-border overflow-hidden mb-6">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border bg-elevated/50">
                  <th class="text-left px-4 py-3 font-mono text-xs text-muted font-semibold">Property</th>
                  <th class="text-left px-4 py-3 font-mono text-xs text-muted font-semibold">Element(s)</th>
                  <th class="text-left px-4 py-3 font-mono text-xs text-muted font-semibold">Description</th>
                </tr>
              </thead>
              <tbody class="text-secondary">
                @for (row of svgPropertyRows; track row.name) {
                  <tr class="border-b border-border/50 last:border-b-0">
                    <td class="px-4 py-2.5 font-mono text-accent-pink text-xs">{{ row.name }}</td>
                    <td class="px-4 py-2.5 font-mono text-xs whitespace-nowrap">{{ row.elements }}</td>
                    <td class="px-4 py-2.5 text-xs">{{ row.description }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <app-code-block [code]="svgCode" lang="typescript" filename="svg-animation.component.ts" class="mb-6" />

        <!-- Live demo: SVG animation -->
        <div class="rounded-xl border border-border p-10 bg-surface/30 flex flex-col items-center justify-center gap-6">
          <svg viewBox="0 0 200 200" width="200" height="200" class="text-accent">
            <circle
              ngmMotion
              [animate]="{ r: svgExpanded() ? 80 : 40, opacity: svgExpanded() ? 0.3 : 0.8 }"
              [transition]="{ type: 'spring', stiffness: 200, damping: 15 }"
              cx="100" cy="100"
              fill="none" stroke="currentColor" stroke-width="2"
            />
            <circle
              ngmMotion
              [animate]="{ r: svgExpanded() ? 50 : 20 }"
              [transition]="{ type: 'spring', stiffness: 300, damping: 20 }"
              cx="100" cy="100"
              class="fill-accent/20"
              stroke="currentColor" stroke-width="1"
            />
          </svg>
          <button
            ngmMotion
            [whileHover]="{ scale: 1.05 }"
            [whileTap]="{ scale: 0.95 }"
            [transition]="{ type: 'spring', stiffness: 400, damping: 17 }"
            (click)="svgExpanded.set(!svgExpanded())"
            class="px-5 py-2.5 rounded-lg bg-accent/10 border border-accent/20 text-accent text-sm font-medium cursor-pointer select-none"
          >
            {{ svgExpanded() ? 'Shrink' : 'Expand' }}
          </button>
          <p class="text-xs text-muted font-mono">Spring-animated SVG circles</p>
        </div>
      </section>

      <!-- ── 10. Best Practices ── -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.9 }"
        class="pt-8 border-t border-border/50"
      >
        <h2 class="font-display font-semibold text-2xl mb-6">Best Practices</h2>

        <div class="grid grid-cols-1 gap-4">
          @for (tip of bestPractices; track tip.title) {
            <div
              ngmMotion
              [whileHover]="{ x: 4, scale: 1.01 }"
              [transition]="{ type: 'spring', stiffness: 300, damping: 20 }"
              class="p-5 rounded-xl border border-border bg-surface/30"
            >
              <h4 class="font-display font-semibold mb-1.5">{{ tip.title }}</h4>
              <p class="text-sm text-secondary leading-relaxed">{{ tip.body }}</p>
            </div>
          }
        </div>

        <!-- Next page links -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12">
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
export class MotionDirectivePage {
  private readonly pendingTimers: ReturnType<typeof setTimeout>[] = [];
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.destroyRef.onDestroy(() => this.pendingTimers.forEach(clearTimeout));
  }

  // ── Interactive demo state ──
  readonly demoOpen = signal(true);
  readonly activeTab = signal(0);
  readonly listVisible = signal(true);
  readonly showPanel = signal(true);
  readonly svgExpanded = signal(false);
  private forItemCounter = 3;
  private readonly removingForIds = signal(new Set<number>());
  readonly forItems = signal([
    { id: 1, label: 'Item 1' },
    { id: 2, label: 'Item 2' },
    { id: 3, label: 'Item 3' },
  ]);
  readonly forItemPresence = usePresenceList(this.forItems, {
    getId: (item) => item.id,
    exitingIds: this.removingForIds,
  });
  readonly tabs = ['Home', 'Profile', 'Settings'];
  readonly staggerItems = [
    'Declarative animations',
    'Spring physics',
    'Gesture handling',
    'Layout transitions',
    'Exit animations',
  ];

  // ── MotionValue demo ──
  readonly sliderValue = useMotionValue(100);
  readonly sliderX = useTransform(this.sliderValue, [0, 200], [-80, 80]);
  readonly sliderRotate = useTransform(this.sliderValue, [0, 200], [-45, 45]);
  readonly sliderScale = useTransform(this.sliderValue, [0, 100, 200], [0.6, 1, 0.6]);

  // ── Demo animation configs ──
  readonly demoVariants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0.4, x: -16 },
  };
  readonly demoTransition = { type: 'spring' as const, stiffness: 260, damping: 24 };

  readonly containerVariants = {
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
    hidden: { transition: { staggerChildren: 0.05 } },
  };

  readonly staggerChildVariants = {
    visible: { opacity: 1, y: 0 },
    hidden: { opacity: 0, y: 12 },
  };

  // ── Core Inputs reference ──
  readonly coreInputRows = [
    { name: 'initial', type: 'TargetAndTransition | VariantLabels | boolean', description: 'Starting state before the first animation. Set to false to disable mount animation.' },
    { name: 'animate', type: 'TargetAndTransition | VariantLabels | boolean', description: 'Target state after mount or when state changes. Accepts objects or variant label strings.' },
    { name: 'transition', type: 'Transition', description: 'Timing, easing, spring config, repeat, and per-property overrides.' },
    { name: 'variants', type: 'Variants', description: 'Named animation states keyed by label. Referenced by animate, whileHover, etc.' },
    { name: 'style', type: 'MotionStyle', description: 'Inline style object. Accepts MotionValues for per-frame reactive updates.' },
    { name: 'exit', type: 'TargetAndTransition | VariantLabels', description: 'Exit state used with *ngmPresence for leave animations.' },
    { name: 'whileHover', type: 'TargetAndTransition | VariantLabels', description: 'State to animate to while the element is hovered.' },
    { name: 'whileTap', type: 'TargetAndTransition | VariantLabels', description: 'State to animate to while the element is pressed.' },
    { name: 'whileFocus', type: 'TargetAndTransition | VariantLabels', description: 'State to animate to while the element is focused.' },
    { name: 'whileInView', type: 'TargetAndTransition | VariantLabels', description: 'State to animate to while the element is in the viewport.' },
    { name: 'whileDrag', type: 'TargetAndTransition | VariantLabels', description: 'State to animate to while the element is being dragged.' },
    { name: 'drag', type: 'boolean | "x" | "y"', description: 'Enable drag. Optionally constrain to a single axis.' },
    { name: 'layout', type: 'boolean | "position" | "size" | "preserve-aspect"', description: 'Enable automatic FLIP layout animations.' },
    { name: 'layoutId', type: 'string', description: 'Shared layout identifier for cross-component layout animations.' },
    { name: 'layoutDependency', type: 'unknown', description: 'Value that triggers layout re-measurement when it changes.' },
  ];

  // ── Outputs reference ──
  readonly outputRows = [
    { name: 'animationStart', payload: 'AnimationDefinition', description: 'An animation begins playing' },
    { name: 'animationComplete', payload: 'AnimationDefinition', description: 'An animation finishes' },
    { name: 'update', payload: 'ResolvedValues', description: 'Every animation frame with latest values' },
    { name: 'hoverStart', payload: 'void', description: 'Pointer enters the element' },
    { name: 'hoverEnd', payload: 'void', description: 'Pointer leaves the element' },
    { name: 'tap', payload: 'void', description: 'A tap/click completes on the element' },
    { name: 'tapStart', payload: 'void', description: 'A press begins on the element' },
    { name: 'tapCancel', payload: 'void', description: 'A press is cancelled (pointer leaves)' },
    { name: 'viewportEnter', payload: 'void', description: 'Element enters the viewport' },
    { name: 'viewportLeave', payload: 'void', description: 'Element leaves the viewport' },
    { name: 'dragStart', payload: 'void', description: 'A drag gesture begins' },
    { name: 'dragMove', payload: 'void', description: 'The element moves during drag' },
    { name: 'dragEnd', payload: 'void', description: 'A drag gesture ends' },
    { name: 'directionLock', payload: 'void', description: 'Drag direction is locked to an axis' },
    { name: 'layoutAnimationStart', payload: 'void', description: 'A layout animation begins' },
    { name: 'layoutAnimationComplete', payload: 'void', description: 'A layout animation finishes' },
  ];

  // ── SVG Properties reference ──
  readonly svgPropertyRows = [
    { name: 'cx, cy', elements: 'circle, ellipse', description: 'Center coordinates' },
    { name: 'r', elements: 'circle', description: 'Radius' },
    { name: 'rx, ry', elements: 'ellipse, rect', description: 'Horizontal/vertical radii' },
    { name: 'pathLength', elements: 'path, circle, rect, line, polygon, polyline', description: 'Normalized path length for dash animations' },
    { name: 'fill', elements: 'all', description: 'Fill color' },
    { name: 'stroke', elements: 'all', description: 'Stroke color' },
    { name: 'strokeWidth', elements: 'all', description: 'Stroke width' },
    { name: 'opacity', elements: 'all', description: 'Element opacity' },
  ];

  // ── Code examples ──
  readonly basicStateCode = [
    "import { Component, signal } from '@angular/core';",
    "import { NgmMotionDirective } from '@scripttype/ng-motion';",
    "import type { Variants, Transition } from '@scripttype/ng-motion';",
    '',
    '@Component({',
    '  imports: [NgmMotionDirective],',
    '  template: `',
    '    <aside ngmMotion',
    '      [initial]="{ opacity: 0, x: -24 }"',
    '      [animate]="open() ? \'open\' : \'closed\'"',
    '      [variants]="variants"',
    '      [transition]="transition"',
    '    >Sidebar content</aside>',
    '  `,',
    '})',
    'export class SidebarComponent {',
    '  readonly open = signal(false);',
    '',
    '  readonly variants: Variants = {',
    '    open:   { opacity: 1, x: 0 },',
    '    closed: { opacity: 0.4, x: -16 },',
    '  };',
    '',
    '  readonly transition: Transition = {',
    "    type: 'spring',",
    '    stiffness: 260,',
    '    damping: 24,',
    '  };',
    '}',
  ].join('\n');

  readonly signalBindingCode = [
    "import { Component, signal } from '@angular/core';",
    "import { NgmMotionDirective } from '@scripttype/ng-motion';",
    '',
    '@Component({',
    '  imports: [NgmMotionDirective],',
    '  template: `',
    '    @for (tab of tabs; track tab; let i = $index) {',
    '      <button (click)="activeTab.set(i)">{{ tab }}</button>',
    '    }',
    '',
    '    <div ngmMotion',
    '      [animate]="{ x: activeTab() * 200 }"',
    '      [transition]="{ type: \'spring\', stiffness: 300, damping: 25 }"',
    '    >',
    '      Active indicator',
    '    </div>',
    '  `,',
    '})',
    'export class TabsComponent {',
    "  readonly tabs = ['Home', 'Profile', 'Settings'];",
    '  readonly activeTab = signal(0);',
    '}',
  ].join('\n');

  readonly controlFlowIfCode = [
    '<!-- *ngmPresence delays removal until exit animation completes -->',
    '<div',
    '  *ngmPresence="showPanel()"',
    '  ngmMotion',
    '  [initial]="{ opacity: 0, height: 0, marginBottom: 0 }"',
    '  [animate]="{ opacity: 1, height: \'auto\', marginBottom: 24 }"',
    '  [exit]="{ opacity: 0, height: 0, marginBottom: 0 }"',
    '  [transition]="{ type: \'spring\', stiffness: 300, damping: 26 }"',
    '  class="overflow-hidden"',
    '>',
    '  <div class="panel-content">Panel content</div>',
    '</div>',
  ].join('\n');

  readonly controlFlowForCode = [
    '<!-- @for + *ngmPresence — rows grow and shrink in flow -->',
    '@let visibleById = forItemPresence.visibleById();',
    '<!-- gapAfter comes from usePresenceList(...) -->',
    '@let gapAfter = forItemPresence.gapAfter();',
    '@for (item of items(); track item.id) {',
    '  <div *ngmPresence="visibleById[item.id] ?? false" ngmMotion',
    '    [initial]="{ opacity: 0, x: -16, height: 0, marginBottom: 0 }"',
    '    [animate]="{ opacity: 1, x: 0, height: 44, marginBottom: gapAfter[item.id] ? 8 : 0 }"',
    '    [exit]="{ opacity: 0, x: 16, height: 0, marginBottom: 0 }"',
    '    [transition]="{ type: \'spring\', stiffness: 300, damping: 24 }"',
    '    class="overflow-hidden"',
    '  >',
    '    <div class="h-11 flex items-center">',
    '      {{ item.label }}',
    '    </div>',
    '  </div>',
    '}',
    '',
    'readonly forItemPresence = usePresenceList(this.items, {',
    '  getId: (item) => item.id,',
    '  exitingIds: this.removingIds,',
    '});',
  ].join('\n');

  readonly variantPropagationCode = [
    "import { Component, signal } from '@angular/core';",
    "import { NgmMotionDirective } from '@scripttype/ng-motion';",
    '',
    '@Component({',
    '  imports: [NgmMotionDirective],',
    '  template: `',
    '    <button (click)="visible.set(!visible())">Toggle</button>',
    '',
    '    @for (item of items; track item; let i = $index) {',
    '      <div ngmMotion',
    '        [animate]="visible()',
    '          ? { opacity: 1, y: 0 }',
    '          : { opacity: 0, y: 12 }"',
    '        [transition]="{',
    "          type: 'spring',",
    '          stiffness: 300,',
    '          damping: 24,',
    '          delay: i * 0.06',
    '        }"',
    '      >',
    '        {{ item }}',
    '      </div>',
    '    }',
    '  `,',
    '})',
    'export class StaggeredListComponent {',
    '  readonly visible = signal(true);',
    "  readonly items = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'];",
    '}',
  ].join('\n');

  readonly motionValueCode = [
    "import { Component } from '@angular/core';",
    "import { NgmMotionDirective, useMotionValue, useTransform } from '@scripttype/ng-motion';",
    '',
    '@Component({',
    '  imports: [NgmMotionDirective],',
    '  template: `',
    '    <input type="range" min="0" max="200" value="100"',
    '      (input)="onSliderInput($event)" />',
    '',
    '    <div ngmMotion',
    '      [style]="{ x: sliderX, rotate: sliderRotate, scale: sliderScale }"',
    '    />',
    '  `,',
    '})',
    'export class SliderDemoComponent {',
    '  readonly sliderValue = useMotionValue(100);',
    '  readonly sliderX = useTransform(this.sliderValue, [0, 200], [-80, 80]);',
    '  readonly sliderRotate = useTransform(this.sliderValue, [0, 200], [-45, 45]);',
    '  readonly sliderScale = useTransform(this.sliderValue, [0, 100, 200], [0.6, 1, 0.6]);',
    '',
    '  onSliderInput(event: Event) {',
    '    this.sliderValue.set(+(event.target as HTMLInputElement).value);',
    '  }',
    '}',
  ].join('\n');

  readonly outputsExampleCode = [
    '<div ngmMotion',
    '  [animate]="{ opacity: 1 }"',
    '  (animationStart)="onStart($event)"',
    '  (animationComplete)="onComplete($event)"',
    '  (hoverStart)="onHoverStart()"',
    '  (tap)="onTap()"',
    '  (viewportEnter)="trackImpression()"',
    '>',
    '  Interactive element',
    '</div>',
  ].join('\n');

  readonly svgCode = [
    "import { Component, signal } from '@angular/core';",
    "import { NgmMotionDirective } from '@scripttype/ng-motion';",
    '',
    '@Component({',
    '  imports: [NgmMotionDirective],',
    '  template: `',
    '    <svg viewBox="0 0 200 200" width="200" height="200">',
    '      <!-- Animated circle -->',
    '      <circle',
    '        ngmMotion',
    '        [initial]="{ r: 0, opacity: 0 }"',
    '        [animate]="{ r: 80, opacity: 1 }"',
    '        [transition]="{ type: \'spring\', stiffness: 200, damping: 15 }"',
    '        cx="100" cy="100"',
    '        fill="none" stroke="currentColor" stroke-width="2"',
    '      />',
    '',
    '      <!-- Path drawing via pathLength -->',
    '      <path',
    '        ngmMotion',
    '        [initial]="{ pathLength: 0 }"',
    '        [animate]="{ pathLength: 1 }"',
    '        [transition]="{ duration: 1.5, ease: \'easeInOut\' }"',
    '        d="M 20 100 Q 100 20, 180 100"',
    '        fill="none" stroke="currentColor" stroke-width="2"',
    '        pathLength="1"',
    '        stroke-dasharray="1"',
    '        stroke-dashoffset="0"',
    '      />',
    '    </svg>',
    '  `,',
    '})',
    'export class SvgAnimationComponent {}',
  ].join('\n');

  // ── Best Practices ──
  readonly bestPractices = [
    {
      title: 'Use variant labels for multi-state components',
      body: 'Instead of recalculating target objects on every render, define variants once and switch between them with string labels. This keeps templates clean and makes animations easy to orchestrate across parent-child trees.',
    },
    {
      title: 'Prefer springs over duration-based transitions',
      body: 'Springs respond naturally to interrupted animations — if a user toggles state mid-animation, the spring adjusts velocity automatically. Use stiffness and damping to fine-tune the feel.',
    },
    {
      title: 'Use MotionValues for high-frequency updates',
      body: 'For scroll-linked effects, cursor tracking, or continuous animations, pass MotionValues through the style input. These update the DOM directly without triggering Angular change detection.',
    },
    {
      title: 'Set initial to false to skip mount animations',
      body: 'When an element should render in its final state immediately (e.g., above-the-fold content), set [initial]="false" to prevent the enter animation from playing.',
    },
    {
      title: 'Keep transition configs in component properties',
      body: 'Define transition objects as readonly class properties rather than inline in the template. This avoids re-creating object literals on every change detection cycle.',
    },
  ];

  // ── Next page links ──
  readonly nextLinks = [
    {
      path: '/docs/transitions',
      title: 'Transitions',
      description: 'Springs, tweens, keyframes, and per-property overrides',
    },
    {
      path: '/docs/variants',
      title: 'Variants',
      description: 'Named states, orchestration, and propagation',
    },
    {
      path: '/docs/gestures',
      title: 'Gestures',
      description: 'Hover, tap, drag, and focus interactions',
    },
    {
      path: '/docs/presence',
      title: 'Presence & Exit',
      description: 'Animate elements entering and leaving the DOM',
    },
  ];

  toggleOpen(): void {
    this.demoOpen.update((v) => !v);
  }

  toggleList(): void {
    this.listVisible.update((v) => !v);
  }

  addForItem(): void {
    this.forItemCounter++;
    this.forItems.update((items) => [...items, { id: this.forItemCounter, label: `Item ${this.forItemCounter}` }]);
  }

  removeForItem(id: number): void {
    if (this.removingForIds().has(id)) {
      return;
    }

    this.removingForIds.update((ids) => {
      const next = new Set(ids);
      next.add(id);
      return next;
    });

    this.pendingTimers.push(setTimeout(() => {
      this.forItems.update((items) => items.filter((item) => item.id !== id));
      this.removingForIds.update((ids) => {
        const next = new Set(ids);
        next.delete(id);
        return next;
      });
    }, 450));
  }

  onSliderInput(event: Event): void {
    const value = +(event.target as HTMLInputElement).value;
    this.sliderValue.set(value);
  }
}
