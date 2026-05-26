const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const { withdrawalLimiter } = require('../middleware/security');
const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');
const Transaction = require('../models/Transaction');

const router = express.Router();

const COIN_TO_INR = parseFloat(process.env.COIN_TO_INR_RATE) || 0.10;
const MIN_WITHDRAWAL = parseFloat(process.env.MIN_WITHDRAWAL) || 55;
const DAILY_WITHDRAWAL_LIMIT = parseFloat(process.env.DAILY_WITHDRAWAL_LIMIT) || 5000;
const KYC_REQUIRED_ABOVE = parseFloat(process.env.KYC_REQUIRED_ABOVE) || 500;

// Request withdrawal
router.post('/request',
  auth,
  withdrawalLimiter,
  body('amount').isFloat({ min: MIN_WITHDRAWAL }).withMessage(`Minimum withdrawal is ₹${MIN_WITHDRAWAL}`),
  body('method').isIn(['upi', 'gpay', 'phonepe', 'paytm', 'bank', 'neft', 'imps']),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { amount, method, upiId, bankDetails } = req.body;
      const user = await User.findById(req.userId);

      // Check KYC for large withdrawals
      if (amount > KYC_REQUIRED_ABOVE && !user.isKycVerified) {
        return res.status(400).json({
          error: `KYC verification required for withdrawals above ₹${KYC_REQUIRED_ABOVE}`,
        });
      }

      // Calculate coins needed
      const coinsNeeded = Math.ceil(amount / COIN_TO_INR);

      // Check balance
      if (user.coinBalance < coinsNeeded) {
        return res.status(400).json({ error: 'Insufficient coin balance' });
      }

      // Check daily withdrawal limit
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayWithdrawals = await Withdrawal.aggregate([
        {
          $match: {
            userId: user._id,
            createdAt: { $gte: today },
            status: { $nin: ['rejected'] },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      const todayTotal = todayWithdrawals[0]?.total || 0;
      if (todayTotal + amount > DAILY_WITHDRAWAL_LIMIT) {
        return res.status(400).json({
          error: `Daily withdrawal limit of ₹${DAILY_WITHDRAWAL_LIMIT} exceeded`,
        });
      }

      // Validate payment details
      if (['upi', 'gpay', 'phonepe', 'paytm'].includes(method)) {
        if (!upiId) {
          return res.status(400).json({ error: 'UPI ID is required' });
        }
      } else {
        if (!bankDetails?.accountNumber || !bankDetails?.ifscCode) {
          return res.status(400).json({ error: 'Bank details are required' });
        }
      }

      // Create withdrawal request
      const withdrawal = await Withdrawal.create({
        userId: user._id,
        amount,
        coinsDeducted: coinsNeeded,
        method,
        upiId,
        bankDetails,
        status: 'pending',
      });

      // Deduct coins
      user.coinBalance -= coinsNeeded;
      user.wallet.coinBalance -= coinsNeeded;
      user.wallet.pendingWithdrawals += amount;
      await user.save();

      // Record transaction
      await Transaction.create({
        userId: user._id,
        type: 'withdrawal',
        coins: -coinsNeeded,
        amount: -amount,
        description: `Withdrawal request - ${method.toUpperCase()} - ₹${amount}`,
        status: 'pending',
        metadata: { withdrawalId: withdrawal._id },
      });

      res.json({
        message: 'Withdrawal request submitted successfully',
        withdrawal,
      });
    } catch (error) {
      console.error('Withdrawal error:', error);
      res.status(500).json({ error: 'Failed to process withdrawal' });
    }
  }
);

// Get withdrawal history
router.get('/history', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const withdrawals = await Withdrawal.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ withdrawals });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch withdrawals' });
  }
});

module.exports = router;
