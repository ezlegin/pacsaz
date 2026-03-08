import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

export namespace IVar {
  export type Variable = {
    id: string;
    name: string;
    value: string;
  };

  export type VariableMap = Variable[];
}

interface VariableStore {
  variables: IVar.VariableMap;
  setVariable: (variable: IVar.Variable) => void;
  removeVariable: (id: string) => void;
  updateVariable: (variable: IVar.Variable) => void;
}

export const useVariableStore = create<VariableStore>()(
  persist(
    (set) => ({
      variables: [],

      setVariable: ({ name, value }) =>
        set((state) => {
          const currentVars = state.variables;
          let id = uuidv4();
          while (currentVars.some((shape) => shape.id === id)) {
            id = uuidv4();
          }

          return {
            variables: [...currentVars, { id, name, value }],
          };
        }),

      removeVariable: (id) =>
        set((state) => ({
          variables: state.variables.filter((v) => v.id !== id),
        })),

      updateVariable: (variable) =>
        set((state) => ({
          variables: state.variables.map((v) =>
            v.id === variable.id ? variable : v,
          ),
        })),
    }),
    {
      name: "editor-variables-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const getVariables = () => useVariableStore.getState().variables;
