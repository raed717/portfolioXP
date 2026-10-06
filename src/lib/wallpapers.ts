/** Wallpapers selectable in Control Panel → Desktop (§3.6). `src: null` means a plain colour. */
export type Wallpaper = { label: string; src: string | null };

export const WALLPAPERS: Record<string, Wallpaper> = {
  // Owner-supplied photo. See docs/SPRINTS.md: must be replaced with original art before launch.
  meadow: { label: "Green Meadow", src: "/wallpapers/wallpaper.jpg" },
  hills: { label: "Rolling Hills", src: "/wallpapers/hills.svg" },
  dusk: { label: "Desert Dusk", src: "/wallpapers/dusk.svg" },
  plain: { label: "Plain Blue", src: null },
};

export const DEFAULT_WALLPAPER = "meadow";

export function wallpaperSrc(id: string): string | null {
  return (WALLPAPERS[id] ?? WALLPAPERS[DEFAULT_WALLPAPER]).src;
}
