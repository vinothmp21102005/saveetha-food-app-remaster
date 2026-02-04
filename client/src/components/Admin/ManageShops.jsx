import { useState, useEffect } from 'react';
import { getAllShopsAdmin, createShop, updateShop, deleteShop } from '../../api/shop';

const ManageShops = () => {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        imageUrl: '',
        ownerId: '' // In a real app, this would be a select from Users
    });
    const [editId, setEditId] = useState(null);

    const [shopkeepers, setShopkeepers] = useState([]);

    const fetchShops = async () => {
        try {
            const data = await getAllShopsAdmin();
            setShops(data);
        } catch (error) {
            console.error('Failed to fetch shops', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchShopkeepers = async () => {
        try {
            // Re-using axios api instance directly for now since we didn't make a standalone user api function
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api'}/auth/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            const keepers = data.filter(u => u.role === 'shopkeeper');
            setShopkeepers(keepers);
        } catch (error) {
            console.error('Failed to fetch users', error);
        }
    };

    useEffect(() => {
        fetchShops();
        fetchShopkeepers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await updateShop(editId, formData);
            } else {
                await createShop(formData);
            }
            setShowModal(false);
            setFormData({ name: '', description: '', imageUrl: '', ownerId: '' });
            setEditId(null);
            fetchShops();
        } catch (error) {
            console.error('Error saving shop', error);
            alert('Failed to save shop');
        }
    };

    const handleEdit = (shop) => {
        setFormData({
            name: shop.name,
            description: shop.description,
            imageUrl: shop.imageUrl,
            ownerId: shop.ownerId || ''
        });
        setEditId(shop._id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to remove this shop?')) {
            try {
                await deleteShop(id);
                fetchShops();
            } catch (error) {
                console.error('Error deleting shop', error);
            }
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Manage Shops</h2>
                <button
                    onClick={() => {
                        setEditId(null);
                        setFormData({ name: '', description: '', imageUrl: '', ownerId: '' });
                        setShowModal(true);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    Add New Shop
                </button>
            </div>

            {loading ? <p>Loading...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {shops.map(shop => (
                        <div key={shop._id} className="bg-white p-4 rounded shadow">
                            <img src={shop.imageUrl || 'https://via.placeholder.com/150'} alt={shop.name} className="w-full h-40 object-cover rounded mb-4" />
                            <h3 className="text-xl font-bold">{shop.name}</h3>
                            <p className="text-gray-600 mb-2">{shop.description}</p>
                            <div className="flex justify-between mt-4">
                                <button
                                    onClick={() => handleEdit(shop)}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(shop._id)}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    {shop.isActive ? 'Delete' : 'Activate'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">{editId ? 'Edit Shop' : 'Add Shop'}</h3>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                placeholder="Shop Name"
                                className="w-full p-2 border rounded mb-3"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <textarea
                                placeholder="Description"
                                className="w-full p-2 border rounded mb-3"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Image URL"
                                className="w-full p-2 border rounded mb-3"
                                value={formData.imageUrl}
                                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                            />
                            {/* In real app, Owner ID would be a dropdown of users with role shopkeeper */}
                            <select
                                className="w-full p-2 border rounded mb-4"
                                value={formData.ownerId}
                                onChange={e => setFormData({ ...formData, ownerId: e.target.value })}
                            >
                                <option value="">Select Shopkeeper (Optional)</option>
                                {shopkeepers.map(user => (
                                    <option key={user._id} value={user._id}>
                                        {user.name} ({user.email})
                                    </option>
                                ))}
                            </select>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageShops;
