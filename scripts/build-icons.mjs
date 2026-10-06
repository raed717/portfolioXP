/**
 * Generates the original icon set in /public/icons (THEME_CONTEXT.md §3.5).
 * Run with `node scripts/build-icons.mjs` after editing a definition below.
 * Style: 32×32 grid, soft vertical gradient, 1px dark outline, white gloss line.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "icons");

const grad = (id, top, bottom) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>`;
const radial = (id, inner, outer) =>
  `<radialGradient id="${id}" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="${inner}"/><stop offset="1" stop-color="${outer}"/></radialGradient>`;
const svg = (defs, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs>${defs}</defs>${body}</svg>\n`;

const PAGE = `<path d="M7 3.5h13l5 5v20H7z" fill="url(#pg)" stroke="#5a6f8f"/><path d="M20 3.5v5h5" fill="#dfe8f5" stroke="#5a6f8f" stroke-linejoin="round"/>`;
const PAGE_DEFS = grad("pg", "#ffffff", "#e3eaf5");
const FOLDER_BACK = `<path d="M3 8.5h9l2 2.5h14.5v15.5H3z" fill="url(#fb)" stroke="#a87b12"/>`;
const FOLDER_FRONT = `<path d="M3 13h25.5v13.5H3z" fill="url(#ff)" stroke="#a87b12"/><path d="M4 14h23.5" stroke="#fff" stroke-opacity=".75"/>`;
const FOLDER_DEFS = grad("fb", "#ffe9a3", "#e9b53a") + grad("ff", "#fff3c4", "#f2c650");
const TILE = (top, bottom, stroke) =>
  `<rect x="2.5" y="2.5" width="27" height="27" rx="5" fill="url(#t)" stroke="${stroke}"/><path d="M6 4h20" stroke="#fff" stroke-opacity=".6" stroke-linecap="round"/>`;
const TILE_DEFS = (top, bottom) => grad("t", top, bottom);
const DISC = (inner, outer, stroke) =>
  `<circle cx="16" cy="16" r="13" fill="url(#d)" stroke="${stroke}"/><path d="M8 10a10 10 0 0 1 16 0" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.5" stroke-linecap="round"/>`;
const DISC_DEFS = (inner, outer) => radial("d", inner, outer);
const BIN = `<path d="M8 9.5h16l-1.8 18H9.8z" fill="url(#bn)" stroke="#4d6a8a"/><rect x="6.5" y="6.5" width="19" height="3.5" rx="1" fill="url(#bl)" stroke="#4d6a8a"/><path d="M12.5 12.5l.6 12M16 12.5v12M19.5 12.5l-.6 12" stroke="#4d6a8a" stroke-opacity=".6"/>`;
const BIN_DEFS = grad("bn", "#e8f2fb", "#9fbcd8") + grad("bl", "#f5f9fd", "#b9cfe4");

const icons = {
  folder: svg(FOLDER_DEFS, FOLDER_BACK + FOLDER_FRONT),
  "folder-open": svg(
    FOLDER_DEFS,
    FOLDER_BACK +
      `<path d="M3 26.5l3.5-12.5h24L27 26.5z" fill="url(#ff)" stroke="#a87b12" stroke-linejoin="round"/><path d="M7.2 15.2h22" stroke="#fff" stroke-opacity=".75"/>`,
  ),
  "folder-documents": svg(
    FOLDER_DEFS,
    FOLDER_BACK +
      `<path d="M8 6.5h13v10H8z" fill="#fff" stroke="#7a8fb0"/><path d="M10 9h9M10 11h9M10 13h6" stroke="#7a8fb0"/>` +
      FOLDER_FRONT,
  ),
  txt: svg(PAGE_DEFS, PAGE + `<path d="M10 13h12M10 16h12M10 19h12M10 22h8" stroke="#7a8fb0"/>`),
  ini: svg(
    PAGE_DEFS + radial("g", "#fff6c8", "#d9a520"),
    PAGE +
      `<path d="M10 12h10M10 15h7" stroke="#7a8fb0"/><circle cx="18" cy="22" r="4.2" fill="url(#g)" stroke="#8a6410"/><circle cx="18" cy="22" r="1.5" fill="#fff" stroke="#8a6410"/>`,
  ),
  pdf: svg(
    PAGE_DEFS + grad("r", "#f2665a", "#c42b1f"),
    PAGE +
      `<path d="M10 11h12M10 14h12" stroke="#7a8fb0"/><rect x="5" y="17" width="17" height="8" rx="1.5" fill="url(#r)" stroke="#8c1d14"/><text x="13.5" y="23.4" font-family="Tahoma,Verdana,sans-serif" font-size="6.5" font-weight="bold" fill="#fff" text-anchor="middle">PDF</text>`,
  ),
  image: svg(
    grad("s", "#bfe3ff", "#5aa8ec") + grad("h", "#8ed46a", "#3f9a2c"),
    `<rect x="3.5" y="5.5" width="25" height="21" rx="1.5" fill="#fff" stroke="#5a6f8f"/><rect x="6" y="8" width="20" height="16" fill="url(#s)"/><path d="M6 24v-5c4-3 8-3 11 0s6 2 9-1v6z" fill="url(#h)"/><circle cx="21.5" cy="12" r="2.2" fill="#ffe680"/>`,
  ),
  exe: svg(
    grad("tb", "#3d95ff", "#0a5fe0") + grad("w", "#ffffff", "#ece9d8"),
    `<rect x="3.5" y="5.5" width="25" height="21" rx="2" fill="url(#w)" stroke="#0831d9"/><path d="M3.5 7.5a2 2 0 0 1 2-2h21a2 2 0 0 1 2 2v3h-25z" fill="url(#tb)"/><path d="M3.5 10.5h25" stroke="#0831d9"/><rect x="7" y="14" width="8" height="9" fill="#cfe0f7" stroke="#7f9db9"/><path d="M18 15h7M18 18h7M18 21h5" stroke="#7f9db9"/>`,
  ),
  terminal: svg(
    grad("tb", "#5a6a80", "#2c3644"),
    `<rect x="2.5" y="5.5" width="27" height="21" rx="2" fill="#10151c" stroke="#2c3644"/><path d="M2.5 7.5a2 2 0 0 1 2-2h23a2 2 0 0 1 2 2v2h-27z" fill="url(#tb)"/><path d="M7 14l4 3-4 3" fill="none" stroke="#c8f7c5" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 21h7" stroke="#c8f7c5" stroke-width="1.6" stroke-linecap="round"/>`,
  ),
  browser: svg(
    radial("d", "#a9dcff", "#1f6fd1"),
    `<circle cx="15" cy="17" r="11.5" fill="url(#d)" stroke="#124b97"/><path d="M8 12c3 1 4 4 2 6s1 5 3 6M18 7c-1 3 2 4 5 4s3 4 1 6-1 5-3 5" fill="none" stroke="#5fbf4a" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="16" cy="15" rx="14.5" ry="5" transform="rotate(-25 16 15)" fill="none" stroke="#f39c1e" stroke-width="2"/><circle cx="27.5" cy="9.5" r="2" fill="#ffd36b" stroke="#b46b00"/>`,
  ),
  mail: svg(
    grad("e", "#ffffff", "#dce6f2"),
    `<rect x="3.5" y="8.5" width="25" height="17" rx="1.5" fill="url(#e)" stroke="#5a6f8f"/><path d="M4 9.5l12 9 12-9" fill="none" stroke="#5a6f8f"/><path d="M4 25l9-8M28 25l-9-8" stroke="#5a6f8f" stroke-opacity=".6"/><circle cx="25" cy="9" r="4" fill="#f39c1e" stroke="#9c5a00"/><path d="M25 7v2.5" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/><circle cx="25" cy="11" r=".8" fill="#fff"/>`,
  ),
  "recycle-empty": svg(BIN_DEFS, BIN),
  "recycle-full": svg(
    BIN_DEFS,
    `<path d="M9 7l4-4 3 3M15 5.5l6-2 2 4M20 6l5 1-1 3" fill="#fff" stroke="#7a8fb0" stroke-linejoin="round"/>` +
      BIN,
  ),
  computer: svg(
    grad("m", "#f4f3ee", "#c9c5b2") + grad("s", "#6fb4ff", "#1c5fc7"),
    `<rect x="3.5" y="4.5" width="25" height="18" rx="2" fill="url(#m)" stroke="#6b6650"/><rect x="6" y="7" width="20" height="13" fill="url(#s)" stroke="#33405a"/><path d="M7 8.5l7 0" stroke="#fff" stroke-opacity=".6"/><path d="M13 22.5h6l1 3h-8z" fill="url(#m)" stroke="#6b6650"/><rect x="8.5" y="25.5" width="15" height="3" rx="1" fill="url(#m)" stroke="#6b6650"/>`,
  ),
  "control-panel": svg(
    grad("w", "#ffffff", "#ece9d8"),
    `<rect x="3.5" y="4.5" width="25" height="23" rx="2" fill="url(#w)" stroke="#5a6f8f"/><path d="M9 9v14M16 9v14M23 9v14" stroke="#7f9db9" stroke-width="2" stroke-linecap="round"/><rect x="6.5" y="12" width="5" height="3.5" rx="1" fill="#3c9a3c" stroke="#1f5e1f"/><rect x="13.5" y="17" width="5" height="3.5" rx="1" fill="#0a5fe0" stroke="#08389a"/><rect x="20.5" y="10" width="5" height="3.5" rx="1" fill="#f39c1e" stroke="#9c5a00"/>`,
  ),
  properties: svg(
    PAGE_DEFS + radial("d", "#d7ecff", "#2e78d6"),
    PAGE +
      `<path d="M10 12h12M10 15h8" stroke="#7a8fb0"/><circle cx="19" cy="22" r="5" fill="url(#d)" stroke="#124b97"/><path d="M19 21v4" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/><circle cx="19" cy="19" r=".9" fill="#fff"/>`,
  ),
  mine: svg(
    radial("d", "#7a7a7a", "#0d0d0d"),
    `<path d="M16 3v26M3 16h26M6.8 6.8l18.4 18.4M25.2 6.8L6.8 25.2" stroke="#1a1a1a" stroke-width="2.2" stroke-linecap="round"/><circle cx="16" cy="16" r="8.5" fill="url(#d)" stroke="#000"/><rect x="11.5" y="11.5" width="3" height="3" fill="#fff"/>`,
  ),
  info: svg(
    DISC_DEFS("#9cd0ff", "#1c64c8"),
    DISC("", "", "#0e3f86") +
      `<circle cx="16" cy="10" r="1.8" fill="#fff"/><path d="M16 14v9" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`,
  ),
  question: svg(
    DISC_DEFS("#9cd0ff", "#1c64c8"),
    DISC("", "", "#0e3f86") +
      `<path d="M12 12.5a4 4 0 1 1 5.5 3.7c-1 .4-1.5 1-1.5 2v1" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/><circle cx="16" cy="23" r="1.6" fill="#fff"/>`,
  ),
  error: svg(
    DISC_DEFS("#ff9a8c", "#c4271a"),
    DISC("", "", "#7d140b") +
      `<path d="M11 11l10 10M21 11L11 21" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`,
  ),
  warning: svg(
    grad("y", "#fff1a8", "#f2b51d"),
    `<path d="M16 3.5L29 27.5H3z" fill="url(#y)" stroke="#8a6410" stroke-linejoin="round"/><path d="M16 11v8" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/><circle cx="16" cy="23.3" r="1.7" fill="#1a1a1a"/>`,
  ),
  "user-recruiter": svg(
    TILE_DEFS("#ffd38a", "#e28a12") + grad("b", "#a0683a", "#6b3f1c"),
    TILE("", "", "#8c4f00") +
      `<rect x="8" y="12" width="16" height="11" rx="1.5" fill="url(#b)" stroke="#3d2410"/><path d="M13 12v-2a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" fill="none" stroke="#3d2410" stroke-width="1.4"/><path d="M8 16.5h16" stroke="#3d2410"/><rect x="14.5" y="15.5" width="3" height="2.5" fill="#ffd36b" stroke="#3d2410" stroke-width=".6"/>`,
  ),
  "user-dev": svg(
    TILE_DEFS("#9ee59a", "#2f8f3a"),
    TILE("", "", "#1c5e24") +
      `<path d="M12 11l-5 5 5 5M20 11l5 5-5 5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M17.5 9.5l-3 13" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`,
  ),
  "user-guest": svg(
    TILE_DEFS("#b5d6ff", "#3a7be0"),
    TILE("", "", "#1f4fa3") +
      `<circle cx="16" cy="16" r="8" fill="#ffd94d" stroke="#8a6410"/><circle cx="13.3" cy="14.3" r="1.1" fill="#3d2410"/><circle cx="18.7" cy="14.3" r="1.1" fill="#3d2410"/><path d="M12.5 17.8a4 4 0 0 0 7 0" fill="none" stroke="#3d2410" stroke-width="1.3" stroke-linecap="round"/>`,
  ),
  logo: svg(
    grad("l", "#5bd16b", "#1c7fd6"),
    `<rect x="2.5" y="2.5" width="27" height="27" rx="8" fill="url(#l)" stroke="#0d4a8a"/><path d="M7 6.5h18" stroke="#fff" stroke-opacity=".55" stroke-linecap="round"/><text x="16" y="21" font-family="Tahoma,Verdana,sans-serif" font-size="12" font-weight="bold" fill="#fff" text-anchor="middle">RG</text>`,
  ),
  repo: svg(
    grad("c", "#5a6a80", "#2c3644"),
    `<path d="M7 4.5h16.5a1 1 0 0 1 1 1V27.5H9a2 2 0 0 1-2-2z" fill="url(#c)" stroke="#1a2230"/><path d="M7 23.5a2 2 0 0 1 2-2h15.5" fill="none" stroke="#fff" stroke-opacity=".6"/><circle cx="13" cy="9" r="1.6" fill="#c8f7c5"/><circle cx="13" cy="17" r="1.6" fill="#c8f7c5"/><circle cx="19" cy="11.5" r="1.6" fill="#c8f7c5"/><path d="M13 10.6v4.8M19 13.1c0 2-3 2-5.2 3" fill="none" stroke="#c8f7c5" stroke-width="1.2"/>`,
  ),
  power: svg(
    DISC_DEFS("#ff9a8c", "#c4271a"),
    DISC("", "", "#7d140b") +
      `<path d="M11.5 11.5a6.5 6.5 0 1 0 9 0" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><path d="M16 8v8" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>`,
  ),
  restart: svg(
    DISC_DEFS("#a6ec9c", "#2f8f3a"),
    DISC("", "", "#1c5e24") +
      `<path d="M22 13a6.5 6.5 0 1 0 .5 5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><path d="M23.5 8.5v5h-5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`,
  ),
  standby: svg(
    DISC_DEFS("#ffe9a3", "#e0a21a"),
    DISC("", "", "#8a6410") + `<path d="M19 9a7.5 7.5 0 1 0 4 12A6 6 0 0 1 19 9z" fill="#fff"/>`,
  ),
  logoff: svg(
    TILE_DEFS("#ffe9a3", "#e0a21a"),
    TILE("", "", "#8a6410") +
      `<path d="M14 8.5H9v15h5" fill="none" stroke="#fff" stroke-width="2.2" stroke-linejoin="round"/><path d="M13.5 16h10M20 12l4 4-4 4" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`,
  ),
  programs: svg(
    DISC_DEFS("#a6ec9c", "#2f8f3a"),
    DISC("", "", "#1c5e24") +
      `<path d="M10 16h11M17 11l5 5-5 5" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`,
  ),
  "sound-on": svg(
    grad("s", "#f4f3ee", "#b8b39a"),
    `<path d="M4.5 12.5h5l7-6v19l-7-6h-5z" fill="url(#s)" stroke="#3d3a2c" stroke-linejoin="round"/><path d="M20 12a5 5 0 0 1 0 8M23 9a9 9 0 0 1 0 14" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`,
  ),
  "sound-off": svg(
    grad("s", "#f4f3ee", "#b8b39a"),
    `<path d="M4.5 12.5h5l7-6v19l-7-6h-5z" fill="url(#s)" stroke="#3d3a2c" stroke-linejoin="round"/><circle cx="24" cy="16" r="5.5" fill="#e0462b" stroke="#7d140b"/><path d="M21.5 13.5l5 5M26.5 13.5l-5 5" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>`,
  ),
  "nav-back": svg(
    DISC_DEFS("#a6ec9c", "#2f8f3a"),
    DISC("", "", "#1c5e24") +
      `<path d="M22 16H11M15 11l-5 5 5 5" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`,
  ),
  "nav-forward": svg(
    DISC_DEFS("#a6ec9c", "#2f8f3a"),
    DISC("", "", "#1c5e24") +
      `<path d="M10 16h11M17 11l5 5-5 5" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`,
  ),
  "nav-up": svg(
    FOLDER_DEFS,
    FOLDER_BACK +
      FOLDER_FRONT +
      `<path d="M16 24v-8M12 19l4-4 4 4" fill="none" stroke="#2f8f3a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`,
  ),
  views: svg(
    grad("w", "#ffffff", "#dce6f2"),
    `<rect x="3.5" y="4.5" width="25" height="23" rx="2" fill="url(#w)" stroke="#5a6f8f"/><rect x="7" y="8" width="6" height="6" fill="#3d95ff"/><rect x="7" y="18" width="6" height="6" fill="#3c9a3c"/><path d="M16 10h9M16 13h6M16 20h9M16 23h6" stroke="#7a8fb0" stroke-width="1.4"/>`,
  ),
  // "Flop", the sidekick (§7.3): an original floppy-disk character.
  sidekick: svg(
    grad("b", "#4f7fe0", "#1f45a8") + grad("l", "#ffffff", "#e3eaf5"),
    `<rect x="4.5" y="3.5" width="23" height="25" rx="2.5" fill="url(#b)" stroke="#132e72"/><rect x="10" y="3.5" width="12" height="7" fill="#c9d3e3" stroke="#132e72"/><rect x="18" y="4.8" width="2.6" height="4.4" fill="#132e72"/><rect x="8" y="15" width="16" height="11" rx="1" fill="url(#l)" stroke="#132e72"/><circle cx="13" cy="19.5" r="1.6" fill="#1a1a1a"/><circle cx="19" cy="19.5" r="1.6" fill="#1a1a1a"/><circle cx="13.5" cy="19" r=".5" fill="#fff"/><circle cx="19.5" cy="19" r=".5" fill="#fff"/><path d="M13.5 23a3 2.2 0 0 0 5 0" fill="none" stroke="#1a1a1a" stroke-width="1.1" stroke-linecap="round"/><circle cx="10.6" cy="22.4" r="1" fill="#ff9aa2" opacity=".7"/><circle cx="21.4" cy="22.4" r="1" fill="#ff9aa2" opacity=".7"/>`,
  ),
  drive: svg(
    grad("h", "#f4f3ee", "#b8b39a"),
    `<path d="M5 13l3-6h16l3 6z" fill="#e9e6d6" stroke="#6b6650" stroke-linejoin="round"/><rect x="4.5" y="13" width="23" height="11" rx="1.5" fill="url(#h)" stroke="#6b6650"/><circle cx="23" cy="18.5" r="1.6" fill="#3fd14b" stroke="#1c5e24" stroke-width=".6"/><path d="M8 18.5h9" stroke="#6b6650" stroke-width="1.4" stroke-linecap="round"/>`,
  ),
};

mkdirSync(OUT, { recursive: true });
for (const [name, markup] of Object.entries(icons)) {
  writeFileSync(join(OUT, `${name}.svg`), markup);
}
console.log(`Wrote ${Object.keys(icons).length} icons to ${OUT}`);
