import { persist } from "zustand/middleware";
import { create } from "zustand/react";
import { useShallow } from "zustand/shallow";

export type Theme = "dark" | "light" | "system";

type AppStore = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      isSidebarOpen: true,
      setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
      theme: "system",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "app-storage", // name of the item in the storage (must be unique)
    },
  ),
);

export const useTheme = (): readonly [Theme, (theme: Theme) => void] => {
  return useAppStore(
    useShallow((state) => [state.theme, state.setTheme] as const),
  );
};

export const useSidebarState = (): readonly [boolean, (isOpen: boolean) => void] => {
  return useAppStore(
    useShallow((state) => [state.isSidebarOpen, state.setIsSidebarOpen] as const),
  );
};
