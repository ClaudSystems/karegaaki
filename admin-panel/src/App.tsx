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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" />;
  return <>{children}</>;
}

function Suppliers() {
  return <div><h2 className="text-2xl font-bold text-white">Fornecedores</h2></div>;
}
function Gateway() {
  return <div><h2 className="text-2xl font-bold text-white">Gateway SMS</h2></div>;
}
function Settings() {
  return <div><h2 className="text-2xl font-bold text-white">Configurações</h2></div>;
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
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="gateway" element={<Gateway />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
  );
}