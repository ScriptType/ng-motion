import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgmMotionDirective } from 'ng-motion';
import { CodeBlockComponent } from '../../components/code-block.component';
import { DemoReplayComponent } from '../../components/demo-replay.component';

@Component({
  selector: 'app-getting-started',
  imports: [RouterLink, NgmMotionDirective, CodeBlockComponent, DemoReplayComponent],
  template: `
    <article class="max-w-3xl pb-16">
      <!-- Header -->
      <div
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
      >
        <h1 class="font-display font-bold text-4xl mb-4">Getting Started</h1>
        <p class="text-lg text-secondary mb-12 leading-relaxed">
          ng-motion brings Framer Motion's animation capabilities to Angular. Built on
          motion-dom, it provides declarative animations, spring physics, gestures, and
          layout animations through simple template directives.
        </p>
      </div>

      <!-- Installation -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.1 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Installation</h2>

        <div class="rounded-xl border border-border bg-surface/30 p-5 mb-6">
          <p class="text-secondary text-sm">
            <strong class="text-primary">Prerequisite:</strong> ng-motion requires
            <code class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10">Angular 21</code>
            or later with standalone components enabled. See the
            <a routerLink="/docs/installation" class="text-accent hover:underline">Installation</a>
            page for full requirements and package manager options.
          </p>
        </div>

        <app-code-block [code]="installCode" lang="bash" filename="terminal" />
      </section>

      <!-- First animation -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.2 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Your first animation</h2>
        <p class="text-secondary mb-6">
          Import the directive and add it to any element. The
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >initial</code
          >
          and
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >animate</code
          >
          inputs define start and end states:
        </p>

        <app-code-block [code]="firstAnimationCode" lang="typescript" filename="component.ts" class="mb-6" />

        <!-- Live demo -->
        <app-demo-replay>
          <ng-template>
            <div
              class="rounded-xl border border-border p-10 bg-surface/30 flex items-center justify-center"
            >
              <div
                ngmMotion
                [initial]="{ opacity: 0, y: 30 }"
                [whileInView]="{ opacity: 1, y: 0 }"
                [viewport]="{ once: true }"
                [transition]="{ type: 'spring', stiffness: 200, damping: 20 }"
                class="px-8 py-4 rounded-xl bg-gradient-to-br from-accent/15 to-accent-purple/15 border border-accent/20 text-lg"
              >
                I animate on mount!
              </div>
            </div>
          </ng-template>
        </app-demo-replay>
      </section>

      <!-- Interactivity -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.3 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Adding interactivity</h2>
        <p class="text-secondary mb-6">
          Use
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >whileHover</code
          >
          and
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >whileTap</code
          >
          for gesture-driven animations:
        </p>

        <app-code-block [code]="interactivityCode" lang="html" filename="template" class="mb-6" />

        <div
          class="rounded-xl border border-border p-10 bg-surface/30 flex items-center justify-center"
        >
          <div
            ngmMotion
            [whileHover]="{ scale: 1.1, rotate: 5 }"
            [whileTap]="{ scale: 0.9, rotate: -5 }"
            [transition]="{ type: 'spring', stiffness: 400, damping: 17 }"
            class="px-8 py-4 rounded-xl bg-gradient-to-br from-accent-pink/15 to-accent-gold/15 border border-accent-pink/20 text-lg cursor-pointer select-none"
          >
            Hover & tap me!
          </div>
        </div>
      </section>

      <!-- Spring physics -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.4 }"
        class="mb-12"
      >
        <h2 class="font-display font-semibold text-2xl mb-4">Spring physics</h2>
        <p class="text-secondary mb-6">
          Use
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >type: 'spring'</code
          >
          in transitions for natural, physics-based motion. Adjust
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >stiffness</code
          >
          and
          <code
            class="text-accent-pink font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10"
            >damping</code
          >
          to control the feel:
        </p>

        <div
          class="rounded-xl border border-border p-10 bg-surface/30 flex items-center justify-center gap-8"
        >
          <div class="text-center">
            <div
              ngmMotion
              [drag]="true"
              [dragSnapToOrigin]="true"
              [dragElastic]="0.2"
              [transition]="{ type: 'spring', stiffness: 600, damping: 10 }"
              class="w-16 h-16 rounded-xl bg-gradient-to-br from-accent to-accent-purple cursor-grab active:cursor-grabbing mx-auto mb-3"
            ></div>
            <p class="text-xs text-muted font-mono">bouncy</p>
          </div>
          <div class="text-center">
            <div
              ngmMotion
              [drag]="true"
              [dragSnapToOrigin]="true"
              [dragElastic]="0.2"
              [transition]="{ type: 'spring', stiffness: 200, damping: 20 }"
              class="w-16 h-16 rounded-xl bg-gradient-to-br from-accent-pink to-accent-gold cursor-grab active:cursor-grabbing mx-auto mb-3"
            ></div>
            <p class="text-xs text-muted font-mono">smooth</p>
          </div>
          <div class="text-center">
            <div
              ngmMotion
              [drag]="true"
              [dragSnapToOrigin]="true"
              [dragElastic]="0.2"
              [transition]="{ type: 'spring', stiffness: 100, damping: 30 }"
              class="w-16 h-16 rounded-xl bg-gradient-to-br from-accent-purple to-accent-pink cursor-grab active:cursor-grabbing mx-auto mb-3"
            ></div>
            <p class="text-xs text-muted font-mono">slow</p>
          </div>
        </div>
      </section>

      <!-- Next steps -->
      <section
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ delay: 0.5 }"
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
export class GettingStartedPage {
  readonly installCode = 'npm install ng-motion motion-dom motion-utils';

  readonly firstAnimationCode = [
    "import { Component } from '@angular/core';",
    "import { NgmMotionDirective } from 'ng-motion';",
    '',
    '@Component({',
    '  imports: [NgmMotionDirective],',
    '  template: `',
    '    <div',
    '      ngmMotion',
    '      [initial]="{ opacity: 0, y: 30 }"',
    '      [animate]="{ opacity: 1, y: 0 }"',
    '      [transition]="{',
    "        type: 'spring',",
    '        stiffness: 200,',
    '        damping: 20',
    '      }"',
    '    >',
    '      I animate on mount!',
    '    </div>',
    '  `,',
    '})',
    'export class MyComponent {}',
  ].join('\n');

  readonly interactivityCode = [
    '<div',
    '  ngmMotion',
    '  [whileHover]="{ scale: 1.1, rotate: 5 }"',
    '  [whileTap]="{ scale: 0.9, rotate: -5 }"',
    '  [transition]="{',
    "    type: 'spring',",
    '    stiffness: 400,',
    '    damping: 17',
    '  }"',
    '>',
    '  Hover & tap me!',
    '</div>',
  ].join('\n');

  readonly nextLinks = [
    {
      path: '/docs/motion-directive',
      title: 'Motion Directive →',
      description: 'Learn all directive inputs and outputs',
    },
    {
      path: '/docs/gestures',
      title: 'Gestures →',
      description: 'Hover, tap, drag, and focus interactions',
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
  ];
}
