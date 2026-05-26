# CashBurst - System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Mobile App (Flutter)               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │  Screens  │ │Providers │ │ Services │ │Widgets │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
└───────────────────────┬─────────────────────────────┘
                        │ HTTPS/REST API
                        ▼
┌─────────────────────────────────────────────────────┐
│              API Server (Node.js + Express)          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │  Routes   │ │Middleware│ │ Services │ │ Models │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
└───────┬──────────┬──────────┬──────────┬────────────┘
        │          │          │          │
        ▼          ▼          ▼          ▼
  ┌──────────┐ ┌────────┐ ┌────────┐ ┌────────────┐
  │ MongoDB  │ │Firebase│ │Payment │ │ Ad Networks │
  │          │ │  Auth  │ │  APIs  │ │   (AdMob)   │
  └──────────┘ └────────┘ └────────┘ └────────────┘
```

## Flutter App Architecture (Provider Pattern)

```
lib/
├── main.dart                 # App entry point
├── config/
│   ├── theme.dart            # Dark gold theme + glassmorphism
│   └── constants.dart        # App constants, levels, coin rates
├── models/
│   ├── user_model.dart       # User, KYC, Wallet models
│   └── transaction_model.dart # Transaction, Withdrawal models
├── providers/
│   ├── auth_provider.dart    # Authentication state
│   ├── wallet_provider.dart  # Wallet & transactions state
│   ├── rewards_provider.dart # Daily rewards, tasks, achievements
│   └── referral_provider.dart # Referral system state
├── services/
│   ├── api_service.dart      # Dio HTTP client with JWT interceptors
│   └── ad_service.dart       # Google AdMob rewarded ad service
├── screens/
│   ├── splash/               # Animated splash screen
│   ├── onboarding/           # 4-page onboarding
│   ├── auth/                 # Login + OTP verification
│   ├── home/                 # Main dashboard with bottom nav
│   ├── ads/                  # Watch & earn page
│   ├── wallet/               # Wallet with transactions
│   ├── withdraw/             # Withdrawal form (UPI/Bank)
│   ├── referral/             # Referral program with leaderboard
│   ├── rewards/              # Daily bonus, spin wheel, scratch card
│   ├── vip/                  # VIP program details
│   ├── notifications/        # Notification center
│   ├── profile/              # Profile & settings
│   ├── kyc/                  # KYC verification (Aadhaar/PAN/Bank)
│   └── admin/                # Admin dashboard
└── widgets/
    ├── coin_display.dart     # Coin balance badge
    ├── earnings_card.dart    # Gold gradient earnings card
    ├── daily_task_card.dart  # Task progress card
    └── quick_action_grid.dart # 3x2 action grid
```

## Backend Architecture

```
backend/src/
├── server.js                 # Express app setup
├── config/
│   └── database.js           # MongoDB connection
├── middleware/
│   ├── auth.js               # JWT auth + admin auth
│   └── security.js           # VPN/emulator detection, rate limiting
├── models/
│   ├── User.js               # User schema with level/wallet logic
│   ├── Transaction.js        # Transaction ledger
│   ├── Withdrawal.js         # Withdrawal requests
│   └── Notification.js       # Push notifications
├── routes/
│   ├── auth.js               # OTP send/verify, token refresh
│   ├── user.js               # Profile, daily status
│   ├── ads.js                # Ad watch recording + referral credits
│   ├── wallet.js             # Balance + transaction history
│   ├── withdrawal.js         # Withdrawal requests + validation
│   ├── referral.js           # Referral stats + team list
│   ├── rewards.js            # Daily bonus, spin, scratch, achievements
│   ├── kyc.js                # KYC submission + status
│   ├── notifications.js      # Notification list + mark read
│   ├── leaderboard.js        # Top referrers/earners
│   └── admin.js              # Full admin CRUD + analytics
└── services/
    └── payoutService.js      # Razorpay/Cashfree/Paytm integration
```

## Data Flow

### Ad Watching Flow
```
User taps "Watch Ad" → AdMob SDK shows rewarded video
→ Ad completed callback → API POST /ads/watch
→ Server validates (daily limit, fraud checks)
→ Credits coins to user + referrer percentage
→ Records transaction → Updates daily tasks
→ Returns new balance to client
```

### Withdrawal Flow
```
User submits withdrawal → API POST /withdrawal/request
→ Validates: balance, KYC, daily limit, fraud
→ Deducts coins, creates pending withdrawal
→ Admin reviews in dashboard
→ Admin approves → PayoutService processes payment
→ Razorpay/Cashfree/Paytm sends funds
→ User notified of completion
```

### Referral Flow
```
User A shares code → User B signs up with code
→ User B linked as referral of User A
→ User A gets signup bonus (50 coins)
→ Every time User B earns from ads:
  → User A gets 10% of User B's coins
  → Recorded as referral_earning transaction
```

## Security Layers

1. **Transport**: HTTPS only
2. **Authentication**: JWT + refresh tokens
3. **Authorization**: Role-based (user, admin, superadmin)
4. **Rate Limiting**: Per-endpoint limits
5. **Input Validation**: express-validator on all routes
6. **Fraud Detection**: VPN detection, emulator detection, device fingerprinting
7. **Anti-Abuse**: Multiple account prevention, fake click detection
8. **Data Security**: Encrypted storage, Firebase security rules
