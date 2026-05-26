import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:confetti/confetti.dart';
import '../../config/theme.dart';
import '../../providers/rewards_provider.dart';
import '../../providers/wallet_provider.dart';
import '../../config/constants.dart';
import 'dart:math';

class RewardsScreen extends StatefulWidget {
  const RewardsScreen({super.key});

  @override
  State<RewardsScreen> createState() => _RewardsScreenState();
}

class _RewardsScreenState extends State<RewardsScreen> {
  late ConfettiController _confettiController;

  @override
  void initState() {
    super.initState();
    _confettiController = ConfettiController(duration: const Duration(seconds: 2));
    Provider.of<RewardsProvider>(context, listen: false).fetchDailyStatus();
  }

  @override
  void dispose() {
    _confettiController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Rewards Center'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Stack(
        children: [
          Container(
            decoration: const BoxDecoration(gradient: AppTheme.darkGradient),
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildDailyBonus(),
                  const SizedBox(height: 16),
                  _buildSpinWheel(),
                  const SizedBox(height: 16),
                  _buildScratchCard(),
                  const SizedBox(height: 16),
                  _buildStreakRewards(),
                  const SizedBox(height: 16),
                  _buildAchievements(),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
          Align(
            alignment: Alignment.topCenter,
            child: ConfettiWidget(
              confettiController: _confettiController,
              blastDirectionality: BlastDirectionality.explosive,
              colors: const [AppTheme.primaryGold, AppTheme.success, AppTheme.warning, AppTheme.info],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDailyBonus() {
    return Consumer<RewardsProvider>(
      builder: (context, rewards, _) {
        return GlassmorphicContainer(
          child: Column(
            children: [
              Row(
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppTheme.primaryGold.withOpacity(0.2),
                    ),
                    child: const Icon(Icons.calendar_today_rounded, color: AppTheme.primaryGold, size: 28),
                  ),
                  const SizedBox(width: 16),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Daily Login Bonus', style: TextStyle(color: AppTheme.textPrimary, fontSize: 16, fontWeight: FontWeight.w600)),
                        Text('Claim your daily reward!', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                      ],
                    ),
                  ),
                  ElevatedButton(
                    onPressed: rewards.dailyBonusClaimed ? null : () => _claimDailyBonus(),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: rewards.dailyBonusClaimed ? AppTheme.cardDarkLight : AppTheme.primaryGold,
                      foregroundColor: AppTheme.backgroundDark,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Text(rewards.dailyBonusClaimed ? 'Claimed' : 'Claim'),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSpinWheel() {
    return Consumer<RewardsProvider>(
      builder: (context, rewards, _) {
        return GlassmorphicContainer(
          child: Column(
            children: [
              Row(
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppTheme.warning.withOpacity(0.2),
                    ),
                    child: const Icon(Icons.donut_large_rounded, color: AppTheme.warning, size: 28),
                  ),
                  const SizedBox(width: 16),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Spin & Win', style: TextStyle(color: AppTheme.textPrimary, fontSize: 16, fontWeight: FontWeight.w600)),
                        Text('Win up to 100 coins!', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                      ],
                    ),
                  ),
                  ElevatedButton(
                    onPressed: rewards.spinAvailable ? () => _spinWheel() : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: rewards.spinAvailable ? AppTheme.warning : AppTheme.cardDarkLight,
                      foregroundColor: AppTheme.backgroundDark,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Text(rewards.spinAvailable ? 'Spin!' : 'Done'),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildScratchCard() {
    return Consumer<RewardsProvider>(
      builder: (context, rewards, _) {
        return GlassmorphicContainer(
          child: Column(
            children: [
              Row(
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppTheme.success.withOpacity(0.2),
                    ),
                    child: const Icon(Icons.style_rounded, color: AppTheme.success, size: 28),
                  ),
                  const SizedBox(width: 16),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Scratch & Win', style: TextStyle(color: AppTheme.textPrimary, fontSize: 16, fontWeight: FontWeight.w600)),
                        Text('Scratch to reveal your prize!', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                      ],
                    ),
                  ),
                  ElevatedButton(
                    onPressed: rewards.scratchAvailable ? () => _scratchCard() : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: rewards.scratchAvailable ? AppTheme.success : AppTheme.cardDarkLight,
                      foregroundColor: AppTheme.backgroundDark,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Text(rewards.scratchAvailable ? 'Scratch!' : 'Done'),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildStreakRewards() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Streak Rewards', style: TextStyle(color: AppTheme.textPrimary, fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: AppConstants.streakBonuses.entries.map((entry) {
            return Container(
              width: (MediaQuery.of(context).size.width - 48) / 3,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.cardDark,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.primaryGold.withOpacity(0.2)),
              ),
              child: Column(
                children: [
                  const Icon(Icons.local_fire_department_rounded, color: AppTheme.warning, size: 24),
                  const SizedBox(height: 4),
                  Text('${entry.key} Days', style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13, fontWeight: FontWeight.w600)),
                  Text('+${entry.value} coins', style: const TextStyle(color: AppTheme.primaryGold, fontSize: 12)),
                ],
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildAchievements() {
    return Consumer<RewardsProvider>(
      builder: (context, rewards, _) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Achievements', style: TextStyle(color: AppTheme.textPrimary, fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            ...rewards.achievements.map((achievement) {
              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.cardDark,
                  borderRadius: BorderRadius.circular(12),
                  border: achievement.isUnlocked
                      ? Border.all(color: AppTheme.primaryGold.withOpacity(0.5))
                      : null,
                ),
                child: Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: achievement.isUnlocked
                            ? AppTheme.primaryGold.withOpacity(0.2)
                            : AppTheme.cardDarkLight,
                      ),
                      child: Center(
                        child: Text(achievement.icon, style: const TextStyle(fontSize: 20)),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            achievement.title,
                            style: TextStyle(
                              color: achievement.isUnlocked ? AppTheme.primaryGold : AppTheme.textPrimary,
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          Text(achievement.description, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                        ],
                      ),
                    ),
                    Text(
                      '+${achievement.reward}',
                      style: TextStyle(
                        color: achievement.isUnlocked ? AppTheme.success : AppTheme.textSecondary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              );
            }),
          ],
        );
      },
    );
  }

  void _claimDailyBonus() async {
    final rewards = Provider.of<RewardsProvider>(context, listen: false);
    final coins = await rewards.claimDailyBonus();
    if (coins > 0) {
      _confettiController.play();
      final wallet = Provider.of<WalletProvider>(context, listen: false);
      wallet.addCoins(coins, coins * AppConstants.coinToInrRate);
      if (mounted) {
        _showRewardDialog('Daily Bonus!', coins);
      }
    }
  }

  void _spinWheel() async {
    final rewards = Provider.of<RewardsProvider>(context, listen: false);
    final coins = await rewards.spinWheel();
    _confettiController.play();
    final wallet = Provider.of<WalletProvider>(context, listen: false);
    wallet.addCoins(coins, coins * AppConstants.coinToInrRate);
    if (mounted) {
      _showRewardDialog('Spin Wheel!', coins);
    }
  }

  void _scratchCard() async {
    final rewards = Provider.of<RewardsProvider>(context, listen: false);
    final coins = await rewards.scratchCard();
    _confettiController.play();
    final wallet = Provider.of<WalletProvider>(context, listen: false);
    wallet.addCoins(coins, coins * AppConstants.coinToInrRate);
    if (mounted) {
      _showRewardDialog('Scratch Card!', coins);
    }
  }

  void _showRewardDialog(String title, int coins) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppTheme.cardDark,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.celebration_rounded, size: 64, color: AppTheme.primaryGold),
            const SizedBox(height: 16),
            Text(title, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text('You won $coins coins!', style: const TextStyle(color: AppTheme.success, fontSize: 24, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text('₹${(coins * AppConstants.coinToInrRate).toStringAsFixed(2)}', style: const TextStyle(color: AppTheme.textSecondary)),
          ],
        ),
        actions: [
          Center(
            child: ElevatedButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Awesome!'),
            ),
          ),
        ],
      ),
    );
  }
}
