const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Notification = require('../models/Notification');

const router = express.Router();

// Submit KYC
router.post('/submit',
  auth,
  body('aadhaarNumber').isLength({ min: 12, max: 12 }).withMessage('Invalid Aadhaar number'),
  body('panNumber').isLength({ min: 10, max: 10 }).withMessage('Invalid PAN number'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { aadhaarNumber, panNumber, bankDetails } = req.body;
      const user = await User.findById(req.userId);

      // Check for duplicate KYC
      const existingAadhaar = await User.findOne({
        'kycDetails.aadhaarNumber': aadhaarNumber,
        _id: { $ne: user._id },
      });

      if (existingAadhaar) {
        return res.status(400).json({ error: 'Aadhaar number already registered with another account' });
      }

      const existingPan = await User.findOne({
        'kycDetails.panNumber': panNumber,
        _id: { $ne: user._id },
      });

      if (existingPan) {
        return res.status(400).json({ error: 'PAN number already registered with another account' });
      }

      // Update KYC details
      user.kycDetails = {
        aadhaarNumber,
        panNumber,
        aadhaarVerified: false,
        panVerified: false,
        bankVerified: false,
        bankDetails: bankDetails || {},
        status: 'pending',
      };

      await user.save();

      // Create notification
      await Notification.create({
        userId: user._id,
        title: 'KYC Submitted',
        body: 'Your KYC documents have been submitted for verification. This usually takes 24-48 hours.',
        type: 'info',
      });

      res.json({
        message: 'KYC submitted successfully. Verification in progress.',
        status: 'pending',
      });
    } catch (error) {
      console.error('KYC submit error:', error);
      res.status(500).json({ error: 'Failed to submit KYC' });
    }
  }
);

// Get KYC status
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({
      isKycVerified: user.isKycVerified,
      kycDetails: user.kycDetails ? {
        aadhaarVerified: user.kycDetails.aadhaarVerified,
        panVerified: user.kycDetails.panVerified,
        bankVerified: user.kycDetails.bankVerified,
        status: user.kycDetails.status,
      } : null,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch KYC status' });
  }
});

module.exports = router;
