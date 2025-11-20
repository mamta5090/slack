import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import axios from "axios";
import {serverURL} from '../main'

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Async Thunk for fetching conversations
export const fetchConversations = createAsyncThunk(
  "conversations/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${serverURL}/api/conversation/my`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const conversationSlice = createSlice({
  name: "conversations",
  initialState: {
    items: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    // --- START OF MODIFIED CODE ---
    // A comment explaining the change: This reducer handles real-time updates for a single conversation.
    // It will update an existing conversation or insert a new one if it doesn't exist.
    upsertConversation: (state, action) => {
      const updatedConvo = action.payload;
      const index = state.items.findIndex(c => c._id === updatedConvo._id);
      if (index !== -1) {
        // If conversation exists, replace it
        state.items[index] = updatedConvo;
      } else {
        // If it's a new conversation, add it to the list
        state.items.push(updatedConvo);
      }
    },
    // --- END OF MODIFIED CODE ---
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

// A comment explaining the change: Export the new action creator.
export const { upsertConversation } = conversationSlice.actions;

// Selectors for components to use
const selectConversationState = (state) => state.conversations;

export const selectAllConversations = createSelector(
  [selectConversationState],
  (conversationState) => conversationState.items
);

export const selectUnreadConversations = createSelector(
  [selectAllConversations],
  (conversations) =>
    conversations.filter((c) => Number(c.unreadCount) > 0)
);

export const selectTotalUnreadCount = createSelector(
  [selectUnreadConversations],
  (unreadConversations) =>
    unreadConversations.reduce((sum, c) => sum + Number(c.unreadCount), 0)
);

export default conversationSlice.reducer;