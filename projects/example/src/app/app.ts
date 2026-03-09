import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgmMotionDirective } from '@scripttype/ng-motion';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgmMotionDirective],
  template: `
    <!-- Ambient background orbs -->
    <div class="fixed inset-0 -z-10 overflow-hidden">
      <div
        ngmMotion
        [animate]="{ x: [0, 40, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.15, 0.95, 1] }"
        [transition]="{ duration: 20, repeat: inf, ease: 'linear' }"
        class="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-accent-cyan/[0.04] blur-[120px]"
      ></div>
      <div
        ngmMotion
        [animate]="{ x: [0, -30, 25, 0], y: [0, 40, -15, 0], scale: [1, 0.9, 1.1, 1] }"
        [transition]="{ duration: 25, repeat: inf, ease: 'linear' }"
        class="absolute -right-32 top-1/3 h-[500px] w-[500px] rounded-full bg-accent-purple/[0.04] blur-[120px]"
      ></div>
      <div
        ngmMotion
        [animate]="{ x: [0, 20, -30, 0], y: [0, -20, 30, 0] }"
        [transition]="{ duration: 30, repeat: inf, ease: 'linear' }"
        class="absolute -bottom-32 left-1/3 h-[400px] w-[400px] rounded-full bg-accent-amber/[0.03] blur-[120px]"
      ></div>
    </div>

    <!-- Mobile top bar -->
    <header class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-border bg-surface-0/80 px-4 py-3 backdrop-blur-xl lg:hidden">
      <a routerLink="/" class="font-display text-lg font-bold tracking-tight text-text-primary">
        ng<span class="bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent">motion</span>
      </a>
      <button (click)="mobileMenuOpen.set(!mobileMenuOpen())" class="flex h-8 w-8 items-center justify-center rounded-button text-text-secondary">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5">
          @if (mobileMenuOpen()) {
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          } @else {
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          }
        </svg>
      </button>
    </header>

    <!-- Mobile menu overlay -->
    @if (mobileMenuOpen()) {
      <div (click)="mobileMenuOpen.set(false)" class="fixed inset-0 z-40 bg-surface-0/60 backdrop-blur-sm lg:hidden"></div>
      <nav class="fixed top-14 right-0 z-50 w-64 rounded-bl-card border-b border-l border-border bg-surface-1/95 p-4 backdrop-blur-xl lg:hidden">
        @for (item of nav; track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="text-accent-cyan"
            [routerLinkActiveOptions]="{ exact: item.path === '/' }"
            (click)="mobileMenuOpen.set(false)"
            class="flex items-center gap-3 rounded-button px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary"
          >
            <span class="text-base">{{ item.icon }}</span>
            {{ item.label }}
          </a>
        }
      </nav>
    }

    <!-- Desktop sidebar -->
    <aside class="fixed top-0 left-0 z-40 hidden h-screen w-60 flex-col border-r border-border bg-surface-0/50 backdrop-blur-xl lg:flex">
      <div class="flex h-16 items-center px-6">
        <a routerLink="/" class="font-display text-xl font-bold tracking-tight text-text-primary">
          ng<span class="bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent">motion</span>
        </a>
      </div>

      <nav class="flex flex-1 flex-col gap-0.5 px-3 py-2">
        @for (item of nav; track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="!bg-surface-2/60 !text-text-primary !border-accent-cyan/30"
            [routerLinkActiveOptions]="{ exact: item.path === '/' }"
            class="flex items-center gap-3 rounded-button border border-transparent px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-2/40 hover:text-text-primary"
          >
            <span class="text-base">{{ item.icon }}</span>
            {{ item.label }}
          </a>
        }
      </nav>

      <div class="border-t border-border px-6 py-4">
        <p class="font-mono text-xs text-text-muted">v0.4</p>
      </div>
    </aside>

    <!-- Main content -->
    <main class="min-h-screen pt-14 lg:pl-60 lg:pt-0">
      <div class="mx-auto max-w-5xl px-6 py-10 lg:px-10 lg:py-14">
        <router-outlet />
      </div>
    </main>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class App {
  readonly inf = Infinity;
  mobileMenuOpen = signal(false);

  readonly nav: NavItem[] = [
    { path: '/', label: 'Home', icon: '\u2302' },
    { path: '/basics', label: 'Basics', icon: '\u25B3' },
    { path: '/gestures', label: 'Gestures', icon: '\u270B' },
    { path: '/presence', label: 'Presence', icon: '\u2728' },
    { path: '/layout', label: 'Layout', icon: '\u2B1A' },
    { path: '/scroll', label: 'Scroll', icon: '\u2193' },
    { path: '/values', label: 'Values', icon: '\u223F' },
    { path: '/reorder', label: 'Reorder', icon: '\u2195' },
  ];
}
