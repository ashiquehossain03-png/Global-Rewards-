const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 0 },
  coinsDeducted: { type: Number, required: true },
  method: {
    type: String,
    required: true,
    enum: ['upi', 'gpay', 'phonepe', 'paytm', 'bank', 'neft', 'imps'],
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'processing', 'completed', 'rejected'],
    default: 'pending',
  },
  upiId: { type: String },
  bankDetails: {
    accountNumber: { type: String },
    ifscCode: { type: String },
    accountHolderName: { type: String },
    bankName: { type: String },
  },
  rejectionReason: { type: String },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  processedAt: { type: Date },
  payoutId: { type: String },
  payoutProvider: { type: String, enum: ['razorpay', 'cashfree', 'paytm'] },
}, {
  timestamps: true,
});

withdrawalSchema.index({ userId: 1, createdAt: -1 });
withdrawalSchema.index({ status: 1 });
withdrawalSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
