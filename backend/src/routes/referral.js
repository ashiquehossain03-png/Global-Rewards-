const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const router = express.Router();

// Get referral stats
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    // Calculate today's referral earnings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEarnings = await Transaction.aggregate([
      {
        $match: {
          userId: user._id,
          type: { $in: ['referral_bonus', 'referral_earning'] },
          createdAt: { $gte: today },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.json({
      stats: {
        referralCode: user.referralCode,
        totalReferrals: user.totalReferrals,
        totalEarnings: user.referralEarnings,
        todayEarnings: todayEarnings[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch referral stats' });
  }
});

// Get referral list
router.get('/list', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const referrals = await User.find({ referredBy: req.userId })
      .select('name profileImage createdAt lastLoginDate')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get earnings from each referral
    const referralData = await Promise.all(
      referrals.map(async (ref) => {
        const earnings = await Transaction.aggregate([
          {
            $match: {
              userId: req.userId,
              type: 'referral_earning',
              'metadata.referralUserId': ref._id,
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);

        const now = new Date();
        const lastLogin = ref.lastLoginDate || ref.createdAt;
        const daysSinceLogin = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));

        return {
          _id: ref._id,
          name: ref.name,
          profileImage: ref.profileImage,
          joinedAt: ref.createdAt,
          earningsFromUser: earnings[0]?.total || 0,
          isActive: daysSinceLogin <= 3,
        };
      })
    );

    res.json({ referrals: referralData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch referral list' });
  }
});

module.exports = router;
