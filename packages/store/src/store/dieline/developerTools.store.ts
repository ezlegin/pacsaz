import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { onDevelope } from "../../utils/onDevelope";

type DeveloperToolsCTX = {
  showContainer: boolean;
  showAnchors: boolean;
  showWatermark: boolean;
  doCenterSVG: boolean;
  dxf: string | undefined;
};

type DeveloperToolsStore = {
  developerTools: DeveloperToolsCTX;
  setDeveloperTools: (key: keyof DeveloperToolsCTX, val: boolean) => void;
};

const storeCreator = (set: any): DeveloperToolsStore => ({
  developerTools: {
    showContainer: true,
    showAnchors: false,
    showWatermark: true,
    doCenterSVG: true,
    dxf: undefined,
  },

  setDeveloperTools: (key, val) =>
    set((state: DeveloperToolsStore) => ({
      developerTools: {
        ...state.developerTools,
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

export const getDevCTX = () => useDeveloperToolsStore.getState().developerTools;
