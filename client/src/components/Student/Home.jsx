import { useState, useEffect } from 'react';
import { getAllShops } from '../../api/shop';
import { Link } from 'react-router-dom';

const StudentHome = () => {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchShops = async () => {
            try {
                const data = await getAllShops();
                setShops(data);
            } catch (error) {
                console.error("Error fetching shops", error);
            } finally {
                setLoading(false);
            }
        };
        fetchShops();
    }, []);

    if (loading) return <div className="p-10 text-center">Loading shops...</div>;

    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Hungry? Pick a Shop!</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shops.map(shop => (
                    <Link to={`/shop/${shop._id}`} key={shop._id} className="block group">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden transition transform group-hover:-translate-y-1 group-hover:shadow-xl">
                            <img
                                src={shop.imageUrl || 'https://via.placeholder.com/300x200'}
                                alt={shop.name}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600">{shop.name}</h3>
                                <p className="text-gray-600 mt-2 text-sm">{shop.description}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {shops.length === 0 && (
                <div className="text-center text-gray-500 mt-10">No active shops available right now.</div>
            )}
        </div>
    );
};

export default StudentHome;
