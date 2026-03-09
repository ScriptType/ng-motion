import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import type { Variants } from '@scripttype/ng-motion';

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
  route: string;
  gradient: string;
}

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, NgmMotionDirective],
  template: `
    <!-- Hero -->
    <section class="relative mb-20">
      <div
        ngmMotion
        [initial]="{ opacity: 0, y: 30 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ duration: 0.7, ease: 'easeOut' }"
        class="max-w-2xl"
      >
        <p
          ngmMotion
          [initial]="{ opacity: 0 }"
          [animate]="{ opacity: 1 }"
          [transition]="{ delay: 0.2, duration: 0.5 }"
          class="mb-4 font-mono text-sm tracking-widest text-accent-cyan uppercase"
        >
          Angular Animation Library
        </p>
        <h1 class="font-display text-5xl font-extrabold leading-tight tracking-tight md:text-6xl">
          Production-ready
          <span
            class="bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-amber bg-clip-text text-transparent"
          >
            motion
          </span>
          <br />for Angular
        </h1>
        <p
          ngmMotion
          [initial]="{ opacity: 0, y: 10 }"
          [animate]="{ opacity: 1, y: 0 }"
          [transition]="{ delay: 0.4, duration: 0.5 }"
          class="mt-6 text-lg leading-relaxed text-text-secondary"
        >
          Declarative animations, spring physics, gestures, layout transitions, scroll-linked
          effects, and drag-to-reorder — all powered by motion-dom.
        </p>
      </div>

      <!-- Animated demo element -->
      <div class="mt-12 flex items-center gap-6">
        <div
          ngmMotion
          [initial]="{ opacity: 0, scale: 0.8, rotate: -10 }"
          [animate]="{ opacity: 1, scale: 1, rotate: 0 }"
          [transition]="{ type: 'spring', stiffness: 200, damping: 20 }"
          [whileHover]="{
            scale: 1.08,
            rotate: 3,
            transition: { type: 'spring', stiffness: 300, damping: 15 },
          }"
          [whileTap]="{ scale: 0.95, transition: { type: 'spring', stiffness: 400, damping: 20 } }"
          class="flex h-24 w-24 cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-br from-accent-cyan to-accent-purple text-3xl font-bold text-white shadow-lg shadow-accent-purple/20"
        >
          ng
        </div>
        <div
          ngmMotion
          [initial]="{ opacity: 0, x: -10 }"
          [animate]="{ opacity: 1, x: 0 }"
          [transition]="{ delay: 0.8, duration: 0.4 }"
        >
          <p class="font-mono text-sm text-text-muted">hover &amp; tap me</p>
          <p class="text-xs text-text-muted/60">spring physics built in</p>
        </div>
      </div>
    </section>

    <!-- Feature grid -->
    <section>
      <div
        ngmMotion
        [initial]="'hidden'"
        [animate]="'visible'"
        [variants]="containerVariants"
        class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        @for (card of features; track card.route; let i = $index) {
          <a
            [routerLink]="card.route"
            ngmMotion
            [variants]="cardVariants"
            [whileHover]="{ y: -4, transition: { duration: 0.2 } }"
            class="group relative block overflow-hidden rounded-card border border-border bg-surface-1/50 p-6 backdrop-blur-sm transition-colors hover:border-border-hover"
          >
            <!-- Gradient accent line -->
            <div
              class="absolute inset-x-0 top-0 h-px opacity-0 transition-opacity group-hover:opacity-100"
              [class]="card.gradient"
            ></div>

            <div class="mb-4 text-2xl">{{ card.icon }}</div>
            <h3 class="mb-2 font-display text-base font-semibold text-text-primary">
              {{ card.title }}
            </h3>
            <p class="text-sm leading-relaxed text-text-secondary">
              {{ card.description }}
            </p>

            <!-- Arrow -->
            <div
              class="mt-4 flex items-center gap-1.5 text-xs font-medium text-text-muted transition-colors group-hover:text-accent-cyan"
            >
              Explore
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="h-3 w-3 transition-transform group-hover:translate-x-0.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </div>
          </a>
        }
      </div>
    </section>

    <!-- Stats row -->
    <section class="mt-16 grid grid-cols-3 gap-6">
      @for (stat of stats; track stat.label; let i = $index) {
        <div
          ngmMotion
          [initial]="{ opacity: 0, y: 20 }"
          [animate]="{ opacity: 1, y: 0 }"
          [transition]="{ delay: 1.2 + i * 0.1, duration: 0.4 }"
          class="text-center"
        >
          <p class="font-display text-2xl font-bold text-text-primary md:text-3xl">
            {{ stat.value }}
          </p>
          <p class="mt-1 text-xs text-text-muted">{{ stat.label }}</p>
        </div>
      }
    </section>

    <!-- Quick demo: toggle -->
    <section class="mt-20">
      <div class="rounded-card border border-border bg-surface-1/30 p-8">
        <h2 class="mb-2 font-display text-lg font-semibold text-text-primary">Quick Demo</h2>
        <p class="mb-6 text-sm text-text-secondary">
          Click to toggle — spring physics, declarative API, zero boilerplate.
        </p>
        <div class="flex items-center gap-6">
          <button
            ngmMotion
            [layout]="true"
            [layoutDependency]="demoToggled()"
            [animate]="demoToggled()"
            [whileTap]="{ scale: 0.95 }"
            [transition]="{ type: 'spring', stiffness: 150, damping: 12 }"
            (click)="demoToggled.set(!demoToggled())"
            class="rounded-button bg-gradient-to-r from-accent-cyan to-accent-purple px-5 py-2.5 text-sm font-medium text-white transition-shadow hover:shadow-lg hover:shadow-accent-cyan/20"
          >
            {{ demoToggled() ? 'Reset' : 'Animate' }}
          </button>
          <div
            ngmMotion
            [animate]="
              demoToggled()
                ? { scale: 1.3, rotate: 180, borderRadius: '50%' }
                : { scale: 1, rotate: 0, borderRadius: '12px' }
            "
            [transition]="{ type: 'spring', stiffness: 260, damping: 20 }"
            class="flex h-16 w-16 items-center justify-center bg-surface-2 text-xl text-text-primary select-none"
          >
            {{ demoToggled() ? '✨' : '■' }}
          </div>
          <p class="font-mono text-xs tabular-nums text-text-muted">
            {{ demoToggled() ? 'scale: 1.3 · rotate: 180°' : 'scale: 1 · rotate: 0°' }}
          </p>
        </div>
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class HomePage {
  demoToggled = signal(false);

  readonly containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.5 },
    },
  };

  readonly cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  readonly features: FeatureCard[] = [
    {
      icon: '\u25B3',
      title: 'Basics',
      description: 'Fade, spring, keyframes, variants, stagger, and imperative animations.',
      route: '/basics',
      gradient: 'bg-gradient-to-r from-accent-cyan to-accent-cyan/0',
    },
    {
      icon: '\u270B',
      title: 'Gestures',
      description: 'Hover, tap, focus, drag with constraints, axis locking, and velocity.',
      route: '/gestures',
      gradient: 'bg-gradient-to-r from-accent-purple to-accent-purple/0',
    },
    {
      icon: '\u2728',
      title: 'Presence',
      description: 'Enter and exit animations with conditional rendering and lists.',
      route: '/presence',
      gradient: 'bg-gradient-to-r from-accent-amber to-accent-amber/0',
    },
    {
      icon: '\u2B1A',
      title: 'Layout',
      description: 'Layout animations, shared layout with layoutId, and cross-container.',
      route: '/layout',
      gradient: 'bg-gradient-to-r from-accent-cyan to-accent-purple/0',
    },
    {
      icon: '\u2193',
      title: 'Scroll',
      description: 'Scroll progress, container tracking, in-view reveals, and parallax.',
      route: '/scroll',
      gradient: 'bg-gradient-to-r from-accent-purple to-accent-amber/0',
    },
    {
      icon: '\u223F',
      title: 'Values & Hooks',
      description: 'useSpring, useTransform, useMotionTemplate, useCycle, and more.',
      route: '/values',
      gradient: 'bg-gradient-to-r from-accent-amber to-accent-cyan/0',
    },
    {
      icon: '\u2195',
      title: 'Reorder',
      description: 'Drag-to-reorder lists with vertical, horizontal, and animated removal.',
      route: '/reorder',
      gradient: 'bg-gradient-to-r from-accent-cyan to-accent-amber/0',
    },
  ];

  readonly stats = [
    { value: '155+', label: 'Exports' },
    { value: '13', label: 'Hooks' },
    { value: '0', label: 'React deps' },
  ];
}
