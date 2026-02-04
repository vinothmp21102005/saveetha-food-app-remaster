import { useState, useEffect } from 'react';
import api from '../../api/axios';
import OrderCard from '../Shopkeeper/OrderCard';

const ActiveOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchActiveOrders = async () => {
        try {
            const { data } = await api.get('/orders/admin/active');
            setOrders(data);
        } catch (error) {
            console.error("Error fetching active orders", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActiveOrders();
    }, []);

    const handleStatusRefresh = () => {
        fetchActiveOrders();
    };

    if (loading) return <div className="p-10 text-center">Loading active orders...</div>;

    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold mb-6">Global Active Orders</h2>

            {orders.length === 0 ? (
                <p className="text-gray-500">No active orders in the system.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orders.map(order => (
                        <div key={order._id} className="relative">
                            <div className="absolute top-0 right-0 bg-gray-200 text-xs px-2 py-1 rounded-bl">
                                Shop: {order.shopId?.name || 'Unknown'}
                            </div>
                            <OrderCard order={order} onStatusChange={handleStatusRefresh} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ActiveOrders;
