import { useState, useEffect } from 'react';
import { getShopAnalytics } from '../../api/order';
import { useAuth } from '../../context/AuthContext';

const ShopStats = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (user && user.shopId) {
                try {
                    const data = await getShopAnalytics(user.shopId);
                    setStats(data);
                } catch (error) {
                    console.error("Error fetching shop stats", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchStats();
    }, [user]);

    if (loading || !stats) return null; // Don't show anything if loading/error (or show skeleton)

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
                <p className="text-gray-500 text-sm font-semibold uppercase">Today's Revenue</p>
                <p className="text-2xl font-bold text-gray-800">₹{stats.todayRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                <p className="text-gray-500 text-sm font-semibold uppercase">Today's Orders</p>
                <p className="text-2xl font-bold text-gray-800">{stats.todayOrders}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
                <p className="text-gray-500 text-sm font-semibold uppercase">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-800">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-gray-500">
                <p className="text-gray-500 text-sm font-semibold uppercase">Total Orders</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
            </div>
        </div>
    );
};

export default ShopStats;
