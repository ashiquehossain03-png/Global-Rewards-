import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';
import '../../config/theme.dart';
import '../../providers/referral_provider.dart';
import '../../providers/auth_provider.dart';

class ReferralScreen extends StatefulWidget {
  const ReferralScreen({super.key});

  @override
  State<ReferralScreen> createState() => _ReferralScreenState();
}

class _ReferralScreenState extends State<ReferralScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadData();
  }

  void _loadData() {
    final referral = Provider.of<ReferralProvider>(context, listen: false);
    referral.fetchReferralStats();
    referral.fetchReferralList();
    referral.fetchLeaderboard();
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
        title: const Text('Referral Program'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Container(
        decoration: const BoxDecoration(gradient: AppTheme.darkGradient),
        child: Column(
          children: [
            _buildReferralCard(),
            _buildStats(),
            Container(
              color: AppTheme.cardDark,
              child: TabBar(
                controller: _tabController,
                indicatorColor: AppTheme.primaryGold,
                labelColor: AppTheme.primaryGold,
                unselectedLabelColor: AppTheme.textSecondary,
                tabs: const [
                  Tab(text: 'My Team'),
                  Tab(text: 'Leaderboard'),
                  Tab(text: 'How it Works'),
                ],
              ),
            ),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildTeamList(),
                  _buildLeaderboard(),
                  _buildHowItWorks(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReferralCard() {
    return Consumer<AuthProvider>(
      builder: (context, auth, _) {
        final code = auth.user?.referralCode ?? 'LOADING...';
        return Container(
          margin: const EdgeInsets.all(16),
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            gradient: AppTheme.goldGradient,
          ),
          child: Column(
            children: [
              const Text(
                'Your Referral Code',
                style: TextStyle(color: Colors.black54, fontSize: 14),
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    code,
                    style: const TextStyle(
                      color: Colors.black87,
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 3,
                    ),
                  ),
                  const SizedBox(width: 12),
                  IconButton(
                    onPressed: () {
                      Clipboard.setData(ClipboardData(text: code));
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Code copied!'), backgroundColor: AppTheme.success),
                      );
                    },
                    icon: const Icon(Icons.copy_rounded, color: Colors.black54),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => _shareReferral(code),
                      icon: const Icon(Icons.share_rounded, size: 18),
                      label: const Text('Share'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.black87,
                        foregroundColor: AppTheme.primaryGold,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => _shareViaWhatsApp(code),
                      icon: const Icon(Icons.chat_rounded, size: 18),
                      label: const Text('WhatsApp'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF25D366),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildStats() {
    return Consumer<ReferralProvider>(
      builder: (context, referral, _) {
        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              _buildStatCard('Total Referrals', '${referral.totalReferrals}', AppTheme.info),
              const SizedBox(width: 8),
              _buildStatCard('Total Earnings', '₹${referral.totalReferralEarnings.toStringAsFixed(0)}', AppTheme.success),
              const SizedBox(width: 8),
              _buildStatCard('Today', '₹${referral.todayReferralEarnings.toStringAsFixed(0)}', AppTheme.warning),
            ],
          ),
        );
      },
    );
  }

  Widget _buildStatCard(String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppTheme.cardDark,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Text(value, style: TextStyle(color: color, fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text(label, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11)),
          ],
        ),
      ),
    );
  }

  Widget _buildTeamList() {
    return Consumer<ReferralProvider>(
      builder: (context, referral, _) {
        if (referral.isLoading) {
          return const Center(child: CircularProgressIndicator(color: AppTheme.primaryGold));
        }
        if (referral.referralList.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.people_outline, size: 64, color: AppTheme.textSecondary.withOpacity(0.3)),
                const SizedBox(height: 16),
                const Text('No referrals yet', style: TextStyle(color: AppTheme.textPrimary)),
                const Text('Share your code to start earning!', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
              ],
            ),
          );
        }
        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: referral.referralList.length,
          itemBuilder: (context, index) {
            final user = referral.referralList[index];
            return Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.cardDark,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    backgroundColor: AppTheme.primaryGold.withOpacity(0.2),
                    child: Text(user.name[0].toUpperCase(), style: const TextStyle(color: AppTheme.primaryGold)),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(user.name, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 14)),
                        Text(
                          user.isActive ? 'Active' : 'Inactive',
                          style: TextStyle(
                            color: user.isActive ? AppTheme.success : AppTheme.textSecondary,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    '₹${user.earningsFromUser.toStringAsFixed(2)}',
                    style: const TextStyle(color: AppTheme.success, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildLeaderboard() {
    return Consumer<ReferralProvider>(
      builder: (context, referral, _) {
        if (referral.leaderboard.isEmpty) {
          return const Center(child: Text('Leaderboard coming soon!', style: TextStyle(color: AppTheme.textSecondary)));
        }
        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: referral.leaderboard.length,
          itemBuilder: (context, index) {
            final entry = referral.leaderboard[index];
            return Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.cardDark,
                borderRadius: BorderRadius.circular(12),
                border: index < 3 ? Border.all(color: AppTheme.primaryGold.withOpacity(0.3)) : null,
              ),
              child: Row(
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: index < 3 ? AppTheme.primaryGold.withOpacity(0.2) : AppTheme.cardDarkLight,
                    ),
                    child: Center(
                      child: Text(
                        '#${entry.rank}',
                        style: TextStyle(
                          color: index < 3 ? AppTheme.primaryGold : AppTheme.textSecondary,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(entry.name, style: const TextStyle(color: AppTheme.textPrimary)),
                  ),
                  Text('${entry.referrals} refs', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                  const SizedBox(width: 12),
                  Text('₹${entry.earnings.toStringAsFixed(0)}', style: const TextStyle(color: AppTheme.success, fontWeight: FontWeight.bold)),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildHowItWorks() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          _buildStep('1', 'Share Your Code', 'Share your unique referral code with friends via WhatsApp, social media, or direct message.'),
          _buildStep('2', 'Friend Joins', 'Your friend downloads CashBurst and signs up using your referral code.'),
          _buildStep('3', 'Both Earn', 'You get 50 coins signup bonus, plus 10% of your friend\'s daily earnings!'),
          _buildStep('4', 'Grow Your Team', 'The more friends you refer, the higher your passive earnings grow.'),
          const SizedBox(height: 16),
          GlassmorphicContainer(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text('Referral Rewards', style: TextStyle(color: AppTheme.primaryGold, fontSize: 16, fontWeight: FontWeight.bold)),
                SizedBox(height: 12),
                Text('• 50 coins per successful signup', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                Text('• 10% of referral\'s daily earnings', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                Text('• Bonus at 5, 10, 25, 50 referrals', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                Text('• VIP referral bonuses for top performers', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStep(String number, String title, String description) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              gradient: AppTheme.goldGradient,
            ),
            child: Center(
              child: Text(number, style: const TextStyle(color: AppTheme.backgroundDark, fontWeight: FontWeight.bold)),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.w600)),
                const SizedBox(height: 4),
                Text(description, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _shareReferral(String code) {
    Share.share(
      'Join CashBurst and earn real money by watching ads! Use my referral code: $code\nDownload now: https://cashburst.app/download',
      subject: 'Join CashBurst - Earn Real Money!',
    );
  }

  void _shareViaWhatsApp(String code) {
    final message = Uri.encodeComponent(
      'Hey! I\'m earning real money on CashBurst by watching ads. Use my referral code: $code and get bonus coins!\nDownload: https://cashburst.app/download',
    );
    // Launch WhatsApp with pre-filled message
    Share.share(
      'Hey! I\'m earning real money on CashBurst by watching ads. Use my referral code: $code and get bonus coins!\nDownload: https://cashburst.app/download',
    );
  }
}
