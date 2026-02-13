import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import AppLayout from './components/AppLayout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Stores from './pages/Stores';
import AddStore from './pages/AddStore';
import Login from './pages/Login';
import Register from './pages/Register';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth pages */}
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

            {/* Protected pages */}
            <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/stores" element={<Stores />} />
              <Route path="/add-store" element={<AddStore />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </StoreProvider>
    </AuthProvider>
  );
}

export default App;
