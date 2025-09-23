import { createSlice } from "@reduxjs/toolkit";

const workspaceSlice = createSlice({
  name: "workspace",
  initialState: {
    workspace: null,
    allworkspace: [],
  },
  reducers: {
    setWorkspace: (state, action) => {
      state.workspace = action.payload;
    },
    setAllworkspace: (state, action) => {
      state.allworkspace = action.payload;
    },
    clearworkspace: (state) => {
      state.workspace = null;
     
    },
  },
});

export const { setWorkspace,setAllworkspace} = workspaceSlice.actions;
export default workspaceSlice.reducer;
