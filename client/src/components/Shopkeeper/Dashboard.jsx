import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import { getShopOrders } from '../../api/order';
import OrderCard from './OrderCard';
import ShopStats from './ShopStats';

const ShopDashboard = () => {
    const { user } = useAuth();
    const { socket } = useSocket();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        if (user && user.shopId) {
            try {
                const data = await getShopOrders(user.shopId);
                setOrders(data);
            } catch (error) {
                console.error("Error fetching orders", error);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchOrders();

        // Listen for new orders via Socket
        if (socket) {
            socket.on('shopkeeper:new_order', (newOrder) => {
                // Add new order to list if it belongs to this shop (server handles room join, but double check doesn't hurt)
                setOrders(prev => {
                    // Avoid duplicates
                    if (prev.find(o => o._id === newOrder._id)) return prev;
                    return [...prev, newOrder].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                });
                alert("New Order Received! 🔔");
            });

            socket.on('order:status_update', () => {
                fetchOrders(); // Refresh to ensure correct status grouping
            });
        }

        return () => {
            if (socket) {
                socket.off('shopkeeper:new_order');
                socket.off('order:status_update');
            }
        };
    }, [user, socket]);

    if (!user.shopId) return <div className="p-10 text-center text-red-500">You are not assigned to any shop. Contact Admin.</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                🍳 Shop Dashboard
                <span className="text-sm font-normal bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    {orders.length} Active Orders
                </span>
            </h2>

            {/* Business Stats */}
            <ShopStats />

            {loading ? <p>Loading orders...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orders.length === 0 ? (
                        <div className="col-span-full text-center text-gray-500 py-10 bg-white rounded shadow">
                            No active orders. Relax! ☕
                        </div>
                    ) : (
                        orders.map(order => (
                            <OrderCard key={order._id} order={order} onStatusChange={fetchOrders} />
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default ShopDashboard;
