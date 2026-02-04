import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold mb-8">Admin Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link to="/admin/shops" className="bg-white p-6 rounded shadow hover:shadow-lg transition flex flex-col items-center justify-center h-40">
                    <span className="text-4xl mb-2">🏪</span>
                    <h3 className="text-xl font-bold text-blue-600">Manage Shops</h3>
                </Link>

                <Link to="/admin/menu" className="bg-white p-6 rounded shadow hover:shadow-lg transition flex flex-col items-center justify-center h-40">
                    <span className="text-4xl mb-2">🍔</span>
                    <h3 className="text-xl font-bold text-blue-600">Manage Menu</h3>
                </Link>

                <Link to="/admin/active-orders" className="bg-white p-6 rounded shadow hover:shadow-lg transition flex flex-col items-center justify-center h-40">
                    <span className="text-4xl mb-2">⚡</span>
                    <h3 className="text-xl font-bold text-blue-600">Active Orders</h3>
                </Link>

                <Link to="/admin/analytics" className="bg-white p-6 rounded shadow hover:shadow-lg transition flex flex-col items-center justify-center h-40">
                    <span className="text-4xl mb-2">📊</span>
                    <h3 className="text-xl font-bold text-blue-600">Analytics</h3>
                </Link>
            </div>
        </div>
    );
};

export default AdminDashboard;
