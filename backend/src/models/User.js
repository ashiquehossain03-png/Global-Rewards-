const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, required: true, unique: true },
  profileImage: { type: String },
  level: {
    type: String,
    enum: ['beginner', 'level_2', 'level_3', 'vip'],
    default: 'beginner',
  },
  coinBalance: { type: Number, default: 0, min: 0 },
  totalEarnings: { type: Number, default: 0, min: 0 },
  referralEarnings: { type: Number, default: 0, min: 0 },
  adsWatchedToday: { type: Number, default: 0 },
  totalAdsWatched: { type: Number, default: 0 },
  lastAdReset: { type: Date, default: Date.now },
  loginStreak: { type: Number, default: 0 },
  lastLoginDate: { type: Date },
  activityScore: { type: Number, default: 0 },
  referralCode: { type: String, unique: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  totalReferrals: { type: Number, default: 0 },
  isKycVerified: { type: Boolean, default: false },
  isVip: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  banReason: { type: String },
  achievements: [{ type: String }],
  wallet: {
    coinBalance: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    pendingWithdrawals: { type: Number, default: 0 },
    referralEarnings: { type: Number, default: 0 },
    withdrawnAmount: { type: Number, default: 0 },
  },
  kycDetails: {
    aadhaarNumber: { type: String },
    panNumber: { type: String },
    aadhaarVerified: { type: Boolean, default: false },
    panVerified: { type: Boolean, default: false },
    bankVerified: { type: Boolean, default: false },
    bankDetails: {
      accountNumber: { type: String },
      ifscCode: { type: String },
      accountHolderName: { type: String },
      bankName: { type: String },
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
  },
  deviceInfo: {
    deviceId: { type: String },
    platform: { type: String },
    model: { type: String },
    osVersion: { type: String },
    appVersion: { type: String },
  },
  fcmToken: { type: String },
  dailyBonusClaimed: { type: Boolean, default: false },
  spinUsed: { type: Boolean, default: false },
  scratchUsed: { type: Boolean, default: false },
  dailyTasks: [{
    id: String,
    title: String,
    description: String,
    target: Number,
    progress: { type: Number, default: 0 },
    reward: Number,
    isCompleted: { type: Boolean, default: false },
  }],
  isAdmin: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
}, {
  timestamps: true,
});

// Generate unique referral code before saving
userSchema.pre('save', function(next) {
  if (!this.referralCode) {
    this.referralCode = 'CB' + crypto.randomBytes(4).toString('hex').toUpperCase();
  }
  next();
});

// Reset daily counters
userSchema.methods.resetDailyCounters = function() {
  const now = new Date();
  const lastReset = this.lastAdReset || new Date(0);

  if (now.toDateString() !== lastReset.toDateString()) {
    this.adsWatchedToday = 0;
    this.dailyBonusClaimed = false;
    this.spinUsed = false;
    this.scratchUsed = false;
    this.lastAdReset = now;
    this.dailyTasks = this.getDefaultDailyTasks();
    return true;
  }
  return false;
};

userSchema.methods.getDefaultDailyTasks = function() {
  return [
    { id: '1', title: 'Watch 5 Ads', description: 'Watch 5 rewarded video ads', target: 5, progress: 0, reward: 25, isCompleted: false },
    { id: '2', title: 'Watch 10 Ads', description: 'Watch 10 rewarded video ads', target: 10, progress: 0, reward: 50, isCompleted: false },
    { id: '3', title: 'Daily Check-in', description: 'Log in and claim your daily bonus', target: 1, progress: 0, reward: 10, isCompleted: false },
    { id: '4', title: 'Spin the Wheel', description: 'Use your daily spin', target: 1, progress: 0, reward: 15, isCompleted: false },
    { id: '5', title: 'Refer a Friend', description: 'Invite a friend using your referral code', target: 1, progress: 0, reward: 50, isCompleted: false },
  ];
};

// Get max ads based on level
userSchema.methods.getMaxAds = function() {
  const limits = { beginner: 15, level_2: 20, level_3: 30, vip: 50 };
  return limits[this.level] || 15;
};

// Get bonus multiplier based on level
userSchema.methods.getBonusMultiplier = function() {
  const multipliers = { beginner: 1.0, level_2: 1.2, level_3: 1.5, vip: 2.0 };
  return multipliers[this.level] || 1.0;
};

// Check and update level
userSchema.methods.checkLevelUp = function() {
  if (this.level === 'beginner') {
    const daysSinceCreation = Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
    if (daysSinceCreation >= 7 && this.totalAdsWatched >= 50) {
      this.level = 'level_2';
      return 'level_2';
    }
  }
  if (this.level === 'level_2') {
    if (this.totalReferrals >= 10 && this.activityScore >= 500) {
      this.level = 'level_3';
      return 'level_3';
    }
  }
  if (this.level === 'level_3') {
    if (this.totalReferrals >= 25 && this.activityScore >= 1000 && this.loginStreak >= 30) {
      this.level = 'vip';
      this.isVip = true;
      return 'vip';
    }
  }
  return null;
};

// Indexes
userSchema.index({ phone: 1 });
userSchema.index({ referralCode: 1 });
userSchema.index({ referredBy: 1 });
userSchema.index({ level: 1 });
userSchema.index({ totalReferrals: -1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
