import { create } from "zustand";
import type { ReplayEvent } from "../types";

interface ModalState {
  event: ReplayEvent | null;
  open: (event: ReplayEvent) => void;
  close: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  event: null,
  open: (event: ReplayEvent) => set({ event }),
  close: () => set({ event: null }),
}));
