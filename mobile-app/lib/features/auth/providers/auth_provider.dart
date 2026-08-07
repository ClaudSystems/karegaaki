import 'package:flutter/material.dart';
import '../../../core/api/api_client.dart';

class AuthProvider extends ChangeNotifier {
  final ApiClient _api = ApiClient();
  bool _isLoading = false;
  String? _error;
  bool _isLoggedIn = false;

  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isLoggedIn => _isLoggedIn;

  Future<bool> loginWithPhone(String phone, String pin) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _api.dio.post('/auth/login', data: {
        'phone_number': phone,
        'pin': pin,
      });

      final token = response.data['access_token'];
      await _api.setToken(token);
      _isLoggedIn = true;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = 'Telefone ou PIN inválido';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register(String phone, String name, String pin) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _api.dio.post('/auth/register', data: {
        'phone_number': phone,
        'full_name': name,
        'pin': pin,
      });

      final token = response.data['access_token'];
      await _api.setToken(token);
      _isLoggedIn = true;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = 'Erro ao registar. Tente novamente.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _api.clearToken();
    _isLoggedIn = false;
    notifyListeners();
  }
}