const rateLimit = require('express-rate-limit');

// VPN Detection middleware
const vpnDetection = (req, res, next) => {
  const suspiciousHeaders = [
    'x-forwarded-for',
    'via',
    'x-proxy-id',
  ];

  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    if (ips.length > 2) {
      req.suspiciousActivity = true;
      req.suspiciousReason = 'Multiple proxy hops detected';
    }
  }

  next();
};

// Emulator detection middleware
const emulatorDetection = (req, res, next) => {
  const deviceInfo = req.body.deviceInfo || {};
  const emulatorIndicators = [
    'generic', 'unknown', 'sdk', 'emulator', 'android sdk',
    'genymotion', 'bluestacks', 'nox',
  ];

  const deviceModel = (deviceInfo.model || '').toLowerCase();
  const isEmulator = emulatorIndicators.some(indicator =>
    deviceModel.includes(indicator)
  );

  if (isEmulator) {
    return res.status(403).json({
      error: 'Emulator detected. Please use a real device.',
    });
  }

  next();
};

// Device fingerprint validation
const deviceFingerprint = (req, res, next) => {
  const deviceId = req.headers['x-device-id'];
  if (deviceId) {
    req.deviceId = deviceId;
  }
  next();
};

// Anti-fraud rate limiters
const adWatchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Too many ad watch requests. Please slow down.' },
  keyGenerator: (req) => req.userId?.toString() || req.ip,
});

const withdrawalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Too many withdrawal requests. Please try later.' },
  keyGenerator: (req) => req.userId?.toString() || req.ip,
});

const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: { error: 'Too many OTP requests. Please wait.' },
});

module.exports = {
  vpnDetection,
  emulatorDetection,
  deviceFingerprint,
  adWatchLimiter,
  withdrawalLimiter,
  otpLimiter,
};
