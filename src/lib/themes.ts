/** Skins (§3.2, §12). Tokens live in styles/themes/index.css; this is the list the UI offers. */
export const THEMES = [
  { id: "luna", label: "Luna Blue" },
  { id: "olive", label: "Olive" },
  { id: "silver", label: "Silver" },
  { id: "midnight", label: "Midnight" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export function isThemeId(value: string): value is ThemeId {
  return THEMES.some((t) => t.id === value);
}
