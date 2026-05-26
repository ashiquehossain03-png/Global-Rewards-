import 'dart:async';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import '../config/constants.dart';

class AdService {
  RewardedAd? _rewardedAd;
  bool _isAdLoaded = false;
  bool _isAdLoading = false;
  int _adLoadAttempts = 0;
  static const int _maxLoadAttempts = 3;
  DateTime? _lastAdWatchTime;

  static final AdService _instance = AdService._internal();
  factory AdService() => _instance;
  AdService._internal();

  bool get isAdReady => _isAdLoaded && _rewardedAd != null;

  bool get canWatchAd {
    if (_lastAdWatchTime == null) return true;
    final diff = DateTime.now().difference(_lastAdWatchTime!);
    return diff.inSeconds >= AppConstants.adCooldownSeconds;
  }

  int get cooldownRemaining {
    if (_lastAdWatchTime == null) return 0;
    final diff = DateTime.now().difference(_lastAdWatchTime!);
    final remaining = AppConstants.adCooldownSeconds - diff.inSeconds;
    return remaining > 0 ? remaining : 0;
  }

  Future<void> initialize() async {
    await MobileAds.instance.initialize();
    await _loadRewardedAd();
  }

  Future<void> _loadRewardedAd() async {
    if (_isAdLoading) return;
    _isAdLoading = true;

    await RewardedAd.load(
      adUnitId: AppConstants.rewardedAdUnitId,
      request: const AdRequest(),
      rewardedAdLoadCallback: RewardedAdLoadCallback(
        onAdLoaded: (ad) {
          _rewardedAd = ad;
          _isAdLoaded = true;
          _isAdLoading = false;
          _adLoadAttempts = 0;
        },
        onAdFailedToLoad: (error) {
          _isAdLoaded = false;
          _isAdLoading = false;
          _adLoadAttempts++;
          if (_adLoadAttempts < _maxLoadAttempts) {
            Future.delayed(const Duration(seconds: 2), _loadRewardedAd);
          }
        },
      ),
    );
  }

  Future<bool> showRewardedAd({
    required Function(int coins) onRewardEarned,
    required Function() onAdDismissed,
    required Function(String error) onAdFailed,
  }) async {
    if (!isAdReady) {
      onAdFailed('Ad not ready. Please try again.');
      await _loadRewardedAd();
      return false;
    }

    if (!canWatchAd) {
      onAdFailed('Please wait ${cooldownRemaining}s before watching another ad.');
      return false;
    }

    final completer = Completer<bool>();

    _rewardedAd!.fullScreenContentCallback = FullScreenContentCallback(
      onAdDismissedFullScreenContent: (ad) {
        ad.dispose();
        _rewardedAd = null;
        _isAdLoaded = false;
        _loadRewardedAd();
        onAdDismissed();
      },
      onAdFailedToShowFullScreenContent: (ad, error) {
        ad.dispose();
        _rewardedAd = null;
        _isAdLoaded = false;
        _loadRewardedAd();
        onAdFailed('Failed to show ad: ${error.message}');
        if (!completer.isCompleted) completer.complete(false);
      },
    );

    _rewardedAd!.show(
      onUserEarnedReward: (ad, reward) {
        _lastAdWatchTime = DateTime.now();
        onRewardEarned(AppConstants.adRewardCoins);
        if (!completer.isCompleted) completer.complete(true);
      },
    );

    return completer.future;
  }

  void dispose() {
    _rewardedAd?.dispose();
  }
}
