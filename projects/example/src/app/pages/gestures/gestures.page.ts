import { Component, signal } from '@angular/core';
import {
  NgmMotionDirective,
  useMotionValue,
  useVelocity,
  useTransform,
  useMotionTemplate,
} from 'ng-motion';
import type { MotionValue } from 'ng-motion';

@Component({
  selector: 'app-gestures-page',
  imports: [NgmMotionDirective],
  template: `
    <!-- Page header -->
    <section class="mb-14">
      <div
        ngmMotion
        [initial]="{ opacity: 0, y: 24 }"
        [animate]="{ opacity: 1, y: 0 }"
        [transition]="{ duration: 0.6, ease: 'easeOut' }"
      >
        <p class="mb-3 font-mono text-xs tracking-widest text-accent-purple uppercase">
          Interactive
        </p>
        <h1
          class="font-display text-4xl font-extrabold bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent"
        >
          Gestures
        </h1>
        <p class="mt-3 max-w-xl text-base leading-relaxed text-text-secondary">
          Hover, tap, focus, and drag interactions with spring physics,
          constraints, axis locking, and velocity tracking.
        </p>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- 1. Hover Effects -->
    <!-- ============================================ -->
    <section class="mb-12">
      <div class="mb-5">
        <h2 class="font-display text-lg font-semibold text-text-primary">Hover Effects</h2>
        <p class="mt-1 text-sm text-text-secondary">
          Three cards with distinct <code class="font-mono text-accent-cyan/80">whileHover</code> behaviors.
        </p>
      </div>
      <div class="bg-surface-1 rounded-demo p-6 border border-border">
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <!-- Card 1: Scale + shadow lift -->
          <div
            ngmMotion
            [whileHover]="{ scale: 1.05, y: -6, boxShadow: '0 20px 40px rgba(6,182,212,0.15)' }"
            [transition]="{ type: 'spring', stiffness: 400, damping: 25 }"
            (hoverStart)="hoverLabel.set('Scale + Lift')"
            (hoverEnd)="hoverLabel.set('Hover a card')"
            class="cursor-pointer bg-surface-2/50 backdrop-blur-xl rounded-card border border-border p-5 select-none"
          >
            <div
              class="mb-3 flex h-10 w-10 items-center justify-center rounded-demo bg-accent-cyan/10 text-lg text-accent-cyan"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
            </div>
            <p class="font-display text-sm font-semibold text-text-primary">Scale + Lift</p>
            <p class="mt-1 text-xs text-text-muted">Subtle upward float with cyan shadow bloom</p>
          </div>

          <!-- Card 2: Rotate + color shift -->
          <div
            ngmMotion
            [whileHover]="{ rotate: 3, scale: 1.02, backgroundColor: 'rgba(124,58,237,0.12)' }"
            [transition]="{ type: 'spring', stiffness: 300, damping: 20 }"
            (hoverStart)="hoverLabel.set('Rotate + Tint')"
            (hoverEnd)="hoverLabel.set('Hover a card')"
            class="cursor-pointer bg-surface-2/50 backdrop-blur-xl rounded-card border border-border p-5 select-none"
          >
            <div
              class="mb-3 flex h-10 w-10 items-center justify-center rounded-demo bg-accent-purple/10 text-lg text-accent-purple"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
            </div>
            <p class="font-display text-sm font-semibold text-text-primary">Rotate + Tint</p>
            <p class="mt-1 text-xs text-text-muted">Tilts with a purple background wash</p>
          </div>

          <!-- Card 3: Skew + border glow -->
          <div
            ngmMotion
            [whileHover]="{ skewX: -3, scale: 1.03, boxShadow: '0 0 0 1px rgba(245,158,11,0.4), 0 0 20px rgba(245,158,11,0.08)' }"
            [transition]="{ type: 'spring', stiffness: 350, damping: 22 }"
            (hoverStart)="hoverLabel.set('Skew + Glow')"
            (hoverEnd)="hoverLabel.set('Hover a card')"
            class="cursor-pointer bg-surface-2/50 backdrop-blur-xl rounded-card border border-border p-5 select-none"
          >
            <div
              class="mb-3 flex h-10 w-10 items-center justify-center rounded-demo bg-accent-amber/10 text-lg text-accent-amber"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
            </div>
            <p class="font-display text-sm font-semibold text-text-primary">Skew + Glow</p>
            <p class="mt-1 text-xs text-text-muted">Perspective skew with amber border glow</p>
          </div>
        </div>
        <p class="mt-4 text-sm text-text-muted font-mono tabular-nums text-center">
          {{ hoverLabel() }}
        </p>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- 2. Tap / Press -->
    <!-- ============================================ -->
    <section class="mb-12">
      <div class="mb-5">
        <h2 class="font-display text-lg font-semibold text-text-primary">Tap / Press</h2>
        <p class="mt-1 text-sm text-text-secondary">
          <code class="font-mono text-accent-cyan/80">whileTap</code> shrinks on press. Tap counter via signal.
        </p>
      </div>
      <div class="bg-surface-1 rounded-demo p-6 border border-border">
        <div class="flex flex-col items-center gap-6">
          <div
            ngmMotion
            [whileHover]="{ scale: 1.04 }"
            [whileTap]="{ scale: 0.92, borderRadius: '20px' }"
            [transition]="{ type: 'spring', stiffness: 500, damping: 30 }"
            (tap)="tapCount.set(tapCount() + 1)"
            class="flex h-28 w-56 cursor-pointer items-center justify-center rounded-card bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 border border-border-hover text-text-primary font-display text-base font-semibold select-none"
          >
            Press me
          </div>
          <div class="flex items-center gap-3">
            <p class="text-sm text-text-muted font-mono tabular-nums">
              tap count: {{ tapCount() }}
            </p>
            @if (tapCount() > 0) {
              <button
                (click)="tapCount.set(0)"
                class="px-3 py-1 rounded-button bg-surface-2 text-xs text-text-secondary border border-border hover:border-border-hover"
              >
                reset
              </button>
            }
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- 3. Focus -->
    <!-- ============================================ -->
    <section class="mb-12">
      <div class="mb-5">
        <h2 class="font-display text-lg font-semibold text-text-primary">Focus</h2>
        <p class="mt-1 text-sm text-text-secondary">
          <code class="font-mono text-accent-cyan/80">whileFocus</code> adds a cyan glow ring and subtle scale.
        </p>
      </div>
      <div class="bg-surface-1 rounded-demo p-6 border border-border">
        <div class="flex flex-col items-center gap-4">
          <div class="w-full max-w-sm">
            <label class="mb-2 block text-xs font-mono uppercase tracking-wider text-text-muted">
              Focus the input
            </label>
            <input
              ngmMotion
              [whileFocus]="{ scale: 1.03, boxShadow: '0 0 0 2px rgba(6,182,212,0.5), 0 0 24px rgba(6,182,212,0.12)' }"
              [transition]="{ type: 'spring', stiffness: 400, damping: 25 }"
              type="text"
              placeholder="Click or tab here..."
              class="w-full rounded-demo border border-border bg-surface-2 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/60 outline-none"
            />
          </div>
          <p class="text-xs text-text-muted">
            Try tabbing into the field to see the animated focus ring
          </p>
        </div>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- 4. Free Drag -->
    <!-- ============================================ -->
    <section class="mb-12">
      <div class="mb-5">
        <h2 class="font-display text-lg font-semibold text-text-primary">Free Drag</h2>
        <p class="mt-1 text-sm text-text-secondary">
          <code class="font-mono text-accent-cyan/80">drag</code> with
          <code class="font-mono text-accent-cyan/80">dragSnapToOrigin</code>.
          Drag the box anywhere and watch it spring back.
        </p>
      </div>
      <div class="bg-surface-1 rounded-demo p-6 border border-border">
        <div
          class="relative flex h-56 items-center justify-center rounded-demo border-2 border-dashed border-border bg-surface-1"
        >
          <div
            ngmMotion
            [drag]="true"
            [dragSnapToOrigin]="true"
            [whileDrag]="{ scale: 1.1, boxShadow: '0 16px 48px rgba(6,182,212,0.2)' }"
            [transition]="{ type: 'spring', stiffness: 300, damping: 20 }"
            (dragStart)="freeDragActive.set(true)"
            (dragEnd)="freeDragActive.set(false)"
            class="flex h-20 w-20 cursor-grab items-center justify-center rounded-card bg-gradient-to-br from-accent-cyan to-accent-purple text-sm font-bold text-white shadow-lg select-none touch-action-none active:cursor-grabbing"
          >
            Drag
          </div>
          <!-- Corner label -->
          <span class="absolute bottom-3 right-3 text-xs text-text-muted font-mono">
            {{ freeDragActive() ? 'dragging...' : '(snaps back)' }}
          </span>
        </div>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- 5. Constrained Drag -->
    <!-- ============================================ -->
    <section class="mb-12">
      <div class="mb-5">
        <h2 class="font-display text-lg font-semibold text-text-primary">Constrained Drag</h2>
        <p class="mt-1 text-sm text-text-secondary">
          <code class="font-mono text-accent-cyan/80">dragConstraints</code> confines movement within a boundary.
          Position tracked via MotionValue.
        </p>
      </div>
      <div class="bg-surface-1 rounded-demo p-6 border border-border">
        <div class="flex flex-col items-center gap-4">
          <div
            class="relative flex h-48 w-full max-w-md items-center justify-center rounded-demo border-2 border-dashed border-accent-purple/20 bg-surface-2/30"
          >
            <!-- Visual boundary indicator -->
            <div
              class="absolute inset-4 rounded-demo border border-accent-purple/15 pointer-events-none"
            ></div>
            <div
              ngmMotion
              [drag]="true"
              [dragX]="constrainedX"
              [dragY]="constrainedY"
              [dragConstraints]="{ left: -120, right: 120, top: -60, bottom: 60 }"
              [dragElastic]="0.15"
              [dragMomentum]="false"
              [whileDrag]="{ scale: 1.06, backgroundColor: 'rgba(124,58,237,0.25)' }"
              [style]="{ x: constrainedX, y: constrainedY }"
              class="flex h-16 w-16 cursor-grab items-center justify-center rounded-demo bg-surface-3 border border-accent-purple/30 text-xs font-mono text-accent-purple select-none touch-action-none active:cursor-grabbing"
            >
              xy
            </div>
          </div>
          <p class="text-sm text-text-muted font-mono tabular-nums">
            x: {{ constrainedXVal() }} / y: {{ constrainedYVal() }}
          </p>
        </div>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- 6. Axis-Locked Drag -->
    <!-- ============================================ -->
    <section class="mb-12">
      <div class="mb-5">
        <h2 class="font-display text-lg font-semibold text-text-primary">Axis-Locked Drag</h2>
        <p class="mt-1 text-sm text-text-secondary">
          <code class="font-mono text-accent-cyan/80">drag="x"</code> and
          <code class="font-mono text-accent-cyan/80">drag="y"</code> constrain to a single axis.
        </p>
      </div>
      <div class="bg-surface-1 rounded-demo p-6 border border-border">
        <div class="grid gap-8 sm:grid-cols-2">
          <!-- X-axis slider -->
          <div class="flex flex-col items-center gap-3">
            <p class="text-xs font-mono uppercase tracking-wider text-text-muted">Horizontal</p>
            <div class="relative flex h-14 w-full items-center rounded-demo bg-surface-2/50">
              <!-- Track line -->
              <div class="absolute inset-x-4 top-1/2 h-px bg-border"></div>
              <!-- Center tick -->
              <div class="absolute left-1/2 top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-text-muted/30"></div>
              <div
                ngmMotion
                drag="x"
                [dragX]="axisX"
                [dragConstraints]="{ left: -130, right: 130, top: 0, bottom: 0 }"
                [dragElastic]="0.08"
                [dragMomentum]="false"
                [whileDrag]="{ backgroundColor: 'rgba(6,182,212,0.2)' }"
                [style]="{ x: axisX }"
                class="relative z-10 mx-auto flex h-10 w-10 cursor-grab items-center justify-center rounded-full bg-surface-3 border border-accent-cyan/30 text-accent-cyan select-none touch-action-none active:cursor-grabbing"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-4 w-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
              </div>
            </div>
            <p class="text-sm text-text-muted font-mono tabular-nums">x: {{ axisXVal() }}</p>
          </div>

          <!-- Y-axis slider -->
          <div class="flex flex-col items-center gap-3">
            <p class="text-xs font-mono uppercase tracking-wider text-text-muted">Vertical</p>
            <div class="relative flex h-40 w-14 items-center justify-center rounded-demo bg-surface-2/50">
              <!-- Track line -->
              <div class="absolute inset-y-4 left-1/2 w-px bg-border"></div>
              <!-- Center tick -->
              <div class="absolute top-1/2 left-1/2 h-px w-3 -translate-x-1/2 -translate-y-1/2 bg-text-muted/30"></div>
              <div
                ngmMotion
                drag="y"
                [dragY]="axisY"
                [dragConstraints]="{ left: 0, right: 0, top: -55, bottom: 55 }"
                [dragElastic]="0.08"
                [dragMomentum]="false"
                [whileDrag]="{ backgroundColor: 'rgba(245,158,11,0.2)' }"
                [style]="{ y: axisY }"
                class="relative z-10 flex h-10 w-10 cursor-grab items-center justify-center rounded-full bg-surface-3 border border-accent-amber/30 text-accent-amber select-none touch-action-none active:cursor-grabbing"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-4 w-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5-3L16.5 18m0 0L12 13.5M16.5 18V4.5" />
                </svg>
              </div>
            </div>
            <p class="text-sm text-text-muted font-mono tabular-nums">y: {{ axisYVal() }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- 7. Velocity Tracking -->
    <!-- ============================================ -->
    <section class="mb-12">
      <div class="mb-5">
        <h2 class="font-display text-lg font-semibold text-text-primary">Velocity Tracking</h2>
        <p class="mt-1 text-sm text-text-secondary">
          <code class="font-mono text-accent-cyan/80">useVelocity</code> +
          <code class="font-mono text-accent-cyan/80">useTransform</code> map drag speed to
          a visual indicator. Drag fast to see the bar react.
        </p>
      </div>
      <div class="bg-surface-1 rounded-demo p-6 border border-border">
        <div class="flex flex-col items-center gap-6">
          <!-- Velocity bar -->
          <div class="w-full max-w-md">
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs font-mono uppercase tracking-wider text-text-muted">Velocity</p>
              <p class="text-sm text-text-muted font-mono tabular-nums">
                {{ velocityDisplay() }} px/s
              </p>
            </div>
            <div class="h-3 w-full rounded-full bg-surface-2 overflow-hidden">
              <div
                ngmMotion
                [style]="{ width: velocityBarWidth }"
                [animate]="{ backgroundColor: velocityColor() }"
                [transition]="{ duration: 0.15 }"
                class="h-full rounded-full"
              ></div>
            </div>
          </div>

          <!-- Drag track -->
          <div class="relative flex h-14 w-full max-w-md items-center rounded-demo bg-surface-2/50">
            <div class="absolute inset-x-4 top-1/2 h-px bg-border"></div>
            <div
              ngmMotion
              drag="x"
              [dragX]="velocityX"
              [dragConstraints]="{ left: -180, right: 180, top: 0, bottom: 0 }"
              [dragElastic]="0.05"
              [dragMomentum]="true"
              [dragSnapToOrigin]="true"
              [whileDrag]="{ scale: 1.15 }"
              [style]="{ x: velocityX, background: velocityHandleBackground }"
              class="relative z-10 mx-auto flex h-12 w-12 cursor-grab items-center justify-center rounded-full border border-border-hover shadow-lg select-none touch-action-none active:cursor-grabbing"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-5 w-5 text-white">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
          </div>
          <p class="text-xs text-text-muted">Drag horizontally with varying speed</p>
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
export class GesturesPage {
  // ── Demo 1: Hover ──
  readonly hoverLabel = signal('Hover a card');

  // ── Demo 2: Tap ──
  readonly tapCount = signal(0);

  // ── Demo 4: Free Drag ──
  readonly freeDragActive = signal(false);

  // ── Demo 5: Constrained Drag ──
  readonly constrainedX: MotionValue<number>;
  readonly constrainedY: MotionValue<number>;
  readonly constrainedXVal = signal(0);
  readonly constrainedYVal = signal(0);

  // ── Demo 6: Axis-Locked ──
  readonly axisX: MotionValue<number>;
  readonly axisY: MotionValue<number>;
  readonly axisXVal = signal(0);
  readonly axisYVal = signal(0);

  // ── Demo 7: Velocity ──
  readonly velocityX: MotionValue<number>;
  readonly velocityMv: MotionValue<number>;
  readonly velocityBarWidth: MotionValue<string>;
  readonly velocityHandleBackground: MotionValue<string>;
  readonly velocityDisplay = signal(0);
  readonly velocityColor = signal('#06b6d4');

  constructor() {
    // -- Constrained drag position tracking --
    this.constrainedX = useMotionValue(0);
    this.constrainedY = useMotionValue(0);

    this.constrainedX.on('change', (v: number) => {
      this.constrainedXVal.set(Math.round(v));
    });
    this.constrainedY.on('change', (v: number) => {
      this.constrainedYVal.set(Math.round(v));
    });

    // -- Axis-locked position tracking --
    this.axisX = useMotionValue(0);
    this.axisY = useMotionValue(0);

    this.axisX.on('change', (v: number) => {
      this.axisXVal.set(Math.round(v));
    });
    this.axisY.on('change', (v: number) => {
      this.axisYVal.set(Math.round(v));
    });

    // -- Velocity tracking --
    this.velocityX = useMotionValue(0);
    this.velocityMv = useVelocity(this.velocityX);

    // Map velocity magnitude to bar width (0-100%)
    const absVelocity = useTransform(this.velocityMv, (v: number) => Math.min(Math.abs(v), 2000));

    this.velocityBarWidth = useTransform(
      absVelocity,
      [0, 2000],
      ['0%', '100%'],
    ) as MotionValue<string>;

    // Map velocity to a handle background gradient via useMotionTemplate
    const hue = useTransform(absVelocity, [0, 1000, 2000], [190, 270, 35]);
    this.velocityHandleBackground = useMotionTemplate`hsl(${hue}, 70%, 50%)`;

    // Bridge velocity to signal for display
    this.velocityMv.on('change', (v: number) => {
      const abs = Math.round(Math.abs(v));
      this.velocityDisplay.set(abs);
      // Update color signal for the bar
      if (abs < 400) {
        this.velocityColor.set('#06b6d4'); // cyan - slow
      } else if (abs < 1000) {
        this.velocityColor.set('#7c3aed'); // purple - medium
      } else {
        this.velocityColor.set('#f59e0b'); // amber - fast
      }
    });
  }
}
