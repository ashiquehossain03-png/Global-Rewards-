import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../services/api_service.dart';
import 'package:intl/intl.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final ApiService _api = ApiService();
  List<Map<String, dynamic>> _notifications = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    setState(() => _isLoading = true);
    try {
      final response = await _api.getNotifications();
      final List<dynamic> list = response['notifications'] ?? [];
      setState(() {
        _notifications = list.cast<Map<String, dynamic>>();
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _notifications = _getDefaultNotifications();
      });
    }
  }

  List<Map<String, dynamic>> _getDefaultNotifications() {
    return [
      {'id': '1', 'title': 'Welcome to CashBurst!', 'body': 'Start earning by watching rewarded ads. No investment needed!', 'type': 'info', 'isRead': false, 'createdAt': DateTime.now().toIso8601String()},
      {'id': '2', 'title': 'Daily Bonus Available', 'body': 'Don\'t forget to claim your daily login bonus!', 'type': 'reward', 'isRead': false, 'createdAt': DateTime.now().subtract(const Duration(hours: 2)).toIso8601String()},
      {'id': '3', 'title': 'New Tasks Available', 'body': 'Complete today\'s tasks to earn extra coins.', 'type': 'task', 'isRead': true, 'createdAt': DateTime.now().subtract(const Duration(days: 1)).toIso8601String()},
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          TextButton(
            onPressed: () {},
            child: const Text('Clear All', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
          ),
        ],
      ),
      body: Container(
        decoration: const BoxDecoration(gradient: AppTheme.darkGradient),
        child: _isLoading
            ? const Center(child: CircularProgressIndicator(color: AppTheme.primaryGold))
            : _notifications.isEmpty
                ? _buildEmpty()
                : RefreshIndicator(
                    onRefresh: _loadNotifications,
                    color: AppTheme.primaryGold,
                    child: ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _notifications.length,
                      itemBuilder: (context, index) => _buildNotificationItem(_notifications[index]),
                    ),
                  ),
      ),
    );
  }

  Widget _buildNotificationItem(Map<String, dynamic> notification) {
    final isRead = notification['isRead'] ?? false;
    final type = notification['type'] ?? 'info';
    final createdAt = DateTime.tryParse(notification['createdAt'] ?? '') ?? DateTime.now();
    final dateStr = DateFormat('dd MMM, hh:mm a').format(createdAt);

    IconData icon;
    Color color;
    switch (type) {
      case 'reward':
        icon = Icons.card_giftcard_rounded;
        color = AppTheme.primaryGold;
        break;
      case 'task':
        icon = Icons.task_alt_rounded;
        color = AppTheme.success;
        break;
      case 'withdrawal':
        icon = Icons.account_balance_rounded;
        color = AppTheme.info;
        break;
      case 'warning':
        icon = Icons.warning_rounded;
        color = AppTheme.warning;
        break;
      default:
        icon = Icons.info_outline_rounded;
        color = AppTheme.textSecondary;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isRead ? AppTheme.cardDark : AppTheme.cardDark.withOpacity(0.8),
        borderRadius: BorderRadius.circular(12),
        border: isRead ? null : Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: color.withOpacity(0.15),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  notification['title'] ?? '',
                  style: TextStyle(
                    color: AppTheme.textPrimary,
                    fontSize: 14,
                    fontWeight: isRead ? FontWeight.normal : FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  notification['body'] ?? '',
                  style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                ),
                const SizedBox(height: 4),
                Text(dateStr, style: TextStyle(color: AppTheme.textSecondary.withOpacity(0.6), fontSize: 11)),
              ],
            ),
          ),
          if (!isRead)
            Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(shape: BoxShape.circle, color: color),
            ),
        ],
      ),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.notifications_off_outlined, size: 64, color: AppTheme.textSecondary.withOpacity(0.3)),
          const SizedBox(height: 16),
          const Text('No notifications', style: TextStyle(color: AppTheme.textPrimary, fontSize: 16)),
        ],
      ),
    );
  }
}
