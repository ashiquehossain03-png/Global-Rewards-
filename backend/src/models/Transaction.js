const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    required: true,
    enum: [
      'ad_reward', 'daily_bonus', 'spin_wheel', 'scratch_card',
      'referral_bonus', 'referral_earning', 'achievement_reward',
      'streak_bonus', 'withdrawal', 'task_reward', 'signup_bonus',
    ],
  },
  coins: { type: Number, required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ['completed', 'pending', 'failed', 'reversed'],
    default: 'completed',
  },
  metadata: { type: mongoose.Schema.Types.Mixed },
}, {
  timestamps: true,
});

transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
