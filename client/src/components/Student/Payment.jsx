import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import api from '../../api/axios';

const Payment = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!state || !state.totalPrice) {
            navigate('/cart');
            return;
        }
    }, [state, navigate]);

    const handlePayment = async () => {
        setLoading(true);
        // Simulate payment processing delay
        setTimeout(async () => {
            try {
                // Create mock order in backend directly (skipping Razorpay)
                const { data: orderData } = await api.post('/payment/create-static', {
                    shopId: state.shopId,
                    items: state.items,
                    totalPrice: state.totalPrice
                });

                clearCart();
                alert(`Payment Successful! Order ID: ${orderData.orderId}`);
                navigate('/my-orders');
            } catch (error) {
                console.error("Payment Error", error);
                alert("Payment failed. Please try again.");
            } finally {
                setLoading(false);
            }
        }, 1500);
    };

    return (
        <div className="p-10 max-w-md mx-auto bg-white rounded-lg shadow-md mt-10">
            <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Payment Gateway</h2>

            <div className="mb-6 p-4 bg-gray-50 rounded">
                <p className="flex justify-between mb-2">
                    <span>Total Amount:</span>
                    <span className="font-bold">₹{state?.totalPrice}</span>
                </p>
                <div className="text-xs text-gray-500 mt-2">
                    * This is a static demo payment page. No real money will be deducted.
                </div>
            </div>

            <div className="space-y-4">
                <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-3 rounded text-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition"
                >
                    {loading ? "Processing..." : "Confirm Payment"}
                </button>
                <button
                    onClick={() => navigate('/cart')}
                    disabled={loading}
                    className="w-full bg-gray-200 text-gray-700 py-3 rounded text-lg font-semibold hover:bg-gray-300 disabled:bg-gray-100 transition"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default Payment;
