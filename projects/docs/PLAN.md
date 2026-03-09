# ng-motion Documentation Site — Plan

## Current State

The docs site is a standalone Angular app within the workspace at `projects/docs/`.
Run with `npx ng serve docs --port 4201`.

### Architecture

```
projects/docs/
├── tsconfig.app.json
├── public/                              # Static assets (favicon, images)
├── src/
│   ├── main.ts                          # Bootstrap
│   ├── index.html                       # Shell + Google Fonts
│   ├── styles.css                       # Tailwind v4 + custom theme
│   └── app/
│       ├── app.ts                       # Root: <app-nav /> + <router-outlet />
│       ├── app.config.ts                # Providers (router, ng-motion)
│       ├── app.routes.ts                # Lazy-loaded routes
│       ├── components/
│       │   └── nav.component.ts         # Fixed top nav with mobile menu
│       └── pages/
│           ├── home.page.ts             # Landing page (6 sections)
│           └── docs/
│               ├── docs-layout.ts       # Sidebar + content layout
│               └── getting-started.page.ts
```

### Tech Stack

| Layer          | Choice                     | Notes                                    |
| -------------- | -------------------------- | ---------------------------------------- |
| Framework      | Angular 21 (standalone)    | Same workspace as the library            |
| Animations     | ng-motion                  | Imported via workspace path alias        |
| Styling        | Tailwind CSS v4            | PostCSS plugin, `@theme` config in CSS   |
| Fonts          | Google Fonts               | Syne, Plus Jakarta Sans, JetBrains Mono  |
| Build          | `@angular/build:application` | Vite-based, dev + prod configs         |
| Package mgr    | bun                        | Consistent with workspace                |

---

## Design System

### Color Palette — "Cosmic Motion"

Dark theme with electric accents. Every color is defined as a Tailwind `@theme` variable in `styles.css`.

| Token            | Hex       | Usage                        |
| ---------------- | --------- | ---------------------------- |
| `deep`           | `#06060A` | Page background              |
| `surface`        | `#0F0F15` | Card backgrounds             |
| `elevated`       | `#171720` | Elevated surfaces, code bars |
| `border`         | `#1E1E2A` | Default borders              |
| `border-active`  | `#2A2A3A` | Hover/active borders         |
| `primary`        | `#F0EDE8` | Primary text (warm off-white)|
| `secondary`      | `#9B97A0` | Body text                    |
| `muted`          | `#5C5A63` | Captions, labels             |
| `accent`         | `#00E0C6` | Primary accent (electric teal)|
| `accent-pink`    | `#FF6B9D` | Secondary accent             |
| `accent-purple`  | `#B18CFF` | Tertiary accent              |
| `accent-gold`    | `#FFE566` | Highlights, warnings         |
| `code-bg`        | `#0C0C14` | Code block background        |

### Typography

| Role     | Font               | Tailwind class  |
| -------- | ------------------ | --------------- |
| Display  | Syne               | `font-display`  |
| Body     | Plus Jakarta Sans   | `font-sans`     |
| Code     | JetBrains Mono     | `font-mono`     |

- Headings: `font-display font-bold` (Syne)
- Body: default `font-sans` (Plus Jakarta Sans)
- Code inline: `font-mono text-sm px-1.5 py-0.5 rounded bg-accent-pink/10 text-accent-pink`
- Code blocks: `font-mono text-sm bg-code-bg` with terminal chrome (3 dots + filename)

### Border Radii

| Token    | Value  | Usage              |
| -------- | ------ | ------------------ |
| `card`   | 16px   | Cards, code blocks |
| `demo`   | 12px   | Demo containers    |
| `button` | 10px   | Buttons, pills     |

### Animation Patterns Used

All animations use ng-motion's `NgmMotionDirective`. Patterns used throughout the site:

**Entrance animations (scroll-triggered):**
```html
[initial]="{ opacity: 0, y: 40 }"
[whileInView]="{ opacity: 1, y: 0 }"
[viewport]="{ once: true, margin: '-50px' }"
```

**Staggered entrance (feature cards):**
```html
[transition]="{ delay: i * 0.1, type: 'spring', stiffness: 200, damping: 20 }"
```

**Hover spring:**
```html
[whileHover]="{ y: -6, scale: 1.02 }"
[transition]="{ type: 'spring', stiffness: 400, damping: 17 }"
```

**Continuous ambient (floating orbs):**
```html
[animate]="{ y: [-30, 30, -30], x: [-20, 20, -20] }"
[transition]="{ duration: 12, repeat: Infinity, ease: 'easeInOut' }"
```

**Character stagger (hero title):**
```
Variants with staggerChildren: 0.06, delayChildren: 0.3
Each char: spring with damping: 12, stiffness: 200
```

---

## Pages to Build

### Landing (done)
- [x] Hero with animated title, badge, CTAs, floating orbs
- [x] Features grid (6 cards with mini demos)
- [x] Interactive demo (drag / hover / tap)
- [x] Code example (code + live result)
- [x] Quick start (3 steps)
- [x] Footer

### Docs Pages (routes to add in `app.routes.ts`)

Each page lives in `pages/docs/` and is lazy-loaded. Add the route + component.

| Route                    | Page file                    | Status  |
| ------------------------ | ---------------------------- | ------- |
| `/docs/getting-started`  | `getting-started.page.ts`    | Done    |
| `/docs/installation`     | `installation.page.ts`       | Todo    |
| `/docs/quick-start`      | `quick-start.page.ts`        | Todo    |
| `/docs/motion-directive` | `motion-directive.page.ts`   | Todo    |
| `/docs/transitions`      | `transitions.page.ts`        | Todo    |
| `/docs/variants`         | `variants.page.ts`           | Todo    |
| `/docs/motion-values`    | `motion-values.page.ts`      | Todo    |
| `/docs/gestures`         | `gestures.page.ts`           | Todo    |
| `/docs/presence`         | `presence.page.ts`           | Todo    |
| `/docs/layout`           | `layout.page.ts`             | Todo    |
| `/docs/scroll`           | `scroll.page.ts`             | Todo    |
| `/docs/drag`             | `drag.page.ts`               | Todo    |
| `/docs/use-spring`       | `use-spring.page.ts`         | Todo    |
| `/docs/use-transform`    | `use-transform.page.ts`      | Todo    |
| `/docs/use-cycle`        | `use-cycle.page.ts`          | Todo    |
| `/docs/use-animate`      | `use-animate.page.ts`        | Todo    |
| `/docs/performance`      | `performance.page.ts`        | Todo    |
| `/docs/feature-loading`  | `feature-loading.page.ts`    | Todo    |
| `/docs/api-reference`    | `api-reference.page.ts`      | Todo    |

---

## Future Enhancements

### Syntax Highlighting
- **Option A: shiki** (recommended) — Build-time or runtime highlighting with VS Code themes. Use a pipe or component that calls `codeToHtml()`. Supports any language.
- **Option B: prismjs** — Already in package.json. Lighter but fewer themes.
- Apply to all `<code>` blocks. Theme should match the dark palette (custom shiki theme or `vitesse-dark`).

### Markdown Content (phase 2)
- Move doc content from inline templates to `.md` files in `src/content/`
- Use `marked` (already in package.json) to parse markdown at build time or runtime
- Create a `MarkdownPage` component that fetches and renders markdown
- Embed live demos via custom Angular components in markdown (MDX-like)

### Search
- **pagefind** — Free, local, works with static builds. Index the built HTML output.
- Add search UI to the nav bar (animated dropdown with results)

### Page Transitions
- Wrap `<router-outlet>` with `ngmPresence` for fade/slide between pages
- Or use Angular's `withViewTransitions()` (already configured in `app.config.ts`)

### SSG / Static Export
- Use `@angular/ssr` with prerendering for static hosting (GitHub Pages, Netlify, Vercel)
- Define all routes in a prerender config

### Additional Components to Build
- **CodeBlock component** — Reusable wrapper with copy button, filename tab, syntax highlighting
- **LiveDemo component** — Bordered demo area with "View Code" toggle
- **Callout component** — Info/warning/tip boxes for documentation
- **TableOfContents** — Auto-generated from heading elements, sticky on right side
- **PrevNext navigation** — Bottom of each doc page linking to prev/next pages

### Mobile
- Docs sidebar becomes a slide-out drawer (use `ngmPresence` for animation)
- Touch-friendly interactive demos
- Responsive typography scaling
