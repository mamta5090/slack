import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  users: [],
  allUsers: [], 
  singleUser: null,
  profileData:null,
  me:null,
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
    },
    setMe:(state,action)=>{
      state.me=action.payload
    },
  },
});

export const { setUser,setProfileData, clearUser, setUsers, setAllUsers, setSingleUser ,setMe} = userSlice.actions; 
export default userSlice.reducer;