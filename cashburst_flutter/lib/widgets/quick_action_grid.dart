import 'package:flutter/material.dart';
import '../config/theme.dart';

class QuickActionGrid extends StatelessWidget {
  const QuickActionGrid({super.key});

  @override
  Widget build(BuildContext context) {
    final actions = [
      _QuickAction(icon: Icons.play_circle_filled_rounded, label: 'Watch Ads', color: AppTheme.primaryGold, route: '/watch-ads'),
      _QuickAction(icon: Icons.donut_large_rounded, label: 'Spin Wheel', color: AppTheme.warning, route: '/rewards'),
      _QuickAction(icon: Icons.style_rounded, label: 'Scratch Card', color: AppTheme.success, route: '/rewards'),
      _QuickAction(icon: Icons.people_rounded, label: 'Referrals', color: AppTheme.info, route: '/referral'),
      _QuickAction(icon: Icons.account_balance_wallet_rounded, label: 'Wallet', color: const Color(0xFF9C27B0), route: '/wallet'),
      _QuickAction(icon: Icons.workspace_premium_rounded, label: 'VIP', color: const Color(0xFFFF6D00), route: '/vip'),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Quick Actions',
          style: TextStyle(color: AppTheme.textPrimary, fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        GridView.count(
          crossAxisCount: 3,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          children: actions.map((action) {
            return GestureDetector(
              onTap: () => Navigator.pushNamed(context, action.route),
              child: Container(
                decoration: BoxDecoration(
                  color: AppTheme.cardDark,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: action.color.withOpacity(0.2)),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: action.color.withOpacity(0.15),
                      ),
                      child: Icon(action.icon, color: action.color, size: 24),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      action.label,
                      style: const TextStyle(color: AppTheme.textPrimary, fontSize: 12, fontWeight: FontWeight.w500),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}

class _QuickAction {
  final IconData icon;
  final String label;
  final Color color;
  final String route;

  _QuickAction({
    required this.icon,
    required this.label,
    required this.color,
    required this.route,
  });
}
