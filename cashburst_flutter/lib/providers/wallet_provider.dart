import 'package:flutter/material.dart';
import '../models/transaction_model.dart';
import '../services/api_service.dart';

class WalletProvider extends ChangeNotifier {
  final ApiService _api = ApiService();

  int _coinBalance = 0;
  double _totalEarnings = 0;
  double _pendingWithdrawals = 0;
  double _referralEarnings = 0;
  double _withdrawnAmount = 0;
  List<TransactionModel> _transactions = [];
  List<WithdrawalModel> _withdrawals = [];
  bool _isLoading = false;
  String? _error;
  int _currentPage = 1;
  bool _hasMore = true;

  int get coinBalance => _coinBalance;
  double get totalEarnings => _totalEarnings;
  double get pendingWithdrawals => _pendingWithdrawals;
  double get referralEarnings => _referralEarnings;
  double get withdrawnAmount => _withdrawnAmount;
  double get availableBalance => _totalEarnings - _pendingWithdrawals - _withdrawnAmount;
  List<TransactionModel> get transactions => _transactions;
  List<WithdrawalModel> get withdrawals => _withdrawals;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get hasMore => _hasMore;

  Future<void> fetchWallet() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _api.getWallet();
      final wallet = response['wallet'];
      _coinBalance = wallet['coinBalance'] ?? 0;
      _totalEarnings = (wallet['totalEarnings'] ?? 0).toDouble();
      _pendingWithdrawals = (wallet['pendingWithdrawals'] ?? 0).toDouble();
      _referralEarnings = (wallet['referralEarnings'] ?? 0).toDouble();
      _withdrawnAmount = (wallet['withdrawnAmount'] ?? 0).toDouble();
      _error = null;
    } catch (e) {
      _error = 'Failed to fetch wallet data.';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> fetchTransactions({bool refresh = false}) async {
    if (refresh) {
      _currentPage = 1;
      _hasMore = true;
      _transactions = [];
    }

    if (!_hasMore) return;

    _isLoading = true;
    notifyListeners();

    try {
      final response = await _api.getTransactions(page: _currentPage);
      final List<dynamic> txList = response['transactions'] ?? [];
      final newTx = txList.map((t) => TransactionModel.fromJson(t)).toList();

      if (refresh) {
        _transactions = newTx;
      } else {
        _transactions.addAll(newTx);
      }

      _hasMore = newTx.length >= 20;
      _currentPage++;
      _error = null;
    } catch (e) {
      _error = 'Failed to fetch transactions.';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> fetchWithdrawals() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _api.getWithdrawals();
      final List<dynamic> wList = response['withdrawals'] ?? [];
      _withdrawals = wList.map((w) => WithdrawalModel.fromJson(w)).toList();
      _error = null;
    } catch (e) {
      _error = 'Failed to fetch withdrawals.';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> requestWithdrawal(Map<String, dynamic> data) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _api.requestWithdrawal(data);
      await fetchWallet();
      await fetchWithdrawals();
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = 'Withdrawal request failed. Please try again.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  void addCoins(int coins, double amount) {
    _coinBalance += coins;
    _totalEarnings += amount;
    notifyListeners();
  }
}
