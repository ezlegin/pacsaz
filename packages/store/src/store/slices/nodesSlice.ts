import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  groupNodes as _groupNodes,
  findNode,
  removeNodeById,
  ungroupNodeById,
} from "../../hepers/node";
import type { RootState } from "../store";
import { ISpec } from "../types";

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

    setNodes: (_, action: PayloadAction<ISpec.Nodes>) => {
      return action.payload;
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

    addEffect: (state, action) => {
      const node = findNode(state, action.payload.nodeId);
      if (!node) return;
      if (!node.effects) node.effects = [];
      node.effects.push(action.payload.effect);
    },

    updateEffect: (state, action) => {
      const node = findNode(state, action.payload.nodeId);
      if (!node) return;
      const fx = node.effects?.[action.payload.index];
      if (!fx) return;
      Object.assign(fx, action.payload.changes);
    },

    removeEffect: (state, action) => {
      const node = findNode(state, action.payload.nodeId);
      if (!node) return;
      node.effects?.splice(action.payload.index, 1);
      if (node.effects?.length === 0) delete node.effects;
    },
  },
});

export const {
  addNode,
  setNodes,
  addNodes,
  updateNode,
  removeNode,
  setNodeVisibility,
  groupNodes,
  ungroupNode,
  addEffect,
  removeEffect,
  updateEffect,
} = nodesSlice.actions;

export const nodesSelector = (state: RootState) => state.dieline.present.nodes;

export default nodesSlice.reducer;
