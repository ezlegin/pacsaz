import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { isSubscribed } from "../app/user.store";
import { onDevelope } from "../../utils/onDevelope";

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

const storeCreator = (set: any): DeveloperToolsStore => ({
  ctx: {
    showContainer: true,
    showAnchors: false,
    showWatermark: !isSubscribed,
    doCenterSVG: true,
  },

  setDeveloperToolsCTX: (key, val) =>
    set((state: DeveloperToolsStore) => ({
      ctx: {
        ...state.ctx,
        [key]: val,
      },
    })),
});

export const useDeveloperToolsStore = create<DeveloperToolsStore>()(
  onDevelope
    ? persist(storeCreator, {
        name: "developer-tools",
        storage: createJSONStorage(() => localStorage),
      })
    : storeCreator,
);

export const getDevCTX = () => useDeveloperToolsStore.getState().ctx;
