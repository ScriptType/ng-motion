import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  NgmMotionDirective,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from '@scripttype/ng-motion';
import { CosmicShuffleGridComponent } from '../components/cosmic-shuffle-grid.component';
import { DemoReplayComponent } from '../components/demo-replay.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, NgmMotionDirective, DemoReplayComponent, CosmicShuffleGridComponent],
  template: `
    <!-- ═══════════════════════ HERO ═══════════════════════ -->
    <section class="relative min-h-screen flex items-center justify-center overflow-hidden">
      <!-- Background layers -->
      <div class="absolute inset-0 pointer-events-none">
        <!-- Dot grid -->
        <div class="absolute inset-0 dot-grid opacity-[0.03]"></div>

        <!-- Floating orbs — static on mobile (blur is expensive), animated on desktop -->
        @if (!mobile) {
          <div
            ngmMotion
            [initial]="{ y: 0, x: 0 }"
            [whileInView]="{ y: [-30, 30, -30], x: [-20, 20, -20] }"
            [transition]="{ duration: 12, repeat: inf, ease: 'easeInOut' }"
            class="absolute top-[20%] left-[20%] w-96 h-96 rounded-full bg-accent/8 blur-[100px]"
          ></div>
          <div
            ngmMotion
            [initial]="{ y: 0, x: 0 }"
            [whileInView]="{ y: [20, -40, 20], x: [15, -25, 15] }"
            [transition]="{ duration: 15, repeat: inf, ease: 'easeInOut' }"
            class="absolute bottom-[30%] right-[20%] w-80 h-80 rounded-full bg-accent-pink/8 blur-[100px]"
          ></div>
          <div
            ngmMotion
            [initial]="{ y: 0, x: 0, scale: 1 }"
            [whileInView]="{ y: [-15, 25, -15], x: [-10, 15, -10], scale: [1, 1.2, 1] }"
            [transition]="{ duration: 18, repeat: inf, ease: 'easeInOut' }"
            class="absolute top-[35%] right-[35%] w-64 h-64 rounded-full bg-accent-purple/6 blur-[80px]"
          ></div>
        } @else {
          <div class="absolute top-[20%] left-[20%] w-96 h-96 rounded-full bg-accent/8 blur-[60px]"></div>
          <div class="absolute bottom-[30%] right-[20%] w-80 h-80 rounded-full bg-accent-pink/8 blur-[60px]"></div>
          <div class="absolute top-[35%] right-[35%] w-64 h-64 rounded-full bg-accent-purple/6 blur-[50px]"></div>
        }
      </div>

      <!-- Hero content -->
      <div class="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <!-- Badge -->
        <div
          ngmMotion
          [initial]="{ opacity: 0, y: 20, scale: 0.9 }"
          [animate]="{ opacity: 1, y: 0, scale: 1 }"
          [transition]="{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }"
          class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/20 bg-accent/5 text-accent text-sm mb-8"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
          v0.4.3
        </div>

        <!-- Cosmic shuffle grid -->
        <div
          ngmMotion
          [initial]="{ opacity: 0, scale: 0.88 }"
          [animate]="{ opacity: 1, scale: 1 }"
          [transition]="{ delay: 0.3, type: 'spring', stiffness: 120, damping: 18 }"
          class="mb-8"
        >
          <app-cosmic-shuffle-grid />
        </div>

        <!-- Title -->
        <h1
          ngmMotion
          [initial]="{ opacity: 0, y: 20 }"
          [animate]="{ opacity: 1, y: 0 }"
          [transition]="{ delay: 0.6, type: 'spring', stiffness: 200, damping: 20 }"
          class="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl mb-4"
        >
          <span class="text-accent">ng</span><span class="text-primary">-motion</span>
        </h1>

        <!-- Subtitle -->
        <p
          ngmMotion
          [initial]="{ opacity: 0, y: 20 }"
          [animate]="{ opacity: 1, y: 0 }"
          [transition]="{ delay: 0.8, duration: 0.6 }"
          class="text-xl md:text-2xl text-secondary max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Declarative animations, spring physics, gestures, and layout
          animations for
          <span class="text-primary font-medium">Angular</span>.
        </p>

        <!-- CTA buttons -->
        <div
          ngmMotion
          [initial]="{ opacity: 0, y: 20 }"
          [animate]="{ opacity: 1, y: 0 }"
          [transition]="{ delay: 1, duration: 0.6 }"
          class="flex flex-wrap items-center justify-center gap-4"
        >
          <a
            routerLink="/docs/getting-started"
            ngmMotion
            [whileHover]="{ scale: 1.05, y: -2 }"
            [whileTap]="{ scale: 0.97 }"
            [transition]="{ type: 'spring', stiffness: 400, damping: 17 }"
            class="px-8 py-3.5 rounded-xl bg-accent text-deep font-semibold text-lg shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-shadow"
          >
            Get Started
          </a>
          <a
            href="#demo"
            ngmMotion
            [whileHover]="{ scale: 1.05, y: -2 }"
            [whileTap]="{ scale: 0.97 }"
            [transition]="{ type: 'spring', stiffness: 400, damping: 17 }"
            class="px-8 py-3.5 rounded-xl border border-border-active text-primary font-semibold text-lg hover:border-accent/50 transition-colors"
          >
            See it in action
          </a>
        </div>
      </div>

      <!-- Scroll indicator -->
      <div
        ngmMotion
        [initial]="{ opacity: 0 }"
        [animate]="{ opacity: 1 }"
        [transition]="{ delay: 1.5 }"
        class="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div
          ngmMotion
          [initial]="{ y: 0 }"
          [whileInView]="{ y: [0, 8, 0] }"
          [transition]="{ duration: 1.5, repeat: inf, ease: 'easeInOut' }"
          class="w-6 h-10 rounded-full border-2 border-muted/50 flex items-start justify-center p-1.5"
        >
          <div class="w-1 h-2 rounded-full bg-muted"></div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════ FEATURES ═══════════════════════ -->
    <section class="py-32 px-6">
      <div class="mx-auto max-w-6xl">
        <div class="text-center mb-20">
          <h2
            ngmMotion
            [initial]="{ opacity: 0, y: 30 }"
            [whileInView]="{ opacity: 1, y: 0 }"
            [viewport]="{ once: true, margin: '-100px' }"
            [transition]="{ duration: 0.6 }"
            class="font-display font-bold text-4xl md:text-5xl mb-4"
          >
            Everything you need
          </h2>
          <p
            ngmMotion
            [initial]="{ opacity: 0, y: 20 }"
            [whileInView]="{ opacity: 1, y: 0 }"
            [viewport]="{ once: true, margin: '-100px' }"
            [transition]="{ delay: 0.1, duration: 0.6 }"
            class="text-lg text-secondary max-w-xl mx-auto"
          >
            A complete animation toolkit built for Angular's reactive model
          </p>
        </div>

        <!-- Feature grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (feature of features; track feature.id; let i = $index) {
            <div
              ngmMotion
              [initial]="{ opacity: 0, y: 40 }"
              [whileInView]="{ opacity: 1, y: 0 }"
              [viewport]="{ once: true, margin: '-50px' }"
              [transition]="{
                delay: i * 0.1,
                type: 'spring',
                stiffness: 200,
                damping: 20
              }"
              [whileHover]="{ y: -6, scale: 1.02 }"
              class="group rounded-2xl border border-border bg-surface/50 p-6 hover:border-accent/30 hover:bg-surface transition-colors cursor-default"
            >
              <!-- Mini animated demo -->
              <div
                class="mb-6 h-32 rounded-xl bg-deep/80 flex items-center justify-center overflow-hidden"
              >
                @switch (feature.id) {
                  @case ('declarative') {
                    <div
                      ngmMotion
                      [initial]="{ rotate: 0 }"
                      [whileInView]="{ rotate: 360 }"
                      [transition]="{ duration: 4, repeat: inf, ease: 'linear' }"
                      class="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent-purple"
                    ></div>
                  }
                  @case ('spring') {
                    <div
                      ngmMotion
                      [initial]="{ scale: 1 }"
                      [whileInView]="{ scale: [1, 1.5, 1] }"
                      [transition]="{
                        duration: 2,
                        repeat: inf,
                        type: 'spring',
                        stiffness: 300,
                        damping: 10
                      }"
                      class="w-12 h-12 rounded-full bg-gradient-to-br from-accent-pink to-accent-gold"
                    ></div>
                  }
                  @case ('gestures') {
                    <div
                      ngmMotion
                      [whileHover]="{ scale: 1.4, rotate: 15 }"
                      [whileTap]="{ scale: 0.7, rotate: -15 }"
                      [transition]="{ type: 'spring', stiffness: 400, damping: 12 }"
                      class="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent-gold cursor-pointer"
                    ></div>
                  }
                  @case ('presence') {
                    <div class="flex gap-3">
                      @for (dot of presenceDots; track dot) {
                        <div
                          ngmMotion
                          [initial]="{ opacity: 0.3, scale: 0.8, y: 0 }"
                          [whileInView]="{
                            opacity: [0.3, 1, 0.3],
                            scale: [0.8, 1.2, 0.8],
                            y: [0, -8, 0]
                          }"
                          [transition]="{
                            duration: 1.5,
                            repeat: inf,
                            delay: dot * 0.2
                          }"
                          class="w-4 h-4 rounded-full bg-accent-purple"
                        ></div>
                      }
                    </div>
                  }
                  @case ('layout') {
                    <div class="flex gap-2 items-center">
                      <div
                        ngmMotion
                        [initial]="{ width: 32 }"
                        [whileInView]="{ width: [32, 64, 32] }"
                        [transition]="{
                          duration: 2.5,
                          repeat: inf,
                          ease: 'easeInOut'
                        }"
                        class="h-10 rounded-lg bg-accent/50"
                      ></div>
                      <div
                        ngmMotion
                        [initial]="{ width: 64 }"
                        [whileInView]="{ width: [64, 32, 64] }"
                        [transition]="{
                          duration: 2.5,
                          repeat: inf,
                          ease: 'easeInOut'
                        }"
                        class="h-10 rounded-lg bg-accent-pink/50"
                      ></div>
                    </div>
                  }
                  @case ('scroll') {
                    <div class="w-full px-8">
                      <div
                        ngmMotion
                        [initial]="{ x: -40 }"
                        [whileInView]="{ x: [-40, 40, -40] }"
                        [transition]="{
                          duration: 3,
                          repeat: inf,
                          ease: 'easeInOut'
                        }"
                        class="h-3 w-14 rounded-full bg-gradient-to-r from-accent via-accent-purple to-accent-pink"
                      ></div>
                    </div>
                  }
                }
              </div>

              <h3
                class="font-display font-semibold text-lg mb-2 group-hover:text-accent transition-colors"
              >
                {{ feature.title }}
              </h3>
              <p class="text-sm text-secondary leading-relaxed">
                {{ feature.description }}
              </p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ═══════════════════════ INTERACTIVE DEMO ═══════════════════════ -->
    <section id="demo" class="py-32 px-6 relative">
      <!-- Background glow -->
      <div class="absolute inset-0 pointer-events-none">
        <div
          ngmMotion
          [initial]="{ x: 0, y: 0 }"
          [whileInView]="{ x: [-30, 30, -30], y: [20, -20, 20] }"
          [transition]="{ duration: 20, repeat: inf, ease: 'easeInOut' }"
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px]"
        ></div>
      </div>

      <div class="mx-auto max-w-6xl relative z-10">
        <div class="text-center mb-16">
          <h2
            ngmMotion
            [initial]="{ opacity: 0, y: 30 }"
            [whileInView]="{ opacity: 1, y: 0 }"
            [viewport]="{ once: true, margin: '-100px' }"
            [transition]="{ duration: 0.6 }"
            class="font-display font-bold text-4xl md:text-5xl mb-4"
          >
            Feel the spring
          </h2>
          <p
            ngmMotion
            [initial]="{ opacity: 0, y: 20 }"
            [whileInView]="{ opacity: 1, y: 0 }"
            [viewport]="{ once: true, margin: '-100px' }"
            [transition]="{ delay: 0.1, duration: 0.6 }"
            class="text-lg text-secondary"
          >
            Drag, hover, and tap. Everything responds with spring physics.
          </p>
        </div>

        <div
          ngmMotion
          [initial]="{ opacity: 0, y: 40 }"
          [whileInView]="{ opacity: 1, y: 0 }"
          [viewport]="{ once: true, margin: '-50px' }"
          class="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <!-- Drag -->
          <div
            class="rounded-2xl border border-border bg-surface/50 p-8 flex flex-col items-center"
          >
            <div class="flex-1 flex items-center justify-center min-h-[200px]">
              <div
                ngmMotion
                [drag]="true"
                [dragX]="dragDemoX"
                [dragY]="dragDemoY"
                [dragSnapToOrigin]="true"
                [dragElastic]="0.3"
                [style]="{
                  x: dragDemoX,
                  y: dragDemoY,
                  rotateX: dragDemoTiltX,
                  rotateY: dragDemoTiltY,
                  rotate: dragDemoRotate,
                  skewX: dragDemoSkewX,
                  skewY: dragDemoSkewY,
                  scaleX: dragDemoStretchX,
                  scaleY: dragDemoStretchY,
                  transformPerspective: 900
                }"
                [whileHover]="{ scale: 1.1 }"
                [whileTap]="{ scale: 0.95 }"
                [whileDrag]="{
                  scale: 1.02,
                  boxShadow: '0 22px 52px rgba(34,211,238,0.28)'
                }"
                [transition]="{ type: 'spring', stiffness: 300, damping: 20 }"
                class="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-accent-purple cursor-grab active:cursor-grabbing shadow-lg shadow-accent/20"
              ></div>
            </div>
            <p class="text-sm text-muted mt-4 font-mono">drag me</p>
          </div>

          <!-- Hover -->
          <div
            class="rounded-2xl border border-border bg-surface/50 p-8 flex flex-col items-center"
          >
            <div class="flex-1 flex items-center justify-center min-h-[200px]">
              <div
                ngmMotion
                [whileHover]="{ scale: 1.4, rotate: 180, borderRadius: '50%' }"
                [transition]="{ type: 'spring', stiffness: 200, damping: 15 }"
                class="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-pink to-accent-gold cursor-pointer shadow-lg shadow-accent-pink/20"
              ></div>
            </div>
            <p class="text-sm text-muted mt-4 font-mono">hover me</p>
          </div>

          <!-- Tap -->
          <div
            class="rounded-2xl border border-border bg-surface/50 p-8 flex flex-col items-center"
          >
            <div class="flex-1 flex items-center justify-center min-h-[200px]">
              <div
                ngmMotion
                [whileTap]="{ scale: 0.5, rotate: -90, borderRadius: '50%' }"
                [whileHover]="{ scale: 1.1 }"
                [transition]="{ type: 'spring', stiffness: 500, damping: 15 }"
                class="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-purple to-accent cursor-pointer shadow-lg shadow-accent-purple/20"
              ></div>
            </div>
            <p class="text-sm text-muted mt-4 font-mono">tap me</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════ CODE EXAMPLE ═══════════════════════ -->
    <section class="py-32 px-6">
      <div class="mx-auto max-w-5xl">
        <div class="text-center mb-16">
          <h2
            ngmMotion
            [initial]="{ opacity: 0, y: 30 }"
            [whileInView]="{ opacity: 1, y: 0 }"
            [viewport]="{ once: true, margin: '-100px' }"
            class="font-display font-bold text-4xl md:text-5xl mb-4"
          >
            Beautifully simple
          </h2>
          <p
            ngmMotion
            [initial]="{ opacity: 0, y: 20 }"
            [whileInView]="{ opacity: 1, y: 0 }"
            [viewport]="{ once: true, margin: '-100px' }"
            [transition]="{ delay: 0.1 }"
            class="text-lg text-secondary"
          >
            A few lines of template is all you need
          </p>
        </div>

        <div
          ngmMotion
          [initial]="{ opacity: 0, y: 40 }"
          [whileInView]="{ opacity: 1, y: 0 }"
          [viewport]="{ once: true, margin: '-50px' }"
          class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
        >
          <!-- Code block -->
          <div class="rounded-2xl border border-border overflow-hidden">
            <div
              class="flex items-center gap-2 px-4 py-3 border-b border-border bg-elevated/50"
            >
              <div class="w-3 h-3 rounded-full bg-accent-pink/60"></div>
              <div class="w-3 h-3 rounded-full bg-accent-gold/60"></div>
              <div class="w-3 h-3 rounded-full bg-accent/60"></div>
              <span class="ml-2 text-xs text-muted font-mono">template.html</span>
            </div>
            <pre
              class="p-6 text-sm font-mono leading-relaxed overflow-x-auto bg-code-bg"
            ><code class="text-secondary whitespace-pre">{{ demoCode }}</code></pre>
          </div>

          <!-- Live result -->
          <app-demo-replay>
            <ng-template>
              <div class="flex items-center justify-center min-h-[300px]">
                <div
                  ngmMotion
                  [initial]="{ opacity: 0, y: 40 }"
                  [whileInView]="{ opacity: 1, y: 0 }"
                  [viewport]="{ once: true }"
                  [whileHover]="{ scale: 1.05, y: -4 }"
                  [transition]="{ type: 'spring', stiffness: 200, damping: 20 }"
                  class="px-10 py-8 rounded-2xl bg-gradient-to-br from-surface to-elevated border border-border-active text-2xl font-display font-semibold cursor-pointer select-none shadow-2xl shadow-accent/5"
                >
                  Hello, motion!
                </div>
              </div>
            </ng-template>
          </app-demo-replay>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════ CLAUDE CODE SKILL ═══════════════════════ -->
    <section class="py-32 px-6 relative">
      <div class="absolute inset-0 pointer-events-none">
        <div
          ngmMotion
          [initial]="{ x: 0, y: 0, scale: 1 }"
          [whileInView]="{ x: [20, -20, 20], y: [-15, 15, -15], scale: [1, 1.15, 1] }"
          [transition]="{ duration: 16, repeat: inf, ease: 'easeInOut' }"
          class="absolute top-[40%] left-[30%] w-[400px] h-[400px] rounded-full bg-accent-purple/6 blur-[100px]"
        ></div>
      </div>

      <div class="mx-auto max-w-4xl relative z-10">
        <div class="text-center mb-12">
          <div
            ngmMotion
            [initial]="{ opacity: 0, y: 20, scale: 0.9 }"
            [whileInView]="{ opacity: 1, y: 0, scale: 1 }"
            [viewport]="{ once: true, margin: '-100px' }"
            [transition]="{ type: 'spring', stiffness: 200, damping: 20 }"
            class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent-purple/20 bg-accent-purple/5 text-accent-purple text-sm mb-6"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-accent-purple animate-pulse"></span>
            Claude Code
          </div>

          <h2
            ngmMotion
            [initial]="{ opacity: 0, y: 30 }"
            [whileInView]="{ opacity: 1, y: 0 }"
            [viewport]="{ once: true, margin: '-100px' }"
            [transition]="{ duration: 0.6 }"
            class="font-display font-bold text-4xl md:text-5xl mb-4"
          >
            AI that knows ng-motion
          </h2>
          <p
            ngmMotion
            [initial]="{ opacity: 0, y: 20 }"
            [whileInView]="{ opacity: 1, y: 0 }"
            [viewport]="{ once: true, margin: '-100px' }"
            [transition]="{ delay: 0.1, duration: 0.6 }"
            class="text-lg text-secondary max-w-2xl mx-auto"
          >
            Install the ng-motion skill and Claude Code can scaffold, debug, and refactor
            ng-motion code for you &mdash; no extra prompting needed.
          </p>
        </div>

        <div
          ngmMotion
          [initial]="{ opacity: 0, y: 40 }"
          [whileInView]="{ opacity: 1, y: 0 }"
          [viewport]="{ once: true, margin: '-50px' }"
          class="rounded-2xl border border-accent-purple/20 bg-surface/50 overflow-hidden"
        >
          <div
            class="flex items-center gap-2 px-5 py-3 border-b border-border bg-elevated/50"
          >
            <div class="w-3 h-3 rounded-full bg-accent-pink/60"></div>
            <div class="w-3 h-3 rounded-full bg-accent-gold/60"></div>
            <div class="w-3 h-3 rounded-full bg-accent/60"></div>
            <span class="ml-2 text-xs text-muted font-mono">Claude Code</span>
          </div>
          <pre
            class="p-6 text-sm font-mono leading-loose overflow-x-auto bg-code-bg"
          ><code class="text-secondary whitespace-pre">{{ claudeSkillCode }}</code></pre>
        </div>

        <p
          ngmMotion
          [initial]="{ opacity: 0 }"
          [whileInView]="{ opacity: 1 }"
          [viewport]="{ once: true }"
          [transition]="{ delay: 0.3 }"
          class="text-center text-sm text-muted mt-6"
        >
          Directives, hooks, gestures, presence, layout &mdash; Claude understands the full API.
        </p>
      </div>
    </section>

    <!-- ═══════════════════════ QUICK START ═══════════════════════ -->
    <section class="py-32 px-6 border-t border-border/30">
      <div class="mx-auto max-w-3xl">
        <div class="text-center mb-16">
          <h2
            ngmMotion
            [initial]="{ opacity: 0, y: 30 }"
            [whileInView]="{ opacity: 1, y: 0 }"
            [viewport]="{ once: true }"
            class="font-display font-bold text-4xl md:text-5xl mb-4"
          >
            Get started in seconds
          </h2>
        </div>

        <div class="space-y-8">
          @for (step of quickStartSteps; track step.number; let i = $index) {
            <div
              ngmMotion
              [initial]="{ opacity: 0, x: -30 }"
              [whileInView]="{ opacity: 1, x: 0 }"
              [viewport]="{ once: true, margin: '-50px' }"
              [transition]="{
                delay: i * 0.12,
                type: 'spring',
                stiffness: 200,
                damping: 20
              }"
              class="flex gap-6 items-start"
            >
              <div
                class="flex-shrink-0 w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center font-display font-bold text-lg border border-accent/20"
              >
                {{ step.number }}
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-display font-semibold text-lg mb-3">
                  {{ step.title }}
                </h3>
                <div class="rounded-xl border border-border overflow-hidden">
                  <pre
                    class="p-4 text-sm font-mono bg-code-bg overflow-x-auto"
                  ><code class="text-secondary whitespace-pre">{{ step.code }}</code></pre>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Final CTA -->
        <div
          ngmMotion
          [initial]="{ opacity: 0, y: 20 }"
          [whileInView]="{ opacity: 1, y: 0 }"
          [viewport]="{ once: true }"
          class="text-center mt-16"
        >
          <a
            routerLink="/docs/getting-started"
            ngmMotion
            [whileHover]="{ scale: 1.05, y: -2 }"
            [whileTap]="{ scale: 0.97 }"
            [transition]="{ type: 'spring', stiffness: 400, damping: 17 }"
            class="inline-flex px-8 py-3.5 rounded-xl bg-accent text-deep font-semibold text-lg shadow-lg shadow-accent/25"
          >
            Read the docs
          </a>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════ FOOTER ═══════════════════════ -->
    <footer class="py-16 px-6 border-t border-border/30">
      <div class="mx-auto max-w-6xl">
        <div
          ngmMotion
          [initial]="{ opacity: 0 }"
          [whileInView]="{ opacity: 1 }"
          [viewport]="{ once: true }"
          class="flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div
            class="flex items-center gap-1.5 font-display font-bold text-xl select-none"
          >
            <span class="text-accent">ng</span>
            <span class="text-primary">motion</span>
          </div>
          <p class="text-sm text-muted">
            Built with Angular & motion-dom. Open source under MIT.
          </p>
        </div>
      </div>
    </footer>
  `,
  styles: `
    .dot-grid {
      background-image: radial-gradient(circle, currentColor 1px, transparent 1px);
      background-size: 24px 24px;
    }
  `,
})
export class HomePage {
  protected readonly inf = Infinity;
  protected readonly mobile = typeof window !== 'undefined' && window.innerWidth < 768;
  readonly dragDemoX: MotionValue<number>;
  readonly dragDemoY: MotionValue<number>;
  readonly dragDemoTiltX: MotionValue<number>;
  readonly dragDemoTiltY: MotionValue<number>;
  readonly dragDemoRotate: MotionValue<number>;
  readonly dragDemoSkewX: MotionValue<number>;
  readonly dragDemoSkewY: MotionValue<number>;
  readonly dragDemoStretchX: MotionValue<number>;
  readonly dragDemoStretchY: MotionValue<number>;

  readonly presenceDots = [0, 1, 2, 3];

  readonly features = [
    {
      id: 'declarative',
      title: 'Declarative',
      description:
        'Define animations in your template with simple property bindings. No imperative code needed.',
    },
    {
      id: 'spring',
      title: 'Spring Physics',
      description:
        'Production-grade spring animations with configurable stiffness, damping, and mass.',
    },
    {
      id: 'gestures',
      title: 'Gestures',
      description:
        'Built-in hover, tap, focus, drag, and pan gesture detection with animated responses.',
    },
    {
      id: 'presence',
      title: 'Presence & Exit',
      description:
        'Animate elements as they enter and leave the DOM with exit animations.',
    },
    {
      id: 'layout',
      title: 'Layout Animation',
      description:
        'Automatic FLIP animations when elements change position or size in the layout.',
    },
    {
      id: 'scroll',
      title: 'Scroll-Driven',
      description:
        'Link animations to scroll progress with configurable offsets and smooth interpolation.',
    },
  ];

  readonly demoCode = [
    '<div',
    '  ngmMotion',
    '  [initial]="{ opacity: 0, y: 40 }"',
    '  [animate]="{ opacity: 1, y: 0 }"',
    '  [whileHover]="{ scale: 1.05 }"',
    '  [transition]="{',
    "    type: 'spring',",
    '    stiffness: 200',
    '  }"',
    '>',
    '  Hello, motion!',
    '</div>',
  ].join('\n');

  readonly claudeSkillCode = [
    '# Add the marketplace',
    '/plugin marketplace add ScriptType/ng-motion-skill',
    '',
    '# Install the skill',
    '/plugin install ng-motion@ng-motion-skill',
  ].join('\n');

  readonly quickStartSteps = [
    {
      number: 1,
      title: 'Install',
      code: 'npm install @scripttype/ng-motion motion-dom motion-utils',
    },
    {
      number: 2,
      title: 'Import the directive',
      code: [
        "import { NgmMotionDirective } from '@scripttype/ng-motion';",
        '',
        '@Component({',
        '  imports: [NgmMotionDirective],',
        '})',
      ].join('\n'),
    },
    {
      number: 3,
      title: 'Animate anything',
      code: [
        '<div',
        '  ngmMotion',
        '  [initial]="{ opacity: 0, y: 20 }"',
        '  [animate]="{ opacity: 1, y: 0 }"',
        '  [whileHover]="{ scale: 1.05 }"',
        '>',
        '  Hello, motion!',
        '</div>',
      ].join('\n'),
    },
  ];

  constructor() {
    this.dragDemoX = useMotionValue(0);
    this.dragDemoY = useMotionValue(0);

    const rawVelocityX = useVelocity(this.dragDemoX);
    const rawVelocityY = useVelocity(this.dragDemoY);

    const tiltXTarget = useTransform(rawVelocityY, [-3200, 0, 3200], [58, 0, -58]);
    const tiltYTarget = useTransform(rawVelocityX, [-3200, 0, 3200], [-68, 0, 68]);
    const rotateTarget = useTransform(rawVelocityX, [-3200, 0, 3200], [-46, 0, 46]);
    const skewXTarget = useTransform(rawVelocityY, [-3200, 0, 3200], [-14, 0, 14]);
    const skewYTarget = useTransform(rawVelocityX, [-3200, 0, 3200], [16, 0, -16]);

    this.dragDemoTiltX = useSpring(tiltXTarget, {
      stiffness: 320,
      damping: 16,
      mass: 0.34,
    });
    this.dragDemoTiltY = useSpring(tiltYTarget, {
      stiffness: 320,
      damping: 16,
      mass: 0.34,
    });
    this.dragDemoRotate = useSpring(rotateTarget, {
      stiffness: 300,
      damping: 15,
      mass: 0.36,
    });
    this.dragDemoSkewX = useSpring(skewXTarget, {
      stiffness: 320,
      damping: 16,
      mass: 0.34,
    });
    this.dragDemoSkewY = useSpring(skewYTarget, {
      stiffness: 320,
      damping: 16,
      mass: 0.34,
    });

    const dragSpeed = useTransform(
      [rawVelocityX, rawVelocityY],
      (vx: number, vy: number) => Math.min(Math.hypot(vx, vy), 3200),
    );

    const stretchTargetX = useTransform(
      [rawVelocityX, rawVelocityY, dragSpeed],
      (vx: number, vy: number, speed: number) => {
        const xPush = Math.min(Math.abs(vx) / 3200, 1);
        const yPush = Math.min(Math.abs(vy) / 3200, 1);
        const speedPush = Math.min(speed / 3200, 1);
        const xDominance = Math.max(xPush - yPush * 0.55, 0);
        const yCounter = Math.max(yPush - xPush * 0.45, 0);
        return Math.min(
          Math.max(1 + speedPush * 0.08 + xDominance * 0.56 - yCounter * 0.36, 0.62),
          1.58,
        );
      },
    );
    const stretchTargetY = useTransform(
      [rawVelocityX, rawVelocityY, dragSpeed],
      (vx: number, vy: number, speed: number) => {
        const xPush = Math.min(Math.abs(vx) / 3200, 1);
        const yPush = Math.min(Math.abs(vy) / 3200, 1);
        const speedPush = Math.min(speed / 3200, 1);
        const yDominance = Math.max(yPush - xPush * 0.55, 0);
        const xCounter = Math.max(xPush - yPush * 0.45, 0);
        return Math.min(
          Math.max(1 + speedPush * 0.08 + yDominance * 0.56 - xCounter * 0.36, 0.62),
          1.58,
        );
      },
    );

    this.dragDemoStretchX = useSpring(stretchTargetX, {
      stiffness: 360,
      damping: 14,
      mass: 0.4,
    });
    this.dragDemoStretchY = useSpring(stretchTargetY, {
      stiffness: 360,
      damping: 14,
      mass: 0.4,
    });
  }
}
