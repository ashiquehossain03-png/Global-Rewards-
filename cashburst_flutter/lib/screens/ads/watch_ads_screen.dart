import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../config/constants.dart';
import '../../providers/auth_provider.dart';
import '../../providers/wallet_provider.dart';
import '../../providers/rewards_provider.dart';
import '../../services/ad_service.dart';
import '../../services/api_service.dart';
import 'dart:async';

class WatchAdsScreen extends StatefulWidget {
  const WatchAdsScreen({super.key});

  @override
  State<WatchAdsScreen> createState() => _WatchAdsScreenState();
}

class _WatchAdsScreenState extends State<WatchAdsScreen> with TickerProviderStateMixin {
  final AdService _adService = AdService();
  final ApiService _api = ApiService();
  bool _isWatching = false;
  int _cooldownSeconds = 0;
  Timer? _cooldownTimer;
  int _coinsEarnedThisSession = 0;
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _adService.initialize();
    _pulseController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _cooldownTimer?.cancel();
    _pulseController.dispose();
    super.dispose();
  }

  void _startCooldown() {
    _cooldownSeconds = AppConstants.adCooldownSeconds;
    _cooldownTimer?.cancel();
    _cooldownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_cooldownSeconds > 0) {
        setState(() => _cooldownSeconds--);
      } else {
        timer.cancel();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Watch & Earn'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Container(
        decoration: const BoxDecoration(gradient: AppTheme.darkGradient),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              _buildAdStats(),
              const SizedBox(height: 20),
              _buildWatchAdButton(),
              const SizedBox(height: 20),
              _buildSessionEarnings(),
              const SizedBox(height: 20),
              _buildEarningTiers(),
              const SizedBox(height: 20),
              _buildAdGuidelines(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAdStats() {
    return Consumer2<RewardsProvider, AuthProvider>(
      builder: (context, rewards, auth, _) {
        final maxAds = UserLevel.maxAdsForLevel(auth.user?.level ?? 'beginner');
        return GlassmorphicContainer(
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildStatItem(
                    icon: Icons.play_circle_outline,
                    value: '${rewards.adsWatchedToday}',
                    label: 'Watched Today',
                    color: AppTheme.primaryGold,
                  ),
                  Container(width: 1, height: 40, color: AppTheme.textSecondary.withOpacity(0.2)),
                  _buildStatItem(
                    icon: Icons.timer_outlined,
                    value: '${maxAds - rewards.adsWatchedToday}',
                    label: 'Remaining',
                    color: AppTheme.success,
                  ),
                  Container(width: 1, height: 40, color: AppTheme.textSecondary.withOpacity(0.2)),
                  _buildStatItem(
                    icon: Icons.monetization_on_outlined,
                    value: '$_coinsEarnedThisSession',
                    label: 'Session Coins',
                    color: AppTheme.warning,
                  ),
                ],
              ),
              const SizedBox(height: 16),
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: LinearProgressIndicator(
                  value: maxAds > 0 ? (rewards.adsWatchedToday / maxAds).clamp(0.0, 1.0) : 0,
                  backgroundColor: AppTheme.cardDarkLight,
                  valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.primaryGold),
                  minHeight: 8,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildStatItem({
    required IconData icon,
    required String value,
    required String label,
    required Color color,
  }) {
    return Column(
      children: [
        Icon(icon, color: color, size: 24),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(
            color: color,
            fontSize: 22,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11),
        ),
      ],
    );
  }

  Widget _buildWatchAdButton() {
    return Consumer2<RewardsProvider, AuthProvider>(
      builder: (context, rewards, auth, _) {
        final maxAds = UserLevel.maxAdsForLevel(auth.user?.level ?? 'beginner');
        final canWatch = rewards.adsWatchedToday < maxAds && _cooldownSeconds == 0 && !_isWatching;

        return GlassmorphicContainer(
          padding: const EdgeInsets.all(32),
          child: Column(
            children: [
              AnimatedBuilder(
                animation: _pulseController,
                builder: (context, child) {
                  return Transform.scale(
                    scale: canWatch ? 1.0 + (_pulseController.value * 0.05) : 1.0,
                    child: GestureDetector(
                      onTap: canWatch ? _watchAd : null,
                      child: Container(
                        width: 140,
                        height: 140,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: canWatch ? AppTheme.goldGradient : null,
                          color: canWatch ? null : AppTheme.cardDarkLight,
                          boxShadow: canWatch
                              ? [
                                  BoxShadow(
                                    color: AppTheme.primaryGold.withOpacity(0.4),
                                    blurRadius: 30,
                                    spreadRadius: 5,
                                  ),
                                ]
                              : null,
                        ),
                        child: Icon(
                          _isWatching ? Icons.hourglass_top_rounded : Icons.play_arrow_rounded,
                          size: 64,
                          color: canWatch ? AppTheme.backgroundDark : AppTheme.textSecondary,
                        ),
                      ),
                    ),
                  );
                },
              ),
              const SizedBox(height: 20),
              Text(
                _getButtonText(rewards, maxAds),
                style: const TextStyle(
                  color: AppTheme.textPrimary,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                _getSubText(rewards, maxAds),
                style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        );
      },
    );
  }

  String _getButtonText(RewardsProvider rewards, int maxAds) {
    if (_isWatching) return 'Watching Ad...';
    if (rewards.adsWatchedToday >= maxAds) return 'Daily Limit Reached';
    if (_cooldownSeconds > 0) return 'Cooldown: ${_cooldownSeconds}s';
    return 'Watch Ad & Earn';
  }

  String _getSubText(RewardsProvider rewards, int maxAds) {
    if (rewards.adsWatchedToday >= maxAds) return 'Come back tomorrow for more rewards!';
    if (_cooldownSeconds > 0) return 'Please wait before watching the next ad';
    return 'Earn ${AppConstants.adRewardCoins} coins per ad watched';
  }

  Widget _buildSessionEarnings() {
    if (_coinsEarnedThisSession == 0) return const SizedBox();
    final inr = (_coinsEarnedThisSession * AppConstants.coinToInrRate).toStringAsFixed(2);
    return GlassmorphicContainer(
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppTheme.success.withOpacity(0.2),
            ),
            child: const Icon(Icons.trending_up_rounded, color: AppTheme.success),
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Session Earnings',
                style: TextStyle(color: AppTheme.textSecondary, fontSize: 13),
              ),
              Text(
                '$_coinsEarnedThisSession coins (₹$inr)',
                style: const TextStyle(
                  color: AppTheme.success,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildEarningTiers() {
    return GlassmorphicContainer(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Earning Tiers',
            style: TextStyle(color: AppTheme.textPrimary, fontSize: 16, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 12),
          _buildTierRow('Beginner', '15 ads/day', '₹300-₹825'),
          _buildTierRow('Level 2', '20 ads/day', '₹500-₹1,200'),
          _buildTierRow('Level 3', '30 ads/day', '₹1,000-₹2,500'),
          _buildTierRow('VIP', '50+ ads/day', '₹2,500+'),
        ],
      ),
    );
  }

  Widget _buildTierRow(String level, String ads, String earning) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              color: AppTheme.primaryGold,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(child: Text(level, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 14))),
          Text(ads, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
          const SizedBox(width: 16),
          Text(earning, style: const TextStyle(color: AppTheme.success, fontSize: 13, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _buildAdGuidelines() {
    return GlassmorphicContainer(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Ad Guidelines',
            style: TextStyle(color: AppTheme.textPrimary, fontSize: 16, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 12),
          _buildGuidelineItem(Icons.check_circle_outline, 'Watch the complete ad to earn coins'),
          _buildGuidelineItem(Icons.check_circle_outline, 'Do not skip or close ads early'),
          _buildGuidelineItem(Icons.check_circle_outline, 'Wait for cooldown between ads'),
          _buildGuidelineItem(Icons.warning_amber_rounded, 'Fake clicks will result in ban'),
          _buildGuidelineItem(Icons.warning_amber_rounded, 'VPN/Emulator usage is prohibited'),
        ],
      ),
    );
  }

  Widget _buildGuidelineItem(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(icon, size: 18, color: AppTheme.textSecondary),
          const SizedBox(width: 8),
          Expanded(
            child: Text(text, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
          ),
        ],
      ),
    );
  }

  Future<void> _watchAd() async {
    setState(() => _isWatching = true);

    await _adService.showRewardedAd(
      onRewardEarned: (coins) async {
        setState(() {
          _coinsEarnedThisSession += coins;
        });

        final walletProvider = Provider.of<WalletProvider>(context, listen: false);
        final rewardsProvider = Provider.of<RewardsProvider>(context, listen: false);

        walletProvider.addCoins(coins, coins * AppConstants.coinToInrRate);
        rewardsProvider.incrementAdsWatched();

        try {
          await _api.recordAdWatch();
        } catch (_) {}

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Earned $coins coins!'),
              backgroundColor: AppTheme.success,
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      },
      onAdDismissed: () {
        setState(() => _isWatching = false);
        _startCooldown();
      },
      onAdFailed: (error) {
        setState(() => _isWatching = false);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(error),
              backgroundColor: AppTheme.error,
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      },
    );
  }
}
