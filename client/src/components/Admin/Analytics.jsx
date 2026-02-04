import { useState, useEffect } from 'react';
import { getAdminAnalytics } from '../../api/order';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminAnalytics = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getAdminAnalytics();
                setStats(data);
            } catch (error) {
                console.error("Error fetching analytics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="p-10 text-center">Loading analytics...</div>;

    const totalRevenue = stats.reduce((acc, curr) => acc + curr.totalRevenue, 0);
    const totalOrders = stats.reduce((acc, curr) => acc + curr.totalOrders, 0);

    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">📊 Business Analytics</h2>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold opacity-90">Total Platform Revenue</h3>
                    <p className="text-4xl font-bold mt-2">₹{totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold opacity-90">Total Orders Processed</h3>
                    <p className="text-4xl font-bold mt-2">{totalOrders}</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-10">
                <h3 className="text-xl font-bold mb-6 text-gray-700">Revenue per Shop</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="shopName" />
                            <YAxis />
                            <Tooltip formatter={(value) => `₹${value}`} />
                            <Legend />
                            <Bar dataKey="totalRevenue" fill="#3B82F6" name="Revenue (₹)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shop Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Orders</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {stats.map((shop) => (
                            <tr key={shop._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{shop.shopName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shop.totalOrders}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-bold">₹{shop.totalRevenue.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminAnalytics;
