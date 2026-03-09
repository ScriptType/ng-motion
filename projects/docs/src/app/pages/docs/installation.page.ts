import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgmMotionDirective } from 'ng-motion';
import { CodeBlockComponent } from '../../components/code-block.component';
import { DemoReplayComponent } from '../../components/demo-replay.component';

@Component({
  selector: 'app-installation',
  imports: [RouterLink, NgmMotionDirective, CodeBlockComponent, DemoReplayComponent],
  template: `
    <article class="max-w-3xl pb-16">
      <!-- Header -->
      <div
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
      >
        <h1 class="font-display font-bold text-4xl mb-4">Installation</h1>
        <p class="text-lg text-secondary mb-12 leading-relaxed">
          Get ng-motion up and running in your Angular project. One install, zero
          configuration required.
        </p>
      </div>

      <!-- Requirements -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.1 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Requirements</h2>
        <div
          class="rounded-xl border border-border bg-surface/30 p-6 space-y-3"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-2 h-2 rounded-full bg-accent flex-shrink-0"
            ></div>
            <p class="text-secondary">
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >Angular 21+</code
              >
              with standalone components and directives
            </p>
          </div>
          <div class="flex items-center gap-3">
            <div
              class="w-2 h-2 rounded-full bg-accent flex-shrink-0"
            ></div>
            <p class="text-secondary">
              Browser rendering (SSR hydration support coming soon)
            </p>
          </div>
          <div class="flex items-center gap-3">
            <div
              class="w-2 h-2 rounded-full bg-accent flex-shrink-0"
            ></div>
            <p class="text-secondary">
              TypeScript 5.4+ (strict mode recommended)
            </p>
          </div>
        </div>
      </section>

      <!-- Install -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.2 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Install the package
        </h2>
        <p class="text-secondary mb-6">
          Pick your preferred package manager. The peer dependencies
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >motion-dom</code
          >
          and
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >motion-utils</code
          >
          must be installed alongside ng-motion.
        </p>

        <!-- npm -->
        <app-code-block [code]="installNpm" lang="bash" filename="npm" class="mb-4" />

        <!-- bun -->
        <app-code-block [code]="installBun" lang="bash" filename="bun" class="mb-4" />

        <!-- pnpm -->
        <app-code-block [code]="installPnpm" lang="bash" filename="pnpm" class="mb-4" />

        <!-- yarn -->
        <app-code-block [code]="installYarn" lang="bash" filename="yarn" class="mb-6" />
      </section>

      <!-- Peer dependencies -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.3 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Peer dependencies
        </h2>
        <p class="text-secondary mb-6">
          ng-motion delegates all animation math and engine work to
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >motion-dom</code
          >
          and
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >motion-utils</code
          >
          from the Framer Motion ecosystem. These are framework-agnostic
          packages with zero React dependencies.
        </p>

        <div
          class="rounded-xl border border-border bg-surface/30 overflow-hidden"
        >
          <div class="grid grid-cols-3 border-b border-border px-5 py-3">
            <span class="text-xs text-muted font-mono uppercase tracking-wider"
              >Package</span
            >
            <span class="text-xs text-muted font-mono uppercase tracking-wider"
              >Version</span
            >
            <span class="text-xs text-muted font-mono uppercase tracking-wider"
              >Provides</span
            >
          </div>
          <div
            class="grid grid-cols-3 border-b border-border/50 px-5 py-3.5 items-center"
          >
            <code class="text-sm font-mono text-accent">motion-dom</code>
            <span class="text-sm text-secondary">^12.34.5</span>
            <span class="text-sm text-secondary"
              >WAAPI engine, springs, gestures</span
            >
          </div>
          <div class="grid grid-cols-3 px-5 py-3.5 items-center">
            <code class="text-sm font-mono text-accent">motion-utils</code>
            <span class="text-sm text-secondary">^12.29.2</span>
            <span class="text-sm text-secondary"
              >Easing functions, math utilities</span
            >
          </div>
        </div>
      </section>

      <!-- Global config -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.4 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Optional global configuration
        </h2>
        <p class="text-secondary mb-6">
          Use
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >provideMotionConfig()</code
          >
          to define app-wide motion defaults. Every
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >ngmMotion</code
          >
          directive will inherit these settings unless overridden locally.
        </p>

        <app-code-block [code]="globalConfigCode" lang="typescript" filename="app.config.ts" class="mb-6" />
      </section>

      <!-- Reduced motion -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.5 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Reduced motion
        </h2>
        <p class="text-secondary mb-6">
          ng-motion respects the user's operating system preference for reduced
          motion. You can control this behavior through the
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >reducedMotion</code
          >
          config option:
        </p>

        <div
          class="rounded-xl border border-border bg-surface/30 p-6 space-y-4"
        >
          <div class="flex items-start gap-3">
            <code
              class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10 flex-shrink-0 mt-0.5"
              >'user'</code
            >
            <p class="text-secondary text-sm">
              <strong class="text-primary">Default.</strong> Respects the
              <code
                class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
                >prefers-reduced-motion</code
              >
              media query. Animations are replaced with instant transitions when
              the user has opted into reduced motion.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <code
              class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10 flex-shrink-0 mt-0.5"
              >'always'</code
            >
            <p class="text-secondary text-sm">
              All animations are disabled regardless of the user's preference.
              Useful for testing or performance-sensitive views.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <code
              class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10 flex-shrink-0 mt-0.5"
              >'never'</code
            >
            <p class="text-secondary text-sm">
              Animations always play, even if the user prefers reduced motion.
              Use with care.
            </p>
          </div>
        </div>
      </section>

      <!-- Verify installation -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.6 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">
          Verify it works
        </h2>
        <p class="text-secondary mb-6">
          Add a simple fade-in to any component to confirm everything is wired
          up:
        </p>

        <app-code-block [code]="verifyCode" lang="typescript" filename="app.component.ts" class="mb-6" />

        <!-- Live demo -->
        <app-demo-replay>
          <ng-template>
            <div
              class="rounded-xl border border-border p-10 bg-surface/30 flex items-center justify-center"
            >
              <div
                ngmMotion
                [initial]="{ opacity: 0, scale: 0.8, y: 20 }"
                [whileInView]="{ opacity: 1, scale: 1, y: 0 }"
                [viewport]="{ once: true }"
                [transition]="{ type: 'spring', stiffness: 200, damping: 20 }"
                class="px-8 py-4 rounded-xl bg-gradient-to-br from-accent/15 to-accent-purple/15 border border-accent/20 text-lg"
              >
                Installation complete!
              </div>
            </div>
          </ng-template>
        </app-demo-replay>
      </section>

      <!-- Next steps -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.7 }"
        class="pt-8 border-t border-border/50"
      >
        <h2 class="font-display font-semibold text-2xl mb-6">Next steps</h2>
        <p class="text-secondary mb-6">
          Now that ng-motion is installed, head to
          <a routerLink="/docs/getting-started" class="text-accent hover:underline font-medium">Getting Started</a>
          to build your first animation with springs, gestures, and more.
        </p>
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
export class InstallationPage {
  readonly installNpm = 'npm install ng-motion motion-dom motion-utils';

  readonly installBun = 'bun add ng-motion motion-dom motion-utils';

  readonly installPnpm = 'pnpm add ng-motion motion-dom motion-utils';

  readonly installYarn = 'yarn add ng-motion motion-dom motion-utils';

  readonly globalConfigCode = [
    "import { type ApplicationConfig } from '@angular/core';",
    "import { provideMotionConfig, type MotionConfig } from 'ng-motion';",
    '',
    'const motionConfig: MotionConfig = {',
    '  transition: { duration: 0.4 },',
    "  reducedMotion: 'user',",
    '};',
    '',
    'export const appConfig: ApplicationConfig = {',
    '  providers: [provideMotionConfig(motionConfig)],',
    '};',
  ].join('\n');

  readonly verifyCode = [
    "import { Component } from '@angular/core';",
    "import { NgmMotionDirective } from 'ng-motion';",
    '',
    '@Component({',
    "  selector: 'app-root',",
    '  imports: [NgmMotionDirective],',
    '  template: `',
    '    <div',
    '      ngmMotion',
    '      [initial]="{ opacity: 0, scale: 0.8 }"',
    '      [animate]="{ opacity: 1, scale: 1 }"',
    '      [transition]="{',
    "        type: 'spring',",
    '        stiffness: 200,',
    '        damping: 20',
    '      }"',
    '    >',
    '      Installation complete!',
    '    </div>',
    '  `,',
    '})',
    'export class AppComponent {}',
  ].join('\n');

  readonly nextLinks = [
    {
      path: '/docs/getting-started',
      title: 'Introduction',
      description: 'Full walkthrough with springs, gestures, and more',
    },
    {
      path: '/docs/motion-directive',
      title: 'Motion Directive',
      description: 'Complete API reference for all directive inputs and outputs',
    },
  ];
}
