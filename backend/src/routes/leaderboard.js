const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Get leaderboard
router.get('/', auth, async (req, res) => {
  try {
    const type = req.query.type || 'referral';
    let sortField;

    switch (type) {
      case 'referral':
        sortField = 'totalReferrals';
        break;
      case 'earnings':
        sortField = 'totalEarnings';
        break;
      case 'ads':
        sortField = 'totalAdsWatched';
        break;
      default:
        sortField = 'totalReferrals';
    }

    const users = await User.find({ isBanned: false })
      .sort({ [sortField]: -1 })
      .limit(50)
      .select('name profileImage totalReferrals totalEarnings totalAdsWatched');

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      profileImage: user.profileImage,
      referrals: user.totalReferrals,
      earnings: user.totalEarnings,
      adsWatched: user.totalAdsWatched,
    }));

    res.json({ leaderboard, type });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
