import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../config/constants.dart';
import '../../providers/auth_provider.dart';
import '../../providers/wallet_provider.dart';
import '../../providers/rewards_provider.dart';
import '../../widgets/coin_display.dart';
import '../../widgets/earnings_card.dart';
import '../../widgets/daily_task_card.dart';
import '../../widgets/quick_action_grid.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData() {
    final walletProvider = Provider.of<WalletProvider>(context, listen: false);
    final rewardsProvider = Provider.of<RewardsProvider>(context, listen: false);
    walletProvider.fetchWallet();
    rewardsProvider.fetchDailyStatus();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppTheme.darkGradient),
        child: SafeArea(
          child: IndexedStack(
            index: _currentIndex,
            children: [
              _buildHomePage(),
              _buildEarnPage(),
              _buildWalletPage(),
              _buildRewardsPage(),
              _buildProfilePage(),
            ],
          ),
        ),
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppTheme.cardDark,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.3),
              blurRadius: 20,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) => setState(() => _currentIndex = index),
          backgroundColor: Colors.transparent,
          elevation: 0,
          selectedItemColor: AppTheme.primaryGold,
          unselectedItemColor: AppTheme.textSecondary,
          type: BottomNavigationBarType.fixed,
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12),
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.home_rounded),
              activeIcon: Icon(Icons.home_rounded),
              label: 'Home',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.play_circle_outline_rounded),
              activeIcon: Icon(Icons.play_circle_filled_rounded),
              label: 'Earn',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.account_balance_wallet_outlined),
              activeIcon: Icon(Icons.account_balance_wallet_rounded),
              label: 'Wallet',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.card_giftcard_outlined),
              activeIcon: Icon(Icons.card_giftcard_rounded),
              label: 'Rewards',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person_outline_rounded),
              activeIcon: Icon(Icons.person_rounded),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHomePage() {
    return RefreshIndicator(
      onRefresh: () async => _loadData(),
      color: AppTheme.primaryGold,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(),
            const SizedBox(height: 20),
            const EarningsOverviewCard(),
            const SizedBox(height: 20),
            const QuickActionGrid(),
            const SizedBox(height: 20),
            _buildDailyProgress(),
            const SizedBox(height: 20),
            _buildDailyTasks(),
            const SizedBox(height: 20),
            _buildStreakSection(),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Consumer<AuthProvider>(
      builder: (context, auth, _) {
        final user = auth.user;
        return Row(
          children: [
            CircleAvatar(
              radius: 24,
              backgroundColor: AppTheme.primaryGold,
              child: Text(
                (user?.name ?? 'U')[0].toUpperCase(),
                style: const TextStyle(
                  color: AppTheme.backgroundDark,
                  fontWeight: FontWeight.bold,
                  fontSize: 20,
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Hello, ${user?.name ?? 'User'}!',
                    style: const TextStyle(
                      color: AppTheme.textPrimary,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    'Level: ${_getLevelName(user?.level ?? 'beginner')}',
                    style: TextStyle(
                      color: AppTheme.primaryGold.withOpacity(0.8),
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ),
            const CoinDisplay(),
            const SizedBox(width: 8),
            IconButton(
              onPressed: () => Navigator.pushNamed(context, '/notifications'),
              icon: Stack(
                children: [
                  const Icon(Icons.notifications_outlined, color: AppTheme.textSecondary, size: 28),
                  Positioned(
                    right: 0,
                    top: 0,
                    child: Container(
                      width: 10,
                      height: 10,
                      decoration: const BoxDecoration(
                        color: AppTheme.error,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildDailyProgress() {
    return Consumer<RewardsProvider>(
      builder: (context, rewards, _) {
        final progress = rewards.maxAdsToday > 0
            ? rewards.adsWatchedToday / rewards.maxAdsToday
            : 0.0;
        return GlassmorphicContainer(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Today\'s Progress',
                    style: TextStyle(
                      color: AppTheme.textPrimary,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Text(
                    '${rewards.adsWatchedToday}/${rewards.maxAdsToday} Ads',
                    style: const TextStyle(
                      color: AppTheme.primaryGold,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: LinearProgressIndicator(
                  value: progress.clamp(0.0, 1.0),
                  backgroundColor: AppTheme.cardDarkLight,
                  valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.primaryGold),
                  minHeight: 10,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                '${(progress * 100).toInt()}% completed',
                style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDailyTasks() {
    return Consumer<RewardsProvider>(
      builder: (context, rewards, _) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Daily Tasks',
              style: TextStyle(
                color: AppTheme.textPrimary,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            ...rewards.dailyTasks.map((task) => DailyTaskCard(task: task)),
          ],
        );
      },
    );
  }

  Widget _buildStreakSection() {
    return Consumer<RewardsProvider>(
      builder: (context, rewards, _) {
        return GlassmorphicContainer(
          child: Row(
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppTheme.warning.withOpacity(0.2),
                ),
                child: const Icon(Icons.local_fire_department_rounded, color: AppTheme.warning, size: 32),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${rewards.loginStreak} Day Streak!',
                      style: const TextStyle(
                        color: AppTheme.textPrimary,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const Text(
                      'Keep logging in daily for bonus rewards',
                      style: TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildEarnPage() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.play_circle_filled_rounded, size: 80, color: AppTheme.primaryGold),
          const SizedBox(height: 16),
          const Text('Watch Ads & Earn', style: TextStyle(color: AppTheme.textPrimary, fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () => Navigator.pushNamed(context, '/watch-ads'),
            child: const Text('Start Earning'),
          ),
        ],
      ),
    );
  }

  Widget _buildWalletPage() {
    return Center(
      child: ElevatedButton(
        onPressed: () => Navigator.pushNamed(context, '/wallet'),
        child: const Text('Open Wallet'),
      ),
    );
  }

  Widget _buildRewardsPage() {
    return Center(
      child: ElevatedButton(
        onPressed: () => Navigator.pushNamed(context, '/rewards'),
        child: const Text('View Rewards'),
      ),
    );
  }

  Widget _buildProfilePage() {
    return Center(
      child: ElevatedButton(
        onPressed: () => Navigator.pushNamed(context, '/profile'),
        child: const Text('View Profile'),
      ),
    );
  }

  String _getLevelName(String level) {
    switch (level) {
      case 'beginner':
        return 'Beginner';
      case 'level_2':
        return 'Level 2';
      case 'level_3':
        return 'Level 3';
      case 'vip':
        return 'VIP';
      default:
        return 'Beginner';
    }
  }
}
