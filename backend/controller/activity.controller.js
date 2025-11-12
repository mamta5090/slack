// controller/activity.controller.js

import mongoose from 'mongoose';
import Activity from '../models/activity.model.js';

// GET all activities for a user in a workspace
export const getActivitiesForUser = async (req, res) => {
    try {
        const { userId, workspaceId } = req.params;
        const { unreadOnly } = req.query;

        // Use a more robust check for valid ObjectIDs
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(workspaceId)) {
            return res.status(400).json({ msg: 'Invalid user ID or workspace ID' });
        }

        const query = {
            userId: userId,
            workSpace: workspaceId // Make sure this field name matches your model
        };

        if (unreadOnly === 'true') {
            query.isRead = false;
        }

        const activities = await Activity.find(query)
            .populate('actor', 'name profileImage')
            .populate('context', 'name')
            .sort({ createdAt: -1 })
            .limit(50);
            
        res.status(200).json(activities);
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// PATCH: Mark all activities as read
export const markActivitiesAsRead = async (req, res) => {
    try {
        const { userId, workspaceId } = req.params; // Corrected param name
        await Activity.updateMany(
            { userId: userId, workspace: workspaceId, isRead: false }, // Corrected field name
            { $set: { isRead: true } }
        );
        res.status(200).json({ message: 'Activities marked as read' });
    } catch (error) {
        console.error('Error marking activities as read:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Helper function to be called from other controllers (e.g., message controller)
export const createActivity = async (activityData) => {
    try {
        const newActivity = new Activity(activityData);
        await newActivity.save();
        // Here, you could also emit a WebSocket event to notify the client in real-time
        console.log('Activity created successfully');
    } catch (error) {
        console.error('Error creating activity:', error);
    }
};