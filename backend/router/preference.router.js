import express from 'express';
import UserPreferences from '../models/UserPreferences.js';

const router = express.Router();


router.get('/:userId', async (req, res) => {
  try {
    let prefs = await UserPreferences.findOne({ userId: req.params.userId });
    if (!prefs) {
      prefs = await UserPreferences.create({
        userId: req.params.userId,
        notifications: {
          messagingDefaults: { desktopNotifications: true, mobileNotifications: true, notifyAbout: "Everything" },
          alsoNotifyAbout: { threadReplies: true, vipMessages: false, newHuddles: true, activityBadgeCount: true },
          channelKeywords: "",
          schedule: { 
            type: "Every day", 
            days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => ({ day: d, start: "9:00 AM", end: "6:00 PM" })) 
          },
          mobileActivity: { inactiveTimeout: "As soon as I'm inactive", summaryNotification: true }
        }
      });
    }
    res.json(prefs);
    console.log(prefs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.patch('/:userId', async (req, res) => {
  try {
    const updatedPrefs = await UserPreferences.findOneAndUpdate(
      { userId: req.params.userId },
      { $set: req.body }, 
      { new: true, upsert: true }
    );
    res.json(updatedPrefs);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;