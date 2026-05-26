import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/constants.dart';

class AuthProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  UserModel? _user;
  bool _isLoading = false;
  bool _isAuthenticated = false;
  String? _error;

  UserModel? get user => _user;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _isAuthenticated;
  String? get error => _error;

  Future<void> checkAuth() async {
    try {
      final token = await _api.getToken();
      if (token != null) {
        await fetchProfile();
        _isAuthenticated = true;
      }
    } catch (e) {
      _isAuthenticated = false;
    }
    notifyListeners();
  }

  Future<bool> sendOtp(String phone) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _api.sendOtp(phone);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = 'Failed to send OTP. Please try again.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> verifyOtp(String phone, String otp, {String? referralCode}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _api.verifyOtp(phone, otp, referralCode: referralCode);
      await _api.saveTokens(response['token'], response['refreshToken']);
      _user = UserModel.fromJson(response['user']);
      _isAuthenticated = true;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = 'Invalid OTP. Please try again.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register(Map<String, dynamic> userData) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _api.register(userData);
      await _api.saveTokens(response['token'], response['refreshToken']);
      _user = UserModel.fromJson(response['user']);
      _isAuthenticated = true;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = 'Registration failed. Please try again.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> fetchProfile() async {
    try {
      final response = await _api.getProfile();
      _user = UserModel.fromJson(response['user']);
      notifyListeners();
    } catch (e) {
      _error = 'Failed to fetch profile.';
    }
  }

  Future<void> updateProfile(Map<String, dynamic> data) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _api.updateProfile(data);
      _user = UserModel.fromJson(response['user']);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = 'Failed to update profile.';
      _isLoading = false;
      notifyListeners();
    }
  }

  void updateUser(UserModel updatedUser) {
    _user = updatedUser;
    notifyListeners();
  }

  Future<void> logout() async {
    await _api.clearTokens();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConstants.userKey);
    _user = null;
    _isAuthenticated = false;
    notifyListeners();
  }
}
