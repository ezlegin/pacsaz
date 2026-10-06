import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ISpec } from "../types";
import type { RootState } from "../store";
import {
  findNode,
  removeNodeById,
  ungroupNodeById,
  groupNodes as _groupNodes,
} from "../../hepers/node";

const initialState: ISpec.Nodes = [];

const nodesSlice = createSlice({
  name: "nodes",
  initialState,
  reducers: {
    addNode: (state, action: PayloadAction<ISpec.Node>) => {
      state.push(action.payload);
    },

    addNodes: (state, action: PayloadAction<ISpec.Node[]>) => {
      state.push(...action.payload);
    },

    updateNode: (
      state,
      action: PayloadAction<{
        id: string;
        changes: Partial<ISpec.Node>;
      }>,
    ) => {
      const node = findNode(state, action.payload.id);

      if (!node) return;

      Object.assign(node, action.payload.changes);
    },

    removeNode: (state, action: PayloadAction<string>) => {
      removeNodeById(state, action.payload);
    },

    setNodeVisibility: (state, action: PayloadAction<string>) => {
      const node = findNode(state, action.payload);

      if (node) {
        node.hidden = !node.hidden;
      }
    },

    groupNodes: (
      state,
      action: PayloadAction<{
        ids: string[];
        group: ISpec.Group;
      }>,
    ) => {
      _groupNodes(state, action.payload.ids, action.payload.group);
    },

    ungroupNode: (state, action: PayloadAction<string>) => {
      ungroupNodeById(state, action.payload);
    },
  },
});

export const {
  addNode,
  addNodes,
  updateNode,
  removeNode,
  setNodeVisibility,
  groupNodes,
  ungroupNode,
} = nodesSlice.actions;

export const nodesSelector = (state: RootState) => state.dieline.present.nodes;

export default nodesSlice.reducer;
