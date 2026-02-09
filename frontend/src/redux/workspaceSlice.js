import { createSlice } from "@reduxjs/toolkit";

const workspaceSlice = createSlice({
  name: "workspace",
  initialState: {
    workspace: null,      // current workspace
    allworkspace: [],     // list of workspaces
  },
  reducers: {
    setWorkspace: (state, action) => {
      state.workspace = action.payload;
    },
    setAllWorkspaces: (state, action) => {
      state.allworkspace = action.payload;
    },
    clearWorkspace: (state) => {
      state.workspace = null;
      state.allworkspace = [];
    },
  },
});

export const { setWorkspace, setAllWorkspaces, clearWorkspace } =
  workspaceSlice.actions;

export default workspaceSlice.reducer;
