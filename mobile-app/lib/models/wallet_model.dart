class Wallet {
  final String userId;
  final double balanceCredit;
  final double totalPurchased;
  final double totalSpent;

  Wallet({
    required this.userId,
    required this.balanceCredit,
    required this.totalPurchased,
    required this.totalSpent,
  });

  factory Wallet.fromJson(Map<String, dynamic> json) {
    return Wallet(
      userId: json['user_id'] ?? '',
      balanceCredit: (json['balance_credit'] ?? 0).toDouble(),
      totalPurchased: (json['total_purchased_credit'] ?? 0).toDouble(),
      totalSpent: (json['total_spent_credit'] ?? 0).toDouble(),
    );
  }
}