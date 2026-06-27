import { create } from 'zustand';

/**
 * UIStore — ephemeral, app-wide UI state that many unrelated components need:
 * theme, global modal, sidebar, toast queue. NOT for server data, NOT for form
 * state (use React Hook Form), NOT for game state (use gameStore).
 */

type Theme = 'light' | 'dark';

export interface Toast {
  id: string;
  message: string;
  variant: 'info' | 'success' | 'error';
}

interface UIState {
  theme: Theme;
  sidebarOpen: boolean;
  toasts: Toast[];
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  pushToast: (toast: Toast) => void;
  dismissToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'light',
  sidebarOpen: false,
  toasts: [],
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  pushToast: (toast) => set((s) => ({ toasts: [...s.toasts, toast] })),
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
