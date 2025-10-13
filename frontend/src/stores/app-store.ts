import { persist } from "zustand/middleware";
import { create } from "zustand/react";

type AppStore = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      isSidebarOpen: true,
      setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
    }),
    {
      name: "app-storage", // name of the item in the storage (must be unique)
    },
  ),
);
