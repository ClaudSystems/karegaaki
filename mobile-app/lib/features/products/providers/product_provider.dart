import 'package:flutter/material.dart';
import '../../../core/api/api_client.dart';
import '../../../models/product_model.dart';

class ProductProvider extends ChangeNotifier {
  final ApiClient _api = ApiClient();
  List<Product> _products = [];
  bool _isLoading = false;

  List<Product> get products => _products;
  bool get isLoading => _isLoading;

  Future<void> fetchProducts() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _api.dio.get('/products', queryParameters: {
        'page_size': 50,
      });
      final items = response.data['items'] as List;
      _products = items.map((j) => Product.fromJson(j)).toList();
      print('Produtos carregados: ${_products.length}');
    } catch (e, stackTrace) {
      print('ERRO CRITICO produtos: $e');
      print('STACK: $stackTrace');
    }

    _isLoading = false;
    notifyListeners();
  }
}