// models/activity.model.js (Improved Version)

import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workSpace: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkSpace', required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // Using an enum provides better data integrity
    action: { 
        type: String, 
        required: true,
        enum: [
            'mentioned_you', 
            'replied_to_thread', 
            'reacted_to_message', 
            'joined_channel',
            // ... add more as you need them
        ]
    },

    contentSnippet: { type: String },

    // --- Dynamic Reference for Context ---
    context: {
        id: { type: mongoose.Schema.Types.ObjectId, required: true },
        model: { type: String, required: true, enum: ['Conversation', 'Channel'] } // Add other models here
    },

    // --- Dynamic Reference for Target ---
    target: {
        id: { type: mongoose.Schema.Types.ObjectId },
        model: { type: String, enum: ['Message', 'File', 'Poll'] } // Add other models here
    },

    isRead: { type: Boolean, default: false, index: true }
}, { timestamps: true });

// To use this, when you query, you would populate it dynamically.
// Example:
// const activity = await Activity.findById(someId);
// await activity.populate({ path: 'context.id', model: activity.context.model });

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;