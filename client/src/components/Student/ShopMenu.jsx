import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getShopMenu } from '../../api/menu';
import { useCart } from '../../context/CartContext';
import { useSocket } from '../../hooks/useSocket';

const ShopMenu = () => {
    const { id } = useParams();
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    // State for cart feedback
    const [notification, setNotification] = useState(null);
    const [shopName] = useState({ _id: id, name: 'Shop' });

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const data = await getShopMenu(id);
                setMenuItems(data);
            } catch (error) {
                console.error("Error fetching menu", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, [id]);

    const handleAddToCart = (item) => {
        if (item.stock > 0) {
            addToCart(item, shopName);
            setNotification(`Added ${item.name} to cart! 🛒`);
            setTimeout(() => setNotification(null), 2000);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading menu...</div>;

    const categories = [...new Set(menuItems.map(item => item.category || 'Other'))];

    return (
        <div className="p-6 relative">
            <h2 className="text-3xl font-bold mb-6">Menu</h2>

            {/* Notification Toast */}
            {notification && (
                <div className="fixed top-20 right-5 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-bounce">
                    {notification}
                </div>
            )}

            {categories.map(category => (
                <div key={category} className="mb-8">
                    <h3 className="text-xl font-bold mb-4 text-gray-700 uppercase tracking-wide border-b pb-2">{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {menuItems.filter(i => (i.category || 'Other') === category).map(item => (
                            <div key={item._id} className={`relative bg-white p-4 rounded-xl shadow-md flex flex-col justify-between h-full border border-gray-100 transition-all ${item.stock === 0 ? 'opacity-75' : 'hover:shadow-lg'}`}>
                                {item.stock === 0 && (
                                    <div className="absolute inset-0 bg-gray-100 bg-opacity-50 z-10 flex items-center justify-center pointer-events-none rounded-xl">
                                        <span className="bg-gray-800 text-white px-3 py-1 rounded text-sm font-bold opacity-80 shadow">OUT OF STOCK</span>
                                    </div>
                                )}
                                <div className={item.stock === 0 ? "grayscale filter" : ""}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-lg text-gray-800">{item.name}</h4>
                                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${item.stock === 0 ? 'bg-gray-200 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                                            {item.stock === 0 ? 'Unavailable' : `₹${item.price}`}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{item.description}</p>
                                </div>

                                <div className={`mt-auto flex items-center gap-4 ${item.stock === 0 ? "grayscale filter" : ""}`}>
                                    {item.imageUrl && (
                                        <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-lg shadow-sm" />
                                    )}
                                    <button
                                        onClick={() => handleAddToCart(item)}
                                        disabled={item.stock === 0}
                                        className={`flex-1 py-2 rounded-lg font-semibold transition-colors shadow-lg z-20
                                            ${item.stock === 0
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none border border-gray-300'
                                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                                            }`}
                                    >
                                        {item.stock === 0 ? 'Restocking' : 'Add to Cart'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {menuItems.length === 0 && <p className="text-center text-gray-500">No items available in this shop.</p>}
        </div>
    );
};

export default ShopMenu;
