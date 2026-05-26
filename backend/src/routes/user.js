const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Get profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-__v');
    user.resetDailyCounters();
    await user.save();
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const allowedFields = ['name', 'email', 'profileImage', 'fcmToken'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get daily status
router.get('/daily-status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    user.resetDailyCounters();
    await user.save();

    res.json({
      dailyStatus: {
        dailyBonusClaimed: user.dailyBonusClaimed,
        spinAvailable: !user.spinUsed,
        scratchAvailable: !user.scratchUsed,
        adsWatchedToday: user.adsWatchedToday,
        maxAdsToday: user.getMaxAds(),
        loginStreak: user.loginStreak,
        dailyTasks: user.dailyTasks,
        achievements: getAchievements(user),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch daily status' });
  }
});

function getAchievements(user) {
  return [
    { id: 'first_ad', title: 'First Step', description: 'Watch your first ad', icon: '🎬', reward: 10, isUnlocked: user.totalAdsWatched >= 1 },
    { id: 'watch_50_ads', title: 'Ad Watcher', description: 'Watch 50 ads', icon: '📺', reward: 100, isUnlocked: user.totalAdsWatched >= 50 },
    { id: 'watch_100_ads', title: 'Ad Master', description: 'Watch 100 ads', icon: '🏆', reward: 250, isUnlocked: user.totalAdsWatched >= 100 },
    { id: 'first_referral', title: 'Social Star', description: 'Refer your first friend', icon: '⭐', reward: 50, isUnlocked: user.totalReferrals >= 1 },
    { id: 'refer_5_friends', title: 'Team Builder', description: 'Refer 5 friends', icon: '👥', reward: 200, isUnlocked: user.totalReferrals >= 5 },
    { id: 'streak_7_days', title: 'Week Warrior', description: '7-day login streak', icon: '🔥', reward: 100, isUnlocked: user.loginStreak >= 7 },
    { id: 'streak_30_days', title: 'Monthly Legend', description: '30-day login streak', icon: '💎', reward: 500, isUnlocked: user.loginStreak >= 30 },
  ];
}

module.exports = router;
