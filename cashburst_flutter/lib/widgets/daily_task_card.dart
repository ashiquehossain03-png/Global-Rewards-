import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../providers/rewards_provider.dart';

class DailyTaskCard extends StatelessWidget {
  final DailyTask task;

  const DailyTaskCard({super.key, required this.task});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.cardDark,
        borderRadius: BorderRadius.circular(12),
        border: task.isCompleted
            ? Border.all(color: AppTheme.success.withOpacity(0.3))
            : null,
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: task.isCompleted
                  ? AppTheme.success.withOpacity(0.2)
                  : AppTheme.primaryGold.withOpacity(0.1),
            ),
            child: Icon(
              task.isCompleted ? Icons.check_circle : Icons.radio_button_unchecked,
              color: task.isCompleted ? AppTheme.success : AppTheme.primaryGold,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  task.title,
                  style: TextStyle(
                    color: task.isCompleted ? AppTheme.textSecondary : AppTheme.textPrimary,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    decoration: task.isCompleted ? TextDecoration.lineThrough : null,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Expanded(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: task.progressPercent,
                          backgroundColor: AppTheme.cardDarkLight,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            task.isCompleted ? AppTheme.success : AppTheme.primaryGold,
                          ),
                          minHeight: 4,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '${task.progress}/${task.target}',
                      style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8),
              color: AppTheme.primaryGold.withOpacity(0.1),
            ),
            child: Text(
              '+${task.reward}',
              style: const TextStyle(
                color: AppTheme.primaryGold,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
