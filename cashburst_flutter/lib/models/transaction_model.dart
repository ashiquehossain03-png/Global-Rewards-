class TransactionModel {
  final String id;
  final String userId;
  final String type;
  final int coins;
  final double amount;
  final String description;
  final String status;
  final DateTime createdAt;
  final Map<String, dynamic>? metadata;

  TransactionModel({
    required this.id,
    required this.userId,
    required this.type,
    required this.coins,
    required this.amount,
    required this.description,
    this.status = 'completed',
    required this.createdAt,
    this.metadata,
  });

  factory TransactionModel.fromJson(Map<String, dynamic> json) {
    return TransactionModel(
      id: json['_id'] ?? json['id'] ?? '',
      userId: json['userId'] ?? '',
      type: json['type'] ?? '',
      coins: json['coins'] ?? 0,
      amount: (json['amount'] ?? 0).toDouble(),
      description: json['description'] ?? '',
      status: json['status'] ?? 'completed',
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      metadata: json['metadata'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'userId': userId,
      'type': type,
      'coins': coins,
      'amount': amount,
      'description': description,
      'status': status,
      'createdAt': createdAt.toIso8601String(),
      'metadata': metadata,
    };
  }

  bool get isCredit => type != 'withdrawal';
  String get formattedAmount => isCredit ? '+₹${amount.toStringAsFixed(2)}' : '-₹${amount.toStringAsFixed(2)}';
  String get formattedCoins => isCredit ? '+$coins' : '-$coins';
}

class WithdrawalModel {
  final String id;
  final String userId;
  final double amount;
  final int coinsDeducted;
  final String method;
  final String status;
  final String? upiId;
  final BankDetails? bankDetails;
  final String? rejectionReason;
  final DateTime createdAt;
  final DateTime? processedAt;

  WithdrawalModel({
    required this.id,
    required this.userId,
    required this.amount,
    required this.coinsDeducted,
    required this.method,
    this.status = 'pending',
    this.upiId,
    this.bankDetails,
    this.rejectionReason,
    required this.createdAt,
    this.processedAt,
  });

  factory WithdrawalModel.fromJson(Map<String, dynamic> json) {
    return WithdrawalModel(
      id: json['_id'] ?? json['id'] ?? '',
      userId: json['userId'] ?? '',
      amount: (json['amount'] ?? 0).toDouble(),
      coinsDeducted: json['coinsDeducted'] ?? 0,
      method: json['method'] ?? '',
      status: json['status'] ?? 'pending',
      upiId: json['upiId'],
      bankDetails: json['bankDetails'] != null
          ? BankDetails.fromJson(json['bankDetails'])
          : null,
      rejectionReason: json['rejectionReason'],
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      processedAt: json['processedAt'] != null
          ? DateTime.parse(json['processedAt'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'userId': userId,
      'amount': amount,
      'coinsDeducted': coinsDeducted,
      'method': method,
      'status': status,
      'upiId': upiId,
      'bankDetails': bankDetails?.toJson(),
      'rejectionReason': rejectionReason,
      'createdAt': createdAt.toIso8601String(),
      'processedAt': processedAt?.toIso8601String(),
    };
  }
}

class BankDetails {
  final String accountNumber;
  final String ifscCode;
  final String accountHolderName;
  final String bankName;

  BankDetails({
    required this.accountNumber,
    required this.ifscCode,
    required this.accountHolderName,
    required this.bankName,
  });

  factory BankDetails.fromJson(Map<String, dynamic> json) {
    return BankDetails(
      accountNumber: json['accountNumber'] ?? '',
      ifscCode: json['ifscCode'] ?? '',
      accountHolderName: json['accountHolderName'] ?? '',
      bankName: json['bankName'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'accountNumber': accountNumber,
      'ifscCode': ifscCode,
      'accountHolderName': accountHolderName,
      'bankName': bankName,
    };
  }
}
