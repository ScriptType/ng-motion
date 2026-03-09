import { Component } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { NgmMotionDirective } from '@scripttype/ng-motion';

@Component({
  selector: 'app-docs-layout',
  imports: [RouterLink, RouterOutlet, RouterLinkActive, NgmMotionDirective],
  template: `
    <div class="pt-16 min-h-screen">
      <div class="mx-auto max-w-7xl flex">
        <!-- Sidebar -->
        <aside
          class="hidden lg:block w-64 flex-shrink-0 border-r border-border/50 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto py-8 px-6"
        >
          @for (section of sidebarSections; track section.title) {
            <div class="mb-8">
              <h4
                class="font-display font-semibold text-xs uppercase tracking-widest text-muted mb-3 px-3"
              >
                {{ section.title }}
              </h4>
              <ul class="space-y-0.5">
                @for (item of section.items; track item.path) {
                  <li>
                    <a
                      [routerLink]="item.path"
                      routerLinkActive="!text-accent !bg-accent/5 !border-l-2 !border-l-accent"
                      ngmMotion
                      [whileHover]="{ x: 4 }"
                      [transition]="{ type: 'spring', stiffness: 300, damping: 20 }"
                      class="block px-3 py-1.5 text-sm text-secondary hover:text-primary rounded-r-lg transition-colors border-l-2 border-l-transparent"
                    >
                      {{ item.label }}
                    </a>
                  </li>
                }
              </ul>
            </div>
          }
        </aside>

        <!-- Main content -->
        <main class="flex-1 min-w-0 px-6 lg:px-16 py-12">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class DocsLayout {
  readonly sidebarSections = [
    {
      title: 'Getting Started',
      items: [
        { path: '/docs/installation', label: 'Installation' },
        { path: '/docs/getting-started', label: 'Introduction' },
      ],
    },
    {
      title: 'Core',
      items: [
        { path: '/docs/motion-directive', label: 'Motion Directive' },
        { path: '/docs/transitions', label: 'Transitions' },
        { path: '/docs/variants', label: 'Variants' },
        { path: '/docs/motion-values', label: 'Motion Values' },
      ],
    },
    {
      title: 'Features',
      items: [
        { path: '/docs/gestures', label: 'Gestures' },
        { path: '/docs/presence', label: 'Presence & Exit' },
        { path: '/docs/layout', label: 'Layout Animation' },
        { path: '/docs/scroll', label: 'Scroll' },
        { path: '/docs/drag', label: 'Drag & Reorder' },
      ],
    },
    {
      title: 'Hooks',
      items: [
        { path: '/docs/use-spring', label: 'useSpring' },
        { path: '/docs/use-transform', label: 'useTransform' },
        { path: '/docs/use-cycle', label: 'useCycle' },
        { path: '/docs/use-animate', label: 'useAnimate' },
        { path: '/docs/use-in-view', label: 'useInView' },
      ],
    },
    {
      title: 'Advanced',
      items: [
        { path: '/docs/performance', label: 'Performance' },
        { path: '/docs/feature-loading', label: 'Feature Loading' },
        { path: '/docs/api-reference', label: 'API Reference' },
        { path: '/docs/recipes', label: 'Recipes' },
      ],
    },
  ];
}
