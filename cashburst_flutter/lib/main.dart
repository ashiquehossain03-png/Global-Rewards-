import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'config/theme.dart';
import 'providers/auth_provider.dart';
import 'providers/wallet_provider.dart';
import 'providers/rewards_provider.dart';
import 'providers/referral_provider.dart';
import 'screens/splash/splash_screen.dart';
import 'screens/onboarding/onboarding_screen.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/otp_screen.dart';
import 'screens/home/home_screen.dart';
import 'screens/ads/watch_ads_screen.dart';
import 'screens/wallet/wallet_screen.dart';
import 'screens/withdraw/withdraw_screen.dart';
import 'screens/referral/referral_screen.dart';
import 'screens/rewards/rewards_screen.dart';
import 'screens/vip/vip_screen.dart';
import 'screens/notifications/notifications_screen.dart';
import 'screens/profile/profile_screen.dart';
import 'screens/kyc/kyc_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: AppTheme.backgroundDark,
    systemNavigationBarIconBrightness: Brightness.light,
  ));

  runApp(const CashBurstApp());
}

class CashBurstApp extends StatelessWidget {
  const CashBurstApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => WalletProvider()),
        ChangeNotifierProvider(create: (_) => RewardsProvider()),
        ChangeNotifierProvider(create: (_) => ReferralProvider()),
      ],
      child: MaterialApp(
        title: 'CashBurst',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.darkTheme,
        initialRoute: '/',
        routes: {
          '/': (context) => const SplashScreen(),
          '/onboarding': (context) => const OnboardingScreen(),
          '/login': (context) => const LoginScreen(),
          '/otp': (context) => const OtpScreen(),
          '/home': (context) => const HomeScreen(),
          '/watch-ads': (context) => const WatchAdsScreen(),
          '/wallet': (context) => const WalletScreen(),
          '/withdraw': (context) => const WithdrawScreen(),
          '/referral': (context) => const ReferralScreen(),
          '/rewards': (context) => const RewardsScreen(),
          '/vip': (context) => const VipScreen(),
          '/notifications': (context) => const NotificationsScreen(),
          '/profile': (context) => const ProfileScreen(),
          '/kyc': (context) => const KycScreen(),
        },
      ),
    );
  }
}
