import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";

export namespace IVar {
  export type Variable = {
    id: string;
    name: string;
    conditions?: { if: string; then: string }[];
    value: string;
  };

  export type VariableMap = Variable[];
}

interface VariableStore {
  variables: IVar.VariableMap;
  setVariable: (variable: IVar.Variable) => void;
  setVariables: (variables: IVar.VariableMap) => void;
  removeVariable: (id: string) => void;
  updateVariable: (variable: IVar.Variable) => void;
}

export const useVariableStore = create<VariableStore>()((set) => ({
  variables: [],

  setVariable: ({ name, value, conditions }) =>
    set((state) => {
      const currentVars = state.variables;
      let id = uuidv4();
      while (currentVars.some((shape) => shape.id === id)) {
        id = uuidv4();
      }

      return {
        variables: [...currentVars, { id, name, conditions, value }],
      };
    }),

  setVariables: (variables) => set(() => ({ variables })),

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
}));

export const getVariables = () => useVariableStore.getState().variables;
