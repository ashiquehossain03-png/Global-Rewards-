class UserModel {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String? profileImage;
  final String level;
  final int coinBalance;
  final double totalEarnings;
  final double referralEarnings;
  final int adsWatchedToday;
  final int totalAdsWatched;
  final int loginStreak;
  final int activityScore;
  final String referralCode;
  final int totalReferrals;
  final bool isKycVerified;
  final bool isVip;
  final bool isBanned;
  final List<String> achievements;
  final DateTime createdAt;
  final DateTime lastLoginAt;
  final KycDetails? kycDetails;
  final WalletDetails wallet;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    this.profileImage,
    this.level = 'beginner',
    this.coinBalance = 0,
    this.totalEarnings = 0.0,
    this.referralEarnings = 0.0,
    this.adsWatchedToday = 0,
    this.totalAdsWatched = 0,
    this.loginStreak = 0,
    this.activityScore = 0,
    required this.referralCode,
    this.totalReferrals = 0,
    this.isKycVerified = false,
    this.isVip = false,
    this.isBanned = false,
    this.achievements = const [],
    required this.createdAt,
    required this.lastLoginAt,
    this.kycDetails,
    required this.wallet,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      profileImage: json['profileImage'],
      level: json['level'] ?? 'beginner',
      coinBalance: json['coinBalance'] ?? 0,
      totalEarnings: (json['totalEarnings'] ?? 0).toDouble(),
      referralEarnings: (json['referralEarnings'] ?? 0).toDouble(),
      adsWatchedToday: json['adsWatchedToday'] ?? 0,
      totalAdsWatched: json['totalAdsWatched'] ?? 0,
      loginStreak: json['loginStreak'] ?? 0,
      activityScore: json['activityScore'] ?? 0,
      referralCode: json['referralCode'] ?? '',
      totalReferrals: json['totalReferrals'] ?? 0,
      isKycVerified: json['isKycVerified'] ?? false,
      isVip: json['isVip'] ?? false,
      isBanned: json['isBanned'] ?? false,
      achievements: List<String>.from(json['achievements'] ?? []),
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      lastLoginAt: DateTime.parse(json['lastLoginAt'] ?? DateTime.now().toIso8601String()),
      kycDetails: json['kycDetails'] != null
          ? KycDetails.fromJson(json['kycDetails'])
          : null,
      wallet: WalletDetails.fromJson(json['wallet'] ?? {}),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'profileImage': profileImage,
      'level': level,
      'coinBalance': coinBalance,
      'totalEarnings': totalEarnings,
      'referralEarnings': referralEarnings,
      'adsWatchedToday': adsWatchedToday,
      'totalAdsWatched': totalAdsWatched,
      'loginStreak': loginStreak,
      'activityScore': activityScore,
      'referralCode': referralCode,
      'totalReferrals': totalReferrals,
      'isKycVerified': isKycVerified,
      'isVip': isVip,
      'isBanned': isBanned,
      'achievements': achievements,
      'createdAt': createdAt.toIso8601String(),
      'lastLoginAt': lastLoginAt.toIso8601String(),
      'kycDetails': kycDetails?.toJson(),
      'wallet': wallet.toJson(),
    };
  }

  UserModel copyWith({
    String? name,
    String? profileImage,
    String? level,
    int? coinBalance,
    double? totalEarnings,
    double? referralEarnings,
    int? adsWatchedToday,
    int? totalAdsWatched,
    int? loginStreak,
    int? activityScore,
    int? totalReferrals,
    bool? isKycVerified,
    bool? isVip,
    List<String>? achievements,
    KycDetails? kycDetails,
    WalletDetails? wallet,
  }) {
    return UserModel(
      id: id,
      name: name ?? this.name,
      email: email,
      phone: phone,
      profileImage: profileImage ?? this.profileImage,
      level: level ?? this.level,
      coinBalance: coinBalance ?? this.coinBalance,
      totalEarnings: totalEarnings ?? this.totalEarnings,
      referralEarnings: referralEarnings ?? this.referralEarnings,
      adsWatchedToday: adsWatchedToday ?? this.adsWatchedToday,
      totalAdsWatched: totalAdsWatched ?? this.totalAdsWatched,
      loginStreak: loginStreak ?? this.loginStreak,
      activityScore: activityScore ?? this.activityScore,
      referralCode: referralCode,
      totalReferrals: totalReferrals ?? this.totalReferrals,
      isKycVerified: isKycVerified ?? this.isKycVerified,
      isVip: isVip ?? this.isVip,
      isBanned: isBanned,
      achievements: achievements ?? this.achievements,
      createdAt: createdAt,
      lastLoginAt: lastLoginAt,
      kycDetails: kycDetails ?? this.kycDetails,
      wallet: wallet ?? this.wallet,
    );
  }
}

class KycDetails {
  final String? aadhaarNumber;
  final String? panNumber;
  final bool aadhaarVerified;
  final bool panVerified;
  final bool bankVerified;
  final String status;

  KycDetails({
    this.aadhaarNumber,
    this.panNumber,
    this.aadhaarVerified = false,
    this.panVerified = false,
    this.bankVerified = false,
    this.status = 'pending',
  });

  factory KycDetails.fromJson(Map<String, dynamic> json) {
    return KycDetails(
      aadhaarNumber: json['aadhaarNumber'],
      panNumber: json['panNumber'],
      aadhaarVerified: json['aadhaarVerified'] ?? false,
      panVerified: json['panVerified'] ?? false,
      bankVerified: json['bankVerified'] ?? false,
      status: json['status'] ?? 'pending',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'aadhaarNumber': aadhaarNumber,
      'panNumber': panNumber,
      'aadhaarVerified': aadhaarVerified,
      'panVerified': panVerified,
      'bankVerified': bankVerified,
      'status': status,
    };
  }
}

class WalletDetails {
  final int coinBalance;
  final double totalEarnings;
  final double pendingWithdrawals;
  final double referralEarnings;
  final double withdrawnAmount;

  WalletDetails({
    this.coinBalance = 0,
    this.totalEarnings = 0.0,
    this.pendingWithdrawals = 0.0,
    this.referralEarnings = 0.0,
    this.withdrawnAmount = 0.0,
  });

  factory WalletDetails.fromJson(Map<String, dynamic> json) {
    return WalletDetails(
      coinBalance: json['coinBalance'] ?? 0,
      totalEarnings: (json['totalEarnings'] ?? 0).toDouble(),
      pendingWithdrawals: (json['pendingWithdrawals'] ?? 0).toDouble(),
      referralEarnings: (json['referralEarnings'] ?? 0).toDouble(),
      withdrawnAmount: (json['withdrawnAmount'] ?? 0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'coinBalance': coinBalance,
      'totalEarnings': totalEarnings,
      'pendingWithdrawals': pendingWithdrawals,
      'referralEarnings': referralEarnings,
      'withdrawnAmount': withdrawnAmount,
    };
  }
}
