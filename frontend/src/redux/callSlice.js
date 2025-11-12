// src/redux/callSlice.js
import { createSlice } from '@reduxjs/toolkit';

const callSlice = createSlice({
  name: 'call',
  initialState: { incomingCallData: null },
  reducers: {
    setIncomingCall: (state, action) => {
      state.incomingCallData = action.payload;
    },
    clearIncomingCall: (state) => {
      state.incomingCallData = null;
    },
  },
});

export const { setIncomingCall, clearIncomingCall } = callSlice.actions;
export default callSlice.reducer;