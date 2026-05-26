import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../services/api_service.dart';

class AdminScreen extends StatefulWidget {
  const AdminScreen({super.key});

  @override
  State<AdminScreen> createState() => _AdminScreenState();
}

class _AdminScreenState extends State<AdminScreen> {
  final ApiService _api = ApiService();
  Map<String, dynamic>? _dashboardData;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadDashboard();
  }

  Future<void> _loadDashboard() async {
    try {
      final response = await _api.get('/admin/dashboard');
      setState(() {
        _dashboardData = response['dashboard'];
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Dashboard'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Container(
        decoration: const BoxDecoration(gradient: AppTheme.darkGradient),
        child: _isLoading
            ? const Center(child: CircularProgressIndicator(color: AppTheme.primaryGold))
            : _dashboardData == null
                ? const Center(child: Text('Admin access required', style: TextStyle(color: AppTheme.textSecondary)))
                : SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Overview', style: TextStyle(color: AppTheme.textPrimary, fontSize: 20, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 16),
                        GridView.count(
                          crossAxisCount: 2,
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                          childAspectRatio: 1.5,
                          children: [
                            _buildStatCard('Total Users', '${_dashboardData!['totalUsers'] ?? 0}', AppTheme.info),
                            _buildStatCard('Active Today', '${_dashboardData!['activeUsers'] ?? 0}', AppTheme.success),
                            _buildStatCard('Total Earnings', '₹${(_dashboardData!['totalEarnings'] ?? 0).toStringAsFixed(0)}', AppTheme.primaryGold),
                            _buildStatCard('Pending Withdrawals', '${_dashboardData!['pendingWithdrawals'] ?? 0}', AppTheme.error),
                            _buildStatCard('Total Withdrawn', '₹${(_dashboardData!['totalWithdrawn'] ?? 0).toStringAsFixed(0)}', AppTheme.warning),
                            _buildStatCard('Banned Users', '${_dashboardData!['bannedUsers'] ?? 0}', AppTheme.error),
                          ],
                        ),
                        const SizedBox(height: 24),
                        const Text('Quick Actions', style: TextStyle(color: AppTheme.textPrimary, fontSize: 18, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 12),
                        _buildActionTile(Icons.people, 'Manage Users', 'View and manage all users'),
                        _buildActionTile(Icons.payment, 'Withdrawals', 'Approve or reject withdrawals'),
                        _buildActionTile(Icons.verified_user, 'KYC Verification', 'Review KYC submissions'),
                        _buildActionTile(Icons.analytics, 'Analytics', 'View detailed analytics'),
                        _buildActionTile(Icons.notifications, 'Send Notification', 'Broadcast to all users'),
                        _buildActionTile(Icons.shield, 'Fraud Monitor', 'Review suspicious activity'),
                      ],
                    ),
                  ),
      ),
    );
  }

  Widget _buildStatCard(String title, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.cardDark,
        borderRadius: BorderRadius.circular(12),
        border: Border(left: BorderSide(color: color, width: 3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(title, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
          const SizedBox(height: 8),
          Text(value, style: TextStyle(color: color, fontSize: 22, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildActionTile(IconData icon, String title, String subtitle) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: AppTheme.primaryGold.withOpacity(0.15),
          ),
          child: Icon(icon, color: AppTheme.primaryGold, size: 20),
        ),
        title: Text(title, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 15)),
        subtitle: Text(subtitle, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
        trailing: const Icon(Icons.chevron_right, color: AppTheme.textSecondary),
        tileColor: AppTheme.cardDark,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        onTap: () {},
      ),
    );
  }
}
