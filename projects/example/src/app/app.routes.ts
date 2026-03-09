import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'basics',
    loadComponent: () => import('./pages/basics/basics.page').then((m) => m.BasicsPage),
  },
  {
    path: 'gestures',
    loadComponent: () => import('./pages/gestures/gestures.page').then((m) => m.GesturesPage),
  },
  {
    path: 'presence',
    loadComponent: () => import('./pages/presence/presence.page').then((m) => m.PresencePage),
  },
  {
    path: 'layout',
    loadComponent: () => import('./pages/layout/layout.page').then((m) => m.LayoutPage),
  },
  {
    path: 'scroll',
    loadComponent: () => import('./pages/scroll/scroll.page').then((m) => m.ScrollPage),
  },
  {
    path: 'values',
    loadComponent: () => import('./pages/values/values.page').then((m) => m.ValuesPage),
  },
  {
    path: 'reorder',
    loadComponent: () => import('./pages/reorder/reorder.page').then((m) => m.ReorderPage),
  },
  { path: '**', redirectTo: '' },
];
