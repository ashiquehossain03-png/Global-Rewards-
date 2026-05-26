import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../config/constants.dart';
import '../../providers/wallet_provider.dart';
import '../../providers/auth_provider.dart';

class WithdrawScreen extends StatefulWidget {
  const WithdrawScreen({super.key});

  @override
  State<WithdrawScreen> createState() => _WithdrawScreenState();
}

class _WithdrawScreenState extends State<WithdrawScreen> {
  final _formKey = GlobalKey<FormState>();
  String _selectedMethod = 'upi';
  final _amountController = TextEditingController();
  final _upiController = TextEditingController();
  final _accountController = TextEditingController();
  final _ifscController = TextEditingController();
  final _nameController = TextEditingController();
  final _bankController = TextEditingController();

  final List<Map<String, dynamic>> _paymentMethods = [
    {'id': 'upi', 'name': 'UPI', 'icon': Icons.qr_code_rounded},
    {'id': 'gpay', 'name': 'Google Pay', 'icon': Icons.g_mobiledata_rounded},
    {'id': 'phonepe', 'name': 'PhonePe', 'icon': Icons.phone_android_rounded},
    {'id': 'paytm', 'name': 'Paytm', 'icon': Icons.payment_rounded},
    {'id': 'bank', 'name': 'Bank Transfer', 'icon': Icons.account_balance_rounded},
    {'id': 'neft', 'name': 'NEFT', 'icon': Icons.swap_horiz_rounded},
    {'id': 'imps', 'name': 'IMPS', 'icon': Icons.flash_on_rounded},
  ];

  @override
  void dispose() {
    _amountController.dispose();
    _upiController.dispose();
    _accountController.dispose();
    _ifscController.dispose();
    _nameController.dispose();
    _bankController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Withdraw'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Container(
        decoration: const BoxDecoration(gradient: AppTheme.darkGradient),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildBalanceCard(),
                const SizedBox(height: 20),
                _buildAmountInput(),
                const SizedBox(height: 20),
                _buildPaymentMethodSelector(),
                const SizedBox(height: 20),
                _buildPaymentDetails(),
                const SizedBox(height: 20),
                _buildWithdrawRules(),
                const SizedBox(height: 24),
                _buildWithdrawButton(),
                const SizedBox(height: 32),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBalanceCard() {
    return Consumer<WalletProvider>(
      builder: (context, wallet, _) {
        return GlassmorphicContainer(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Available Balance', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                  const SizedBox(height: 4),
                  Text(
                    '₹${wallet.availableBalance.toStringAsFixed(2)}',
                    style: const TextStyle(color: AppTheme.primaryGold, fontSize: 28, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const Text('Coins', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                  const SizedBox(height: 4),
                  Text(
                    '${wallet.coinBalance}',
                    style: const TextStyle(color: AppTheme.textPrimary, fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildAmountInput() {
    return GlassmorphicContainer(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Withdrawal Amount', style: TextStyle(color: AppTheme.textPrimary, fontSize: 16, fontWeight: FontWeight.w600)),
          const SizedBox(height: 12),
          TextFormField(
            controller: _amountController,
            keyboardType: TextInputType.number,
            style: const TextStyle(color: AppTheme.textPrimary, fontSize: 24, fontWeight: FontWeight.bold),
            decoration: const InputDecoration(
              prefixText: '₹ ',
              prefixStyle: TextStyle(color: AppTheme.primaryGold, fontSize: 24, fontWeight: FontWeight.bold),
              hintText: '0.00',
            ),
            validator: (value) {
              if (value == null || value.isEmpty) return 'Enter withdrawal amount';
              final amount = double.tryParse(value);
              if (amount == null) return 'Enter a valid amount';
              if (amount < AppConstants.minWithdrawalAmount) return 'Minimum withdrawal is ₹${AppConstants.minWithdrawalAmount}';
              return null;
            },
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              _buildQuickAmount(55),
              _buildQuickAmount(100),
              _buildQuickAmount(500),
              _buildQuickAmount(1000),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickAmount(int amount) {
    return Expanded(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4),
        child: OutlinedButton(
          onPressed: () => _amountController.text = amount.toString(),
          style: OutlinedButton.styleFrom(
            side: const BorderSide(color: AppTheme.primaryGold, width: 0.5),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            padding: const EdgeInsets.symmetric(vertical: 8),
          ),
          child: Text('₹$amount', style: const TextStyle(color: AppTheme.primaryGold, fontSize: 13)),
        ),
      ),
    );
  }

  Widget _buildPaymentMethodSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Payment Method', style: TextStyle(color: AppTheme.textPrimary, fontSize: 16, fontWeight: FontWeight.w600)),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: _paymentMethods.map((method) {
            final isSelected = _selectedMethod == method['id'];
            return GestureDetector(
              onTap: () => setState(() => _selectedMethod = method['id']),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  color: isSelected ? AppTheme.primaryGold.withOpacity(0.15) : AppTheme.cardDark,
                  border: Border.all(
                    color: isSelected ? AppTheme.primaryGold : AppTheme.cardDarkLight,
                    width: isSelected ? 1.5 : 1,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(method['icon'], size: 18, color: isSelected ? AppTheme.primaryGold : AppTheme.textSecondary),
                    const SizedBox(width: 6),
                    Text(
                      method['name'],
                      style: TextStyle(
                        color: isSelected ? AppTheme.primaryGold : AppTheme.textSecondary,
                        fontSize: 13,
                        fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                      ),
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

  Widget _buildPaymentDetails() {
    if (_selectedMethod == 'bank' || _selectedMethod == 'neft' || _selectedMethod == 'imps') {
      return GlassmorphicContainer(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Bank Details', style: TextStyle(color: AppTheme.textPrimary, fontSize: 16, fontWeight: FontWeight.w600)),
            const SizedBox(height: 12),
            TextFormField(
              controller: _nameController,
              style: const TextStyle(color: AppTheme.textPrimary),
              decoration: const InputDecoration(labelText: 'Account Holder Name'),
              validator: (v) => v?.isEmpty == true ? 'Required' : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _accountController,
              style: const TextStyle(color: AppTheme.textPrimary),
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Account Number'),
              validator: (v) => v?.isEmpty == true ? 'Required' : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _ifscController,
              style: const TextStyle(color: AppTheme.textPrimary),
              decoration: const InputDecoration(labelText: 'IFSC Code'),
              validator: (v) => v?.isEmpty == true ? 'Required' : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _bankController,
              style: const TextStyle(color: AppTheme.textPrimary),
              decoration: const InputDecoration(labelText: 'Bank Name'),
              validator: (v) => v?.isEmpty == true ? 'Required' : null,
            ),
          ],
        ),
      );
    }

    return GlassmorphicContainer(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('UPI Details', style: TextStyle(color: AppTheme.textPrimary, fontSize: 16, fontWeight: FontWeight.w600)),
          const SizedBox(height: 12),
          TextFormField(
            controller: _upiController,
            style: const TextStyle(color: AppTheme.textPrimary),
            decoration: const InputDecoration(
              labelText: 'UPI ID',
              hintText: 'example@upi',
            ),
            validator: (v) {
              if (v?.isEmpty == true) return 'Enter UPI ID';
              if (!v!.contains('@')) return 'Enter a valid UPI ID';
              return null;
            },
          ),
        ],
      ),
    );
  }

  Widget _buildWithdrawRules() {
    return GlassmorphicContainer(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Withdrawal Rules', style: TextStyle(color: AppTheme.textPrimary, fontSize: 14, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          _buildRuleItem('Minimum withdrawal: ₹${AppConstants.minWithdrawalAmount}'),
          _buildRuleItem('Daily limit: ₹${AppConstants.dailyWithdrawalLimit}'),
          _buildRuleItem('OTP verification required'),
          _buildRuleItem('KYC required for amounts above ₹${AppConstants.kycRequiredAbove}'),
          _buildRuleItem('Processing time: 24-48 hours'),
        ],
      ),
    );
  }

  Widget _buildRuleItem(String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          const Icon(Icons.info_outline, size: 14, color: AppTheme.textSecondary),
          const SizedBox(width: 8),
          Text(text, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
        ],
      ),
    );
  }

  Widget _buildWithdrawButton() {
    return Consumer<WalletProvider>(
      builder: (context, wallet, _) {
        return SizedBox(
          width: double.infinity,
          height: 56,
          child: ElevatedButton(
            onPressed: wallet.isLoading ? null : _submitWithdrawal,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryGold,
              foregroundColor: AppTheme.backgroundDark,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
            child: wallet.isLoading
                ? const CircularProgressIndicator(color: AppTheme.backgroundDark)
                : const Text('Request Withdrawal', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          ),
        );
      },
    );
  }

  void _submitWithdrawal() async {
    if (!_formKey.currentState!.validate()) return;

    final amount = double.parse(_amountController.text);
    final auth = Provider.of<AuthProvider>(context, listen: false);

    if (amount > AppConstants.kycRequiredAbove && !(auth.user?.isKycVerified ?? false)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('KYC verification required for this withdrawal amount'),
          backgroundColor: AppTheme.warning,
        ),
      );
      Navigator.pushNamed(context, '/kyc');
      return;
    }

    final data = {
      'amount': amount,
      'method': _selectedMethod,
      if (_selectedMethod == 'bank' || _selectedMethod == 'neft' || _selectedMethod == 'imps')
        'bankDetails': {
          'accountHolderName': _nameController.text,
          'accountNumber': _accountController.text,
          'ifscCode': _ifscController.text,
          'bankName': _bankController.text,
        }
      else
        'upiId': _upiController.text,
    };

    final wallet = Provider.of<WalletProvider>(context, listen: false);
    final success = await wallet.requestWithdrawal(data);

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Withdrawal request submitted!'), backgroundColor: AppTheme.success),
      );
      Navigator.pop(context);
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(wallet.error ?? 'Failed'), backgroundColor: AppTheme.error),
      );
    }
  }
}
