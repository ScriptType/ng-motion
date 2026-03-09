# Docs Site Architecture

## Decision

Build the public docs site as a dedicated Analog application in hybrid mode.

Target setup:

- `ssr: true`
- `static: true`
- prerender all content and API pages
- mark example-heavy routes as client-only with `routeRules`

This keeps the docs fast and indexable while avoiding SSR breakage in live demos.

## Why Hybrid Instead of Full SSR

`ng-motion` is not fully SSR-safe today.

Known browser-only paths include:

- `useReducedMotion()` -> `window.matchMedia(...)`
- `useInView()` -> `IntersectionObserver`
- `useAnimationFrame()` -> `performance.now()`
- `useScroll()` and scroll internals -> `document.scrollingElement`, `window`
- drag internals -> `window`, `performance`

That means live examples cannot be treated as universally SSR-safe right now.

## App Structure

Recommended project layout:

```text
projects/docs-site/
  src/
    app/
      pages/
        index.page.ts
        docs/
        api/
        examples/
        playground/
      layouts/
      ui/
        docs-client-example/
        code-tabs/
        api-table/
      examples/
        basics/
        gestures/
        presence/
        layout/
        scroll/
        values/
    content/
      docs/
      api/
```

Content strategy:

- `workspace/docs/` remains the current planning and authoring area
- during implementation, public site content should move into `projects/docs-site/src/content/`
- docs-specific examples should be separate standalone components, not imports of `projects/example` pages

## Route Model

Prerendered static routes:

- `/`
- `/docs`
- `/docs/getting-started`
- `/docs/core-motion`
- `/docs/motion-values`
- `/docs/gestures`
- `/docs/presence`
- `/docs/layout`
- `/docs/scroll`
- `/docs/reorder`
- `/docs/imperative-animation`
- `/docs/advanced-apis`
- `/api`
- `/api/**`

Client-only routes:

- `/examples/**`
- `/playground/**`
- `/404.html`

Reason:

- docs and API pages should be crawlable and fast
- example and playground routes can safely use browser-only hooks

## Live Example Strategy

Use two layers for examples.

### Phase 1

Static docs pages link to dedicated live example routes:

- guide page contains explanation, code, and screenshot/placeholder
- “Open live example” goes to `/examples/...`

This is the safest initial version.

### Phase 2

Embed live examples into docs pages through a client-only wrapper component:

- server renders a placeholder shell only
- browser dynamically imports the standalone example component
- wrapper mounts the example only on the client

This gives the Angular Material-style experience without forcing the entire docs page to become client-only.

## Rendering Rules

Planned Analog configuration:

```ts
analog({
  ssr: true,
  static: true,
  prerender: {
    routes: async () => [
      '/',
      '/docs',
      '/docs/getting-started',
      '/docs/core-motion',
      '/docs/motion-values',
      '/docs/gestures',
      '/docs/presence',
      '/docs/layout',
      '/docs/scroll',
      '/docs/reorder',
      '/docs/imperative-animation',
      '/docs/advanced-apis',
      '/api',
      '/404.html',
    ],
  },
  nitro: {
    routeRules: {
      '/examples/**': { ssr: false },
      '/playground/**': { ssr: false },
      '/404.html': { ssr: false },
    },
  },
})
```

## Example Authoring Rules

Each public example should have:

- one standalone Angular component
- small, focused scope
- matching code snippets shown in the docs
- no dependency on internal demo-only styling or routing

Recommended file shape:

```text
src/app/examples/basics/fade-card/
  fade-card.example.ts
  fade-card.example.html
  fade-card.example.css
  fade-card.example.meta.ts
```

The `meta` file should provide:

- title
- short description
- related docs page
- tags
- raw source strings for code tabs

## Deployment

Deploy the static output from Analog’s public build directory.

Preferred hosts:

- Cloudflare Pages
- Vercel

## Implementation Order

1. Create `projects/docs-site`
2. Add Analog hybrid config
3. Move or copy core docs into content routes
4. Build docs-specific standalone examples
5. Add client-only `/examples/**` routes
6. Add embedded client-only example wrapper
7. Add API reference generation

## Source Notes

Analog references for this plan:

- Server-side rendering overview: https://analogjs.org/docs/features/server/server-side-rendering
- Static site generation: https://analogjs.org/docs/features/server/static-site-generation
- Content routes: https://analogjs.org/docs/features/routing/content
