import { create } from "zustand";

interface ModuleState {
  activeModule: string;
  setActiveModule: (module: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useModuleState = create<ModuleState>((set) => ({
  activeModule: "dashboard",
  setActiveModule: (module: string) => set({ activeModule: module }),
  sidebarOpen: true,
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
}));
