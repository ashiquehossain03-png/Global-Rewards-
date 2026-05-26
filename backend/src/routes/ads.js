const express = require('express');
const { auth } = require('../middleware/auth');
const { adWatchLimiter, vpnDetection } = require('../middleware/security');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const router = express.Router();

const AD_REWARD_COINS = 37;
const COIN_TO_INR = parseFloat(process.env.COIN_TO_INR_RATE) || 0.10;

// Record ad watch
router.post('/watch', auth, vpnDetection, adWatchLimiter, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    // Reset daily counters if needed
    user.resetDailyCounters();

    // Check if user can watch more ads
    const maxAds = user.getMaxAds();
    if (user.adsWatchedToday >= maxAds) {
      return res.status(400).json({ error: 'Daily ad limit reached' });
    }

    // Check for suspicious activity
    if (req.suspiciousActivity) {
      return res.status(403).json({ error: 'Suspicious activity detected' });
    }

    // Calculate reward with level multiplier
    const multiplier = user.getBonusMultiplier();
    const coins = Math.floor(AD_REWARD_COINS * multiplier);
    const amount = coins * COIN_TO_INR;

    // Update user stats
    user.adsWatchedToday += 1;
    user.totalAdsWatched += 1;
    user.coinBalance += coins;
    user.totalEarnings += amount;
    user.wallet.coinBalance += coins;
    user.wallet.totalEarnings += amount;
    user.activityScore += 2;

    // Update daily tasks
    if (user.dailyTasks) {
      user.dailyTasks.forEach(task => {
        if (task.title && task.title.includes('Watch') && task.title.includes('Ads')) {
          task.progress = user.adsWatchedToday;
          if (task.progress >= task.target && !task.isCompleted) {
            task.isCompleted = true;
          }
        }
      });
      user.markModified('dailyTasks');
    }

    // Check level up
    const newLevel = user.checkLevelUp();

    await user.save();

    // Record transaction
    await Transaction.create({
      userId: user._id,
      type: 'ad_reward',
      coins,
      amount,
      description: `Watched rewarded ad #${user.adsWatchedToday}`,
      metadata: {
        adNumber: user.adsWatchedToday,
        multiplier,
      },
    });

    // Credit referrer if applicable
    if (user.referredBy) {
      const referralPercent = parseFloat(process.env.REFERRAL_EARNING_PERCENT) || 10;
      const referralCoins = Math.floor(coins * referralPercent / 100);
      const referralAmount = referralCoins * COIN_TO_INR;

      if (referralCoins > 0) {
        await User.findByIdAndUpdate(user.referredBy, {
          $inc: {
            coinBalance: referralCoins,
            'wallet.coinBalance': referralCoins,
            totalEarnings: referralAmount,
            'wallet.totalEarnings': referralAmount,
            referralEarnings: referralAmount,
            'wallet.referralEarnings': referralAmount,
          },
        });

        await Transaction.create({
          userId: user.referredBy,
          type: 'referral_earning',
          coins: referralCoins,
          amount: referralAmount,
          description: `Referral earning from ${user.name}`,
        });
      }
    }

    res.json({
      coins,
      amount,
      totalCoins: user.coinBalance,
      adsWatchedToday: user.adsWatchedToday,
      maxAdsToday: maxAds,
      newLevel,
    });
  } catch (error) {
    console.error('Ad watch error:', error);
    res.status(500).json({ error: 'Failed to record ad watch' });
  }
});

// Get ad status
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    user.resetDailyCounters();
    await user.save();

    res.json({
      adsWatchedToday: user.adsWatchedToday,
      maxAdsToday: user.getMaxAds(),
      totalAdsWatched: user.totalAdsWatched,
      level: user.level,
      multiplier: user.getBonusMultiplier(),
      coinsPerAd: Math.floor(AD_REWARD_COINS * user.getBonusMultiplier()),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ad status' });
  }
});

module.exports = router;
