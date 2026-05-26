const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const router = express.Router();

const COIN_TO_INR = parseFloat(process.env.COIN_TO_INR_RATE) || 0.10;
const DAILY_LOGIN_BONUS = 10;

const STREAK_BONUSES = {
  3: 20, 7: 50, 14: 100, 30: 250, 60: 500, 90: 1000,
};

const SPIN_REWARDS = [5, 10, 15, 20, 25, 30, 50, 100];

// Claim daily bonus
router.post('/daily-bonus', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    user.resetDailyCounters();

    if (user.dailyBonusClaimed) {
      return res.status(400).json({ error: 'Daily bonus already claimed' });
    }

    let bonusCoins = DAILY_LOGIN_BONUS;

    // Check streak bonus
    const streakBonus = STREAK_BONUSES[user.loginStreak];
    if (streakBonus) {
      bonusCoins += streakBonus;
    }

    // Apply level multiplier
    const multiplier = user.getBonusMultiplier();
    bonusCoins = Math.floor(bonusCoins * multiplier);
    const amount = bonusCoins * COIN_TO_INR;

    // Update user
    user.coinBalance += bonusCoins;
    user.wallet.coinBalance += bonusCoins;
    user.totalEarnings += amount;
    user.wallet.totalEarnings += amount;
    user.dailyBonusClaimed = true;
    user.activityScore += 5;

    // Update daily task
    if (user.dailyTasks) {
      user.dailyTasks.forEach(task => {
        if (task.id === '3') {
          task.progress = 1;
          task.isCompleted = true;
        }
      });
      user.markModified('dailyTasks');
    }

    await user.save();

    await Transaction.create({
      userId: user._id,
      type: 'daily_bonus',
      coins: bonusCoins,
      amount,
      description: `Daily login bonus (Day ${user.loginStreak})`,
    });

    res.json({
      coins: bonusCoins,
      amount,
      loginStreak: user.loginStreak,
      streakBonus: streakBonus || 0,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to claim daily bonus' });
  }
});

// Spin wheel
router.post('/spin', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    user.resetDailyCounters();

    if (user.spinUsed) {
      return res.status(400).json({ error: 'Daily spin already used' });
    }

    const randomIndex = Math.floor(Math.random() * SPIN_REWARDS.length);
    let coins = SPIN_REWARDS[randomIndex];
    coins = Math.floor(coins * user.getBonusMultiplier());
    const amount = coins * COIN_TO_INR;

    user.coinBalance += coins;
    user.wallet.coinBalance += coins;
    user.totalEarnings += amount;
    user.wallet.totalEarnings += amount;
    user.spinUsed = true;
    user.activityScore += 3;

    // Update daily task
    if (user.dailyTasks) {
      user.dailyTasks.forEach(task => {
        if (task.id === '4') {
          task.progress = 1;
          task.isCompleted = true;
        }
      });
      user.markModified('dailyTasks');
    }

    await user.save();

    await Transaction.create({
      userId: user._id,
      type: 'spin_wheel',
      coins,
      amount,
      description: `Spin wheel reward`,
    });

    res.json({ coins, amount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to spin wheel' });
  }
});

// Scratch card
router.post('/scratch', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    user.resetDailyCounters();

    if (user.scratchUsed) {
      return res.status(400).json({ error: 'Daily scratch card already used' });
    }

    let coins = 2 + Math.floor(Math.random() * 48);
    coins = Math.floor(coins * user.getBonusMultiplier());
    const amount = coins * COIN_TO_INR;

    user.coinBalance += coins;
    user.wallet.coinBalance += coins;
    user.totalEarnings += amount;
    user.wallet.totalEarnings += amount;
    user.scratchUsed = true;
    user.activityScore += 3;
    await user.save();

    await Transaction.create({
      userId: user._id,
      type: 'scratch_card',
      coins,
      amount,
      description: `Scratch card reward`,
    });

    res.json({ coins, amount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to scratch card' });
  }
});

// Claim achievement
router.post('/achievement/:achievementId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const { achievementId } = req.params;

    if (user.achievements.includes(achievementId)) {
      return res.status(400).json({ error: 'Achievement already claimed' });
    }

    const achievementRewards = {
      first_ad: 10, watch_50_ads: 100, watch_100_ads: 250,
      first_referral: 50, refer_5_friends: 200, refer_10_friends: 500,
      first_withdrawal: 25, streak_7_days: 100, streak_30_days: 500,
      level_2_unlock: 200, level_3_unlock: 500, vip_unlock: 1000,
    };

    const coins = achievementRewards[achievementId];
    if (!coins) {
      return res.status(400).json({ error: 'Invalid achievement' });
    }

    const amount = coins * COIN_TO_INR;

    user.achievements.push(achievementId);
    user.coinBalance += coins;
    user.wallet.coinBalance += coins;
    user.totalEarnings += amount;
    user.wallet.totalEarnings += amount;
    user.activityScore += 10;
    await user.save();

    await Transaction.create({
      userId: user._id,
      type: 'achievement_reward',
      coins,
      amount,
      description: `Achievement unlocked: ${achievementId}`,
    });

    res.json({ coins, amount, achievementId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to claim achievement' });
  }
});

module.exports = router;
