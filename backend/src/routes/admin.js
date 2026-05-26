const express = require('express');
const { adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Withdrawal = require('../models/Withdrawal');
const Notification = require('../models/Notification');

const router = express.Router();

// Dashboard stats
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({
      lastLoginDate: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });
    const totalEarnings = await Transaction.aggregate([
      { $match: { type: { $ne: 'withdrawal' } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });
    const totalWithdrawn = await Withdrawal.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const kycPending = await User.countDocuments({ 'kycDetails.status': 'pending' });

    res.json({
      dashboard: {
        totalUsers,
        activeUsers,
        totalEarnings: totalEarnings[0]?.total || 0,
        pendingWithdrawals,
        totalWithdrawn: totalWithdrawn[0]?.total || 0,
        bannedUsers,
        kycPending,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// List users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const query = search ? {
      $or: [
        { name: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { referralCode: new RegExp(search, 'i') },
      ],
    } : {};

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user details
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const transactions = await Transaction.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const withdrawals = await Withdrawal.find({ userId: user._id })
      .sort({ createdAt: -1 });

    res.json({ user, transactions, withdrawals });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// Ban/unban user
router.post('/users/:id/ban', adminAuth, async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.isBanned = !user.isBanned;
    user.banReason = user.isBanned ? reason : undefined;
    await user.save();

    await Notification.create({
      userId: user._id,
      title: user.isBanned ? 'Account Suspended' : 'Account Restored',
      body: user.isBanned
        ? `Your account has been suspended. Reason: ${reason}`
        : 'Your account has been restored.',
      type: 'warning',
    });

    res.json({
      message: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully`,
      isBanned: user.isBanned,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Pending withdrawals
router.get('/withdrawals', adminAuth, async (req, res) => {
  try {
    const status = req.query.status || 'pending';
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const withdrawals = await Withdrawal.find({ status })
      .populate('userId', 'name phone email level isKycVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Withdrawal.countDocuments({ status });

    res.json({
      withdrawals,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch withdrawals' });
  }
});

// Approve/reject withdrawal
router.post('/withdrawals/:id/action', adminAuth, async (req, res) => {
  try {
    const { action, reason } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) return res.status(404).json({ error: 'Withdrawal not found' });

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ error: 'Withdrawal already processed' });
    }

    const user = await User.findById(withdrawal.userId);

    if (action === 'approve') {
      withdrawal.status = 'approved';
      withdrawal.processedBy = req.userId;
      withdrawal.processedAt = new Date();

      user.wallet.pendingWithdrawals -= withdrawal.amount;
      user.wallet.withdrawnAmount += withdrawal.amount;

      await Notification.create({
        userId: user._id,
        title: 'Withdrawal Approved',
        body: `Your withdrawal of ₹${withdrawal.amount} has been approved and will be processed shortly.`,
        type: 'withdrawal',
      });
    } else {
      withdrawal.status = 'rejected';
      withdrawal.rejectionReason = reason;
      withdrawal.processedBy = req.userId;
      withdrawal.processedAt = new Date();

      // Refund coins
      user.coinBalance += withdrawal.coinsDeducted;
      user.wallet.coinBalance += withdrawal.coinsDeducted;
      user.wallet.pendingWithdrawals -= withdrawal.amount;

      await Notification.create({
        userId: user._id,
        title: 'Withdrawal Rejected',
        body: `Your withdrawal of ₹${withdrawal.amount} was rejected. Reason: ${reason}. Coins have been refunded.`,
        type: 'withdrawal',
      });
    }

    await withdrawal.save();
    await user.save();

    res.json({
      message: `Withdrawal ${action}ed successfully`,
      withdrawal,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process withdrawal' });
  }
});

// KYC management
router.get('/kyc/pending', adminAuth, async (req, res) => {
  try {
    const users = await User.find({ 'kycDetails.status': 'pending' })
      .select('name phone email kycDetails createdAt')
      .sort({ 'kycDetails.createdAt': -1 });

    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch KYC requests' });
  }
});

// Approve/reject KYC
router.post('/kyc/:userId/action', adminAuth, async (req, res) => {
  try {
    const { action, reason } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (action === 'approve') {
      user.kycDetails.status = 'verified';
      user.kycDetails.aadhaarVerified = true;
      user.kycDetails.panVerified = true;
      user.kycDetails.bankVerified = true;
      user.isKycVerified = true;

      await Notification.create({
        userId: user._id,
        title: 'KYC Verified',
        body: 'Your KYC verification has been approved. You can now withdraw higher amounts.',
        type: 'info',
      });
    } else {
      user.kycDetails.status = 'rejected';

      await Notification.create({
        userId: user._id,
        title: 'KYC Rejected',
        body: `Your KYC verification was rejected. Reason: ${reason}`,
        type: 'warning',
      });
    }

    await user.save();
    res.json({ message: `KYC ${action}ed successfully` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process KYC' });
  }
});

// Send push notification
router.post('/notifications/send', adminAuth, async (req, res) => {
  try {
    const { title, body, type, userId, isBroadcast } = req.body;

    const notification = await Notification.create({
      userId: isBroadcast ? undefined : userId,
      title,
      body,
      type: type || 'info',
      isBroadcast: isBroadcast || false,
    });

    res.json({ message: 'Notification sent', notification });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Analytics
router.get('/analytics', adminAuth, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const dailySignups = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dailyEarnings = await Transaction.aggregate([
      { $match: { createdAt: { $gte: startDate }, type: { $ne: 'withdrawal' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dailyWithdrawals = await Withdrawal.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const levelDistribution = await User.aggregate([
      { $group: { _id: '$level', count: { $sum: 1 } } },
    ]);

    res.json({
      analytics: {
        dailySignups,
        dailyEarnings,
        dailyWithdrawals,
        levelDistribution,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;
