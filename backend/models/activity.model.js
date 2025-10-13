// models/activity.model.js

import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
    // The user who should SEE this notification (The recipient)
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    
    // The workspace where the activity happened
    workSpace: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkSpace', required: true },

    // The user who PERFORMED the action (e.g., who sent the message)
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // The type of action performed (e.g., 'MENTION', 'THREAD_REPLY', 'REACTION_ADDED')
    action: { type: String, required: true },

    // A snippet of the message content for preview
    contentSnippet: { type: String },

    // The channel or DM where the activity occurred
    context: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    
    // The specific message that was replied to or mentioned in
    target: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },

    // Flag to see if the user has viewed this activity
    isRead: { type: Boolean, default: false, index: true }

}, { timestamps: true }); // timestamps adds createdAt and updatedAt automatically

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;