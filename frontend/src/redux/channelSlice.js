import { createSlice } from "@reduxjs/toolkit"


const initialState={
    channel:null,
    allChannels:[],
    selectedChannelId:null,
    addMember:[]
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
        },
        setSelectedChannelId:(state,action)=>{
            state.selectedChannelId=action.payload;
        },
        // setAddMember:(state,action)=>{
        //     state.addMember=action.payload;
        // },
        addMembers: (state, action) => { // This ADDS
            const newMembers = action.payload;
            const existingMemberIds = new Set(state.addMember.map(member => member._id));
            const uniqueNewMembers = newMembers.filter(
                member => !existingMemberIds.has(member._id)
            );
            state.addMember.push(...uniqueNewMembers);
        }
    }
})

export const {setChannel,setAllChannels,setSelectedChannelId,setAddMember,addMembers}=channelSlice.actions
export default channelSlice.reducer;