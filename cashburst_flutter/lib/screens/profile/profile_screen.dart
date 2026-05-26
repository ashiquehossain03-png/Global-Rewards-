import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile & Settings'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Container(
        decoration: const BoxDecoration(gradient: AppTheme.darkGradient),
        child: Consumer<AuthProvider>(
          builder: (context, auth, _) {
            final user = auth.user;
            return SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _buildProfileHeader(user),
                  const SizedBox(height: 20),
                  _buildStatsCard(user),
                  const SizedBox(height: 20),
                  _buildMenuSection(context),
                  const SizedBox(height: 20),
                  _buildLegalSection(context),
                  const SizedBox(height: 20),
                  _buildLogoutButton(context),
                  const SizedBox(height: 32),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildProfileHeader(dynamic user) {
    return GlassmorphicContainer(
      child: Column(
        children: [
          CircleAvatar(
            radius: 40,
            backgroundColor: AppTheme.primaryGold,
            child: Text(
              (user?.name ?? 'U')[0].toUpperCase(),
              style: const TextStyle(color: AppTheme.backgroundDark, fontSize: 32, fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(height: 12),
          Text(user?.name ?? 'User', style: const TextStyle(color: AppTheme.textPrimary, fontSize: 20, fontWeight: FontWeight.bold)),
          Text(user?.phone ?? '', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 14)),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              gradient: AppTheme.goldGradient,
            ),
            child: Text(
              _getLevelName(user?.level ?? 'beginner'),
              style: const TextStyle(color: AppTheme.backgroundDark, fontWeight: FontWeight.bold, fontSize: 13),
            ),
          ),
          if (user?.isKycVerified == true) ...[
            const SizedBox(height: 8),
            const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.verified, color: AppTheme.success, size: 16),
                SizedBox(width: 4),
                Text('KYC Verified', style: TextStyle(color: AppTheme.success, fontSize: 12)),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildStatsCard(dynamic user) {
    return Row(
      children: [
        Expanded(child: _buildStatItem('Total Ads', '${user?.totalAdsWatched ?? 0}', AppTheme.info)),
        const SizedBox(width: 8),
        Expanded(child: _buildStatItem('Referrals', '${user?.totalReferrals ?? 0}', AppTheme.success)),
        const SizedBox(width: 8),
        Expanded(child: _buildStatItem('Streak', '${user?.loginStreak ?? 0}d', AppTheme.warning)),
        const SizedBox(width: 8),
        Expanded(child: _buildStatItem('Score', '${user?.activityScore ?? 0}', AppTheme.primaryGold)),
      ],
    );
  }

  Widget _buildStatItem(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.cardDark,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Text(value, style: TextStyle(color: color, fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(label, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11)),
        ],
      ),
    );
  }

  Widget _buildMenuSection(BuildContext context) {
    final menuItems = [
      {'icon': Icons.person_outline, 'title': 'Edit Profile', 'route': null},
      {'icon': Icons.verified_user_outlined, 'title': 'KYC Verification', 'route': '/kyc'},
      {'icon': Icons.workspace_premium_outlined, 'title': 'VIP Program', 'route': '/vip'},
      {'icon': Icons.people_outline, 'title': 'Referral Program', 'route': '/referral'},
      {'icon': Icons.notifications_outlined, 'title': 'Notifications', 'route': '/notifications'},
      {'icon': Icons.security_outlined, 'title': 'Security', 'route': null},
      {'icon': Icons.help_outline, 'title': 'Help & Support', 'route': null},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Settings', style: TextStyle(color: AppTheme.textPrimary, fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        ...menuItems.map((item) => _buildMenuItem(
              context,
              item['icon'] as IconData,
              item['title'] as String,
              item['route'] as String?,
            )),
      ],
    );
  }

  Widget _buildMenuItem(BuildContext context, IconData icon, String title, String? route) {
    return Container(
      margin: const EdgeInsets.only(bottom: 4),
      child: ListTile(
        leading: Icon(icon, color: AppTheme.textSecondary),
        title: Text(title, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 15)),
        trailing: const Icon(Icons.chevron_right, color: AppTheme.textSecondary),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        tileColor: AppTheme.cardDark,
        onTap: route != null ? () => Navigator.pushNamed(context, route) : null,
      ),
    );
  }

  Widget _buildLegalSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Legal', style: TextStyle(color: AppTheme.textPrimary, fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        _buildMenuItem(context, Icons.privacy_tip_outlined, 'Privacy Policy', null),
        _buildMenuItem(context, Icons.description_outlined, 'Terms & Conditions', null),
        _buildMenuItem(context, Icons.info_outline, 'About CashBurst', null),
      ],
    );
  }

  Widget _buildLogoutButton(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 52,
      child: OutlinedButton.icon(
        onPressed: () => _showLogoutDialog(context),
        icon: const Icon(Icons.logout_rounded, color: AppTheme.error),
        label: const Text('Logout', style: TextStyle(color: AppTheme.error, fontSize: 16)),
        style: OutlinedButton.styleFrom(
          side: const BorderSide(color: AppTheme.error),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
    );
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.cardDark,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Logout', style: TextStyle(color: AppTheme.textPrimary)),
        content: const Text('Are you sure you want to logout?', style: TextStyle(color: AppTheme.textSecondary)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: AppTheme.textSecondary)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              Provider.of<AuthProvider>(context, listen: false).logout();
              Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.error),
            child: const Text('Logout'),
          ),
        ],
      ),
    );
  }

  String _getLevelName(String level) {
    switch (level) {
      case 'beginner': return 'Beginner';
      case 'level_2': return 'Level 2';
      case 'level_3': return 'Level 3';
      case 'vip': return 'VIP';
      default: return 'Beginner';
    }
  }
}
