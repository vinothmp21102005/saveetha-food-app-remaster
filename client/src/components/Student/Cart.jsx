import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart, shopId } = useCart();
    const navigate = useNavigate();

    if (cartItems.length === 0) {
        return (
            <div className="p-10 text-center">
                <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
                <Link to="/" className="text-blue-600 hover:underline">Go back to browse shops</Link>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Your Cart</h2>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                {cartItems.map(item => (
                    <div key={item._id} className="flex justify-between items-center border-b py-4 last:border-0">
                        <div className="flex items-center gap-4">
                            {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded" />}
                            <div>
                                <h3 className="font-bold text-lg">{item.name}</h3>
                                <p className="text-gray-500">₹{item.price}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center border rounded">
                                <button
                                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                    className="px-3 py-1 hover:bg-gray-100"
                                >-</button>
                                <span className="px-3">{item.quantity}</span>
                                <button
                                    onClick={() => item.quantity < item.stock ? updateQuantity(item._id, item.quantity + 1) : alert(`Only ${item.stock} available`)}
                                    className={`px-3 py-1 hover:bg-gray-100 ${item.quantity >= item.stock ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >+</button>
                            </div>
                            <p className="font-bold w-20 text-right">₹{item.price * item.quantity}</p>
                            <button
                                onClick={() => removeFromCart(item._id)}
                                className="text-red-500 hover:text-red-700"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-md">
                <div>
                    <button
                        onClick={clearCart}
                        className="text-red-600 hover:text-red-800 text-sm"
                    >
                        Clear Cart
                    </button>
                </div>
                <div className="text-right">
                    <p className="text-gray-600 mb-1">Total Amount</p>
                    <p className="text-3xl font-bold text-blue-600">₹{cartTotal}</p>
                    <button
                        onClick={() => navigate('/payment', { state: { items: cartItems, totalPrice: cartTotal, shopId } })}
                        className="mt-4 bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-bold hover:bg-green-700 shadow-md transition transform hover:-translate-y-1"
                    >
                        Proceed to Pay
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
