// src/App.tsx
import WalletScreen from './screens/WalletScreen';
import React, { useState, useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import CartScreen from './screens/CartScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';
import { Product } from './types';

type Screen = 'login' | 'home' | 'cart' | 'product_detail'| 'wallet';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { isAuthenticated, loadUser } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      loadUser();
      setScreen('home');
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    setScreen('home');
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setScreen('product_detail');
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  switch (screen) {
    case 'wallet':
      return <WalletScreen onBack={() => setScreen('home')} />;

    case 'cart':
      return <CartScreen onBack={() => setScreen('home')} />;

    case 'product_detail':
      return selectedProduct ? (
          <ProductDetailScreen
              product={selectedProduct}
              onBack={() => setScreen('home')}
              onCartClick={() => setScreen('cart')}
          />
      ) : (
          <HomeScreen onProductClick={handleProductClick} onCartClick={() => setScreen('cart')} onWalletClick={() => setScreen('wallet')} />      );

    case 'home':
    default:
      return (
          <HomeScreen
              onProductClick={handleProductClick}
              onCartClick={() => setScreen('cart')}
              onWalletClick={() => setScreen('wallet')}
          />
      );

  }
}