import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/constants.dart';

class ApiService {
  late final Dio _dio;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;

  ApiService._internal() {
    _dio = Dio(BaseOptions(
      baseUrl: AppConstants.baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.read(key: AppConstants.tokenKey);
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          final refreshed = await _refreshToken();
          if (refreshed) {
            final token = await _storage.read(key: AppConstants.tokenKey);
            error.requestOptions.headers['Authorization'] = 'Bearer $token';
            final response = await _dio.fetch(error.requestOptions);
            return handler.resolve(response);
          }
        }
        return handler.next(error);
      },
    ));
  }

  Future<bool> _refreshToken() async {
    try {
      final refreshToken = await _storage.read(key: AppConstants.refreshTokenKey);
      if (refreshToken == null) return false;

      final response = await _dio.post('/auth/refresh', data: {
        'refreshToken': refreshToken,
      });

      if (response.statusCode == 200) {
        await _storage.write(
          key: AppConstants.tokenKey,
          value: response.data['token'],
        );
        await _storage.write(
          key: AppConstants.refreshTokenKey,
          value: response.data['refreshToken'],
        );
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  Future<Map<String, dynamic>> get(String path, {Map<String, dynamic>? queryParams}) async {
    final response = await _dio.get(path, queryParameters: queryParams);
    return response.data;
  }

  Future<Map<String, dynamic>> post(String path, {dynamic data}) async {
    final response = await _dio.post(path, data: data);
    return response.data;
  }

  Future<Map<String, dynamic>> put(String path, {dynamic data}) async {
    final response = await _dio.put(path, data: data);
    return response.data;
  }

  Future<Map<String, dynamic>> delete(String path) async {
    final response = await _dio.delete(path);
    return response.data;
  }

  // Auth APIs
  Future<Map<String, dynamic>> sendOtp(String phone) async {
    return post('/auth/send-otp', data: {'phone': phone});
  }

  Future<Map<String, dynamic>> verifyOtp(String phone, String otp, {String? referralCode}) async {
    return post('/auth/verify-otp', data: {
      'phone': phone,
      'otp': otp,
      if (referralCode != null) 'referralCode': referralCode,
    });
  }

  Future<Map<String, dynamic>> register(Map<String, dynamic> userData) async {
    return post('/auth/register', data: userData);
  }

  // User APIs
  Future<Map<String, dynamic>> getProfile() async {
    return get('/user/profile');
  }

  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> data) async {
    return put('/user/profile', data: data);
  }

  Future<Map<String, dynamic>> getDailyStatus() async {
    return get('/user/daily-status');
  }

  // Ad APIs
  Future<Map<String, dynamic>> recordAdWatch() async {
    return post('/ads/watch');
  }

  Future<Map<String, dynamic>> getAdStatus() async {
    return get('/ads/status');
  }

  // Wallet APIs
  Future<Map<String, dynamic>> getWallet() async {
    return get('/wallet');
  }

  Future<Map<String, dynamic>> getTransactions({int page = 1, int limit = 20}) async {
    return get('/wallet/transactions', queryParams: {'page': page, 'limit': limit});
  }

  // Withdrawal APIs
  Future<Map<String, dynamic>> requestWithdrawal(Map<String, dynamic> data) async {
    return post('/withdrawal/request', data: data);
  }

  Future<Map<String, dynamic>> getWithdrawals({int page = 1}) async {
    return get('/withdrawal/history', queryParams: {'page': page});
  }

  // Referral APIs
  Future<Map<String, dynamic>> getReferralStats() async {
    return get('/referral/stats');
  }

  Future<Map<String, dynamic>> getReferralList({int page = 1}) async {
    return get('/referral/list', queryParams: {'page': page});
  }

  // Rewards APIs
  Future<Map<String, dynamic>> claimDailyBonus() async {
    return post('/rewards/daily-bonus');
  }

  Future<Map<String, dynamic>> spinWheel() async {
    return post('/rewards/spin');
  }

  Future<Map<String, dynamic>> scratchCard() async {
    return post('/rewards/scratch');
  }

  Future<Map<String, dynamic>> claimAchievement(String achievementId) async {
    return post('/rewards/achievement/$achievementId');
  }

  // KYC APIs
  Future<Map<String, dynamic>> submitKyc(Map<String, dynamic> data) async {
    return post('/kyc/submit', data: data);
  }

  Future<Map<String, dynamic>> getKycStatus() async {
    return get('/kyc/status');
  }

  // Notifications
  Future<Map<String, dynamic>> getNotifications({int page = 1}) async {
    return get('/notifications', queryParams: {'page': page});
  }

  Future<Map<String, dynamic>> markNotificationRead(String id) async {
    return put('/notifications/$id/read');
  }

  // Leaderboard
  Future<Map<String, dynamic>> getLeaderboard({String type = 'referral'}) async {
    return get('/leaderboard', queryParams: {'type': type});
  }

  // Token management
  Future<void> saveTokens(String token, String refreshToken) async {
    await _storage.write(key: AppConstants.tokenKey, value: token);
    await _storage.write(key: AppConstants.refreshTokenKey, value: refreshToken);
  }

  Future<void> clearTokens() async {
    await _storage.delete(key: AppConstants.tokenKey);
    await _storage.delete(key: AppConstants.refreshTokenKey);
  }

  Future<String?> getToken() async {
    return _storage.read(key: AppConstants.tokenKey);
  }
}
