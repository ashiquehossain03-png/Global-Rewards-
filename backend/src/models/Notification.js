const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: {
    type: String,
    enum: ['info', 'reward', 'task', 'withdrawal', 'warning', 'system'],
    default: 'info',
  },
  isRead: { type: Boolean, default: false },
  isBroadcast: { type: Boolean, default: false },
  metadata: { type: mongoose.Schema.Types.Mixed },
}, {
  timestamps: true,
});

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
