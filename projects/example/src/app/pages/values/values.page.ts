import { Component, signal, type ElementRef, viewChild } from '@angular/core';
import {
  NgmMotionDirective,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  useCycle,
  useTime,
  useReducedMotion,
  useAnimationFrame,
  type MotionValue,
} from '@scripttype/ng-motion';

@Component({
  selector: 'app-values-page',
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
          Reactive Primitives
        </p>
        <h1
          class="font-display text-4xl font-extrabold bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent"
        >
          Values & Hooks
        </h1>
        <p class="mt-3 text-sm text-text-secondary max-w-xl leading-relaxed">
          Motion values, spring physics, derived transforms, template strings,
          state cycling, accessibility detection, and frame-level control.
        </p>
      </div>
    </header>

    <!-- Grid of demos -->
    <div class="grid gap-6 lg:grid-cols-2">

      <!-- 1. useSpring -->
      <section class="bg-surface-1 rounded-demo p-6 border border-border">
        <div class="mb-4">
          <h2 class="font-display text-lg font-semibold text-text-primary">useSpring</h2>
          <p class="text-sm text-text-secondary mt-0.5">
            Raw value vs spring-smoothed value from a slider
          </p>
        </div>
        <div class="mb-4">
          <input
            type="range"
            min="0"
            max="200"
            [value]="springSlider()"
            (input)="onSpringSlider($event)"
            class="w-full accent-accent-cyan"
          />
        </div>
        <div class="space-y-3 bg-surface-0/50 rounded-demo p-4">
          <div>
            <p class="text-xs text-text-muted mb-1">Raw</p>
            <div class="h-3 rounded-full bg-surface-2 overflow-hidden">
              <div
                class="h-full rounded-full bg-accent-cyan/60 transition-none"
                [style.width.px]="springSlider()"
              ></div>
            </div>
          </div>
          <div>
            <p class="text-xs text-text-muted mb-1">Spring</p>
            <div class="h-3 rounded-full bg-surface-2 overflow-hidden">
              <div
                class="h-full rounded-full bg-accent-cyan transition-none"
                [style.width.px]="springValue()"
              ></div>
            </div>
          </div>
        </div>
        <p class="text-sm text-text-muted font-mono tabular-nums mt-3 text-center">
          raw: {{ springSlider() }} · spring: {{ springValue().toFixed(1) }}
        </p>
      </section>

      <!-- 2. useTransform Range -->
      <section class="bg-surface-1 rounded-demo p-6 border border-border">
        <div class="mb-4">
          <h2 class="font-display text-lg font-semibold text-text-primary">useTransform Range</h2>
          <p class="text-sm text-text-secondary mt-0.5">
            Drag X maps to opacity and background color
          </p>
        </div>
        <div class="flex items-center justify-center h-48 bg-surface-0/50 rounded-demo overflow-hidden">
          <div
            ngmMotion
            [style]="{ x: dragX, opacity: dragOpacity, backgroundColor: dragColor }"
            [drag]="'x'"
            [dragX]="dragX"
            [dragConstraints]="{ left: -150, right: 150, top: 0, bottom: 0 }"
            [dragElastic]="0.1"
            [whileTap]="{ scale: 0.95 }"
            class="w-20 h-20 rounded-demo cursor-grab active:cursor-grabbing flex items-center justify-center text-white text-sm font-medium select-none shadow-lg"
          >
            Drag
          </div>
        </div>
        <p class="text-sm text-text-muted font-mono tabular-nums mt-3 text-center">
          x: {{ dragXSig().toFixed(0) }} · opacity: {{ dragOpSig().toFixed(2) }}
        </p>
      </section>

      <!-- 3. useTransform Function (Lissajous) -->
      <section class="bg-surface-1 rounded-demo p-6 border border-border">
        <div class="mb-4">
          <h2 class="font-display text-lg font-semibold text-text-primary">useTransform Function</h2>
          <p class="text-sm text-text-secondary mt-0.5">
            useTime() driving a Lissajous curve via transform functions
          </p>
        </div>
        <div class="relative flex items-center justify-center h-48 bg-surface-0/50 rounded-demo overflow-hidden">
          <!-- Crosshair guides -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="w-px h-full bg-border"></div>
          </div>
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="h-px w-full bg-border"></div>
          </div>
          <div
            ngmMotion
            [style]="{ x: lissX, y: lissY }"
            class="w-4 h-4 rounded-full bg-accent-purple shadow-lg shadow-accent-purple/40"
          ></div>
        </div>
        <p #lissajousReadout class="text-sm text-text-muted font-mono tabular-nums mt-3 text-center">
          t: 0.0s · x: 0 · y: 0
        </p>
      </section>

      <!-- 4. useMotionTemplate -->
      <section class="bg-surface-1 rounded-demo p-6 border border-border">
        <div class="mb-4">
          <h2 class="font-display text-lg font-semibold text-text-primary">useMotionTemplate</h2>
          <p class="text-sm text-text-secondary mt-0.5">
            Hue slider builds an HSL string in real time
          </p>
        </div>
        <div class="mb-4">
          <input
            type="range"
            min="0"
            max="360"
            [value]="hueSlider()"
            (input)="onHueSlider($event)"
            class="w-full accent-accent-amber"
          />
        </div>
        <div class="flex items-center justify-center h-36 bg-surface-0/50 rounded-demo">
          <div
            ngmMotion
            [style]="{ backgroundColor: hslString }"
            class="w-32 h-32 rounded-demo shadow-lg transition-none"
          ></div>
        </div>
        <p class="text-sm text-text-muted font-mono tabular-nums mt-3 text-center">
          {{ hslStringSig() }}
        </p>
      </section>

      <!-- 5. useCycle -->
      <section class="bg-surface-1 rounded-demo p-6 border border-border">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="font-display text-lg font-semibold text-text-primary">useCycle</h2>
            <p class="text-sm text-text-secondary mt-0.5">
              Cycle through 4 transform states on each press
            </p>
          </div>
          <button
            (click)="cycleFn()"
            class="px-4 py-2 rounded-button bg-gradient-to-r from-accent-purple to-accent-cyan text-white font-medium text-sm"
          >
            Cycle
          </button>
        </div>
        <div class="flex items-center justify-center h-44 bg-surface-0/50 rounded-demo">
          <div
            ngmMotion
            [animate]="cycleState()"
            [transition]="{ type: 'spring', stiffness: 300, damping: 20 }"
            class="w-20 h-20 bg-gradient-to-br from-accent-purple to-accent-cyan rounded-demo shadow-lg shadow-accent-purple/20"
          ></div>
        </div>
        <p class="text-sm text-text-muted font-mono tabular-nums mt-3 text-center">
          state {{ cycleIndex() }}/4 · scale: {{ cycleState().scale }} · rotate: {{ cycleState().rotate }}
        </p>
      </section>

      <!-- 6. useReducedMotion -->
      <section class="bg-surface-1 rounded-demo p-6 border border-border">
        <div class="mb-4">
          <h2 class="font-display text-lg font-semibold text-text-primary">useReducedMotion</h2>
          <p class="text-sm text-text-secondary mt-0.5">
            Respects OS accessibility preference for reduced motion
          </p>
        </div>
        <div class="flex items-center justify-center h-44 bg-surface-0/50 rounded-demo">
          <div
            ngmMotion
            [animate]="reducedToggle()
              ? { scale: 1.3, rotate: 180, borderRadius: '50%' }
              : { scale: 1, rotate: 0, borderRadius: '12px' }"
            [transition]="prefersReduced()
              ? { duration: 0 }
              : { type: 'spring', stiffness: 260, damping: 15 }"
            class="w-20 h-20 bg-gradient-to-br from-accent-amber to-accent-amber/60 rounded-demo shadow-lg shadow-accent-amber/15 cursor-pointer"
            (click)="reducedToggle.set(!reducedToggle())"
          ></div>
        </div>
        <div class="mt-3 text-center">
          <p class="text-sm text-text-muted font-mono tabular-nums">
            prefers-reduced-motion: {{ prefersReduced() ? 'reduce' : 'no-preference' }}
          </p>
          <p class="text-xs text-text-muted mt-1">
            {{ prefersReduced() ? 'Animations snap instantly (duration: 0)' : 'Animations use spring physics' }}
            — click the box to toggle
          </p>
        </div>
      </section>

      <!-- 7. useAnimationFrame -->
      <section class="bg-surface-1 rounded-demo p-6 border border-border lg:col-span-2">
        <div class="mb-4">
          <h2 class="font-display text-lg font-semibold text-text-primary">useAnimationFrame</h2>
          <p class="text-sm text-text-secondary mt-0.5">
            Live clock, FPS counter, and frame delta updated directly from the frame loop
          </p>
        </div>
        <div class="grid grid-cols-3 gap-4 bg-surface-0/50 rounded-demo p-6">
          <!-- Clock -->
          <div class="text-center">
            <p class="text-xs text-text-muted mb-2 uppercase tracking-wider">Clock</p>
            <p #clockReadout class="font-mono text-2xl font-bold text-text-primary tabular-nums">
              00:00:00.000
            </p>
          </div>
          <!-- FPS -->
          <div class="text-center">
            <p class="text-xs text-text-muted mb-2 uppercase tracking-wider">FPS</p>
            <p #fpsReadout class="font-mono text-2xl font-bold tabular-nums text-accent-cyan">
              60
            </p>
          </div>
          <!-- Delta -->
          <div class="text-center">
            <p class="text-xs text-text-muted mb-2 uppercase tracking-wider">Frame Delta</p>
            <p #deltaReadout class="font-mono text-2xl font-bold text-accent-purple tabular-nums">
              16.6ms
            </p>
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
export class ValuesPage {
  // ── 1. useSpring ──
  private readonly rawMV: MotionValue<number>;
  private readonly springMV: MotionValue<number>;
  springSlider = signal(100);
  springValue = signal(100);

  // ── 2. useTransform Range ──
  readonly dragX: MotionValue<number>;
  readonly dragOpacity: MotionValue<number>;
  readonly dragColor: MotionValue<string>;
  dragXSig = signal(0);
  dragOpSig = signal(0.6);

  // ── 3. useTransform Function (Lissajous) ──
  private readonly timeMV: MotionValue<number>;
  readonly lissX: MotionValue<number>;
  readonly lissY: MotionValue<number>;
  private readonly timeOrigin: number;

  // ── 4. useMotionTemplate ──
  private readonly hueMV: MotionValue<number>;
  readonly hslString: MotionValue<string>;
  hueSlider = signal(200);
  hslStringSig = signal('hsl(200, 80%, 60%)');

  private readonly lissajousReadoutRef = viewChild<ElementRef<HTMLElement>>('lissajousReadout');
  private readonly clockReadoutRef = viewChild<ElementRef<HTMLElement>>('clockReadout');
  private readonly fpsReadoutRef = viewChild<ElementRef<HTMLElement>>('fpsReadout');
  private readonly deltaReadoutRef = viewChild<ElementRef<HTMLElement>>('deltaReadout');

  // ── 5. useCycle ──
  readonly cycleState: ReturnType<typeof useCycle<{ scale: number; rotate: number }>>[0];
  readonly cycleFn: () => void;
  cycleIndex = signal(1);
  private cycleCount = 0;

  // ── 6. useReducedMotion ──
  readonly prefersReduced;
  reducedToggle = signal(false);

  // ── 7. useAnimationFrame ──
  private fpsFrames = 0;
  private latestFps = 60;
  private fpsLastTime = 0;

  constructor() {
    // 1. useSpring
    this.rawMV = useMotionValue(100);
    this.springMV = useSpring(this.rawMV, { stiffness: 300, damping: 25 });
    this.springMV.on('change', (v: number) => this.springValue.set(v));

    // 2. useTransform Range (drag)
    this.dragX = useMotionValue(0);
    this.dragOpacity = useTransform(this.dragX, [-150, 0, 150], [0.2, 0.6, 1]);
    this.dragColor = useTransform(
      this.dragX,
      [-150, 0, 150],
      ['#06b6d4', '#7c3aed', '#f59e0b'],
    );
    this.dragX.on('change', (v: number) => this.dragXSig.set(v));
    this.dragOpacity.on('change', (v: number) => this.dragOpSig.set(v));

    // 3. useTransform Function (Lissajous)
    this.timeMV = useTime();
    this.timeOrigin = this.timeMV.get();
    this.lissX = useTransform(this.timeMV, (t: number) => Math.sin((t - this.timeOrigin) * 0.001) * 80);
    this.lissY = useTransform(this.timeMV, (t: number) => Math.sin((t - this.timeOrigin) * 0.0013) * 80);

    // 4. useMotionTemplate
    this.hueMV = useMotionValue(200);
    // Build template as tagged template literal via the spread form
    const strings = Object.assign(['hsl(', ', 80%, 60%)'], { raw: ['hsl(', ', 80%, 60%)'] }) as unknown as TemplateStringsArray;
    this.hslString = useMotionTemplate(strings, this.hueMV);
    this.hslString.on('change', (v: string) => this.hslStringSig.set(v));

    // 5. useCycle
    const [state, cycle] = useCycle(
      { scale: 1, rotate: 0 },
      { scale: 1.5, rotate: 90 },
      { scale: 1, rotate: 180 },
      { scale: 1.5, rotate: 270 },
    );
    this.cycleState = state;
    this.cycleFn = () => {
      cycle();
      this.cycleCount = (this.cycleCount + 1) % 4;
      this.cycleIndex.set(this.cycleCount + 1);
    };

    // 6. useReducedMotion
    this.prefersReduced = useReducedMotion();

    // 7. useAnimationFrame
    this.fpsLastTime = performance.now();
    useAnimationFrame((time: number, delta: number) => {
      this.fpsFrames++;
      const elapsed = time - this.fpsLastTime;
      if (elapsed >= 500) {
        this.latestFps = (this.fpsFrames / elapsed) * 1000;
        this.fpsFrames = 0;
        this.fpsLastTime = time;
      }

      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      const ms = String(now.getMilliseconds()).padStart(3, '0');

      const clockEl = this.clockReadoutRef()?.nativeElement;
      if (clockEl) {
        clockEl.textContent = `${h}:${m}:${s}.${ms}`;
      }

      const fpsEl = this.fpsReadoutRef()?.nativeElement;
      if (fpsEl) {
        fpsEl.textContent = this.latestFps.toFixed(0);
        fpsEl.className =
          this.latestFps >= 55
            ? 'font-mono text-2xl font-bold tabular-nums text-accent-cyan'
            : this.latestFps >= 30
              ? 'font-mono text-2xl font-bold tabular-nums text-accent-amber'
              : 'font-mono text-2xl font-bold tabular-nums text-red-400';
      }

      const deltaEl = this.deltaReadoutRef()?.nativeElement;
      if (deltaEl) {
        deltaEl.textContent = `${delta.toFixed(1)}ms`;
      }

      const lissajousEl = this.lissajousReadoutRef()?.nativeElement;
      if (lissajousEl) {
        lissajousEl.textContent =
          `t: ${((this.timeMV.get() - this.timeOrigin) / 1000).toFixed(1)}s` +
          ` · x: ${this.lissX.get().toFixed(0)}` +
          ` · y: ${this.lissY.get().toFixed(0)}`;
      }
    });
  }

  onSpringSlider(event: Event): void {
    const val = +(event.target as HTMLInputElement).value;
    this.springSlider.set(val);
    this.rawMV.set(val);
  }

  onHueSlider(event: Event): void {
    const val = +(event.target as HTMLInputElement).value;
    this.hueSlider.set(val);
    this.hueMV.set(val);
  }
}
