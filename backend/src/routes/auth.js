const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { otpLimiter } = require('../middleware/security');

const router = express.Router();

// Generate OTP (In production, integrate with SMS service)
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Store OTPs temporarily (use Redis in production)
const otpStore = new Map();

// Send OTP
router.post('/send-otp',
  otpLimiter,
  body('phone').matches(/^\+91\d{10}$/).withMessage('Invalid phone number'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { phone } = req.body;
      const otp = generateOtp();

      otpStore.set(phone, {
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000,
        attempts: 0,
      });

      // In production: Send OTP via SMS service (MSG91, Twilio, etc.)
      console.log(`OTP for ${phone}: ${otp}`);

      res.json({ message: 'OTP sent successfully', expiresIn: 300 });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  }
);

// Verify OTP
router.post('/verify-otp',
  body('phone').matches(/^\+91\d{10}$/).withMessage('Invalid phone number'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('Invalid OTP'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { phone, otp, referralCode } = req.body;

      // Verify OTP
      const storedOtp = otpStore.get(phone);
      if (!storedOtp || storedOtp.otp !== otp) {
        return res.status(400).json({ error: 'Invalid OTP' });
      }

      if (Date.now() > storedOtp.expiresAt) {
        otpStore.delete(phone);
        return res.status(400).json({ error: 'OTP expired' });
      }

      otpStore.delete(phone);

      // Find or create user
      let user = await User.findOne({ phone });
      let isNewUser = false;

      if (!user) {
        isNewUser = true;
        const userData = {
          name: 'CashBurst User',
          phone,
          wallet: { coinBalance: 0, totalEarnings: 0, pendingWithdrawals: 0, referralEarnings: 0, withdrawnAmount: 0 },
        };

        // Handle referral
        if (referralCode) {
          const referrer = await User.findOne({ referralCode });
          if (referrer) {
            userData.referredBy = referrer._id;

            // Credit referral bonus to referrer
            const referralBonus = parseInt(process.env.REFERRAL_SIGNUP_BONUS) || 50;
            const coinToInr = parseFloat(process.env.COIN_TO_INR_RATE) || 0.10;

            referrer.coinBalance += referralBonus;
            referrer.wallet.coinBalance += referralBonus;
            referrer.totalEarnings += referralBonus * coinToInr;
            referrer.wallet.totalEarnings += referralBonus * coinToInr;
            referrer.referralEarnings += referralBonus * coinToInr;
            referrer.wallet.referralEarnings += referralBonus * coinToInr;
            referrer.totalReferrals += 1;
            await referrer.save();

            await Transaction.create({
              userId: referrer._id,
              type: 'referral_bonus',
              coins: referralBonus,
              amount: referralBonus * coinToInr,
              description: `Referral signup bonus - new user joined`,
            });
          }
        }

        user = await User.create(userData);

        // Give signup bonus
        const signupBonus = 10;
        const coinToInr = parseFloat(process.env.COIN_TO_INR_RATE) || 0.10;
        user.coinBalance += signupBonus;
        user.wallet.coinBalance += signupBonus;
        user.totalEarnings += signupBonus * coinToInr;
        user.wallet.totalEarnings += signupBonus * coinToInr;
        await user.save();

        await Transaction.create({
          userId: user._id,
          type: 'signup_bonus',
          coins: signupBonus,
          amount: signupBonus * coinToInr,
          description: 'Welcome bonus for joining CashBurst!',
        });
      }

      // Update login streak
      const now = new Date();
      const lastLogin = user.lastLoginDate;
      if (lastLogin) {
        const diffDays = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          user.loginStreak += 1;
        } else if (diffDays > 1) {
          user.loginStreak = 1;
        }
      } else {
        user.loginStreak = 1;
      }
      user.lastLoginDate = now;

      // Reset daily counters if new day
      user.resetDailyCounters();
      await user.save();

      // Generate tokens
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      const refreshToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
      );

      res.json({
        token,
        refreshToken,
        user: user.toObject(),
        isNewUser,
      });
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({ error: 'Verification failed' });
    }
  }
);

// Refresh token
router.post('/refresh',
  body('refreshToken').notEmpty(),
  async (req, res) => {
    try {
      const { refreshToken } = req.body;
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      const newRefreshToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
      );

      res.json({ token, refreshToken: newRefreshToken });
    } catch (error) {
      res.status(401).json({ error: 'Invalid refresh token' });
    }
  }
);

module.exports = router;
