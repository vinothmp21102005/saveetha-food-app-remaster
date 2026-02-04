import { updateOrderStatus } from '../../api/order';

const OrderCard = ({ order, onStatusChange }) => {
    const statusColors = {
        received: 'bg-yellow-100 border-yellow-500 text-yellow-800',
        preparing: 'bg-blue-100 border-blue-500 text-blue-800',
        ready: 'bg-green-100 border-green-500 text-green-800',
    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            await updateOrderStatus(order._id, newStatus);
            onStatusChange(); // Refresh parent
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    return (
        <div className={`border-l-4 p-4 rounded shadow-md bg-white mb-4 ${statusColors[order.orderStatus]}`}>
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-lg">Order #{order.orderId}</h4>
                    <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleTimeString()}
                        <span className="mx-2">•</span>
                        {order.studentId?.name || 'Unknown Student'}
                    </p>
                </div>
                <span className="uppercase text-xs font-bold px-2 py-1 rounded bg-white bg-opacity-50">
                    {order.orderStatus}
                </span>
            </div>

            <div className="my-3 border-t border-b py-2 border-gray-200 border-dashed">
                {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm mb-1">
                        <span>{item.quantity} x {item.name}</span>
                        <span className="font-bold">₹{item.price * item.quantity}</span>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center mt-4">
                <span className="font-bold text-lg">Total: ₹{order.totalPrice}</span>

                <div className="flex gap-2">
                    {order.orderStatus === 'received' && (
                        <button
                            onClick={() => handleStatusUpdate('preparing')}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                            Mark Preparing
                        </button>
                    )}
                    {order.orderStatus === 'preparing' && (
                        <button
                            onClick={() => handleStatusUpdate('ready')}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                            Mark Ready
                        </button>
                    )}
                    {order.orderStatus === 'ready' && (
                        <button
                            onClick={() => handleStatusUpdate('picked_up')}
                            className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                        >
                            Mark Collected
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderCard;
