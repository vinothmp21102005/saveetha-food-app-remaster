import { useState, useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';

const OrderStatus = ({ initialOrder }) => {
    const { socket } = useSocket();
    const [order, setOrder] = useState(initialOrder);

    useEffect(() => {
        if (!socket) return;

        socket.on('order:status_update', (data) => {
            if (data.orderId === order._id) {
                setOrder(prev => ({ ...prev, orderStatus: data.status }));
            }
        });

        return () => {
            socket.off('order:status_update');
        };
    }, [socket, order._id]);

    const steps = ['received', 'preparing', 'ready', 'picked_up'];
    const currentStepIndex = steps.indexOf(order.orderStatus);

    return (
        <div className="bg-white p-6 rounded shadow-md w-full mb-6">
            <h3 className="text-xl font-bold mb-4">Order #{order.orderId} Status</h3>

            <div className="flex items-center justify-between relative mt-8 mb-4">
                {/* Progress Bar Background */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-0"></div>
                {/* Active Progress */}
                <div
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-green-500 -z-0 transition-all duration-500"
                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                ></div>

                {steps.map((step, index) => (
                    <div key={step} className="flex flex-col items-center relative z-10">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300
                            ${index <= currentStepIndex ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'}`}
                        >
                            {index + 1}
                        </div>
                        <span className={`text-xs mt-2 font-medium uppercase ${index <= currentStepIndex ? 'text-green-600' : 'text-gray-400'}`}>
                            {step.replace('_', ' ')}
                        </span>
                    </div>
                ))}
            </div>

            <div className="text-center mt-6">
                {order.orderStatus === 'ready' && (
                    <div className="bg-green-100 text-green-800 p-3 rounded animate-bounce">
                        🎉 Your order is READY! Please pick it up.
                    </div>
                )}
                {order.orderStatus === 'picked_up' && (
                    <div className="text-gray-500">Order Completed. Enjoy your meal! 🍔</div>
                )}
            </div>
        </div>
    );
};

export default OrderStatus;
