import 'package:flutter/material.dart';
import '../../../core/api/api_client.dart';
import '../../../models/wallet_model.dart';

class WalletProvider extends ChangeNotifier {
  final ApiClient _api = ApiClient();
  Wallet? _wallet;
  bool _isLoading = false;

  Wallet? get wallet => _wallet;
  bool get isLoading => _isLoading;
  double get balance => _wallet?.balanceCredit ?? 0;

  Future<void> fetchBalance() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _api.dio.get('/wallet/balance');
      _wallet = Wallet.fromJson(response.data);
      print('Saldo carregado: ${_wallet?.balanceCredit}');
    } catch (e, stackTrace) {
      print('ERRO CRITICO wallet: $e');
      print('STACK: $stackTrace');
    }

    _isLoading = false;
    notifyListeners();
  }
}