# PortfolioXP

A software engineer's portfolio presented as a nostalgic early-2000s desktop.
Read [`THEME_CONTEXT.md`](./THEME_CONTEXT.md) before changing anything. The roadmap is in [`docs/SPRINTS.md`](./docs/SPRINTS.md).

## Scripts

```bash
npm run dev        # http://localhost:3000  (plain CV at /cv)
npm run build
npm run typecheck  # next typegen + tsc
npm run lint
npm test           # vitest
```

## Architecture

```
src/
  app/                 routes: / (desktop experience), /cv (static semantic CV)
  apps/                one folder per program + registry.ts (metadata, lazy loader, ext → app)
  components/
    shell/             Desktop, Taskbar, StartMenu, Tray, ContextMenu
    window/            Window, TitleBar, WindowManager
    ui/                Button, Dialog, Tabs, Menu, Tooltip, ProgressBar
  data/
    content/*.json     ← owner content: edit these
    index.ts           typed + normalized content (projects get slugs, null links)
    fs.ts              the virtual file system derived from content
  hooks/               useLayoutMode, useReducedMotion, …
  lib/                 vfs, storage (guarded), themes, slugify
  store/               zustand: windows, preferences (persisted), session
  styles/              tokens.css (design tokens), themes/
public/
  cv/                  resume PDF
  images/              local project screenshots
  icons/ wallpapers/ sounds/
```

### Conventions

- **Colors and fonts come only from tokens** (`var(--xp-*)` or the `bg-xp-*` / `font-ui` Tailwind utilities).
- **Content lives in `src/data/content`.** Components read from `@/data` or `@/data/fs`, never from raw JSON.
- **Adding an app** takes one entry in `src/apps/registry.ts` (with `load: () => import("./<app>")`) plus the component. An entry without `load` renders the friendly "not available yet" dialog.
- **Window behavior** lives in `src/store/windows.ts` and is unit-tested. UI components only call its actions.
