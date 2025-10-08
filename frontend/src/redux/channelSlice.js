import { createSlice } from "@reduxjs/toolkit"
// import reducer from "./userSlice" // This import is unused and can be removed

const initialState={
    channel:null,
    allChannels:[],
};

const channelSlice=createSlice({
    name:"channel",
    initialState,
    reducers:{
        setChannel:(state,action)=>{
            state.channel=action.payload;
        },
        setAllChannels:(state,action)=>{
            state.allChannels=action.payload;
        }
    }
})

export const {setChannel,setAllChannels}=channelSlice.actions
export default channelSlice.reducer;