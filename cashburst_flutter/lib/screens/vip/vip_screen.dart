import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';

class VipScreen extends StatelessWidget {
  const VipScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('VIP Program'),
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
              _buildVipHeader(context),
              const SizedBox(height: 20),
              _buildLevelCards(),
              const SizedBox(height: 20),
              _buildVipBenefits(),
              const SizedBox(height: 20),
              _buildHowToUnlock(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildVipHeader(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, auth, _) {
        final isVip = auth.user?.isVip ?? false;
        return Container(
          width: double.infinity,
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            gradient: isVip ? AppTheme.goldGradient : AppTheme.cardGradient,
            border: isVip ? null : Border.all(color: AppTheme.primaryGold.withOpacity(0.3)),
          ),
          child: Column(
            children: [
              Icon(
                Icons.workspace_premium_rounded,
                size: 64,
                color: isVip ? AppTheme.backgroundDark : AppTheme.primaryGold,
              ),
              const SizedBox(height: 12),
              Text(
                isVip ? 'VIP Member' : 'Become VIP',
                style: TextStyle(
                  color: isVip ? AppTheme.backgroundDark : AppTheme.primaryGold,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                isVip
                    ? 'You are enjoying premium benefits!'
                    : 'No investment required! Unlock through activity.',
                style: TextStyle(
                  color: isVip ? Colors.black54 : AppTheme.textSecondary,
                  fontSize: 14,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildLevelCards() {
    final levels = [
      {'name': 'Beginner', 'ads': '15/day', 'earning': '₹300-₹825', 'color': AppTheme.textSecondary, 'icon': Icons.star_border},
      {'name': 'Level 2', 'ads': '20/day', 'earning': '₹500-₹1,200', 'color': AppTheme.info, 'icon': Icons.star_half},
      {'name': 'Level 3', 'ads': '30/day', 'earning': '₹1,000-₹2,500', 'color': AppTheme.warning, 'icon': Icons.star},
      {'name': 'VIP', 'ads': '50+/day', 'earning': '₹2,500+', 'color': AppTheme.primaryGold, 'icon': Icons.workspace_premium},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Level Tiers', style: TextStyle(color: AppTheme.textPrimary, fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        ...levels.map((level) {
          return Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.cardDark,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: (level['color'] as Color).withOpacity(0.3)),
            ),
            child: Row(
              children: [
                Icon(level['icon'] as IconData, color: level['color'] as Color, size: 32),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(level['name'] as String, style: TextStyle(color: level['color'] as Color, fontSize: 16, fontWeight: FontWeight.bold)),
                      Text('${level['ads']} • ${level['earning']}', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                    ],
                  ),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _buildVipBenefits() {
    final benefits = [
      {'icon': Icons.play_circle_filled, 'title': 'Higher Ad Limits', 'desc': '50+ ads per day'},
      {'icon': Icons.monetization_on, 'title': 'Better Rewards', 'desc': '2x bonus multiplier'},
      {'icon': Icons.speed, 'title': 'Faster Withdrawals', 'desc': 'Priority processing'},
      {'icon': Icons.support_agent, 'title': 'Priority Support', 'desc': 'Dedicated support'},
      {'icon': Icons.trending_up, 'title': 'Bonus Multipliers', 'desc': 'Extra coins on all activities'},
      {'icon': Icons.card_giftcard, 'title': 'Exclusive Tasks', 'desc': 'Premium high-paying tasks'},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('VIP Benefits', style: TextStyle(color: AppTheme.textPrimary, fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisSpacing: 8,
          mainAxisSpacing: 8,
          childAspectRatio: 1.5,
          children: benefits.map((benefit) {
            return GlassmorphicContainer(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(benefit['icon'] as IconData, color: AppTheme.primaryGold, size: 28),
                  const SizedBox(height: 8),
                  Text(benefit['title'] as String, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13, fontWeight: FontWeight.w600)),
                  Text(benefit['desc'] as String, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11)),
                ],
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildHowToUnlock() {
    return GlassmorphicContainer(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: const [
          Text('How to Unlock VIP', style: TextStyle(color: AppTheme.primaryGold, fontSize: 16, fontWeight: FontWeight.bold)),
          SizedBox(height: 12),
          Text('VIP access is earned through:', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
          SizedBox(height: 8),
          Text('• Consistent daily activity (30+ days)', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
          Text('• Referral milestones (25+ referrals)', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
          Text('• High activity score (1000+)', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
          Text('• Task completion rate (90%+)', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
          SizedBox(height: 12),
          Text('No investment required!', style: TextStyle(color: AppTheme.success, fontSize: 14, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
