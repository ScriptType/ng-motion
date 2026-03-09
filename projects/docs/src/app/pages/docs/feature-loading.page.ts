import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgmMotionDirective } from 'ng-motion';
import { CodeBlockComponent } from '../../components/code-block.component';

@Component({
  selector: 'app-feature-loading',
  imports: [RouterLink, NgmMotionDirective, CodeBlockComponent],
  template: `
    <article class="max-w-3xl pb-16">
      <!-- Header -->
      <div
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
      >
        <h1 class="font-display font-bold text-4xl mb-4">Feature Loading</h1>
        <p class="text-lg text-secondary mb-12 leading-relaxed">
          ng-motion initializes its animation engine automatically by default.
          For applications that need finer control over bundle size or load
          timing, you can configure exactly which features are loaded &mdash;
          and when.
        </p>
      </div>

      <!-- ═══════════════ Default Behavior ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.1 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Default behavior
        </h2>
        <p class="text-secondary mb-6">
          Out of the box, ng-motion auto-initializes all features the
          first time a
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >ngmMotion</code
          >
          directive is created. This includes the animation engine, all gesture
          handlers (hover, tap, focus, in-view, pan), drag, exit animations,
          and layout projection. You don&rsquo;t need any additional setup to
          get started.
        </p>

        <div
          class="rounded-xl border border-border bg-surface/30 p-6 space-y-4"
        >
          <div class="flex items-start gap-3">
            <div
              class="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 mt-2"
            ></div>
            <p class="text-secondary">
              <strong class="text-primary">Zero config:</strong> Import
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >NgmMotionDirective</code
              >, add
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >ngmMotion</code
              >
              to your template, and animations work immediately.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <div
              class="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 mt-2"
            ></div>
            <p class="text-secondary">
              <strong class="text-primary">Lazy by nature:</strong> Features are
              registered on first use, not at application bootstrap. If no
              component uses ng-motion, nothing is initialized.
            </p>
          </div>
        </div>
      </section>

      <!-- ═══════════════ provideMotionFeatures ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.2 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          provideMotionFeatures
        </h2>
        <p class="text-secondary mb-6">
          For explicit control, use
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >provideMotionFeatures()</code
          >
          in your application config. This registers a specific feature bundle
          via Angular DI at bootstrap time, ensuring features are ready before
          any component renders.
        </p>

        <app-code-block [code]="provideCode" lang="typescript" filename="app.config.ts" class="mb-6" />

        <p class="text-secondary">
          This is the recommended approach for production applications. It makes
          the feature set explicit and guarantees initialization order via
          Angular&rsquo;s
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >APP_INITIALIZER</code
          >.
        </p>
      </section>

      <!-- ═══════════════ Feature Bundles ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.3 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Feature bundles
        </h2>
        <p class="text-secondary mb-6">
          ng-motion ships two pre-built bundles. Choose the one that matches
          your application&rsquo;s needs.
        </p>

        <div class="rounded-xl border border-border overflow-hidden mb-6">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border bg-elevated/50">
                <th class="text-left px-4 py-2.5 font-mono text-xs text-muted">
                  Bundle
                </th>
                <th class="text-left px-4 py-2.5 font-mono text-xs text-muted">
                  Includes
                </th>
                <th class="text-left px-4 py-2.5 font-mono text-xs text-muted">
                  Use when
                </th>
              </tr>
            </thead>
            <tbody class="bg-code-bg">
              @for (row of bundleRows; track row.name) {
                <tr class="border-b border-border/50 last:border-0">
                  <td class="px-4 py-2.5">
                    <code
                      class="text-accent-pink font-mono text-xs px-1.5 py-0.5 rounded bg-accent-pink/10"
                      >{{ row.name }}</code
                    >
                  </td>
                  <td class="px-4 py-2.5 text-secondary">
                    {{ row.includes }}
                  </td>
                  <td class="px-4 py-2.5 text-secondary">
                    {{ row.useWhen }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <app-code-block [code]="allFeaturesCode" lang="typescript" filename="app.config.ts" />
      </section>

      <!-- ═══════════════ Lazy Loading ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.4 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Lazy loading features
        </h2>
        <p class="text-secondary mb-6">
          For the smallest possible initial bundle,
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >provideMotionFeatures()</code
          >
          also accepts an async loader function. This is ng-motion&rsquo;s
          equivalent of Framer Motion&rsquo;s
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >LazyMotion</code
          >
          &mdash; features are dynamically imported and registered before the
          app finishes bootstrapping.
        </p>

        <app-code-block [code]="lazyLoadCode" lang="typescript" filename="app.config.ts" class="mb-6" />

        <div
          class="rounded-xl border border-border bg-surface/30 p-6 space-y-4"
        >
          <div class="flex items-start gap-3">
            <div
              class="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2"
            ></div>
            <p class="text-secondary">
              The async function runs inside Angular&rsquo;s
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >APP_INITIALIZER</code
              >, so the application waits for features to resolve before
              rendering.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <div
              class="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2"
            ></div>
            <p class="text-secondary">
              Features are merged into the existing registry, so you can combine
              lazy loading with pre-registered features.
            </p>
          </div>
        </div>
      </section>

      <!-- ═══════════════ Manual Initialization ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.5 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Manual initialization
        </h2>
        <p class="text-secondary mb-6">
          Two lower-level functions give you direct control over the feature
          registry, useful for advanced scenarios like micro-frontends or
          testing.
        </p>

        <div class="rounded-xl border border-border overflow-hidden mb-6">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border bg-elevated/50">
                <th class="text-left px-4 py-2.5 font-mono text-xs text-muted">
                  Function
                </th>
                <th class="text-left px-4 py-2.5 font-mono text-xs text-muted">
                  Description
                </th>
              </tr>
            </thead>
            <tbody class="bg-code-bg">
              @for (row of manualFns; track row.name) {
                <tr class="border-b border-border/50 last:border-0">
                  <td class="px-4 py-2.5">
                    <code
                      class="text-accent-pink font-mono text-xs px-1.5 py-0.5 rounded bg-accent-pink/10"
                      >{{ row.name }}</code
                    >
                  </td>
                  <td class="px-4 py-2.5 text-secondary">{{ row.desc }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <app-code-block [code]="manualInitCode" lang="typescript" filename="component.ts" />
      </section>

      <!-- ═══════════════ What happens without features ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.55 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Auto-initialization fallback
        </h2>
        <p class="text-secondary mb-6">
          Even when you use
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >provideMotionFeatures()</code
          >
          to register a subset of features, ng-motion&rsquo;s auto-initialization
          still runs the first time a
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >ngmMotion</code
          >
          directive creates a visual element. The auto-initializer
          (<code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >initNgmFeatures()</code
          >) is idempotent &mdash; it only runs once. This means:
        </p>

        <div
          class="rounded-xl border border-border bg-surface/30 p-6 space-y-4 mb-6"
        >
          <div class="flex items-start gap-3">
            <div
              class="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 mt-2"
            ></div>
            <p class="text-secondary">
              <strong class="text-primary">If you call provideMotionFeatures() first:</strong>
              The APP_INITIALIZER sets your chosen features via
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >setFeatureDefinitions()</code
              >.
              Then when the first directive creates a visual element,
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >initNgmFeatures()</code
              >
              runs and registers all default features (including drag, layout, all
              gestures, and exit animations).
            </p>
          </div>
          <div class="flex items-start gap-3">
            <div
              class="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 mt-2"
            ></div>
            <p class="text-secondary">
              <strong class="text-primary">In practice, nothing silently breaks.</strong>
              Since the auto-initializer always registers the full feature set,
              using a gesture or drag feature without explicitly loading it will
              still work. The primary benefit of
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >provideMotionFeatures()</code
              >
              is controlling initialization timing (via APP_INITIALIZER) and
              enabling code-splitting with async loaders.
            </p>
          </div>
        </div>

        <div
          class="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4"
        >
          <p class="text-secondary text-sm">
            <strong class="text-primary">Note:</strong>
            All ng-motion APIs are imported from the root
            <code
              class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
              >'ng-motion'</code
            >
            package path. There are no sub-path imports (e.g.,
            <code
              class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
              >'ng-motion/gestures'</code
            >
            does not exist). Features, directives, hooks, and utilities are all
            available from
            <code
              class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
              >import &lcub; ... &rcub; from 'ng-motion'</code
            >.
          </p>
        </div>
      </section>

      <!-- ═══════════════ When to Use ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.65 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          When to use explicit feature loading
        </h2>
        <p class="text-secondary mb-6">
          Most applications work perfectly with the default auto-initialization.
          Consider explicit feature loading when:
        </p>

        <div
          class="rounded-xl border border-border bg-surface/30 p-6 space-y-4"
        >
          <div class="flex items-start gap-3">
            <div
              class="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2"
            ></div>
            <p class="text-secondary">
              <strong class="text-primary">Bundle size is critical.</strong>
              Lazy-load feature bundles so the animation engine code is split
              into a separate chunk and only fetched when needed.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <div
              class="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2"
            ></div>
            <p class="text-secondary">
              <strong class="text-primary">You need drag or layout with explicit loading.</strong>
              The
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >ngmAnimationFeatures</code
              >
              bundle does not include drag or layout projection. Use
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >ngmAllFeatures</code
              >
              or add them manually with
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >loadNgmFeatures()</code
              >.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <div
              class="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2"
            ></div>
            <p class="text-secondary">
              <strong class="text-primary"
                >You&rsquo;re building a micro-frontend.</strong
              >
              Multiple apps on the same page can register features independently
              using
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >initNgmFeatures()</code
              >
              without conflicting with each other.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <div
              class="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2"
            ></div>
            <p class="text-secondary">
              <strong class="text-primary">Testing specific features.</strong>
              In unit tests you can call
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >loadNgmFeatures()</code
              >
              with only the features under test, keeping test setup minimal and
              fast.
            </p>
          </div>
        </div>
      </section>

      <!-- ═══════════════ Next Steps ═══════════════ -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.75 }"
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
export class FeatureLoadingPage {
  // ── Feature bundle table ───────────────────────────────────────

  readonly bundleRows = [
    {
      name: 'ngmAnimationFeatures',
      includes: 'Animation engine, hover, tap, focus, in-view, pan, exit',
      useWhen: 'Most apps — covers all standard animations and gestures',
    },
    {
      name: 'ngmAllFeatures',
      includes: 'Everything in animation + drag + layout projection',
      useWhen: 'Apps using drag-and-drop or layout animations',
    },
  ];

  // ── Manual functions table ─────────────────────────────────────

  readonly manualFns = [
    {
      name: 'initNgmFeatures()',
      desc: 'Registers the default feature set imperatively. Call once at startup. Equivalent to what auto-initialization does internally.',
    },
    {
      name: 'loadNgmFeatures(features)',
      desc: 'Merges a custom FeatureDefinitions object into the registry. Useful for adding individual features or overriding defaults.',
    },
  ];

  // ── Code snippets ──────────────────────────────────────────────

  readonly provideCode = [
    "import { type ApplicationConfig } from '@angular/core';",
    "import { provideMotionFeatures, ngmAnimationFeatures } from 'ng-motion';",
    '',
    'export const appConfig: ApplicationConfig = {',
    '  providers: [',
    '    provideMotionFeatures(ngmAnimationFeatures),',
    '  ],',
    '};',
  ].join('\n');

  readonly allFeaturesCode = [
    '// Include drag and layout projection',
    "import { provideMotionFeatures, ngmAllFeatures } from 'ng-motion';",
    '',
    'export const appConfig: ApplicationConfig = {',
    '  providers: [',
    '    provideMotionFeatures(ngmAllFeatures),',
    '  ],',
    '};',
  ].join('\n');

  readonly lazyLoadCode = [
    "import { provideMotionFeatures } from 'ng-motion';",
    '',
    'export const appConfig: ApplicationConfig = {',
    '  providers: [',
    '    // Async loader — features are code-split into a separate chunk',
    '    provideMotionFeatures(',
    "      () => import('ng-motion').then(m => m.ngmAllFeatures)",
    '    ),',
    '  ],',
    '};',
  ].join('\n');

  readonly manualInitCode = [
    "import { initNgmFeatures, loadNgmFeatures } from 'ng-motion';",
    '',
    '// Option 1: Register all defaults imperatively',
    'initNgmFeatures();',
    '',
    '// Option 2: Load specific features on demand',
    "import { ngmAllFeatures } from 'ng-motion';",
    'loadNgmFeatures(ngmAllFeatures);',
  ].join('\n');

  // ── Next steps ─────────────────────────────────────────────────

  readonly nextLinks = [
    {
      path: '/docs/performance',
      title: 'Performance \u2192',
      description: 'MotionValues, will-change, and reduced motion',
    },
    {
      path: '/docs/motion-directive',
      title: 'Motion Directive \u2192',
      description: 'Full API reference for all inputs and outputs',
    },
    {
      path: '/docs/getting-started',
      title: 'Getting Started \u2192',
      description: 'Quick introduction to ng-motion',
    },
    {
      path: '/docs/transitions',
      title: 'Transitions \u2192',
      description: 'Spring, tween, and inertia configuration',
    },
  ];
}
