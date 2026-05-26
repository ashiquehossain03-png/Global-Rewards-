import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../config/constants.dart';
import '../../providers/wallet_provider.dart';
import '../../models/transaction_model.dart';
import 'package:intl/intl.dart';

class WalletScreen extends StatefulWidget {
  const WalletScreen({super.key});

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
  }

  void _loadData() {
    final wallet = Provider.of<WalletProvider>(context, listen: false);
    wallet.fetchWallet();
    wallet.fetchTransactions(refresh: true);
    wallet.fetchWithdrawals();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Wallet'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            onPressed: () => Navigator.pushNamed(context, '/withdraw'),
            icon: const Icon(Icons.send_rounded, color: AppTheme.primaryGold),
          ),
        ],
      ),
      body: Container(
        decoration: const BoxDecoration(gradient: AppTheme.darkGradient),
        child: Column(
          children: [
            _buildWalletCard(),
            const SizedBox(height: 8),
            _buildQuickStats(),
            const SizedBox(height: 8),
            Container(
              color: AppTheme.cardDark,
              child: TabBar(
                controller: _tabController,
                indicatorColor: AppTheme.primaryGold,
                labelColor: AppTheme.primaryGold,
                unselectedLabelColor: AppTheme.textSecondary,
                tabs: const [
                  Tab(text: 'Transactions'),
                  Tab(text: 'Withdrawals'),
                ],
              ),
            ),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildTransactionsList(),
                  _buildWithdrawalsList(),
                ],
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.pushNamed(context, '/withdraw'),
        backgroundColor: AppTheme.primaryGold,
        foregroundColor: AppTheme.backgroundDark,
        icon: const Icon(Icons.account_balance_outlined),
        label: const Text('Withdraw', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
    );
  }

  Widget _buildWalletCard() {
    return Consumer<WalletProvider>(
      builder: (context, wallet, _) {
        return Container(
          margin: const EdgeInsets.all(16),
          padding: const EdgeInsets.all(24),
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
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Total Balance',
                    style: TextStyle(
                      color: Colors.black54,
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.black12,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.monetization_on, size: 16, color: Colors.black54),
                        const SizedBox(width: 4),
                        Text(
                          '${wallet.coinBalance} coins',
                          style: const TextStyle(
                            color: Colors.black87,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                '₹${wallet.totalEarnings.toStringAsFixed(2)}',
                style: const TextStyle(
                  color: Colors.black87,
                  fontSize: 36,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildWalletStat('Available', '₹${wallet.availableBalance.toStringAsFixed(2)}'),
                  _buildWalletStat('Pending', '₹${wallet.pendingWithdrawals.toStringAsFixed(2)}'),
                  _buildWalletStat('Withdrawn', '₹${wallet.withdrawnAmount.toStringAsFixed(2)}'),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildWalletStat(String label, String value) {
    return Column(
      children: [
        Text(label, style: const TextStyle(color: Colors.black45, fontSize: 12)),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(color: Colors.black87, fontSize: 14, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildQuickStats() {
    return Consumer<WalletProvider>(
      builder: (context, wallet, _) {
        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              Expanded(
                child: _buildQuickStatCard(
                  icon: Icons.people_outline,
                  label: 'Referral Earnings',
                  value: '₹${wallet.referralEarnings.toStringAsFixed(2)}',
                  color: AppTheme.info,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildQuickStatCard(
                  icon: Icons.trending_up,
                  label: 'Today\'s Earnings',
                  value: '₹0.00',
                  color: AppTheme.success,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildQuickStatCard({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return GlassmorphicContainer(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 8),
          Text(label, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11)),
          const SizedBox(height: 4),
          Text(value, style: TextStyle(color: color, fontSize: 16, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildTransactionsList() {
    return Consumer<WalletProvider>(
      builder: (context, wallet, _) {
        if (wallet.isLoading && wallet.transactions.isEmpty) {
          return const Center(child: CircularProgressIndicator(color: AppTheme.primaryGold));
        }
        if (wallet.transactions.isEmpty) {
          return _buildEmptyState('No transactions yet', 'Start earning by watching ads!');
        }
        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: wallet.transactions.length,
          itemBuilder: (context, index) {
            final tx = wallet.transactions[index];
            return _buildTransactionItem(tx);
          },
        );
      },
    );
  }

  Widget _buildTransactionItem(TransactionModel tx) {
    final isCredit = tx.isCredit;
    final dateStr = DateFormat('dd MMM, hh:mm a').format(tx.createdAt);
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.cardDark,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: (isCredit ? AppTheme.success : AppTheme.error).withOpacity(0.15),
            ),
            child: Icon(
              isCredit ? Icons.arrow_downward_rounded : Icons.arrow_upward_rounded,
              color: isCredit ? AppTheme.success : AppTheme.error,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(tx.description, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 14)),
                const SizedBox(height: 2),
                Text(dateStr, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                tx.formattedAmount,
                style: TextStyle(
                  color: isCredit ? AppTheme.success : AppTheme.error,
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                tx.formattedCoins,
                style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildWithdrawalsList() {
    return Consumer<WalletProvider>(
      builder: (context, wallet, _) {
        if (wallet.isLoading && wallet.withdrawals.isEmpty) {
          return const Center(child: CircularProgressIndicator(color: AppTheme.primaryGold));
        }
        if (wallet.withdrawals.isEmpty) {
          return _buildEmptyState('No withdrawals yet', 'Earn coins and withdraw real money!');
        }
        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: wallet.withdrawals.length,
          itemBuilder: (context, index) {
            final w = wallet.withdrawals[index];
            return _buildWithdrawalItem(w);
          },
        );
      },
    );
  }

  Widget _buildWithdrawalItem(WithdrawalModel w) {
    final dateStr = DateFormat('dd MMM yyyy').format(w.createdAt);
    Color statusColor;
    switch (w.status) {
      case 'approved':
      case 'completed':
        statusColor = AppTheme.success;
        break;
      case 'rejected':
        statusColor = AppTheme.error;
        break;
      default:
        statusColor = AppTheme.warning;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.cardDark,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: statusColor.withOpacity(0.15),
            ),
            child: Icon(Icons.account_balance_outlined, color: statusColor, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('₹${w.amount.toStringAsFixed(2)}', style: const TextStyle(color: AppTheme.textPrimary, fontSize: 14, fontWeight: FontWeight.w600)),
                Text('${w.method.toUpperCase()} • $dateStr', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              w.status.toUpperCase(),
              style: TextStyle(color: statusColor, fontSize: 11, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(String title, String subtitle) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.inbox_outlined, size: 64, color: AppTheme.textSecondary.withOpacity(0.3)),
          const SizedBox(height: 16),
          Text(title, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 16)),
          const SizedBox(height: 4),
          Text(subtitle, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
        ],
      ),
    );
  }
}
