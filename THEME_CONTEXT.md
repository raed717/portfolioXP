# THEME_CONTEXT.md — Retro Desktop Portfolio

> **Audience:** AI coding agent working on this repository.
> **Purpose:** Single source of truth for the visual theme, UX behavior, content model, and engineering rules. Read this fully before writing or modifying any code. When this file conflicts with a generic best practice, this file wins. When this file is silent, ask or choose the simplest option and document it.

---

## 1. Project Summary

A software engineer's portfolio presented as a **nostalgic, early-2000s desktop operating system** (Windows XP-inspired look and feel). Visitors explore the engineer's profile by **double-clicking icons, opening folders, reading files, and using "programs"** inside draggable windows.

**Core idea:** the OS is a wrapper. The substance (projects, skills, experience, contact) must always be clear, accessible, and reachable quickly.

**Tone:** playful, warm, nostalgic, slightly self-deprecating humor. Professional where content matters (project write-ups, CV).

**Primary audiences**
1. **Recruiters / hiring managers**: need the CV, key projects, and contact info within ~15 seconds.
2. **Fellow developers**: want to see code, architecture decisions, and technical depth.
3. **Casual visitors**: should enjoy the experience and discover easter eggs.

---

## 2. Non-Negotiable Rules

1. **Always provide a fast path.** A visible "Quick View" / plain-HTML CV link must exist at every entry point (login screen and desktop).
2. **Skip intro must always work.** Boot and login animations are skippable with a click, key press, or visible button, and are remembered per session.
3. **Respect `prefers-reduced-motion`.** Disable boot animation, window transitions, screensaver motion, and shakes when set. Provide a "Reduce motion" toggle in Control Panel.
4. **Sounds are opt-in.** Muted by default. Never autoplay audio. A clear mute/unmute toggle lives in the system tray.
5. **Accessible by default.** Full keyboard navigation, visible focus rings, ARIA roles, screen-reader friendly structure (see §10).
6. **Mobile is a first-class layout**, not an afterthought (see §9).
7. **Content over gimmick.** Never ship a window that shows placeholder text in production. Unfinished content shows the friendly "error dialog" pattern (§7.4), not lorem ipsum.
8. **No dead UI.** Every visible icon, menu item, and button must do something or show an intentional "not available" dialog.

---

## 3. Visual Language

### 3.1 Design principles
- **Skeuomorphic, glossy, rounded**: soft gradients, 3D beveled buttons, rounded window corners (top only), subtle drop shadows.
- **Dense and utilitarian**: small text, compact controls, like a real 2001-era desktop.
- **Consistent metaphors**: folders contain things, files open in the right "program", programs live in windows.
- **Nostalgia with polish**: crisp rendering, smooth drag, no jank. The retro look must not feel slow or broken.

### 3.2 Color tokens
Define all colors as CSS custom properties on `:root`. Never hardcode hex values in components.

```css
:root {
  /* Window chrome */
  --xp-titlebar-active-start: #0a5fe0;
  --xp-titlebar-active-end:   #3d95ff;
  --xp-titlebar-inactive-start: #7a96df;
  --xp-titlebar-inactive-end:   #a9bdf0;
  --xp-titlebar-text: #ffffff;
  --xp-window-border: #0831d9;
  --xp-window-bg: #ece9d8;          /* classic warm beige surface */
  --xp-panel-bg: #ffffff;           /* content area (explorer, notepad) */
  --xp-panel-border: #7f9db9;

  /* Taskbar & Start */
  --xp-taskbar-start: #2a62d9;
  --xp-taskbar-end:   #1f4fc0;
  --xp-start-green:   #3c9a3c;
  --xp-start-green-hover: #4fb24f;
  --xp-tray-bg: #0f8ee8;

  /* Controls */
  --xp-button-face: #f4f3ee;
  --xp-button-border: #003c74;
  --xp-button-hover-glow: #f8b636;  /* orange hover ring */
  --xp-button-active: #e1ddcf;
  --xp-selection-bg: #316ac5;
  --xp-selection-text: #ffffff;
  --xp-close-red: #e0462b;

  /* Text */
  --xp-text: #000000;
  --xp-text-muted: #5a5a5a;
  --xp-link: #0000ee;

  /* Semantic */
  --xp-error: #d32f2f;
  --xp-warning: #f5a623;
  --xp-success: #2e8b57;
}
```

Provide a **dark / alt theme hook** (`[data-theme="..."]`) so alternative skins (e.g., "Olive", "Silver", "Midnight") can be added later by overriding tokens only.

### 3.3 Typography
- **UI font stack:** `Tahoma, "Segoe UI", Verdana, "DejaVu Sans", sans-serif` at **11px to 12px** for chrome, **13px to 14px** for readable content windows.
- **Monospace (Notepad, Terminal, code):** `"Lucida Console", "Courier New", "DejaVu Sans Mono", monospace`.
- **Title bar:** bold, white, subtle text-shadow (`1px 1px 0 rgba(0,0,0,.4)`).
- Use `font-smoothing: auto`. Do not apply modern anti-aliasing tweaks that make text look too clean.
- Body content in long-form windows must stay readable: min 13px, line-height 1.5, max line length ~80ch.

### 3.4 Shape, depth, and spacing
- Window radius: `8px 8px 0 0`. Buttons: `3px`. Taskbar: square.
- Window shadow: `2px 2px 12px rgba(0,0,0,.45)` (active), lighter when inactive.
- Spacing scale: 2 / 4 / 6 / 8 / 12 / 16 px. Keep chrome tight.
- Bevels: use 1px inset/outset border pairs to fake 3D on classic controls.

### 3.5 Iconography
- **Original icon set**, 32×32 (desktop), 16×16 (menus/taskbar/titlebar), 48×48 (large views).
- Style: pixel-clean, slight gradient, 1px dark outline, XP-era "glossy" feel. Deliver as SVG where possible, with PNG fallbacks only if needed.
- Store in `/public/icons/` with consistent naming: `folder.svg`, `folder-open.svg`, `txt.svg`, `pdf.svg`, `exe.svg`, `terminal.svg`, `browser.svg`, `mail.svg`, `recycle-empty.svg`, `recycle-full.svg`, etc.
- Desktop icon labels: white text with dark text-shadow, 2 lines max, ellipsis after.

### 3.6 Wallpaper
- Original artwork: a stylized rolling green hill under a blue sky with clouds (own illustration, **not** a copy of any known wallpaper). Support `object-fit: cover`.
- Provide 2 to 3 alternative wallpapers selectable in Control Panel → Display.

---

## 4. Experience Flow

```
[Boot screen] → [Login screen] → [Desktop] → (Shutdown / Log off) → [Goodbye screen]
```

### 4.1 Boot screen
- Black background, original logo/wordmark, animated progress bar (looping blue blocks).
- Duration ≈ 2.5s. **Skippable** (click / any key / "Skip intro" link bottom-right).
- Skipped automatically if `sessionStorage.introSeen === "true"` or reduced motion is on.

### 4.2 Login screen
- Classic split layout: blue gradient background, left branding, right user list.
- Accounts (each sets a `persona` in global state and tailors the first view):
  | Account | Persona effect |
  |---|---|
  | **Recruiter** | Opens `Resume` window and highlights "Quick Facts" on launch |
  | **Fellow Dev** | Opens `Terminal` and the `Projects` folder |
  | **Guest** | Opens `about_me.txt` and a welcome dialog |
- Include a visible **"Quick View (plain CV)"** link that goes to a static HTML page.
- No real authentication. Optional playful password hint ("hint: my favorite language").

### 4.3 Desktop
- Wallpaper, left-aligned grid of icons, taskbar bottom, system tray with clock.
- Icon grid snaps to 90×90px cells, flows top-to-bottom, left-to-right.
- Single click selects, double click opens (on touch: single tap opens).

### 4.4 Shutdown / Log off
- Start menu → "Turn Off" shows a classic dialog (Stand By / Turn Off / Restart).
- "Turn Off" leads to a goodbye screen: "Thanks for visiting", contact links, GitHub/LinkedIn, and a "Power on" button that returns to boot.

---

## 5. Desktop Shell Components

### 5.1 Window manager (core)
Implement as a central store (Zustand recommended). Each window has:

```ts
type WindowState = {
  id: string;             // unique instance id
  appId: AppId;           // which program renders inside
  title: string;
  icon: string;
  x: number; y: number;
  width: number; height: number;
  minWidth: number; minHeight: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isFocused: boolean;
  params?: Record<string, unknown>; // e.g. { path: "/Projects/atlas" }
};
```

**Required behaviors**
- Drag by title bar; constrain so the title bar never leaves the viewport.
- Resize from all edges/corners (disabled if app declares `resizable: false`).
- Click anywhere on a window focuses it and raises `zIndex`.
- Minimize animates toward its taskbar button; restore reverses it.
- Maximize fills the area above the taskbar; double-click title bar toggles.
- Close removes the window and its taskbar button.
- Cascade new windows with a +24px offset; remember last position per `appId`.
- Single-instance apps (e.g., Control Panel) focus the existing window instead of opening a second one.
- `Esc` closes dialog-type windows; `Alt+F4` closes the focused window; `Alt+Tab` cycles windows (best effort).

### 5.2 Taskbar
- Left: Start button. Middle: one button per open window (active = pressed look). Right: tray.
- Clicking an inactive window button focuses it; clicking the active one minimizes it.
- Tray contains: volume/mute toggle, language/theme indicator (optional), live clock (`h:mm AM/PM`, tooltip shows full date).

### 5.3 Start menu
- Two-column layout.
  - **Left:** pinned programs (Resume, Terminal, Browser, Mail) and "All Programs" submenu listing every project and app.
  - **Right:** My Documents, My Projects, My Computer, Control Panel, Contact, and a link to the GitHub profile.
- Footer: "Log Off" and "Turn Off".
- The green Start button uses an **original label/logo** (e.g., the engineer's name or initials) instead of the Windows flag.
- Closes on outside click or `Esc`. Fully keyboard-navigable.

### 5.4 Context menus
- Right-click on desktop: *Refresh, New → Folder/Text Document (cosmetic), Properties*.
- Right-click on icon/file: *Open, Properties* (and *Open with…* where relevant).
- Custom menu component with hover highlight in `--xp-selection-bg`.

### 5.5 Dialogs and message boxes
- A reusable `<Dialog>` supports icon (info / warning / error / question), title, message, and button set (OK, Cancel, Yes/No).
- Modal dialogs dim and block the parent window only, not the whole desktop.

---

## 6. Content Model → XP Metaphor Map

All content lives in **typed data files**, not hardcoded in components (see §11).

| Desktop item | Component / App | Content shown |
|---|---|---|
| **My Documents** | `Explorer` | Folder tree: `/Projects`, `/Experience`, `/Education`, `/Writing`, `/Personal` |
| **My Computer** | `SystemInfo` | Skills as "drives": `C:` Languages, `D:` Frameworks, `E:` Tools, `F:` Soft skills. Usage bars = proficiency/frequency |
| **about_me.txt** | `Notepad` | Bio with optional typing effect (disabled under reduced motion) |
| **Resume.pdf** | `PdfViewer` | Embedded CV, with a download button |
| **Internet Explorer-style browser** *(own branding)* | `Browser` | Iframe loader for live project demos, fallback screenshot if embedding is blocked |
| **Mail client** | `Mail` | Contact form styled as a composer (To is prefilled) |
| **Recycle Bin** | `Explorer` | "Deleted" abandoned ideas, failed experiments, lessons learned |
| **Control Panel** | `ControlPanel` | Theme, wallpaper, sound, reduce motion, language |
| **Chat messenger** | `Chat` | AI assistant that answers questions about the engineer (optional, see §12) |
| **Paint-like app** | `Sketchpad` | Working canvas or design gallery |
| **Terminal (cmd)** | `Terminal` | Command-driven navigation (see §7.2) |
| **Games** | `Minesweeper`, `Solitaire` (own implementations) | Playable, lazy-loaded |

### 6.1 Project folders
Each project is a **folder** containing:
- `README.txt` — problem, role, approach, outcome (concise, scannable)
- `screenshots/` — images opening in an image viewer window
- `demo.exe` — launches the live demo in the Browser app (or shows a repo link)
- `stack.ini` — tech stack in INI-like format
- Right-click → **Properties** shows a tabbed dialog: *General* (name, date, role), *Tech Stack*, *Links* (GitHub, live), *Metrics* (results).

### 6.2 Project README structure (required fields)
```
PROJECT:   <name>
ROLE:      <your role / team size>
PERIOD:    <start – end>
PROBLEM:   <1–2 sentences>
SOLUTION:  <1–3 sentences>
STACK:     <comma-separated>
RESULTS:   <quantified outcomes where possible>
LINKS:     <repo>, <live demo>
```

---

## 7. Interaction Details & Easter Eggs

### 7.1 Sounds (opt-in)
Own-created short sounds: startup, click, window open/close, error ding, notification. Keep each under 50 KB. Preload lazily after the first user interaction. Respect the mute toggle everywhere.

### 7.2 Terminal commands
Minimum command set:

| Command | Behavior |
|---|---|
| `help` | Lists commands |
| `about` | Short bio |
| `projects` | Lists projects, `open <name>` opens its folder window |
| `skills` | Prints skills grouped by category |
| `experience` | Prints timeline |
| `contact` | Prints contact links |
| `theme <name>` | Switches theme |
| `clear` | Clears output |
| `ls`, `cd`, `cat` | Navigate the virtual file system and read files |
| `sudo hire-me` | Hidden easter egg: playful success message + opens contact |
| `exit` | Closes terminal |

Support command history (↑/↓) and tab completion for paths and commands.

### 7.3 Assistant sidekick
An original animated character (**not Clippy**) that appears occasionally with tips ("It looks like you're hiring a developer…"). Must be dismissible, and disabled permanently once dismissed (persist in `localStorage`). Never overlaps critical UI.

### 7.4 Fake error dialogs (friendly)
Used for unfinished or humorous states. Always provide an OK button and a witty, non-alarming message. Never block progress.

### 7.5 Blue-screen easter egg
Triggered by a hidden action (e.g., opening a deliberately forbidden file like `do_not_open.exe`). Fully dismissible with any key or click, returns to the desktop. Include a link to contact.

### 7.6 Screensaver
After 60s idle, a custom animation (bouncing logo or pipes-like 3D lines in own style). Any input exits. Disabled under reduced motion.

### 7.7 Other touches
- Hover tooltips on desktop icons.
- Recycle Bin icon changes between empty/full states.
- Window "shake to minimize all" is optional, off by default.
- Persist window layout and preferences in `localStorage` (guarded with try/catch).

---

## 8. Content & Copy Guidelines

- **Voice:** first person, friendly, concise. Humor is light and never at the expense of clarity.
- **Microcopy:** use period-appropriate phrasing ("Are you sure you want to delete…", "Please wait while Windows…" → rewrite to original wording like "Please wait while the system loads…").
- **Project descriptions:** lead with outcome, then approach. Quantify where possible.
- **No lorem ipsum** in any committed content file.
- **Placeholders for the owner** must use a recognizable token like `{{OWNER_NAME}}` and be listed in §14 so they are easy to find and replace.

---

## 9. Responsive & Mobile Strategy

| Breakpoint | Behavior |
|---|---|
| **≥ 1024px** | Full desktop experience with draggable, resizable windows |
| **768–1023px** | Windows draggable but default-maximized; icons in a smaller grid |
| **< 768px** | **Mobile mode**: no dragging or resizing. Windows open full-screen with a title bar and a back/close button. Taskbar becomes a compact bottom bar with Start and a window switcher. Desktop icons render in a 3 to 4 column grid. |

- Touch: single tap opens items, long-press opens the context menu.
- Test touch targets ≥ 44×44px in mobile mode.
- Never rely on hover for essential information.

---

## 10. Accessibility Requirements

- Semantic structure: windows use `role="dialog"` (or `role="region"` for non-modal) with `aria-labelledby` pointing at the title.
- All icons and window controls have accessible names (`aria-label`).
- Full keyboard support: `Tab` order is logical; arrow keys navigate icon grids and menus; `Enter`/`Space` activates; `Esc` closes menus and dialogs.
- Visible focus indicator (dotted XP-style outline or high-contrast ring) on all interactive elements.
- Color contrast: text ≥ 4.5:1 against its background. Check white-on-blue title bars and icon labels over the wallpaper (use text shadows or a label backdrop).
- Provide an `aria-live="polite"` region for window open/close announcements.
- A static **semantic HTML fallback** (`/cv`, `<noscript>`) contains the full content for crawlers, screen readers, and no-JS users.

---

## 11. Technical Architecture

### 11.1 Recommended stack
- **Framework:** React + TypeScript (Next.js or Vite). Prefer Next.js if SEO/static export matters.
- **State:** Zustand (window manager, preferences, persona).
- **Styling:** CSS Modules or Tailwind **plus** design tokens from §3.2. XP.css may be used as a base for controls.
- **Dragging/resizing:** `react-rnd` or a custom pointer-events hook.
- **Animation:** Framer Motion (respect reduced motion).
- **Terminal:** `xterm.js` or a lightweight custom implementation.
- **Testing:** Vitest + React Testing Library; Playwright for e2e flows.
- **Hosting:** Vercel or Netlify (static where possible).

### 11.2 Suggested folder structure
```
/src
  /app or /pages          # routes (/, /cv)
  /components
    /shell                # Desktop, Taskbar, StartMenu, Tray, ContextMenu
    /window               # Window, TitleBar, ResizeHandles, WindowManager
    /ui                   # Button, Dialog, Tabs, Menu, Tooltip, ProgressBar
  /apps                   # one folder per program
    /explorer /notepad /terminal /browser /mail
    /resume /controlpanel /sysinfo /chat /games
  /data                   # typed content (projects, skills, experience, fs tree)
  /store                  # zustand stores
  /hooks
  /styles                 # tokens.css, global.css, themes/
  /lib                    # utils, virtual file system, command parser
/public
  /icons /wallpapers /sounds /fonts
```

### 11.3 Virtual file system (VFS)
Model the portfolio as a typed tree. Everything the Explorer, Terminal, and Start menu show derives from it.

```ts
type VNode =
  | { type: "folder"; name: string; icon?: string; children: VNode[] }
  | { type: "file"; name: string; ext: "txt" | "pdf" | "exe" | "png" | "ini" | "md";
      opensWith: AppId; content?: string; src?: string; meta?: Record<string, unknown> };
```

- One source of truth: edit `/data/fs.ts` (or JSON) and every app updates.
- File extension → default app mapping lives in one registry (`/apps/registry.ts`).

### 11.4 App registry
```ts
type AppDefinition = {
  id: AppId;
  title: string;
  icon: string;
  component: React.LazyExoticComponent<...>;
  defaultSize: { width: number; height: number };
  resizable: boolean;
  singleInstance: boolean;
};
```
Adding a new program = add one registry entry + one component. No other wiring.

### 11.5 Performance budget
- Initial JS (shell only) **< 200 KB gzipped**. Lazy-load every app, games, and the terminal.
- Preload only the Explorer and Notepad after idle.
- Images: modern formats (WebP/AVIF), sized per use, lazy-loaded.
- Target Lighthouse: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 90 on the static fallback.
- Drag interactions must hold 60fps: use `transform` for movement, avoid layout thrash.

### 11.6 Storage
- Use `localStorage` only for preferences (theme, sound, reduce motion, sidekick dismissed, window layout) and always wrap in try/catch with safe defaults.
- Never store personal data from the contact form.

### 11.7 Security & privacy
- Browser app iframes use `sandbox` and a strict allow-list of project URLs; show a fallback if `X-Frame-Options` blocks embedding.
- Contact form: validate client and server side, rate limit, add a honeypot field. Do not expose email in plain text in the DOM (obfuscate or use a form endpoint).
- If an AI chat is added (§12), proxy through a server route. **Never expose API keys in the client.**

---

## 12. Optional / Stretch Features
- AI chat messenger answering questions about the engineer using a curated knowledge base (server-side proxy, rate limited, clear "AI" labeling).
- Multiple themes (Luna Blue, Olive, Silver).
- Drag-and-drop files between folders (cosmetic).
- Multi-language support (EN/FR).
- Analytics (privacy-friendly, cookie-less) to see which icons are opened most.

---

## 13. Quality Checklist (Definition of Done)

Before marking any task complete, verify:

- [ ] Uses design tokens only (no hardcoded colors/fonts).
- [ ] No Microsoft trademarks or assets used.
- [ ] Works with keyboard only; focus is visible.
- [ ] Respects `prefers-reduced-motion` and the sound mute state.
- [ ] Works in mobile mode (< 768px) without dragging.
- [ ] New content added to `/data`, not hardcoded in JSX.
- [ ] New app registered in the app registry and lazy-loaded.
- [ ] Windows focus, minimize, maximize, close, and taskbar sync correctly.
- [ ] No console errors or warnings; types compile; lint passes.
- [ ] Unit/e2e test added for new behavior where practical.
- [ ] Static `/cv` fallback updated if profile content changed.

---

## 14. Owner Placeholders (to be filled in)

Search the repo for these tokens and replace with real content before launch:

| Token | Meaning |
|---|---|
| `{{OWNER_NAME}}` | Full name |
| `{{OWNER_TITLE}}` | Job title (e.g., Software Engineer) |
| `{{OWNER_TAGLINE}}` | One-line pitch |
| `{{OWNER_EMAIL}}` | Contact email |
| `{{GITHUB_URL}}` `{{LINKEDIN_URL}}` | Social links |
| `{{CV_PDF_PATH}}` | Path to the resume PDF |
| `{{START_LABEL}}` | Text/logo for the Start button |
| `{{PROJECTS}}` | Project data entries in `/data` |

---

## 15. Agent Working Agreement

1. **Plan before coding.** For any non-trivial task, outline files to touch and approach in a few lines.
2. **Small, reviewable changes.** One feature per change set; keep components focused.
3. **Reuse before creating.** Check `/components/ui` and `/apps` for existing patterns.
4. **Document as you go.** Update this file or a `/docs` note when a new convention is introduced.
5. **Ask when unclear** about content or personal details; never invent facts about the owner (employers, dates, metrics).
6. **Prefer the simplest implementation** that satisfies the behavior and the checklist in §13.
7. **Stay in theme.** If a UI element has no XP-era equivalent, design it to feel native to the era (bevels, gradients, Tahoma, compact sizing) rather than using modern flat defaults.
