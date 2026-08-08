import 'package:flutter/material.dart';
import '../../../models/product_model.dart';

class ProductDetailScreen extends StatelessWidget {
  final Product product;
  const ProductDetailScreen({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(product.name)),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Ícone grande
            Center(
              child: Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  color: Theme.of(context).primaryColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Icon(Icons.card_giftcard, size: 50, color: Colors.blue),
              ),
            ),
            const SizedBox(height: 24),

            // Nome e categoria
            Text(product.name, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text(product.categoryName ?? 'Produto digital', style: TextStyle(color: Colors.grey[600])),
            const SizedBox(height: 16),

            // Descrição
            if (product.description != null) ...[
              Text(product.description!, style: const TextStyle(fontSize: 14)),
              const SizedBox(height: 16),
            ],

            // Preço
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Theme.of(context).primaryColor.withOpacity(0.05),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Theme.of(context).primaryColor.withOpacity(0.2)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Preço', style: TextStyle(fontSize: 16)),
                  Text(
                    '${product.creditPrice} créditos',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).primaryColor,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Stock
            Row(
              children: [
                Icon(Icons.inventory, size: 16, color: Colors.grey[500]),
                const SizedBox(width: 4),
                Text(
                  '${product.stockAvailable} em stock',
                  style: TextStyle(color: Colors.grey[500]),
                ),
              ],
            ),

            const Spacer(),

            // Botão comprar
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  // TODO: Implementar checkout
                },
                child: const Text('Comprar com Créditos'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}