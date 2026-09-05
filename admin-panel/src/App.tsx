import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import ProductsPage from './pages/ProductsPage';
import LoginPage from './pages/LoginPage';
import { useAuthStore } from './stores/authStore';
import CreditsPage from './pages/CreditsPage';
import TransactionsPage from './pages/TransactionsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import CustomersPage from './pages/CustomersPage';
import DisputesPage from './pages/DisputesPage';
import { Truck, Radio, Settings } from 'lucide-react';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const token = useAuthStore((s) => s.token);
  const admin = useAuthStore((s) => s.admin);

  if (!token) return <Navigate to="/login" replace />;

  if (allowedRoles && admin && !allowedRoles.includes(admin.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function Suppliers() {
  return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Fornecedores</h2>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
          <Truck className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Gestão de fornecedores em desenvolvimento</p>
          <p className="text-xs text-slate-500 mt-2">Disponível em breve</p>
        </div>
      </div>
  );
}

function Gateway() {
  return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Gateway SMS</h2>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
          <Radio className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Gateway SMS em desenvolvimento</p>
          <p className="text-xs text-slate-500 mt-2">Disponível em breve</p>
        </div>
      </div>
  );
}

function SettingsPage() {
  return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Configurações</h2>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
          <Settings className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Configurações do sistema em desenvolvimento</p>
          <p className="text-xs text-slate-500 mt-2">Disponível em breve</p>
        </div>
      </div>
  );
}

export default function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="credits" element={<CreditsPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="disputes" element={<DisputesPage />} />

            <Route path="users" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <AdminUsersPage />
              </ProtectedRoute>
            } />

            <Route path="suppliers" element={<Suppliers />} />
            <Route path="gateway" element={<Gateway />} />
            <Route path="settings" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <SettingsPage />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
  );
}