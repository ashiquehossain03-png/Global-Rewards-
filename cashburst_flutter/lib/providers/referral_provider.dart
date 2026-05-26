import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ReferralProvider extends ChangeNotifier {
  final ApiService _api = ApiService();

  String _referralCode = '';
  int _totalReferrals = 0;
  double _totalReferralEarnings = 0;
  double _todayReferralEarnings = 0;
  List<ReferralUser> _referralList = [];
  List<LeaderboardEntry> _leaderboard = [];
  bool _isLoading = false;
  String? _error;

  String get referralCode => _referralCode;
  int get totalReferrals => _totalReferrals;
  double get totalReferralEarnings => _totalReferralEarnings;
  double get todayReferralEarnings => _todayReferralEarnings;
  List<ReferralUser> get referralList => _referralList;
  List<LeaderboardEntry> get leaderboard => _leaderboard;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchReferralStats() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _api.getReferralStats();
      final stats = response['stats'];
      _referralCode = stats['referralCode'] ?? '';
      _totalReferrals = stats['totalReferrals'] ?? 0;
      _totalReferralEarnings = (stats['totalEarnings'] ?? 0).toDouble();
      _todayReferralEarnings = (stats['todayEarnings'] ?? 0).toDouble();
      _error = null;
    } catch (e) {
      _error = 'Failed to fetch referral stats.';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> fetchReferralList() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _api.getReferralList();
      final List<dynamic> list = response['referrals'] ?? [];
      _referralList = list.map((r) => ReferralUser.fromJson(r)).toList();
      _error = null;
    } catch (e) {
      _error = 'Failed to fetch referral list.';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> fetchLeaderboard() async {
    try {
      final response = await _api.getLeaderboard(type: 'referral');
      final List<dynamic> list = response['leaderboard'] ?? [];
      _leaderboard = list.map((l) => LeaderboardEntry.fromJson(l)).toList();
      notifyListeners();
    } catch (e) {
      // Silently fail for leaderboard
    }
  }
}

class ReferralUser {
  final String id;
  final String name;
  final String? profileImage;
  final DateTime joinedAt;
  final double earningsFromUser;
  final bool isActive;

  ReferralUser({
    required this.id,
    required this.name,
    this.profileImage,
    required this.joinedAt,
    required this.earningsFromUser,
    required this.isActive,
  });

  factory ReferralUser.fromJson(Map<String, dynamic> json) {
    return ReferralUser(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? '',
      profileImage: json['profileImage'],
      joinedAt: DateTime.parse(json['joinedAt'] ?? DateTime.now().toIso8601String()),
      earningsFromUser: (json['earningsFromUser'] ?? 0).toDouble(),
      isActive: json['isActive'] ?? true,
    );
  }
}

class LeaderboardEntry {
  final int rank;
  final String name;
  final String? profileImage;
  final int referrals;
  final double earnings;

  LeaderboardEntry({
    required this.rank,
    required this.name,
    this.profileImage,
    required this.referrals,
    required this.earnings,
  });

  factory LeaderboardEntry.fromJson(Map<String, dynamic> json) {
    return LeaderboardEntry(
      rank: json['rank'] ?? 0,
      name: json['name'] ?? '',
      profileImage: json['profileImage'],
      referrals: json['referrals'] ?? 0,
      earnings: (json['earnings'] ?? 0).toDouble(),
    );
  }
}
