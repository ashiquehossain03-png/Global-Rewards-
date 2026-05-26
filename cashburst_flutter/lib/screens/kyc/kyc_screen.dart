import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';

class KycScreen extends StatefulWidget {
  const KycScreen({super.key});

  @override
  State<KycScreen> createState() => _KycScreenState();
}

class _KycScreenState extends State<KycScreen> {
  final _formKey = GlobalKey<FormState>();
  final _aadhaarController = TextEditingController();
  final _panController = TextEditingController();
  final _bankAccountController = TextEditingController();
  final _ifscController = TextEditingController();
  final _nameController = TextEditingController();
  final ApiService _api = ApiService();
  bool _isLoading = false;
  int _currentStep = 0;

  @override
  void dispose() {
    _aadhaarController.dispose();
    _panController.dispose();
    _bankAccountController.dispose();
    _ifscController.dispose();
    _nameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('KYC Verification'),
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
                _buildKycStatus(),
                const SizedBox(height: 20),
                _buildStepIndicator(),
                const SizedBox(height: 20),
                if (_currentStep == 0) _buildAadhaarStep(),
                if (_currentStep == 1) _buildPanStep(),
                if (_currentStep == 2) _buildBankStep(),
                const SizedBox(height: 20),
                _buildKycInfo(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildKycStatus() {
    return Consumer<AuthProvider>(
      builder: (context, auth, _) {
        final isVerified = auth.user?.isKycVerified ?? false;
        return GlassmorphicContainer(
          child: Row(
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: (isVerified ? AppTheme.success : AppTheme.warning).withOpacity(0.2),
                ),
                child: Icon(
                  isVerified ? Icons.verified_rounded : Icons.pending_rounded,
                  color: isVerified ? AppTheme.success : AppTheme.warning,
                  size: 28,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isVerified ? 'KYC Verified' : 'KYC Pending',
                      style: TextStyle(
                        color: isVerified ? AppTheme.success : AppTheme.warning,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      isVerified ? 'Your identity is verified' : 'Complete KYC for higher withdrawals',
                      style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
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

  Widget _buildStepIndicator() {
    final steps = ['Aadhaar', 'PAN', 'Bank'];
    return Row(
      children: List.generate(steps.length, (index) {
        final isActive = index == _currentStep;
        final isCompleted = index < _currentStep;
        return Expanded(
          child: Column(
            children: [
              Row(
                children: [
                  if (index > 0) Expanded(child: Container(height: 2, color: isCompleted ? AppTheme.success : AppTheme.cardDarkLight)),
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isCompleted ? AppTheme.success : isActive ? AppTheme.primaryGold : AppTheme.cardDarkLight,
                    ),
                    child: Center(
                      child: isCompleted
                          ? const Icon(Icons.check, size: 16, color: Colors.white)
                          : Text('${index + 1}', style: TextStyle(color: isActive ? AppTheme.backgroundDark : AppTheme.textSecondary, fontWeight: FontWeight.bold, fontSize: 13)),
                    ),
                  ),
                  if (index < steps.length - 1) Expanded(child: Container(height: 2, color: isCompleted ? AppTheme.success : AppTheme.cardDarkLight)),
                ],
              ),
              const SizedBox(height: 4),
              Text(steps[index], style: TextStyle(color: isActive ? AppTheme.primaryGold : AppTheme.textSecondary, fontSize: 12)),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildAadhaarStep() {
    return GlassmorphicContainer(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Aadhaar Verification', style: TextStyle(color: AppTheme.textPrimary, fontSize: 16, fontWeight: FontWeight.w600)),
          const SizedBox(height: 16),
          TextFormField(
            controller: _aadhaarController,
            keyboardType: TextInputType.number,
            maxLength: 12,
            style: const TextStyle(color: AppTheme.textPrimary),
            decoration: const InputDecoration(
              labelText: 'Aadhaar Number',
              hintText: 'Enter 12-digit Aadhaar number',
              counterText: '',
              prefixIcon: Icon(Icons.badge_outlined, color: AppTheme.textSecondary),
            ),
            validator: (v) {
              if (v?.isEmpty == true) return 'Enter Aadhaar number';
              if (v!.length != 12) return 'Aadhaar must be 12 digits';
              return null;
            },
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isLoading ? null : () {
                if (_aadhaarController.text.length == 12) {
                  setState(() => _currentStep = 1);
                }
              },
              child: const Text('Verify & Continue'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPanStep() {
    return GlassmorphicContainer(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('PAN Verification', style: TextStyle(color: AppTheme.textPrimary, fontSize: 16, fontWeight: FontWeight.w600)),
          const SizedBox(height: 16),
          TextFormField(
            controller: _panController,
            maxLength: 10,
            textCapitalization: TextCapitalization.characters,
            style: const TextStyle(color: AppTheme.textPrimary),
            decoration: const InputDecoration(
              labelText: 'PAN Number',
              hintText: 'Enter 10-character PAN',
              counterText: '',
              prefixIcon: Icon(Icons.credit_card_outlined, color: AppTheme.textSecondary),
            ),
            validator: (v) {
              if (v?.isEmpty == true) return 'Enter PAN number';
              if (v!.length != 10) return 'PAN must be 10 characters';
              return null;
            },
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () => setState(() => _currentStep = 0),
                  style: OutlinedButton.styleFrom(side: const BorderSide(color: AppTheme.textSecondary)),
                  child: const Text('Back', style: TextStyle(color: AppTheme.textSecondary)),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: _isLoading ? null : () {
                    if (_panController.text.length == 10) {
                      setState(() => _currentStep = 2);
                    }
                  },
                  child: const Text('Continue'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBankStep() {
    return GlassmorphicContainer(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Bank Verification', style: TextStyle(color: AppTheme.textPrimary, fontSize: 16, fontWeight: FontWeight.w600)),
          const SizedBox(height: 16),
          TextFormField(
            controller: _nameController,
            style: const TextStyle(color: AppTheme.textPrimary),
            decoration: const InputDecoration(
              labelText: 'Account Holder Name',
              prefixIcon: Icon(Icons.person_outline, color: AppTheme.textSecondary),
            ),
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _bankAccountController,
            keyboardType: TextInputType.number,
            style: const TextStyle(color: AppTheme.textPrimary),
            decoration: const InputDecoration(
              labelText: 'Account Number',
              prefixIcon: Icon(Icons.account_balance_outlined, color: AppTheme.textSecondary),
            ),
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _ifscController,
            textCapitalization: TextCapitalization.characters,
            style: const TextStyle(color: AppTheme.textPrimary),
            decoration: const InputDecoration(
              labelText: 'IFSC Code',
              prefixIcon: Icon(Icons.code_outlined, color: AppTheme.textSecondary),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () => setState(() => _currentStep = 1),
                  style: OutlinedButton.styleFrom(side: const BorderSide(color: AppTheme.textSecondary)),
                  child: const Text('Back', style: TextStyle(color: AppTheme.textSecondary)),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _submitKyc,
                  child: _isLoading
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.backgroundDark))
                      : const Text('Submit KYC'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildKycInfo() {
    return GlassmorphicContainer(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: const [
          Text('Why KYC?', style: TextStyle(color: AppTheme.textPrimary, fontSize: 14, fontWeight: FontWeight.w600)),
          SizedBox(height: 8),
          Text('• Required for withdrawals above ₹500', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
          Text('• Ensures secure & legal transactions', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
          Text('• Prevents fraud & multiple accounts', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
          Text('• Your data is encrypted & secure', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
        ],
      ),
    );
  }

  Future<void> _submitKyc() async {
    setState(() => _isLoading = true);
    try {
      await _api.submitKyc({
        'aadhaarNumber': _aadhaarController.text,
        'panNumber': _panController.text,
        'bankDetails': {
          'accountHolderName': _nameController.text,
          'accountNumber': _bankAccountController.text,
          'ifscCode': _ifscController.text,
        },
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('KYC submitted successfully!'), backgroundColor: AppTheme.success),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('KYC submission failed. Please try again.'), backgroundColor: AppTheme.error),
        );
      }
    }
    setState(() => _isLoading = false);
  }
}
