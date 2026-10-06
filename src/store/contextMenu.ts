/** A single context menu for the whole desktop (§5.4). Components describe items; ContextMenu renders them. */
import { create } from "zustand";

export type MenuAction = {
  label: string;
  onSelect: () => void;
  /** The default action (what double-click does) is shown in bold. */
  isDefault?: boolean;
  disabled?: boolean;
};

export type MenuItem = MenuAction | "separator";

type ContextMenuStore = {
  menu: { x: number; y: number; items: MenuItem[] } | null;
  open: (x: number, y: number, items: MenuItem[]) => void;
  close: () => void;
};

export const useContextMenu = create<ContextMenuStore>((set) => ({
  menu: null,
  open: (x, y, items) => set({ menu: { x, y, items } }),
  close: () => set({ menu: null }),
}));
