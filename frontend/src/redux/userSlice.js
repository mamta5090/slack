// PREVIOUS CODE
/*
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
*/

// MODIFIED CODE
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  users: [],
  allUsers: [], // A comment explaining the change: Added state to hold all users for suggestions.
  singleUser: null,
  profileData:null,
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
    setAllUsers: (state, action) => {
      state.allUsers = action.payload;
    },
    setSingleUser: (state, action) => {
      state.singleUser = action.payload;
    },
    setProfileData:(state,action)=>{
      state.profileData=action.payload
    }
  },
});

export const { setUser,setProfileData, clearUser, setUsers, setAllUsers, setSingleUser } = userSlice.actions; 
export default userSlice.reducer;