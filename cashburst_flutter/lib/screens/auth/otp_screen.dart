import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:pin_code_fields/pin_code_fields.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';

class OtpScreen extends StatefulWidget {
  const OtpScreen({super.key});

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  final _otpController = TextEditingController();
  int _resendTimer = 30;
  Timer? _timer;
  String _phone = '';

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final args = ModalRoute.of(context)?.settings.arguments;
    if (args is String) {
      _phone = args;
    }
  }

  void _startTimer() {
    _resendTimer = 30;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_resendTimer > 0) {
        setState(() => _resendTimer--);
      } else {
        timer.cancel();
      }
    });
  }

  @override
  void dispose() {
    _otpController.dispose();
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppTheme.darkGradient),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.arrow_back_ios, color: AppTheme.primaryGold),
                ),
                const SizedBox(height: 32),
                const Center(
                  child: Icon(
                    Icons.verified_user_rounded,
                    size: 64,
                    color: AppTheme.primaryGold,
                  ),
                ),
                const SizedBox(height: 24),
                const Center(
                  child: Text(
                    'Verify OTP',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Center(
                  child: Text(
                    'We\'ve sent a 6-digit code to $_phone',
                    style: const TextStyle(
                      fontSize: 14,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                ),
                const SizedBox(height: 48),
                GlassmorphicContainer(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    children: [
                      PinCodeTextField(
                        appContext: context,
                        length: 6,
                        controller: _otpController,
                        keyboardType: TextInputType.number,
                        animationType: AnimationType.fade,
                        textStyle: const TextStyle(
                          color: AppTheme.primaryGold,
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                        pinTheme: PinTheme(
                          shape: PinCodeFieldShape.box,
                          borderRadius: BorderRadius.circular(12),
                          fieldHeight: 56,
                          fieldWidth: 44,
                          activeFillColor: AppTheme.cardDarkLight,
                          inactiveFillColor: AppTheme.cardDark,
                          selectedFillColor: AppTheme.cardDarkLight,
                          activeColor: AppTheme.primaryGold,
                          inactiveColor: AppTheme.cardDarkLight,
                          selectedColor: AppTheme.primaryGold,
                        ),
                        enableActiveFill: true,
                        onCompleted: (code) => _verifyOtp(code),
                        onChanged: (value) {},
                      ),
                      const SizedBox(height: 24),
                      Consumer<AuthProvider>(
                        builder: (context, auth, _) {
                          return SizedBox(
                            width: double.infinity,
                            height: 56,
                            child: ElevatedButton(
                              onPressed: auth.isLoading
                                  ? null
                                  : () => _verifyOtp(_otpController.text),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.primaryGold,
                                foregroundColor: AppTheme.backgroundDark,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(16),
                                ),
                              ),
                              child: auth.isLoading
                                  ? const SizedBox(
                                      height: 24,
                                      width: 24,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: AppTheme.backgroundDark,
                                      ),
                                    )
                                  : const Text(
                                      'Verify',
                                      style: TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                            ),
                          );
                        },
                      ),
                      if (Provider.of<AuthProvider>(context).error != null) ...[
                        const SizedBox(height: 12),
                        Text(
                          Provider.of<AuthProvider>(context).error!,
                          style: const TextStyle(color: AppTheme.error, fontSize: 13),
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                Center(
                  child: _resendTimer > 0
                      ? Text(
                          'Resend OTP in ${_resendTimer}s',
                          style: const TextStyle(color: AppTheme.textSecondary),
                        )
                      : TextButton(
                          onPressed: _resendOtp,
                          child: const Text(
                            'Resend OTP',
                            style: TextStyle(
                              color: AppTheme.primaryGold,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _verifyOtp(String otp) async {
    if (otp.length != 6) return;

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final success = await auth.verifyOtp(_phone, otp);
    if (success && mounted) {
      Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
    }
  }

  void _resendOtp() async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    await auth.sendOtp(_phone);
    _startTimer();
  }
}
