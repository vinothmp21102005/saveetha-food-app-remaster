import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const InventoryManager = () => {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchInventory = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api'}/inventory/${user.shopId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setItems(response.data);
        } catch (error) {
            console.error("Failed to fetch inventory", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && user.shopId) {
            fetchInventory();
        }
    }, [user]);

    const handleStockUpdate = async (itemId, newStock) => {
        try {
            const token = localStorage.getItem('token');
            const stockValue = parseInt(newStock, 10);

            if (isNaN(stockValue) || stockValue < 0) return;

            await axios.put(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api'}/inventory/${itemId}`,
                { stock: stockValue },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Optimistic update
            setItems(prev => prev.map(item =>
                item._id === itemId ? { ...item, stock: stockValue } : item
            ));
            alert("Stock updated successfully!");
        } catch (error) {
            console.error("Failed to update stock", error);
            alert("Failed to update stock");
        }
    };

    if (!user.shopId) return <div className="p-10 text-center text-red-500 font-bold text-xl">Access Denied. No Shop Assigned.</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <header className="mb-8">
                <h2 className="text-4xl font-extrabold text-gray-800 mb-2">📦 Inventory Management</h2>
                <p className="text-gray-500">Manage your product availability. Items with <span className="font-bold text-red-500">0 Stock</span> are hidden from students.</p>
            </header>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map(item => (
                        <div key={item._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                            <div className="h-4 p-4 flex justify-between items-start">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${item.stock === 0 ? 'bg-red-100 text-red-600' :
                                    item.stock < 5 ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'
                                    }`}>
                                    {item.stock === 0 ? 'Out of Stock' : item.stock < 5 ? 'Low Stock' : 'In Stock'}
                                </span>
                            </div>

                            <div className="p-6 pt-2">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800 leading-tight">{item.name}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{item.category}</p>
                                    </div>
                                    <span className="text-lg font-bold text-gray-700">₹{item.price}</span>
                                </div>

                                <div className="flex items-center justify-between mt-6 bg-gray-50 p-3 rounded-lg">
                                    <label className="text-sm font-semibold text-gray-600">Current Stock:</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-20 p-2 border border-blue-300 rounded font-bold text-center focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={item.stock !== undefined ? item.stock : 0}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                setItems(prev => prev.map(i => i._id === item._id ? { ...i, stock: isNaN(val) ? 0 : val } : i));
                                            }}
                                        />
                                        <button
                                            onClick={() => handleStockUpdate(item._id, item.stock)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition-colors shadow-sm"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InventoryManager;
