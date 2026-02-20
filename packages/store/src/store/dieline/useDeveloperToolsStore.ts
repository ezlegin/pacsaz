import { create } from "zustand";
import { isSubscribed } from "../app/user.store";

type DeveloperToolsCTX = {
  showContainer: boolean;
  showAnchors: boolean;
  showWatermark: boolean;
  doCenterSVG: boolean;
};

type DeveloperToolsStore = {
  ctx: DeveloperToolsCTX;
  setDeveloperToolsCTX: (key: keyof DeveloperToolsCTX, val: boolean) => void;
};

export const useDeveloperToolsStore = create<DeveloperToolsStore>((set) => ({
  ctx: {
    showContainer: true,
    showAnchors: false,
    showWatermark: !isSubscribed,
    doCenterSVG: true,
  },

  setDeveloperToolsCTX: (key, val) =>
    set((state) => ({
      ctx: {
        ...state.ctx,
        [key]: val,
      },
    })),
}));

export const getDevCTX = () => useDeveloperToolsStore.getState().ctx;
