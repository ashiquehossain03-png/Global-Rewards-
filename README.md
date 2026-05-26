# CashBurst - Premium Rewarded Earnings App

A premium Android mobile application where users earn real money legally by watching rewarded advertisements, completing tasks, daily bonuses, and referrals — without any investment.

## Architecture

```
CashBurst/
├── cashburst_flutter/    # Flutter mobile app
├── backend/              # Node.js + Express API server
├── admin_dashboard/      # React admin panel
└── docs/                 # Documentation & legal
```

## Tech Stack

| Layer        | Technology                              |
|--------------|-----------------------------------------|
| Frontend     | Flutter (Dart)                          |
| Backend      | Node.js + Express.js                    |
| Database     | MongoDB + Firebase Firestore            |
| Ads          | Google AdMob (Rewarded Video)           |
| Payments     | Razorpay / Cashfree / Paytm Payout APIs |
| Auth         | Firebase Auth + JWT                     |
| Hosting      | AWS / Firebase Hosting                  |
| Notifications| Firebase Cloud Messaging                |

## Coin Economy

| Coins  | INR Equivalent |
|--------|----------------|
| 550    | ₹55            |
| 1000   | ₹100           |

## User Levels

| Level     | Ads/Day | Daily Earning Range   |
|-----------|---------|----------------------|
| Beginner  | 15      | ₹300 – ₹825          |
| Level 2   | 20      | ₹500 – ₹1,200        |
| Level 3   | 30      | ₹1,000 – ₹2,500      |
| VIP       | 50+     | ₹2,500+               |

## Features

- Rewarded video ad watching (AdMob, Unity, AppLovin, ironSource)
- Daily check-in, spin wheel, scratch cards
- Multi-level referral system with team dashboard
- Wallet with UPI/Bank/PayTM/GPay withdrawals
- KYC verification (Aadhaar, PAN, Bank)
- Anti-fraud: VPN detection, emulator detection, device fingerprinting
- Admin dashboard with analytics & user management
- Firebase Cloud Messaging push notifications
- Premium dark-gold fintech UI with glassmorphism

## Getting Started

### Flutter App
```bash
cd cashburst_flutter
flutter pub get
flutter run
```

### Backend
```bash
cd backend
npm install
npm run dev
```

### Admin Dashboard
```bash
cd admin_dashboard
npm install
npm start
```

## Environment Variables

See `backend/.env.example` for required environment variables.

## Legal

- Privacy Policy: `docs/privacy_policy.md`
- Terms & Conditions: `docs/terms_and_conditions.md`

## License

Proprietary – All rights reserved.
