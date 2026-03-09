import { Component, signal } from '@angular/core';
import { NgmMotionDirective } from 'ng-motion';

interface CosmicBody {
  readonly id: string;
}

const COSMIC_BODIES: readonly CosmicBody[] = [
  { id: 'sol' },
  { id: 'terra' },
  { id: 'luna' },
  { id: 'nova' },
  { id: 'nebula' },
  { id: 'saturn' },
  { id: 'crystal' },
  { id: 'comet' },
  { id: 'pulsar' },
  { id: 'mars' },
  { id: 'quasar' },
  { id: 'void' },
];

@Component({
  selector: 'app-cosmic-shuffle-grid',
  imports: [NgmMotionDirective],
  template: `
    <div
      class="grid grid-cols-4 gap-3 sm:gap-4 max-w-sm sm:max-w-md mx-auto select-none"
      role="presentation"
    >
      @for (item of items(); track item.id) {
        <div
          ngmMotion
          [layout]="true"
          [transition]="spring"
          [whileHover]="{ scale: 1.18, rotate: 10 }"
          [whileTap]="{ scale: 0.82, rotate: -6 }"
          (click)="shuffle()"
          class="aspect-square flex items-center justify-center cursor-pointer"
        >
          <div [class]="'cb-offset cb-offset--' + item.id">
            <div [class]="'cb cb--' + item.id"></div>
          </div>
        </div>
      }
    </div>
    <p
      ngmMotion
      [initial]="{ opacity: 0 }"
      [animate]="{ opacity: 1 }"
      [transition]="{ delay: 2 }"
      class="text-center text-[11px] text-muted/40 font-mono mt-3 select-none tracking-wider"
    >
      tap to shuffle
    </p>
  `,
  styles: `
    :host {
      display: block;
    }

    .cb-offset {
      display: flex;
      width: 100%;
      height: 100%;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }

    .cb {
      position: relative;
    }

    .cb-offset--sol {
      transform: translate(10%, 18%) rotate(-8deg);
    }

    .cb-offset--terra {
      transform: translate(18%, 24%) rotate(-10deg);
    }

    .cb-offset--luna {
      transform: translate(-10%, 20%) rotate(12deg);
    }

    .cb-offset--nova {
      transform: translate(-12%, -18%) rotate(-6deg);
    }

    .cb-offset--nebula {
      transform: translate(12%, -10%) rotate(4deg);
    }

    .cb-offset--saturn {
      transform: translate(10%, -24%) rotate(8deg);
    }

    .cb-offset--crystal {
      transform: translate(-6%, -18%) rotate(-14deg);
    }

    .cb-offset--comet {
      transform: translate(18%, -4%) rotate(10deg);
    }

    .cb-offset--pulsar {
      transform: translate(-20%, -12%) rotate(6deg);
    }

    .cb-offset--mars {
      transform: translate(-8%, 16%) rotate(-10deg);
    }

    .cb-offset--quasar {
      transform: translate(-18%, -18%) rotate(4deg);
    }

    .cb-offset--void {
      transform: translate(-4%, -24%) rotate(10deg);
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━
       Sol — radiant sun
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    .cb--sol {
      width: 72%;
      height: 72%;
      border-radius: 50%;
      background: radial-gradient(circle at 32% 32%, #ffe566, #ff6b9d 92%);
      box-shadow:
        0 0 24px rgba(255, 229, 102, 0.45),
        0 0 52px rgba(255, 229, 102, 0.12);
      animation: sol-glow 4s ease-in-out infinite;
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━
       Terra — teal planet
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    .cb--terra {
      width: 60%;
      height: 60%;
      border-radius: 50%;
      background: linear-gradient(145deg, #00e0c6 25%, #085c50);
      box-shadow:
        0 0 16px rgba(0, 224, 198, 0.25),
        inset -5px -4px 10px rgba(0, 0, 0, 0.35);
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━
       Luna — crescent moon
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    .cb--luna {
      width: 46%;
      height: 46%;
      border-radius: 50%;
      background: #d5d0c9;
      box-shadow:
        inset -10px -5px 0 #0a0a12,
        0 0 12px rgba(213, 208, 201, 0.15);
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━
       Nova — 5-point star
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    .cb--nova {
      width: 64%;
      height: 64%;
      clip-path: polygon(
        50% 0%,
        61% 35%,
        98% 35%,
        68% 57%,
        79% 91%,
        50% 70%,
        21% 91%,
        32% 57%,
        2% 35%,
        39% 35%
      );
      background: linear-gradient(135deg, #ff6b9d, #ffe566);
      filter: drop-shadow(0 0 8px rgba(255, 107, 157, 0.4));
      animation: nova-twinkle 3s ease-in-out infinite;
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━
       Nebula — glowing cloud
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    .cb--nebula {
      width: 78%;
      height: 52%;
      border-radius: 50%;
      background: linear-gradient(
        135deg,
        rgba(177, 140, 255, 0.65),
        rgba(255, 107, 157, 0.45)
      );
      filter: blur(5px);
      animation: nebula-breathe 5s ease-in-out infinite;
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━
       Saturn — ringed planet
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    .cb--saturn {
      width: 50%;
      height: 50%;
      border-radius: 50%;
      background: linear-gradient(145deg, #b18cff, #6b4fa0);
      box-shadow: 0 0 14px rgba(177, 140, 255, 0.25);
    }
    .cb--saturn::after {
      content: '';
      position: absolute;
      width: 180%;
      height: 32%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotateX(72deg);
      border: 2px solid rgba(177, 140, 255, 0.3);
      border-radius: 50%;
      pointer-events: none;
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━
       Crystal — elongated gem
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    .cb--crystal {
      width: 36%;
      height: 56%;
      clip-path: polygon(50% 0%, 100% 28%, 100% 72%, 50% 100%, 0% 72%, 0% 28%);
      background: linear-gradient(180deg, #00e0c6 10%, #b18cff 90%);
      filter: drop-shadow(0 0 6px rgba(0, 224, 198, 0.25));
      animation: crystal-bob 4.5s ease-in-out infinite;
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━
       Comet — streaking fireball
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    .cb--comet {
      width: 62%;
      height: 24%;
      border-radius: 50% 10% 10% 50%;
      background: linear-gradient(90deg, #00e0c6 15%, rgba(0, 224, 198, 0.06));
      box-shadow: 0 0 10px rgba(0, 224, 198, 0.3);
      transform: rotate(-28deg);
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━
       Pulsar — radiating beacon
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    .cb--pulsar {
      width: 32%;
      height: 32%;
      border-radius: 50%;
      background: #ffe566;
      box-shadow:
        0 0 0 5px rgba(255, 229, 102, 0.18),
        0 0 0 10px rgba(255, 229, 102, 0.08),
        0 0 0 16px rgba(255, 229, 102, 0.03);
      animation: pulsar-ring 2.5s ease-in-out infinite;
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━
       Mars — red planet
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    .cb--mars {
      width: 54%;
      height: 54%;
      border-radius: 50%;
      background: radial-gradient(circle at 38% 38%, #ff6b9d, #8c3050);
      box-shadow:
        0 0 14px rgba(255, 107, 157, 0.2),
        inset -4px -3px 8px rgba(0, 0, 0, 0.3);
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━
       Quasar — brilliant point
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    .cb--quasar {
      width: 24%;
      height: 24%;
      border-radius: 50%;
      background: #f0ede8;
      box-shadow:
        0 0 14px rgba(240, 237, 232, 0.55),
        0 0 28px rgba(0, 224, 198, 0.2),
        0 0 48px rgba(177, 140, 255, 0.1);
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━
       Void — black hole
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    .cb--void {
      width: 56%;
      height: 56%;
      border-radius: 50%;
      background: radial-gradient(
        circle,
        #06060a 32%,
        rgba(177, 140, 255, 0.45) 54%,
        rgba(177, 140, 255, 0.1) 72%,
        transparent
      );
      box-shadow: 0 0 18px rgba(177, 140, 255, 0.2);
      animation: void-warp 7s ease-in-out infinite;
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━
       Keyframes
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    @keyframes sol-glow {
      0%,
      100% {
        box-shadow:
          0 0 24px rgba(255, 229, 102, 0.45),
          0 0 52px rgba(255, 229, 102, 0.12);
      }
      50% {
        box-shadow:
          0 0 34px rgba(255, 229, 102, 0.6),
          0 0 70px rgba(255, 229, 102, 0.2);
      }
    }

    @keyframes nova-twinkle {
      0%,
      100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.72;
        transform: scale(0.9);
      }
    }

    @keyframes nebula-breathe {
      0%,
      100% {
        transform: scale(1);
        opacity: 0.55;
      }
      50% {
        transform: scale(1.14);
        opacity: 0.78;
      }
    }

    @keyframes crystal-bob {
      0%,
      100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-12%);
      }
    }

    @keyframes pulsar-ring {
      0%,
      100% {
        box-shadow:
          0 0 0 5px rgba(255, 229, 102, 0.18),
          0 0 0 10px rgba(255, 229, 102, 0.08),
          0 0 0 16px rgba(255, 229, 102, 0.03);
      }
      50% {
        box-shadow:
          0 0 0 8px rgba(255, 229, 102, 0.28),
          0 0 0 16px rgba(255, 229, 102, 0.12),
          0 0 0 26px rgba(255, 229, 102, 0.04);
      }
    }

    @keyframes void-warp {
      0%,
      100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.06);
      }
    }
  `,
})
export class CosmicShuffleGridComponent {
  /** Real render order so layout projection sees a true list reorder. */
  readonly items = signal([...COSMIC_BODIES]);

  readonly spring = {
    type: 'spring',
    stiffness: 170,
    damping: 14,
    mass: 0.8,
  } as const;

  shuffle(): void {
    const next = [...this.items()];
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i]!, next[j]!] = [next[j]!, next[i]!];
    }
    this.items.set(next);
  }
}
