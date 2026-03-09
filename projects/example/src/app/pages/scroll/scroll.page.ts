import { Component, signal, type WritableSignal } from '@angular/core';
import {
  NgmMotionDirective,
  useScroll,
  useSpring,
  useTransform,
  type ViewportOptions,
} from '@scripttype/ng-motion';

interface RevealCard {
  icon: string;
  label: string;
  colorFrom: string;
  colorTo: string;
  delay: number;
}

@Component({
  selector: 'app-scroll-page',
  imports: [NgmMotionDirective],
  template: `
    <!-- Page header -->
    <header class="mb-14">
      <div
        ngmMotion
        [initial]="{ opacity: 0, y: 20 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ duration: 0.5, ease: 'easeOut' }"
      >
        <p class="mb-3 font-mono text-xs tracking-widest text-accent-cyan uppercase">
          Scroll-Linked
        </p>
        <h1
          class="font-display text-4xl font-extrabold bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent"
        >
          Scroll
        </h1>
        <p class="mt-3 text-sm text-text-secondary max-w-xl leading-relaxed">
          Progress bars, container tracking, viewport-triggered reveals, and parallax depth
          layers &mdash; all driven by scroll position through MotionValues.
        </p>
      </div>
    </header>

    <!-- Grid of demos -->
    <div class="grid gap-6 lg:grid-cols-2">

      <!-- ─── 1. Scroll Progress Bar ─── -->
      <section class="bg-surface-1 rounded-demo p-6 border border-border lg:col-span-2">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="font-display text-lg font-semibold text-text-primary">
              Scroll Progress Bar
            </h2>
            <p class="text-sm text-text-secondary mt-0.5">
              useScroll + useSpring tracking page scroll with a smooth gradient bar
            </p>
          </div>
          <p class="text-sm text-text-muted font-mono tabular-nums">
            {{ scrollPercent() }}%
          </p>
        </div>

        <!-- Progress bar track -->
        <div class="relative h-3 w-full rounded-full bg-surface-0/70 overflow-hidden">
          <!-- Gradient progress fill -->
          <div
            class="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-amber"
            [style.width.%]="smoothScrollPercent()"
          ></div>
          <!-- Glow overlay -->
          <div
            class="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-amber opacity-40 blur-sm"
            [style.width.%]="smoothScrollPercent()"
          ></div>
        </div>

        <!-- Mini ruler marks -->
        <div class="flex justify-between mt-2 px-0.5">
          @for (tick of progressTicks; track tick) {
            <span class="text-[10px] font-mono text-text-muted/40">{{ tick }}%</span>
          }
        </div>
      </section>

      <!-- ─── 2. Container Scroll ─── -->
      <section class="bg-surface-1 rounded-demo p-6 border border-border">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="font-display text-lg font-semibold text-text-primary">
              Container Scroll
            </h2>
            <p class="text-sm text-text-secondary mt-0.5">
              Tracking scroll inside a bounded container
            </p>
          </div>
          <p class="text-sm text-text-muted font-mono tabular-nums">
            {{ containerPercent() }}%
          </p>
        </div>

        <div class="flex gap-3">
          <!-- Vertical progress rail -->
          <div class="relative w-1.5 rounded-full bg-surface-0/70 shrink-0 self-stretch overflow-hidden">
            <div
              class="absolute inset-x-0 top-0 rounded-full bg-gradient-to-b from-accent-purple to-accent-amber"
              [style.height.%]="containerPercent()"
            ></div>
          </div>

          <!-- Scrollable container -->
          <div
            class="h-64 flex-1 overflow-y-auto rounded-demo bg-surface-0/50 scroll-smooth"
            (scroll)="onContainerScroll($event)"
          >
            <div class="p-4 space-y-3">
              @for (block of containerBlocks; track block.id) {
                <div
                  class="rounded-lg p-4 border border-border/50"
                  [class]="block.bg"
                >
                  <p class="text-xs font-mono text-white/70 mb-1">Block {{ block.id }}</p>
                  <p class="text-sm text-white/90 font-medium">{{ block.label }}</p>
                </div>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- ─── 3. Scroll-Triggered Reveal ─── -->
      <section class="bg-surface-1 rounded-demo p-6 border border-border">
        <div class="mb-4">
          <h2 class="font-display text-lg font-semibold text-text-primary">
            Scroll-Triggered Reveal
          </h2>
          <p class="text-sm text-text-secondary mt-0.5">
            whileInView + viewport once &mdash; staggered card entrance
          </p>
        </div>

        <div class="h-80 overflow-y-auto rounded-demo bg-surface-0/50 scroll-smooth">
          <div class="p-4 space-y-4 pt-24 pb-32">
            @for (card of revealCards; track card.label; let i = $index) {
              <div
                ngmMotion
                [initial]="{ opacity: 0, y: 40, scale: 0.92 }"
                [whileInView]="{ opacity: 1, y: 0, scale: 1 }"
                [viewport]="viewportOnce"
                [transition]="{
                  duration: 0.5,
                  delay: card.delay,
                  ease: [0.22, 1, 0.36, 1]
                }"
                class="flex items-center gap-4 rounded-lg border border-border/50 p-4"
                [class]="card.colorFrom"
              >
                <div
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg"
                  [class]="card.colorTo"
                >
                  {{ card.icon }}
                </div>
                <div>
                  <p class="text-sm font-semibold text-white/90">{{ card.label }}</p>
                  <p class="text-xs text-white/50 font-mono">delay: {{ card.delay }}s</p>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- ─── 4. Parallax Layers ─── -->
      <section class="bg-surface-1 rounded-demo p-6 border border-border lg:col-span-2">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="font-display text-lg font-semibold text-text-primary">
              Parallax Layers
            </h2>
            <p class="text-sm text-text-secondary mt-0.5">
              useTransform maps scroll progress to different layer speeds for depth
            </p>
          </div>
          <p class="text-sm text-text-muted font-mono tabular-nums">
            y: {{ parallaxDebug() }}
          </p>
        </div>

        <!-- Parallax viewport -->
        <div
          class="relative h-96 overflow-y-auto rounded-demo bg-surface-0/50"
          (scroll)="onParallaxScroll($event)"
        >
          <!-- Tall inner to create scroll room -->
          <div class="relative h-[900px] overflow-hidden">

            <!-- Layer 0: Slowest — large background shapes -->
            <div
              class="absolute inset-x-0 top-0 h-full pointer-events-none"
              [style.transform]="'translateY(' + parallaxLayer0() + 'px)'"
            >
              <!-- Large diffuse circle -->
              <div
                class="absolute top-20 left-[10%] w-64 h-64 rounded-full opacity-[0.07]"
                style="background: radial-gradient(circle, var(--color-accent-cyan) 0%, transparent 70%)"
              ></div>
              <div
                class="absolute top-[400px] right-[8%] w-80 h-80 rounded-full opacity-[0.06]"
                style="background: radial-gradient(circle, var(--color-accent-purple) 0%, transparent 70%)"
              ></div>
              <div
                class="absolute top-[650px] left-[30%] w-56 h-56 rounded-full opacity-[0.05]"
                style="background: radial-gradient(circle, var(--color-accent-amber) 0%, transparent 70%)"
              ></div>
            </div>

            <!-- Layer 1: Medium speed — geometric shapes -->
            <div
              class="absolute inset-x-0 top-0 h-full pointer-events-none"
              [style.transform]="'translateY(' + parallaxLayer1() + 'px)'"
            >
              <div
                class="absolute top-32 left-[15%] w-20 h-20 rounded-xl rotate-12 border-2 border-accent-cyan/20 bg-accent-cyan/5"
              ></div>
              <div
                class="absolute top-56 right-[20%] w-16 h-16 rounded-full border-2 border-accent-purple/25 bg-accent-purple/5"
              ></div>
              <div
                class="absolute top-[320px] left-[55%] w-24 h-24 rotate-45 border-2 border-accent-amber/20 bg-accent-amber/5"
              ></div>
              <div
                class="absolute top-[480px] left-[25%] w-14 h-14 rounded-lg -rotate-12 border-2 border-accent-cyan/15 bg-accent-cyan/5"
              ></div>
              <div
                class="absolute top-[600px] right-[15%] w-20 h-20 rounded-xl rotate-6 border-2 border-accent-purple/20 bg-accent-purple/5"
              ></div>
              <div
                class="absolute top-[750px] left-[40%] w-16 h-16 rounded-full border-2 border-accent-amber/15 bg-accent-amber/5"
              ></div>
            </div>

            <!-- Layer 2: Faster — small accents -->
            <div
              class="absolute inset-x-0 top-0 h-full pointer-events-none"
              [style.transform]="'translateY(' + parallaxLayer2() + 'px)'"
            >
              <div
                class="absolute top-24 left-[40%] w-3 h-3 rounded-full bg-accent-cyan/40"
              ></div>
              <div
                class="absolute top-48 right-[30%] w-2 h-2 rounded-full bg-accent-purple/50"
              ></div>
              <div
                class="absolute top-72 left-[70%] w-4 h-4 rounded-full bg-accent-amber/35"
              ></div>
              <div
                class="absolute top-[200px] left-[20%] w-2 h-2 rounded-full bg-accent-cyan/30"
              ></div>
              <div
                class="absolute top-[340px] right-[40%] w-3 h-3 rounded-full bg-accent-purple/40"
              ></div>
              <div
                class="absolute top-[450px] left-[60%] w-2 h-2 rounded-full bg-accent-amber/30"
              ></div>
              <div
                class="absolute top-[550px] left-[35%] w-3 h-3 rounded-full bg-accent-cyan/35"
              ></div>
              <div
                class="absolute top-[700px] right-[25%] w-4 h-4 rounded-full bg-accent-purple/45"
              ></div>
            </div>

            <!-- Layer 3: Fastest — text labels floating -->
            <div
              class="absolute inset-x-0 top-0 h-full pointer-events-none"
              [style.transform]="'translateY(' + parallaxLayer3() + 'px)'"
            >
              <div class="absolute top-40 left-[12%]">
                <span class="font-mono text-[10px] text-accent-cyan/30 tracking-widest uppercase">scroll</span>
              </div>
              <div class="absolute top-[280px] right-[10%]">
                <span class="font-mono text-[10px] text-accent-purple/25 tracking-widest uppercase">motion</span>
              </div>
              <div class="absolute top-[520px] left-[50%]">
                <span class="font-mono text-[10px] text-accent-amber/25 tracking-widest uppercase">depth</span>
              </div>
              <div class="absolute top-[700px] left-[18%]">
                <span class="font-mono text-[10px] text-accent-cyan/20 tracking-widest uppercase">layers</span>
              </div>
            </div>

            <!-- Center focal content cards that appear at different scroll depths -->
            <div class="absolute inset-x-0 top-0 h-full flex flex-col items-center justify-start pt-8 gap-40 pointer-events-none">
              <div
                ngmMotion
                [initial]="{ opacity: 0, scale: 0.85 }"
                [whileInView]="{ opacity: 1, scale: 1 }"
                [viewport]="viewportOnce"
                [transition]="{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }"
                class="px-6 py-4 rounded-xl border border-accent-cyan/20 bg-surface-1/80 backdrop-blur-md shadow-lg shadow-accent-cyan/5 pointer-events-auto"
              >
                <p class="font-display text-sm font-semibold text-accent-cyan">Near</p>
                <p class="text-xs text-text-muted font-mono mt-1">speed: 1.0x</p>
              </div>

              <div
                ngmMotion
                [initial]="{ opacity: 0, scale: 0.85 }"
                [whileInView]="{ opacity: 1, scale: 1 }"
                [viewport]="viewportOnce"
                [transition]="{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }"
                class="px-6 py-4 rounded-xl border border-accent-purple/20 bg-surface-1/80 backdrop-blur-md shadow-lg shadow-accent-purple/5 pointer-events-auto"
              >
                <p class="font-display text-sm font-semibold text-accent-purple">Mid</p>
                <p class="text-xs text-text-muted font-mono mt-1">speed: 0.6x</p>
              </div>

              <div
                ngmMotion
                [initial]="{ opacity: 0, scale: 0.85 }"
                [whileInView]="{ opacity: 1, scale: 1 }"
                [viewport]="viewportOnce"
                [transition]="{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }"
                class="px-6 py-4 rounded-xl border border-accent-amber/20 bg-surface-1/80 backdrop-blur-md shadow-lg shadow-accent-amber/5 pointer-events-auto"
              >
                <p class="font-display text-sm font-semibold text-accent-amber">Far</p>
                <p class="text-xs text-text-muted font-mono mt-1">speed: 0.3x</p>
              </div>

              <div
                ngmMotion
                [initial]="{ opacity: 0, y: 20 }"
                [whileInView]="{ opacity: 1, y: 0 }"
                [viewport]="viewportOnce"
                [transition]="{ duration: 0.5, delay: 0.1 }"
                class="px-6 py-3 rounded-xl border border-border/40 bg-surface-1/60 backdrop-blur-sm pointer-events-auto"
              >
                <p class="font-mono text-xs text-text-muted text-center">end of parallax</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class ScrollPage {
  // ── Shared ──
  readonly viewportOnce: ViewportOptions = { once: true, amount: 0.3 };

  // ── 1. Scroll Progress Bar ──
  readonly progressTicks = [0, 25, 50, 75, 100];
  readonly scrollPercent = signal(0);
  readonly smoothScrollPercent = signal(0);

  private readonly pageScroll = useScroll();
  private readonly smoothProgress = useSpring(this.pageScroll.scrollYProgress, {
    stiffness: 100,
    damping: 30,
  });

  // ── 2. Container Scroll ──
  readonly containerPercent = signal(0);

  readonly containerBlocks = [
    { id: 1, label: 'Scroll tracking begins', bg: 'bg-gradient-to-br from-accent-cyan/20 to-accent-cyan/5' },
    { id: 2, label: 'MotionValues update live', bg: 'bg-gradient-to-br from-accent-purple/20 to-accent-purple/5' },
    { id: 3, label: 'Progress maps 0 to 1', bg: 'bg-gradient-to-br from-accent-amber/20 to-accent-amber/5' },
    { id: 4, label: 'Smooth spring physics', bg: 'bg-gradient-to-br from-accent-cyan/15 to-accent-purple/5' },
    { id: 5, label: 'Zero requestAnimationFrame', bg: 'bg-gradient-to-br from-accent-purple/15 to-accent-amber/5' },
    { id: 6, label: 'Container-scoped tracking', bg: 'bg-gradient-to-br from-accent-amber/15 to-accent-cyan/5' },
    { id: 7, label: 'Declarative and reactive', bg: 'bg-gradient-to-br from-accent-cyan/20 to-accent-amber/5' },
    { id: 8, label: 'Powered by motion-dom', bg: 'bg-gradient-to-br from-accent-purple/20 to-accent-cyan/5' },
  ];

  // ── 3. Scroll-Triggered Reveal ──
  readonly revealCards: RevealCard[] = [
    { icon: '\u25B3', label: 'Geometry', colorFrom: 'bg-accent-cyan/10', colorTo: 'bg-accent-cyan/20', delay: 0 },
    { icon: '\u2B21', label: 'Hexagonal', colorFrom: 'bg-accent-purple/10', colorTo: 'bg-accent-purple/20', delay: 0.05 },
    { icon: '\u25C7', label: 'Diamond', colorFrom: 'bg-accent-amber/10', colorTo: 'bg-accent-amber/20', delay: 0.1 },
    { icon: '\u25CB', label: 'Circular', colorFrom: 'bg-accent-cyan/10', colorTo: 'bg-accent-cyan/20', delay: 0.05 },
    { icon: '\u25A1', label: 'Rectangular', colorFrom: 'bg-accent-purple/10', colorTo: 'bg-accent-purple/20', delay: 0 },
    { icon: '\u2606', label: 'Stellar', colorFrom: 'bg-accent-amber/10', colorTo: 'bg-accent-amber/20', delay: 0.05 },
    { icon: '\u2B22', label: 'Polygon', colorFrom: 'bg-accent-cyan/10', colorTo: 'bg-accent-cyan/20', delay: 0.1 },
    { icon: '\u25CE', label: 'Bullseye', colorFrom: 'bg-accent-purple/10', colorTo: 'bg-accent-purple/20', delay: 0.05 },
  ];

  // ── 4. Parallax Layers ──
  readonly parallaxLayer0 = signal(0);
  readonly parallaxLayer1 = signal(0);
  readonly parallaxLayer2 = signal(0);
  readonly parallaxLayer3 = signal(0);
  readonly parallaxDebug = signal('0 / 0 / 0 / 0');

  // useTransform for page-level parallax (demos 1 & 4 share page scroll)
  private readonly parallaxSlow = useTransform(this.pageScroll.scrollYProgress, [0, 1], [0, -60]);
  private readonly parallaxMed = useTransform(this.pageScroll.scrollYProgress, [0, 1], [0, -130]);
  private readonly parallaxFast = useTransform(this.pageScroll.scrollYProgress, [0, 1], [0, -220]);
  private readonly parallaxFastest = useTransform(this.pageScroll.scrollYProgress, [0, 1], [0, -320]);

  constructor() {
    // Bridge page scroll MotionValues to signals
    this.pageScroll.scrollYProgress.on('change', (v: number) => {
      this.scrollPercent.set(Math.round(v * 100));
    });

    this.smoothProgress.on('change', (v: number) => {
      this.smoothScrollPercent.set(Math.round(v * 100));
    });

    // Bridge parallax transforms to signals
    this.parallaxSlow.on('change', (v: number) => {
      this.parallaxLayer0.set(Math.round(v));
    });
    this.parallaxMed.on('change', (v: number) => {
      this.parallaxLayer1.set(Math.round(v));
    });
    this.parallaxFast.on('change', (v: number) => {
      this.parallaxLayer2.set(Math.round(v));
    });
    this.parallaxFastest.on('change', (v: number) => {
      this.parallaxLayer3.set(Math.round(v));
      this.parallaxDebug.set(
        `${this.parallaxLayer0()} / ${this.parallaxLayer1()} / ${this.parallaxLayer2()} / ${Math.round(v)}`
      );
    });
  }

  // ── 2. Container scroll handler ──
  onContainerScroll(event: Event): void {
    const el = event.target as HTMLElement;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll > 0) {
      this.containerPercent.set(Math.round((el.scrollTop / maxScroll) * 100));
    }
  }

  // ── 4. Parallax container scroll handler ──
  onParallaxScroll(event: Event): void {
    const el = event.target as HTMLElement;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll <= 0) return;
    const progress = el.scrollTop / maxScroll;

    // Local parallax within the container at different speeds
    this.parallaxLayer0.set(Math.round(progress * -50));
    this.parallaxLayer1.set(Math.round(progress * -120));
    this.parallaxLayer2.set(Math.round(progress * -200));
    this.parallaxLayer3.set(Math.round(progress * -290));
    this.parallaxDebug.set(
      `${this.parallaxLayer0()} / ${this.parallaxLayer1()} / ${this.parallaxLayer2()} / ${this.parallaxLayer3()}`
    );
  }
}
