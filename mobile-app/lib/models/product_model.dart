class Product {
  final String id;
  final String name;
  final String slug;
  final String? description;
  final String? categoryId;
  final String? categoryName;
  final String? imageUrl;
  final double creditPrice;
  final bool isActive;
  final int stockAvailable;

  Product({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    this.categoryId,
    this.categoryName,
    this.imageUrl,
    required this.creditPrice,
    required this.isActive,
    required this.stockAvailable,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      slug: json['slug'] ?? '',
      description: json['description'],
      categoryId: json['category_id'],
      categoryName: json['category_name'],
      imageUrl: json['image_url'],
      creditPrice: (json['credit_price'] ?? 0).toDouble(),
      isActive: json['is_active'] ?? true,
      stockAvailable: json['stock_available'] ?? 0,
    );
  }
}