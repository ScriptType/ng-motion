import { Component, signal, type WritableSignal, type ElementRef, viewChild, afterNextRender } from '@angular/core';
import {
  NgmMotionDirective,
  useMotionValue,
  useAnimate,
  animate,
  type Variants,
  type MotionValue,
  type ScopedAnimate,
} from '@scripttype/ng-motion';

interface SpringPreset {
  label: string;
  stiffness: number;
  damping: number;
  color: string;
}

interface AnimState {
  label: string;
  scale?: number;
  rotate?: number;
  x?: number;
}

@Component({
  selector: 'app-basics-page',
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
          Fundamentals
        </p>
        <h1
          class="font-display text-4xl font-extrabold bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent"
        >
          Basics
        </h1>
        <p class="mt-3 text-sm text-text-secondary max-w-xl leading-relaxed">
          Core animation primitives: declarative transitions, spring physics, keyframes,
          variant orchestration, signal-driven state, sequences, and imperative control.
        </p>
      </div>
    </header>

    <!-- Grid of demos -->
    <div class="grid gap-6 lg:grid-cols-2">

      <!-- ─── 1. Fade In ─── -->
      <section class="bg-surface-1 rounded-demo p-6 border border-border">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="font-display text-lg font-semibold text-text-primary">Fade In</h2>
            <p class="text-sm text-text-secondary mt-0.5">initial + animate with opacity and y</p>
          </div>
          <button
            (click)="replayFade()"
            class="px-4 py-2 rounded-button bg-surface-2 text-text-secondary border border-border text-sm hover:border-border-hover transition-colors"
          >
            Replay
          </button>
        </div>
        <div class="flex items-center justify-center h-40 bg-surface-0/50 rounded-demo">
          @if (fadeVisible()) {
            <div
              ngmMotion
              [initial]="{ opacity: 0, y: 30 }"
              [animate]="{ opacity: 1, y: 0 }"
              [transition]="{ duration: 0.6, ease: 'easeOut' }"
              class="bg-gradient-to-br from-accent-cyan to-accent-cyan/60 rounded-demo px-8 py-4 text-white font-medium text-sm shadow-lg shadow-accent-cyan/10"
            >
              Hello, motion
            </div>
          }
        </div>
      </section>

      <!-- ─── 2. Spring Physics ─── -->
      <section class="bg-surface-1 rounded-demo p-6 border border-border">
        <div class="mb-4">
          <h2 class="font-display text-lg font-semibold text-text-primary">Spring Physics</h2>
          <p class="text-sm text-text-secondary mt-0.5">Three presets: bouncy, smooth, stiff</p>
        </div>
        <div class="flex gap-2 mb-4">
          @for (preset of springPresets; track preset.label) {
            <button
              (click)="activeSpring.set(preset)"
              [class]="
                'px-4 py-2 rounded-button text-sm font-medium transition-colors ' +
                (activeSpring().label === preset.label
                  ? 'bg-gradient-to-r from-accent-purple to-accent-purple/80 text-white'
                  : 'bg-surface-2 text-text-secondary border border-border hover:border-border-hover')
              "
            >
              {{ preset.label }}
            </button>
          }
        </div>
        <div class="flex items-center justify-center h-40 bg-surface-0/50 rounded-demo">
          <div
            ngmMotion
            [animate]="{
              scale: activeSpring().label === 'bouncy' ? 1.3 : activeSpring().label === 'smooth' ? 1.15 : 1.25,
              rotate: activeSpring().label === 'bouncy' ? 20 : activeSpring().label === 'smooth' ? -15 : 10,
              borderRadius: activeSpring().label === 'smooth' ? '50%' : '12px'
            }"
            [transition]="{
              type: 'spring',
              stiffness: activeSpring().stiffness,
              damping: activeSpring().damping
            }"
            [whileHover]="{ scale: 1.4, rotate: 0 }"
            [whileTap]="{ scale: 0.9 }"
            class="w-20 h-20 bg-gradient-to-br from-accent-purple to-accent-purple/60 rounded-demo cursor-pointer shadow-lg shadow-accent-purple/15"
          ></div>
        </div>
        <p class="text-sm text-text-muted font-mono tabular-nums mt-3 text-center">
          stiffness: {{ activeSpring().stiffness }} · damping: {{ activeSpring().damping }}
        </p>
      </section>

      <!-- ─── 3. Keyframes ─── -->
      <section class="bg-surface-1 rounded-demo p-6 border border-border">
        <div class="mb-4">
          <h2 class="font-display text-lg font-semibold text-text-primary">Keyframes</h2>
          <p class="text-sm text-text-secondary mt-0.5">Multi-step x animation with infinite repeat</p>
        </div>
        <div class="flex items-center justify-center h-40 bg-surface-0/50 rounded-demo">
          <div
            ngmMotion
            [animate]="{ x: [0, 50, -50, 0] }"
            [transition]="{
              duration: 2,
              ease: 'easeInOut',
              repeat: inf,
              repeatDelay: 0.5
            }"
            class="w-14 h-14 bg-gradient-to-br from-accent-amber to-accent-amber/60 rounded-demo shadow-lg shadow-accent-amber/15"
          ></div>
        </div>
        <p class="text-sm text-text-muted font-mono tabular-nums mt-3 text-center">
          x: [0, 50, -50, 0] · repeat: Infinity
        </p>
      </section>

      <!-- ─── 4. Variant Orchestration ─── -->
      <section class="bg-surface-1 rounded-demo p-6 border border-border">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="font-display text-lg font-semibold text-text-primary">Variant Orchestration</h2>
            <p class="text-sm text-text-secondary mt-0.5">Parent-child stagger with delayChildren</p>
          </div>
          <button
            (click)="variantsShown.set(!variantsShown())"
            [class]="
              'px-4 py-2 rounded-button text-sm font-medium transition-colors ' +
              (variantsShown()
                ? 'bg-gradient-to-r from-accent-cyan to-accent-purple text-white'
                : 'bg-surface-2 text-text-secondary border border-border hover:border-border-hover')
            "
          >
            {{ variantsShown() ? 'Hide' : 'Show' }}
          </button>
        </div>
        <div
          ngmMotion
          [initial]="'hidden'"
          [animate]="variantsShown() ? 'visible' : 'hidden'"
          [variants]="parentVariants"
          class="flex flex-col gap-2 h-40 justify-center bg-surface-0/50 rounded-demo px-6"
        >
          @for (i of staggerItems; track i) {
            <div
              ngmMotion
              [variants]="childVariants"
              class="h-7 rounded-md bg-gradient-to-r from-accent-cyan/80 to-accent-purple/40"
              [style.width]="(40 + i * 12) + '%'"
            ></div>
          }
        </div>
      </section>

      <!-- ─── 5. Signal-Driven ─── -->
      <section class="bg-surface-1 rounded-demo p-6 border border-border">
        <div class="mb-4">
          <h2 class="font-display text-lg font-semibold text-text-primary">Signal-Driven</h2>
          <p class="text-sm text-text-secondary mt-0.5">Reactive state object drives animation</p>
        </div>
        <div class="flex flex-wrap gap-2 mb-4">
          @for (state of animStates; track state.label) {
            <button
              (click)="activeAnimState.set(state)"
              [class]="
                'px-4 py-2 rounded-button text-sm font-medium transition-colors ' +
                (activeAnimState().label === state.label
                  ? 'bg-gradient-to-r from-accent-amber to-accent-amber/80 text-surface-0'
                  : 'bg-surface-2 text-text-secondary border border-border hover:border-border-hover')
              "
            >
              {{ state.label }}
            </button>
          }
        </div>
        <div class="flex items-center justify-center h-40 bg-surface-0/50 rounded-demo">
          <div
            ngmMotion
            [animate]="{
              scale: activeAnimState().scale ?? 1,
              rotate: activeAnimState().rotate ?? 0,
              x: activeAnimState().x ?? 0
            }"
            [transition]="{ type: 'spring', stiffness: 300, damping: 22 }"
            [whileHover]="{ scale: (activeAnimState().scale ?? 1) + 0.1 }"
            [whileTap]="{ scale: (activeAnimState().scale ?? 1) - 0.1 }"
            class="w-16 h-16 bg-gradient-to-br from-accent-amber to-accent-amber/60 rounded-demo cursor-pointer shadow-lg shadow-accent-amber/15"
          ></div>
        </div>
        <p class="text-sm text-text-muted font-mono tabular-nums mt-3 text-center">
          {{ activeAnimState().label }} · scale: {{ activeAnimState().scale ?? 1 }} · rotate: {{ activeAnimState().rotate ?? 0 }} · x: {{ activeAnimState().x ?? 0 }}
        </p>
      </section>

      <!-- ─── 6. Stagger Sequence ─── -->
      <section class="bg-surface-1 rounded-demo p-6 border border-border">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="font-display text-lg font-semibold text-text-primary">Stagger Sequence</h2>
            <p class="text-sm text-text-secondary mt-0.5">animate() with cascading bars</p>
          </div>
          <button
            (click)="runStaggerSequence()"
            class="px-4 py-2 rounded-button bg-gradient-to-r from-accent-cyan to-accent-purple text-white font-medium text-sm"
          >
            Run
          </button>
        </div>
        <div class="flex flex-col gap-2 h-40 justify-center bg-surface-0/50 rounded-demo px-6">
          @for (bar of barSignals; track $index; let i = $index) {
            <div class="flex items-center gap-3">
              <div
                class="h-5 rounded-md"
                [class]="barColors[i]"
                [style.width.px]="bar()"
              ></div>
              <span class="text-xs font-mono text-text-muted tabular-nums w-10 text-right">
                {{ round(bar()) }}px
              </span>
            </div>
          }
        </div>
      </section>

      <!-- ─── 7. useAnimate Scope ─── -->
      <section class="bg-surface-1 rounded-demo p-6 border border-border lg:col-span-2">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="font-display text-lg font-semibold text-text-primary">useAnimate Scope</h2>
            <p class="text-sm text-text-secondary mt-0.5">Imperative animation sequence with status tracking</p>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-sm text-text-muted font-mono tabular-nums">
              {{ scopeStatus() }}
            </span>
            <button
              (click)="runScopeAnimation()"
              [disabled]="scopeRunning()"
              [class]="
                'px-4 py-2 rounded-button font-medium text-sm transition-colors ' +
                (scopeRunning()
                  ? 'bg-surface-3 text-text-muted cursor-not-allowed'
                  : 'bg-gradient-to-r from-accent-purple to-accent-cyan text-white')
              "
            >
              {{ scopeRunning() ? 'Running...' : 'Animate' }}
            </button>
          </div>
        </div>
        <div class="flex items-center justify-center h-48 bg-surface-0/50 rounded-demo">
          <div
            #scopeTarget
            class="w-24 h-24 bg-gradient-to-br from-accent-purple to-accent-cyan rounded-demo shadow-lg shadow-accent-purple/15 transition-none"
          ></div>
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
export class BasicsPage {
  // ── Infinity workaround for templates ──
  readonly inf = Infinity;

  // ── 1. Fade In ──
  fadeVisible = signal(true);

  replayFade(): void {
    this.fadeVisible.set(false);
    setTimeout(() => this.fadeVisible.set(true), 50);
  }

  round(v: number): number {
    return Math.round(v);
  }

  // ── 2. Spring Physics ──
  readonly springPresets: SpringPreset[] = [
    { label: 'bouncy', stiffness: 600, damping: 10, color: 'cyan' },
    { label: 'smooth', stiffness: 200, damping: 20, color: 'purple' },
    { label: 'stiff', stiffness: 400, damping: 40, color: 'amber' },
  ];
  activeSpring: WritableSignal<SpringPreset> = signal(this.springPresets[0]);

  // ── 3. Keyframes — uses `inf` field above ──

  // ── 4. Variant Orchestration ──
  variantsShown = signal(true);
  readonly staggerItems = [0, 1, 2, 3, 4];

  readonly parentVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  };

  readonly childVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  // ── 5. Signal-Driven ──
  readonly animStates: AnimState[] = [
    { label: 'expand', scale: 1.5 },
    { label: 'rotate', rotate: 180 },
    { label: 'move', x: 100 },
    { label: 'reset', scale: 1, rotate: 0, x: 0 },
  ];
  activeAnimState: WritableSignal<AnimState> = signal(this.animStates[3]);

  // ── 6. Stagger Sequence ──
  private readonly barMVs: MotionValue<number>[];
  readonly barSignals: WritableSignal<number>[];
  readonly barTargets: number[] = [160, 100, 190, 70, 140];
  readonly barColors = [
    'bg-accent-cyan',
    'bg-accent-purple',
    'bg-accent-amber',
    'bg-accent-cyan/70',
    'bg-accent-purple/70',
  ];

  // ── 7. useAnimate Scope ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- useAnimate returns a mutable scope object despite readonly type
  private readonly scopeRef: { current: HTMLElement; animations: any[] };
  private readonly scopedAnimate: ScopedAnimate;
  scopeStatus = signal('idle');
  scopeRunning = signal(false);
  private readonly scopeTargetRef = viewChild<ElementRef<HTMLElement>>('scopeTarget');

  constructor() {
    // Initialize motion values for stagger bars (injection context)
    this.barMVs = this.barTargets.map(() => useMotionValue(0));
    this.barSignals = this.barMVs.map((mv) => {
      const sig = signal(mv.get());
      mv.on('change', (v: number) => sig.set(v));
      return sig;
    });

    // Initialize useAnimate (injection context)
    const [scope, scopedAnimate] = useAnimate<HTMLElement>();
    // Cast to mutable — useAnimate internally creates a plain object with {current, animations}
    this.scopeRef = scope as { current: HTMLElement; animations: unknown[] };
    this.scopedAnimate = scopedAnimate;

    // Assign scope to the target element after render
    afterNextRender(() => {
      const el = this.scopeTargetRef();
      if (el) {
        this.scopeRef.current = el.nativeElement;
      }
    });
  }

  runStaggerSequence(): void {
    // Reset all bars to 0, then animate to targets
    for (const mv of this.barMVs) {
      mv.set(0);
    }
    for (let i = 0; i < this.barMVs.length; i++) {
      animate(this.barMVs[i], this.barTargets[i], {
        duration: 0.8,
        delay: i * 0.12,
        ease: [0.22, 1, 0.36, 1],
      });
    }
  }

  runScopeAnimation(): void {
    if (this.scopeRunning()) return;
    const el = this.scopeRef.current;
    if (!el) return;

    this.scopeRunning.set(true);

    const run = async (): Promise<void> => {
      this.scopeStatus.set('scaling up');
      await this.scopedAnimate(el, { scale: 1.4 }, { duration: 0.4, ease: [0.22, 1, 0.36, 1] })
        .finished;

      this.scopeStatus.set('rotating');
      await this.scopedAnimate(
        el,
        { rotate: 180 },
        { duration: 0.5, type: 'spring', stiffness: 200, damping: 15 },
      ).finished;

      this.scopeStatus.set('color shift');
      await this.scopedAnimate(
        el,
        { backgroundColor: '#f59e0b' },
        { duration: 0.4, ease: 'easeInOut' },
      ).finished;

      this.scopeStatus.set('resetting');
      await this.scopedAnimate(
        el,
        { scale: 1, rotate: 0, backgroundColor: '#7c3aed' },
        { duration: 0.6, type: 'spring', stiffness: 260, damping: 20 },
      ).finished;

      this.scopeStatus.set('idle');
      this.scopeRunning.set(false);
    };

    void run();
  }
}
