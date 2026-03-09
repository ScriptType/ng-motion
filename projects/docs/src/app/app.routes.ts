import { type Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home.page').then((m) => m.HomePage),
  },
  {
    path: 'docs',
    loadComponent: () => import('./pages/docs/docs-layout').then((m) => m.DocsLayout),
    children: [
      {
        path: 'getting-started',
        loadComponent: () =>
          import('./pages/docs/getting-started.page').then((m) => m.GettingStartedPage),
      },
      {
        path: 'installation',
        loadComponent: () =>
          import('./pages/docs/installation.page').then((m) => m.InstallationPage),
      },
      {
        path: 'motion-directive',
        loadComponent: () =>
          import('./pages/docs/motion-directive.page').then((m) => m.MotionDirectivePage),
      },
      {
        path: 'transitions',
        loadComponent: () =>
          import('./pages/docs/transitions.page').then((m) => m.TransitionsPage),
      },
      {
        path: 'variants',
        loadComponent: () =>
          import('./pages/docs/variants.page').then((m) => m.VariantsPage),
      },
      {
        path: 'motion-values',
        loadComponent: () =>
          import('./pages/docs/motion-values.page').then((m) => m.MotionValuesPage),
      },
      {
        path: 'gestures',
        loadComponent: () =>
          import('./pages/docs/gestures.page').then((m) => m.GesturesPage),
      },
      {
        path: 'presence',
        loadComponent: () =>
          import('./pages/docs/presence.page').then((m) => m.PresencePage),
      },
      {
        path: 'layout',
        loadComponent: () =>
          import('./pages/docs/layout.page').then((m) => m.LayoutPage),
      },
      {
        path: 'scroll',
        loadComponent: () =>
          import('./pages/docs/scroll.page').then((m) => m.ScrollPage),
      },
      {
        path: 'drag',
        loadComponent: () =>
          import('./pages/docs/drag.page').then((m) => m.DragPage),
      },
      {
        path: 'use-spring',
        loadComponent: () =>
          import('./pages/docs/use-spring.page').then((m) => m.UseSpringPage),
      },
      {
        path: 'use-transform',
        loadComponent: () =>
          import('./pages/docs/use-transform.page').then((m) => m.UseTransformPage),
      },
      {
        path: 'use-cycle',
        loadComponent: () =>
          import('./pages/docs/use-cycle.page').then((m) => m.UseCyclePage),
      },
      {
        path: 'use-animate',
        loadComponent: () =>
          import('./pages/docs/use-animate.page').then((m) => m.UseAnimatePage),
      },
      {
        path: 'performance',
        loadComponent: () =>
          import('./pages/docs/performance.page').then((m) => m.PerformancePage),
      },
      {
        path: 'feature-loading',
        loadComponent: () =>
          import('./pages/docs/feature-loading.page').then((m) => m.FeatureLoadingPage),
      },
      {
        path: 'use-in-view',
        loadComponent: () =>
          import('./pages/docs/use-in-view.page').then((m) => m.UseInViewPage),
      },
      {
        path: 'api-reference',
        loadComponent: () =>
          import('./pages/docs/api-reference.page').then((m) => m.ApiReferencePage),
      },
      {
        path: 'recipes',
        loadComponent: () =>
          import('./pages/docs/recipes.page').then((m) => m.RecipesPage),
      },
      { path: '', redirectTo: 'installation', pathMatch: 'full' },
    ],
  },
];
