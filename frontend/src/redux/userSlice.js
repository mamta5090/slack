import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,   
  users: [],    
  singleUser: null, 
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
    setUsers: (state, action) => {
      state.users = action.payload;
    },
    setSingleUser: (state, action) => {   // 👈 new reducer
      state.singleUser = action.payload;
    },
  },
});

export const { setUser, clearUser, setUsers, setSingleUser } = userSlice.actions;
export default userSlice.reducer;
