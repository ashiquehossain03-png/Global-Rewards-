# Firebase Schema - CashBurst

## Firestore Collections

### `users/{userId}`
```json
{
  "name": "string",
  "phone": "string",
  "email": "string",
  "level": "beginner | level_2 | level_3 | vip",
  "coinBalance": "number",
  "totalEarnings": "number",
  "referralCode": "string",
  "referredBy": "string (userId)",
  "totalReferrals": "number",
  "loginStreak": "number",
  "activityScore": "number",
  "isKycVerified": "boolean",
  "isVip": "boolean",
  "isBanned": "boolean",
  "fcmToken": "string",
  "createdAt": "timestamp",
  "lastLoginAt": "timestamp"
}
```

### `users/{userId}/transactions/{transactionId}`
```json
{
  "type": "ad_reward | daily_bonus | spin_wheel | scratch_card | referral_bonus | withdrawal",
  "coins": "number",
  "amount": "number",
  "description": "string",
  "status": "completed | pending | failed",
  "createdAt": "timestamp"
}
```

### `users/{userId}/withdrawals/{withdrawalId}`
```json
{
  "amount": "number",
  "coinsDeducted": "number",
  "method": "upi | bank | gpay | phonepe | paytm",
  "status": "pending | approved | rejected | completed",
  "upiId": "string",
  "bankDetails": {
    "accountNumber": "string",
    "ifscCode": "string",
    "accountHolderName": "string",
    "bankName": "string"
  },
  "createdAt": "timestamp",
  "processedAt": "timestamp"
}
```

### `notifications/{notificationId}`
```json
{
  "userId": "string",
  "title": "string",
  "body": "string",
  "type": "info | reward | task | withdrawal | warning",
  "isRead": "boolean",
  "isBroadcast": "boolean",
  "createdAt": "timestamp"
}
```

### `leaderboard/{type}`
```json
{
  "entries": [
    {
      "userId": "string",
      "name": "string",
      "score": "number",
      "rank": "number"
    }
  ],
  "updatedAt": "timestamp"
}
```

### `config/app`
```json
{
  "coinToInrRate": 0.10,
  "minWithdrawal": 55,
  "dailyWithdrawalLimit": 5000,
  "level1MaxAds": 15,
  "level2MaxAds": 20,
  "level3MaxAds": 30,
  "vipMaxAds": 50,
  "adRewardCoins": 37,
  "referralSignupBonus": 50,
  "referralEarningPercent": 10,
  "maintenanceMode": false,
  "minAppVersion": "1.0.0"
}
```

## Firebase Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;

      match /transactions/{transactionId} {
        allow read: if request.auth != null && request.auth.uid == userId;
        allow write: if false; // Only server can write
      }

      match /withdrawals/{withdrawalId} {
        allow read: if request.auth != null && request.auth.uid == userId;
        allow create: if request.auth != null && request.auth.uid == userId;
        allow update: if false; // Only admin can update
      }
    }

    // Notifications
    match /notifications/{notificationId} {
      allow read: if request.auth != null;
      allow write: if false; // Only server can write
    }

    // Leaderboard is publicly readable
    match /leaderboard/{type} {
      allow read: if request.auth != null;
      allow write: if false;
    }

    // App config is publicly readable
    match /config/{doc} {
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}
```
