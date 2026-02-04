import { useState, useEffect } from 'react';
import { getMyOrders } from '../../api/order';
import OrderStatus from './OrderStatus';
import { useSocket } from '../../hooks/useSocket';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const { socket } = useSocket();

    const fetchOrders = async () => {
        try {
            const data = await getMyOrders();
            setOrders(data);
        } catch (error) {
            console.error("Error fetching orders", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        if (!socket) return;
        socket.on('order:status_update', () => {
            fetchOrders();
        });
        return () => {
            socket.off('order:status_update');
        };
    }, [socket]);

    if (loading) return <div className="p-10 text-center">Loading orders...</div>;

    const activeOrders = orders.filter(o => ['received', 'preparing', 'ready'].includes(o.orderStatus));
    const pastOrders = orders.filter(o => !['received', 'preparing', 'ready'].includes(o.orderStatus));

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">My Orders</h2>

            {activeOrders.length > 0 && (
                <div className="mb-10">
                    <h3 className="text-xl font-bold mb-4 text-blue-600">Active Orders ({activeOrders.length})</h3>
                    <div className="space-y-6">
                        {activeOrders.map(order => (
                            <OrderStatus key={order._id} initialOrder={order} />
                        ))}
                    </div>
                </div>
            )}

            <div>
                <h3 className="text-xl font-bold mb-4 text-gray-700">Order History</h3>
                {pastOrders.length === 0 ? (
                    <p className="text-gray-500">No past orders.</p>
                ) : (
                    <div className="space-y-4">
                        {pastOrders.map(order => (
                            <div key={order._id} className="bg-white p-4 rounded shadow flex justify-between items-center opacity-75">
                                <div>
                                    <h4 className="font-bold">Order #{order.orderId}</h4>
                                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    <div className="text-sm mt-1">
                                        {order.items.map((i, idx) => (
                                            <span key={idx} className="mr-2">{i.quantity} x {i.name}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">₹{order.totalPrice}</p>
                                    <span className={`text-xs px-2 py-1 rounded ${order.orderStatus === 'picked_up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {order.orderStatus.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
