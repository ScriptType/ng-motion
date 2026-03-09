import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgmMotionDirective } from 'ng-motion';

@Component({
  selector: 'app-nav',
  imports: [RouterLink, RouterLinkActive, NgmMotionDirective],
  template: `
    <nav
      class="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-xl bg-deep/80"
    >
      <div class="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <!-- Logo -->
        <a
          routerLink="/"
          ngmMotion
          [whileHover]="{ scale: 1.05, rotate: -2 }"
          [whileTap]="{ scale: 0.95 }"
          [transition]="{ type: 'spring', stiffness: 400, damping: 17 }"
          class="flex items-center gap-1.5 font-display font-bold text-xl select-none"
        >
          <span class="text-accent">ng</span>
          <span class="text-primary">motion</span>
        </a>

        <!-- Desktop links -->
        <div class="hidden md:flex items-center gap-1">
          @for (link of navLinks; track link.label) {
            <a
              [routerLink]="link.path"
              routerLinkActive="!text-accent"
              [routerLinkActiveOptions]="{ exact: link.exact }"
              ngmMotion
              [whileHover]="{ y: -2 }"
              [transition]="{ type: 'spring', stiffness: 300, damping: 20 }"
              class="px-4 py-2 text-sm text-secondary hover:text-primary transition-colors rounded-lg"
            >
              {{ link.label }}
            </a>
          }
        </div>

        <!-- Right side -->
        <div class="flex items-center gap-3">
          <!-- GitHub -->
          <a
            href="#"
            target="_blank"
            rel="noopener"
            ngmMotion
            [whileHover]="{ scale: 1.15, rotate: 8 }"
            [whileTap]="{ scale: 0.9 }"
            [transition]="{ type: 'spring', stiffness: 400, damping: 15 }"
            class="p-2 text-secondary hover:text-primary transition-colors"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
              />
            </svg>
          </a>

          <!-- Mobile menu toggle -->
          <button
            (click)="mobileOpen.set(!mobileOpen())"
            ngmMotion
            [whileTap]="{ scale: 0.9 }"
            class="md:hidden p-2 text-secondary"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              stroke-width="2"
            >
              @if (mobileOpen()) {
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              } @else {
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              }
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      @if (mobileOpen()) {
        <div
          ngmMotion
          [initial]="{ opacity: 0, height: 0 }"
          [animate]="{ opacity: 1, height: 'auto' }"
          [transition]="{ type: 'spring', stiffness: 300, damping: 30 }"
          class="md:hidden border-t border-border/50 bg-deep/95 backdrop-blur-xl overflow-hidden"
        >
          <div class="px-6 py-4 flex flex-col gap-1">
            @for (link of navLinks; track link.label) {
              <a
                [routerLink]="link.path"
                (click)="mobileOpen.set(false)"
                ngmMotion
                [whileHover]="{ x: 8 }"
                [transition]="{ type: 'spring', stiffness: 300, damping: 20 }"
                class="px-4 py-3 text-secondary hover:text-primary transition-colors rounded-lg"
              >
                {{ link.label }}
              </a>
            }
          </div>
        </div>
      }
    </nav>
  `,
})
export class NavComponent {
  readonly mobileOpen = signal(false);

  readonly navLinks = [
    { path: '/docs/installation', label: 'Docs', exact: false },
    { path: '/docs/api-reference', label: 'API Reference', exact: false },
  ];
}
