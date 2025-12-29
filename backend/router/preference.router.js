import express from 'express';
const router = express.Router();
// IMPORTANT: Add the .js extension here
import UserPreferences from '../models/UserPreferences.js';

router.get('/:userId', async (req, res) => {
  try {
    let prefs = await UserPreferences.findOne({ userId: req.params.userId });
    if (!prefs) {
      prefs = await UserPreferences.create({ userId: req.params.userId });
    }
    res.json(prefs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE preferences
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

// Change this line:
export default router;