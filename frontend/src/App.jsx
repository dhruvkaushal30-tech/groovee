import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import AdminLayout from './admin/AdminLayout';
import CouponList from './admin/CouponList';
import Dashboard from './admin/Dashboard';
import OrderList from './admin/OrderList';
import ProductForm from './admin/ProductForm';
import ProductList from './admin/ProductList';
import UserList from './admin/UserList';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Collections from './pages/Collections';
import Home from './pages/Home';
import Login from './pages/Login';
import OrderDetails from './pages/OrderDetails';
import Orders from './pages/Orders';
import ProductDetails from './pages/ProductDetails';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import Register from './pages/Register';
import Shop from './pages/Shop';
import { Contact, Faq, StaticPage } from './pages/StaticPages';
import ProtectedRoute from './routes/ProtectedRoute';

function CustomerLoginEntry() {
  const location = useLocation();
  return <Navigate to="/" replace state={{ openLogin: true, from: location.state?.from }} />;
}

function StoreShell({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';

  if (isAdmin) {
    return (
      <Routes>
        <Route
          path="/admin"
          element={
            <ProtectedRoute admin>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/create" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="users" element={<UserList />} />
          <Route path="coupons" element={<CouponList />} />
        </Route>
      </Routes>
    );
  }

  return (
    <StoreShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/product/:slug" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/login" element={<CustomerLoginEntry />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/login" element={<Login admin />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
        <Route path="/about" element={<StaticPage name="about" />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/shipping" element={<StaticPage name="shipping" />} />
        <Route path="/returns" element={<StaticPage name="returns" />} />
        <Route path="/privacy" element={<StaticPage name="privacy" />} />
        <Route path="/terms" element={<StaticPage name="terms" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </StoreShell>
  );
}
