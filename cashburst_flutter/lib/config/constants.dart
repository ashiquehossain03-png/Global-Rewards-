class AppConstants {
  static const String appName = 'CashBurst';
  static const String appVersion = '1.0.0';
  static const String baseUrl = 'https://api.cashburst.app/api/v1';
  static const String supportEmail = 'support@cashburst.app';

  // Coin Economy
  static const double coinToInrRate = 0.10; // 1 coin = ₹0.10
  static const int coinsFor55 = 550;
  static const int coinsFor100 = 1000;

  // Ad Rewards
  static const int adRewardCoins = 37; // ~550/15 for level 1
  static const int adCooldownSeconds = 30;

  // User Levels
  static const int level1MaxAds = 15;
  static const int level2MaxAds = 20;
  static const int level3MaxAds = 30;
  static const int vipMaxAds = 50;

  // Level Unlock Requirements
  static const int level2RequiredDays = 7;
  static const int level2RequiredTasks = 50;
  static const int level3RequiredReferrals = 10;
  static const int level3RequiredActivityScore = 500;

  // Withdrawal Limits
  static const double minWithdrawalAmount = 55.0;
  static const double dailyWithdrawalLimit = 5000.0;
  static const double kycRequiredAbove = 500.0;

  // Daily Bonuses
  static const int dailyLoginBonus = 10;
  static const int spinWheelMinReward = 5;
  static const int spinWheelMaxReward = 100;
  static const int scratchCardMinReward = 2;
  static const int scratchCardMaxReward = 50;

  // Referral
  static const int referralSignupBonus = 50;
  static const double referralEarningPercent = 10.0;

  // Streak Bonuses
  static const Map<int, int> streakBonuses = {
    3: 20,
    7: 50,
    14: 100,
    30: 250,
    60: 500,
    90: 1000,
  };

  // Achievement Badges
  static const Map<String, int> achievements = {
    'first_ad': 10,
    'watch_50_ads': 100,
    'watch_100_ads': 250,
    'first_referral': 50,
    'refer_5_friends': 200,
    'refer_10_friends': 500,
    'first_withdrawal': 25,
    'streak_7_days': 100,
    'streak_30_days': 500,
    'level_2_unlock': 200,
    'level_3_unlock': 500,
    'vip_unlock': 1000,
  };

  // Storage Keys
  static const String tokenKey = 'auth_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userKey = 'user_data';
  static const String onboardingKey = 'onboarding_complete';
  static const String deviceIdKey = 'device_id';

  // AdMob IDs (Test IDs - Replace with production IDs)
  static const String admobAppId = 'ca-app-pub-3940256099942544~3347511713';
  static const String rewardedAdUnitId = 'ca-app-pub-3940256099942544/5224354917';
  static const String bannerAdUnitId = 'ca-app-pub-3940256099942544/6300978111';
}

class UserLevel {
  static const String beginner = 'beginner';
  static const String level2 = 'level_2';
  static const String level3 = 'level_3';
  static const String vip = 'vip';

  static int maxAdsForLevel(String level) {
    switch (level) {
      case beginner:
        return AppConstants.level1MaxAds;
      case level2:
        return AppConstants.level2MaxAds;
      case level3:
        return AppConstants.level3MaxAds;
      case vip:
        return AppConstants.vipMaxAds;
      default:
        return AppConstants.level1MaxAds;
    }
  }

  static double bonusMultiplier(String level) {
    switch (level) {
      case beginner:
        return 1.0;
      case level2:
        return 1.2;
      case level3:
        return 1.5;
      case vip:
        return 2.0;
      default:
        return 1.0;
    }
  }
}

class WithdrawalStatus {
  static const String pending = 'pending';
  static const String approved = 'approved';
  static const String rejected = 'rejected';
  static const String processing = 'processing';
  static const String completed = 'completed';
}

class TransactionType {
  static const String adReward = 'ad_reward';
  static const String dailyBonus = 'daily_bonus';
  static const String spinWheel = 'spin_wheel';
  static const String scratchCard = 'scratch_card';
  static const String referralBonus = 'referral_bonus';
  static const String referralEarning = 'referral_earning';
  static const String achievementReward = 'achievement_reward';
  static const String streakBonus = 'streak_bonus';
  static const String withdrawal = 'withdrawal';
  static const String taskReward = 'task_reward';
}
