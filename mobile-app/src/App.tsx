// src/App.tsx
import WalletScreen from './screens/WalletScreen';
import React, { useState, useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { useCartStore } from './stores/cartStore';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import CartScreen from './screens/CartScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';
import BottomNav from './components/BottomNav';
import { Product } from './types';
import ProfileScreen from './screens/ProfileScreen';
import DisputesScreen from './screens/DisputesScreen';
import TransactionsScreen from './screens/TransactionsScreen';

type Screen = 'login' | 'home' | 'cart' | 'product_detail' | 'wallet' | 'transactions' | 'profile'| 'disputes';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [homeRefresh, setHomeRefresh] = useState(0);
  const { isAuthenticated, loadUser } = useAuthStore();
  const { count } = useCartStore();

  useEffect(() => {
    if (isAuthenticated) {
      loadUser();
      setScreen('home');
    }
  }, [isAuthenticated]);

  const handleLogin = () => setScreen('home');
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setScreen('product_detail');
  };
  const goToHome = () => {
    setHomeRefresh(prev => prev + 1);
    setScreen('home');
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const showBottomNav = ['home', 'cart', 'wallet', 'transactions', 'profile'].includes(screen);

  const renderScreen = () => {
    switch (screen) {

      case 'wallet':
        return <WalletScreen onBack={goToHome} />;
      case 'cart':
        return <CartScreen onBack={goToHome} onNavigateToWallet={() => setScreen('wallet')} />;
      case 'product_detail':
        return selectedProduct ? (
            <ProductDetailScreen
                product={selectedProduct}
                onBack={goToHome}
                onCartClick={() => setScreen('cart')}
            />
        ) : (
            <HomeScreen
                key={homeRefresh}
                onProductClick={handleProductClick}
                onCartClick={() => setScreen('cart')}
                onWalletClick={() => setScreen('wallet')}
            />
        );
      case 'transactions':
        return (
            <TransactionsScreen
                onBack={goToHome}
                onNavigateToDisputes={(reference) => {
                  localStorage.setItem('dispute_reference', reference);
                  setScreen('disputes');
                }}
            />
        );

      case 'profile':
        return <ProfileScreen
            onBack={goToHome}
            onNavigateToDisputes={() => setScreen('disputes')}
        />;
      case 'disputes':
        return <DisputesScreen onBack={goToHome} />;


      case 'home':
      default:
        return (
            <HomeScreen
                key={homeRefresh}
                onProductClick={handleProductClick}
                onCartClick={() => setScreen('cart')}
                onWalletClick={() => setScreen('wallet')}
            />
        );
    }
  };

  return (
      <div className="min-h-screen bg-slate-950">
        {renderScreen()}
        {showBottomNav && (
            <BottomNav
                currentScreen={screen}
                onNavigate={(s) => {
                  if (s === 'home') goToHome();
                  else setScreen(s as Screen);
                }}
                cartCount={count()}
            />
        )}
      </div>
  );
}