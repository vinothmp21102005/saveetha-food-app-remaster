import { useState, useEffect } from 'react';
import { getAllShopsAdmin } from '../../api/shop';
import { getShopMenu, addMenuItem, updateMenuItem, deleteMenuItem } from '../../api/menu';

const ManageMenu = () => {
    const [shops, setShops] = useState([]);
    const [selectedShop, setSelectedShop] = useState('');
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        imageUrl: '',
        stock: 0
    });
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        const fetchShops = async () => {
            const data = await getAllShopsAdmin();
            setShops(data);
            if (data.length > 0) setSelectedShop(data[0]._id);
        };
        fetchShops();
    }, []);

    useEffect(() => {
        if (selectedShop) {
            fetchMenu();
        }
    }, [selectedShop]);

    const fetchMenu = async () => {
        setLoading(true);
        try {
            const data = await getShopMenu(selectedShop);
            setMenuItems(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await updateMenuItem(editId, formData);
            } else {
                await addMenuItem({ ...formData, shopId: selectedShop });
            }
            setShowModal(false);
            setFormData({ name: '', description: '', price: '', category: '', imageUrl: '' });
            setEditId(null);
            fetchMenu();
        } catch (error) {
            alert('Error saving menu item');
        }
    };

    const handleEdit = (item) => {
        setFormData({
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category,
            imageUrl: item.imageUrl,
            stock: item.stock || 0
        });
        setEditId(item._id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this item?')) {
            await deleteMenuItem(id);
            fetchMenu();
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Manage Menu</h2>

            <div className="mb-6">
                <label className="mr-2 font-bold">Select Shop:</label>
                <select
                    className="p-2 border rounded"
                    value={selectedShop}
                    onChange={e => setSelectedShop(e.target.value)}
                >
                    {shops.map(shop => (
                        <option key={shop._id} value={shop._id}>{shop.name}</option>
                    ))}
                </select>
            </div>

            <button
                onClick={() => {
                    setEditId(null);
                    setFormData({ name: '', description: '', price: '', category: '', imageUrl: '' });
                    setShowModal(true);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded mb-6 hover:bg-green-700"
            >
                Add Menu Item
            </button>

            {loading ? <p>Loading Menu...</p> : (
                <div className="space-y-4">
                    {menuItems.map(item => (
                        <div key={item._id} className="flex justify-between items-center bg-white p-4 rounded shadow">
                            <div className="flex items-center gap-4">
                                <img src={item.imageUrl || 'https://via.placeholder.com/80'} alt={item.name} className="w-16 h-16 object-cover rounded" />
                                <div>
                                    <h3 className="font-bold">{item.name}</h3>
                                    <p className="text-sm text-gray-500">{item.category} - ₹{item.price}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(item)} className="text-blue-600">Edit</button>
                                <button onClick={() => handleDelete(item._id)} className="text-red-600">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">{editId ? 'Edit Item' : 'Add Item'}</h3>
                        <form onSubmit={handleSubmit}>
                            <input type="text" placeholder="Item Name" className="w-full p-2 border rounded mb-2" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            <textarea placeholder="Description" className="w-full p-2 border rounded mb-2" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            <input type="number" placeholder="Price" className="w-full p-2 border rounded mb-2" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                            <input type="text" placeholder="Category" className="w-full p-2 border rounded mb-2" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />

                            <div className="mb-2">
                                <label className="text-xs text-gray-500">Stock (Managed by Shopkeeper)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                                    value={formData.stock || 0}
                                    readOnly
                                    disabled
                                />
                            </div>

                            <input type="text" placeholder="Image URL" className="w-full p-2 border rounded mb-4" value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} />

                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageMenu;
