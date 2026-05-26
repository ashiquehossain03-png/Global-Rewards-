import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../providers/wallet_provider.dart';

class EarningsOverviewCard extends StatelessWidget {
  const EarningsOverviewCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<WalletProvider>(
      builder: (context, wallet, _) {
        return Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            gradient: AppTheme.goldGradient,
            boxShadow: [
              BoxShadow(
                color: AppTheme.primaryGold.withOpacity(0.3),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Total Earnings',
                    style: TextStyle(color: Colors.black54, fontSize: 14, fontWeight: FontWeight.w500),
                  ),
                  Icon(Icons.account_balance_wallet_rounded, color: Colors.black38, size: 24),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                '₹${wallet.totalEarnings.toStringAsFixed(2)}',
                style: const TextStyle(
                  color: Colors.black87,
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildMiniStat('Coins', '${wallet.coinBalance}'),
                  _buildMiniStat('Pending', '₹${wallet.pendingWithdrawals.toStringAsFixed(0)}'),
                  _buildMiniStat('Available', '₹${wallet.availableBalance.toStringAsFixed(0)}'),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildMiniStat(String label, String value) {
    return Column(
      children: [
        Text(label, style: const TextStyle(color: Colors.black45, fontSize: 12)),
        const SizedBox(height: 2),
        Text(value, style: const TextStyle(color: Colors.black87, fontSize: 14, fontWeight: FontWeight.bold)),
      ],
    );
  }
}
