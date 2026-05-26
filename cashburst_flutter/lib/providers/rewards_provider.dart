import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../config/constants.dart';
import 'dart:math';

class RewardsProvider extends ChangeNotifier {
  final ApiService _api = ApiService();

  bool _dailyBonusClaimed = false;
  bool _spinAvailable = true;
  bool _scratchAvailable = true;
  int _adsWatchedToday = 0;
  int _maxAdsToday = AppConstants.level1MaxAds;
  int _loginStreak = 0;
  List<DailyTask> _dailyTasks = [];
  List<Achievement> _achievements = [];
  bool _isLoading = false;
  String? _error;

  bool get dailyBonusClaimed => _dailyBonusClaimed;
  bool get spinAvailable => _spinAvailable;
  bool get scratchAvailable => _scratchAvailable;
  int get adsWatchedToday => _adsWatchedToday;
  int get maxAdsToday => _maxAdsToday;
  int get loginStreak => _loginStreak;
  List<DailyTask> get dailyTasks => _dailyTasks;
  List<Achievement> get achievements => _achievements;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchDailyStatus() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _api.getDailyStatus();
      final status = response['dailyStatus'];
      _dailyBonusClaimed = status['dailyBonusClaimed'] ?? false;
      _spinAvailable = status['spinAvailable'] ?? true;
      _scratchAvailable = status['scratchAvailable'] ?? true;
      _adsWatchedToday = status['adsWatchedToday'] ?? 0;
      _maxAdsToday = status['maxAdsToday'] ?? AppConstants.level1MaxAds;
      _loginStreak = status['loginStreak'] ?? 0;

      final List<dynamic> tasks = status['dailyTasks'] ?? [];
      _dailyTasks = tasks.map((t) => DailyTask.fromJson(t)).toList();

      final List<dynamic> achList = status['achievements'] ?? [];
      _achievements = achList.map((a) => Achievement.fromJson(a)).toList();

      _error = null;
    } catch (e) {
      _error = 'Failed to fetch daily status.';
      _initDefaultTasks();
    }

    _isLoading = false;
    notifyListeners();
  }

  void _initDefaultTasks() {
    _dailyTasks = [
      DailyTask(id: '1', title: 'Watch 5 Ads', description: 'Watch 5 rewarded video ads', target: 5, progress: 0, reward: 25, isCompleted: false),
      DailyTask(id: '2', title: 'Watch 10 Ads', description: 'Watch 10 rewarded video ads', target: 10, progress: 0, reward: 50, isCompleted: false),
      DailyTask(id: '3', title: 'Daily Check-in', description: 'Log in and claim your daily bonus', target: 1, progress: 0, reward: 10, isCompleted: false),
      DailyTask(id: '4', title: 'Spin the Wheel', description: 'Use your daily spin', target: 1, progress: 0, reward: 15, isCompleted: false),
      DailyTask(id: '5', title: 'Refer a Friend', description: 'Invite a friend using your referral code', target: 1, progress: 0, reward: 50, isCompleted: false),
    ];

    _achievements = [
      Achievement(id: 'first_ad', title: 'First Step', description: 'Watch your first ad', icon: '🎬', reward: 10, isUnlocked: false),
      Achievement(id: 'watch_50_ads', title: 'Ad Watcher', description: 'Watch 50 ads', icon: '📺', reward: 100, isUnlocked: false),
      Achievement(id: 'watch_100_ads', title: 'Ad Master', description: 'Watch 100 ads', icon: '🏆', reward: 250, isUnlocked: false),
      Achievement(id: 'first_referral', title: 'Social Star', description: 'Refer your first friend', icon: '⭐', reward: 50, isUnlocked: false),
      Achievement(id: 'refer_5_friends', title: 'Team Builder', description: 'Refer 5 friends', icon: '👥', reward: 200, isUnlocked: false),
      Achievement(id: 'streak_7_days', title: 'Week Warrior', description: '7-day login streak', icon: '🔥', reward: 100, isUnlocked: false),
      Achievement(id: 'streak_30_days', title: 'Monthly Legend', description: '30-day login streak', icon: '💎', reward: 500, isUnlocked: false),
    ];
  }

  Future<int> claimDailyBonus() async {
    try {
      final response = await _api.claimDailyBonus();
      _dailyBonusClaimed = true;
      _loginStreak = response['loginStreak'] ?? _loginStreak + 1;
      notifyListeners();
      return response['coins'] ?? AppConstants.dailyLoginBonus;
    } catch (e) {
      _error = 'Failed to claim daily bonus.';
      notifyListeners();
      return 0;
    }
  }

  Future<int> spinWheel() async {
    try {
      final response = await _api.spinWheel();
      _spinAvailable = false;
      notifyListeners();
      return response['coins'] ?? _generateSpinReward();
    } catch (e) {
      return _generateSpinReward();
    }
  }

  int _generateSpinReward() {
    final random = Random();
    final rewards = [5, 10, 15, 20, 25, 30, 50, 100];
    return rewards[random.nextInt(rewards.length)];
  }

  Future<int> scratchCard() async {
    try {
      final response = await _api.scratchCard();
      _scratchAvailable = false;
      notifyListeners();
      return response['coins'] ?? _generateScratchReward();
    } catch (e) {
      return _generateScratchReward();
    }
  }

  int _generateScratchReward() {
    final random = Random();
    return AppConstants.scratchCardMinReward +
        random.nextInt(AppConstants.scratchCardMaxReward - AppConstants.scratchCardMinReward);
  }

  void incrementAdsWatched() {
    _adsWatchedToday++;
    for (var task in _dailyTasks) {
      if (task.title.contains('Watch') && task.title.contains('Ads')) {
        task.progress = _adsWatchedToday;
        if (task.progress >= task.target) {
          task.isCompleted = true;
        }
      }
    }
    notifyListeners();
  }
}

class DailyTask {
  final String id;
  final String title;
  final String description;
  final int target;
  int progress;
  final int reward;
  bool isCompleted;

  DailyTask({
    required this.id,
    required this.title,
    required this.description,
    required this.target,
    required this.progress,
    required this.reward,
    required this.isCompleted,
  });

  factory DailyTask.fromJson(Map<String, dynamic> json) {
    return DailyTask(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      target: json['target'] ?? 0,
      progress: json['progress'] ?? 0,
      reward: json['reward'] ?? 0,
      isCompleted: json['isCompleted'] ?? false,
    );
  }

  double get progressPercent => target > 0 ? (progress / target).clamp(0.0, 1.0) : 0.0;
}

class Achievement {
  final String id;
  final String title;
  final String description;
  final String icon;
  final int reward;
  bool isUnlocked;

  Achievement({
    required this.id,
    required this.title,
    required this.description,
    required this.icon,
    required this.reward,
    required this.isUnlocked,
  });

  factory Achievement.fromJson(Map<String, dynamic> json) {
    return Achievement(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      icon: json['icon'] ?? '',
      reward: json['reward'] ?? 0,
      isUnlocked: json['isUnlocked'] ?? false,
    );
  }
}
