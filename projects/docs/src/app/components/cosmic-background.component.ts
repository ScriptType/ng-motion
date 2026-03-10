import { Component, computed, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import {
  NgmMotionDirective,
  useScroll,
  useTransform,
  type MotionValue,
} from '@scripttype/ng-motion';

interface StarData {
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  rotation: number;
}

interface TwinkleData {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  glow: string;
  minOpacity: number;
  maxOpacity: number;
  duration: number;
  delay: number;
}

@Component({
  selector: 'app-cosmic-background',
  imports: [NgmMotionDirective],
  host: { 'aria-hidden': 'true' },
  template: `
    @if (isHomePage()) {
      <!-- Deep star field — slowest parallax (farthest away) -->
      <div ngmMotion [style]="mobile ? {} : { y: deepY }" class="layer">
        @for (s of deepStarData; track $index) {
          <div
            class="star"
            [style.left.%]="s.x"
            [style.top.%]="s.y"
            [style.width.px]="s.size"
            [style.height.px]="s.size"
            [style.opacity]="s.opacity"
            [style.background]="s.color"
            [style.transform]="'rotate(' + s.rotation + 'deg)'"
          ></div>
        }
      </div>

      @if (!mobile) {
        <!-- Nebula wisps — medium parallax (desktop only) -->
        <div ngmMotion [style]="{ y: nebulaY }" class="layer">
          <div
            ngmMotion
            [animate]="{ x: [-18, 18, -18], y: [-10, 14, -10] }"
            [transition]="{ duration: 30, repeat: inf, ease: 'easeInOut' }"
            class="nebula n-cyan"
          ></div>
          <div
            ngmMotion
            [animate]="{ x: [14, -14, 14], y: [10, -18, 10] }"
            [transition]="{ duration: 40, repeat: inf, ease: 'easeInOut' }"
            class="nebula n-purple"
          ></div>
          <div
            ngmMotion
            [animate]="{ x: [-10, 12, -10], y: [-14, 10, -14] }"
            [transition]="{ duration: 35, repeat: inf, ease: 'easeInOut' }"
            class="nebula n-pink"
          ></div>
        </div>
      }

      <!-- Near star field — fastest parallax (closest) -->
      <div ngmMotion [style]="mobile ? {} : { y: nearY }" class="layer">
        @for (s of nearStarData; track $index) {
          <div
            class="star"
            [style.left.%]="s.x"
            [style.top.%]="s.y"
            [style.width.px]="s.size"
            [style.height.px]="s.size"
            [style.opacity]="s.opacity"
            [style.background]="s.color"
            [style.transform]="'rotate(' + s.rotation + 'deg)'"
          ></div>
        }
      </div>

      @if (!mobile) {
        <!-- Twinkle stars — individual animated bright points (desktop only) -->
        <div ngmMotion [style]="{ y: twinkleY }" class="layer">
          @for (star of twinkleStars; track star.id) {
            <div
              ngmMotion
              [animate]="{
                opacity: [star.minOpacity, star.maxOpacity, star.minOpacity]
              }"
              [transition]="{
                duration: star.duration,
                repeat: inf,
                ease: 'easeInOut',
                delay: star.delay
              }"
              class="star twinkle-star"
              [style.left.%]="star.x"
              [style.top.%]="star.y"
              [style.width.px]="star.size"
              [style.height.px]="star.size"
              [style.background]="star.color"
              [style.boxShadow]="star.glow"
            ></div>
          }
        </div>
      }
    }

    <!-- Vignette — darkens edges for depth -->
    <div class="vignette"></div>
  `,
  styles: `
    :host {
      position: fixed;
      inset: 0;
      z-index: -1;
      pointer-events: none;
      overflow: hidden;
    }

    .layer {
      position: absolute;
      top: -15%;
      left: -10%;
      width: 120%;
      height: 130%;
      will-change: transform;
    }

    .star {
      position: absolute;
      clip-path: polygon(
        50% 0%,
        58% 36%,
        100% 50%,
        58% 64%,
        50% 100%,
        42% 64%,
        0% 50%,
        42% 36%
      );
    }

    .nebula {
      position: absolute;
      border-radius: 50%;
    }

    .n-cyan {
      top: 10%;
      left: 5%;
      width: 500px;
      height: 500px;
      background: radial-gradient(
        circle,
        rgba(0, 224, 198, 0.035) 0%,
        transparent 70%
      );
    }

    .n-purple {
      bottom: 12%;
      right: 8%;
      width: 450px;
      height: 450px;
      background: radial-gradient(
        circle,
        rgba(177, 140, 255, 0.03) 0%,
        transparent 70%
      );
    }

    .n-pink {
      top: 40%;
      left: 50%;
      width: 380px;
      height: 380px;
      background: radial-gradient(
        circle,
        rgba(255, 107, 157, 0.02) 0%,
        transparent 70%
      );
    }

    .twinkle-star {
    }

    .vignette {
      position: absolute;
      inset: 0;
      background: radial-gradient(
        ellipse at center,
        transparent 40%,
        var(--color-deep) 100%
      );
    }
  `,
})
export class CosmicBackgroundComponent {
  protected readonly inf = Infinity;
  protected readonly mobile = typeof window !== 'undefined' && window.innerWidth < 768;

  private readonly router = inject(Router);
  private readonly navEnd = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );
  readonly isHomePage = computed(() => {
    const url = this.navEnd();
    return url === '/' || url === '';
  });

  readonly deepY: MotionValue<number>;
  readonly nebulaY: MotionValue<number>;
  readonly nearY: MotionValue<number>;
  readonly twinkleY: MotionValue<number>;

  readonly deepStarData: StarData[];
  readonly nearStarData: StarData[];
  readonly twinkleStars: TwinkleData[];

  constructor() {
    const { scrollY } = useScroll();

    this.deepY = useTransform(scrollY, (v: number) => v * -0.03);
    this.nebulaY = useTransform(scrollY, (v: number) => v * -0.06);
    this.twinkleY = useTransform(scrollY, (v: number) => v * -0.08);
    this.nearY = useTransform(scrollY, (v: number) => v * -0.12);

    const rng = Math.random;
    this.deepStarData = [
      ...this.generateStars(rng, this.mobile ? 30 : 90, 2, 4, 0.06, 0.22),
      ...this.generateEdgeStars(rng, this.mobile ? 18 : 55, 2, 4, 0.06, 0.22),
    ];
    this.nearStarData = [
      ...this.generateStars(rng, this.mobile ? 15 : 45, 3, 6, 0.08, 0.35),
      ...this.generateEdgeStars(rng, this.mobile ? 10 : 30, 3, 6, 0.08, 0.35),
    ];
    this.twinkleStars = this.generateTwinkleStars(rng);
  }

  private generateStars(
    rand: () => number,
    count: number,
    minSize: number,
    maxSize: number,
    minAlpha: number,
    maxAlpha: number,
  ): StarData[] {
    const stars: StarData[] = [];

    for (let i = 0; i < count; i++) {
      const x = Math.round((rand() * 104 - 2) * 100) / 100;
      const y = Math.round((rand() * 104 - 2) * 100) / 100;
      const size = Math.round((rand() * (maxSize - minSize) + minSize) * 10) / 10;
      const opacity = Math.round((rand() * (maxAlpha - minAlpha) + minAlpha) * 100) / 100;
      const rotation = Math.round(rand() * 45);

      const tint = rand();
      let color: string;
      if (tint < 0.04) {
        color = '#00e0c6';
      } else if (tint < 0.08) {
        color = '#b18cff';
      } else {
        color = '#fff';
      }

      stars.push({ x, y, size, color, opacity, rotation });
    }

    return stars;
  }

  private generateEdgeStars(
    rand: () => number,
    count: number,
    minSize: number,
    maxSize: number,
    minAlpha: number,
    maxAlpha: number,
  ): StarData[] {
    const stars: StarData[] = [];

    for (let i = 0; i < count; i++) {
      const inLeft = rand() < 0.5;
      const x = inLeft
        ? Math.round(rand() * 18 * 100) / 100
        : Math.round((82 + rand() * 18) * 100) / 100;
      const y = Math.round((rand() * 104 - 2) * 100) / 100;
      const size = Math.round((rand() * (maxSize - minSize) + minSize) * 10) / 10;
      const opacity = Math.round((rand() * (maxAlpha - minAlpha) + minAlpha) * 100) / 100;
      const rotation = Math.round(rand() * 45);

      const tint = rand();
      let color: string;
      if (tint < 0.04) {
        color = '#00e0c6';
      } else if (tint < 0.08) {
        color = '#b18cff';
      } else {
        color = '#fff';
      }

      stars.push({ x, y, size, color, opacity, rotation });
    }

    return stars;
  }

  private generateTwinkleStars(rand: () => number): TwinkleData[] {
    const palette = [
      { hex: '#00e0c6', rgb: '0,224,198' },
      { hex: '#b18cff', rgb: '177,140,255' },
      { hex: '#ffffff', rgb: '255,255,255' },
      { hex: '#ff6b9d', rgb: '255,107,157' },
      { hex: '#ffe566', rgb: '255,229,102' },
      { hex: '#f0ede8', rgb: '240,237,232' },
    ];

    return palette.map((c, i) => {
      const size = Math.round((rand() * 4 + 5) * 10) / 10;
      const glowSize = Math.round(size * 2);

      return {
        id: i,
        x: Math.round(rand() * 90 * 100) / 100 + 5,
        y: Math.round(rand() * 80 * 100) / 100 + 10,
        size,
        color: c.hex,
        glow: `0 0 ${glowSize}px ${Math.round(size * 0.6)}px rgba(${c.rgb},0.25)`,
        minOpacity: 0.05 + rand() * 0.1,
        maxOpacity: 0.3 + rand() * 0.3,
        duration: 3 + rand() * 5,
        delay: rand() * 6,
      };
    });
  }
}
