import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Shared/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ProtectedRoute from './components/Shared/ProtectedRoute';
import AdminDashboard from './components/Admin/AdminDashboard';
import ManageShops from './components/Admin/ManageShops';
import ManageMenu from './components/Admin/ManageMenu';
import AdminAnalytics from './components/Admin/Analytics';
import StudentHome from './components/Student/Home';
import ShopMenu from './components/Student/ShopMenu';
import Cart from './components/Student/Cart';
import Payment from './components/Student/Payment';
import MyOrders from './components/Student/MyOrders';
import ShopDashboard from './components/Shopkeeper/Dashboard';
import InventoryManager from './components/Shopkeeper/InventoryManager';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto mt-6">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Shopkeeper Routes */}
          <Route element={<ProtectedRoute allowedRoles={['shopkeeper']} />}>
            <Route path="/shop-dashboard" element={<ShopDashboard />} />
            <Route path="/shop-inventory" element={<InventoryManager />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/shops" element={<ManageShops />} />
            <Route path="/admin/menu" element={<ManageMenu />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
          </Route>

          {/* Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/" element={<StudentHome />} />
            <Route path="/shop/:id" element={<ShopMenu />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/my-orders" element={<MyOrders />} />
          </Route>

          {/* Fallback */}
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
