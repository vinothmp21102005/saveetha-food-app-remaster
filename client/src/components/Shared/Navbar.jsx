import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-blue-600 p-4 text-white shadow-md relative z-50">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold">QueueLess Food Court</Link>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 focus:outline-none"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-6">
                    {user ? (
                        <>
                            {user.role === 'student' && (
                                <>
                                    <Link to="/" className="hover:text-gray-200">Home</Link>
                                    <Link to="/cart" className="hover:text-gray-200">Cart</Link>
                                    <Link to="/my-orders" className="hover:text-gray-200">My Orders</Link>
                                </>
                            )}

                            {user.role === 'shopkeeper' && (
                                <>
                                    <Link to="/shop-dashboard" className="hover:text-gray-200">Dashboard</Link>
                                    <Link to="/shop-inventory" className="hover:text-gray-200">Inventory</Link>
                                </>
                            )}

                            {user.role === 'admin' && (
                                <>
                                    <Link to="/admin" className="hover:text-gray-200">Dashboard</Link>
                                    <Link to="/admin/shops" className="hover:text-gray-200">Shops</Link>
                                    <Link to="/admin/menu" className="hover:text-gray-200">Menu</Link>
                                </>
                            )}

                            <div className="flex items-center gap-2">
                                <span className="text-sm bg-blue-700 px-2 py-1 rounded">
                                    {user.name} ({user.role})
                                </span>
                                <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm transition">Logout</button>
                            </div>
                        </>
                    ) : (
                        <div className="flex gap-4">
                            <Link to="/login" className="hover:text-gray-200">Login</Link>
                            <Link to="/register" className="bg-white text-blue-600 px-4 py-1 rounded hover:bg-gray-100 transition">Register</Link>
                        </div>
                    )}
                </div>

                {/* Mobile Dropdown */}
                {isOpen && (
                    <div className="absolute top-16 left-0 w-full bg-blue-600 shadow-lg md:hidden flex flex-col items-center gap-4 py-4 border-t border-blue-500">
                        {user ? (
                            <>
                                {user.role === 'student' && (
                                    <>
                                        <Link to="/" className="w-full text-center py-2 hover:bg-blue-700" onClick={() => setIsOpen(false)}>Home</Link>
                                        <Link to="/cart" className="w-full text-center py-2 hover:bg-blue-700" onClick={() => setIsOpen(false)}>Cart</Link>
                                        <Link to="/my-orders" className="w-full text-center py-2 hover:bg-blue-700" onClick={() => setIsOpen(false)}>My Orders</Link>
                                    </>
                                )}
                                {user.role === 'shopkeeper' && (
                                    <>
                                        <Link to="/shop-dashboard" className="w-full text-center py-2 hover:bg-blue-700" onClick={() => setIsOpen(false)}>Dashboard</Link>
                                        <Link to="/shop-inventory" className="w-full text-center py-2 hover:bg-blue-700" onClick={() => setIsOpen(false)}>Inventory</Link>
                                    </>
                                )}
                                {user.role === 'admin' && (
                                    <>
                                        <Link to="/admin" className="w-full text-center py-2 hover:bg-blue-700" onClick={() => setIsOpen(false)}>Dashboard</Link>
                                        <Link to="/admin/shops" className="w-full text-center py-2 hover:bg-blue-700" onClick={() => setIsOpen(false)}>Shops</Link>
                                        <Link to="/admin/menu" className="w-full text-center py-2 hover:bg-blue-700" onClick={() => setIsOpen(false)}>Menu</Link>
                                    </>
                                )}
                                <div className="w-full text-center py-2 border-t border-blue-500 mt-2">
                                    <span className="block text-sm mb-2">{user.name} ({user.role})</span>
                                    <button onClick={handleLogout} className="bg-red-500 px-6 py-2 rounded">Logout</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="w-full text-center py-2 hover:bg-blue-700" onClick={() => setIsOpen(false)}>Login</Link>
                                <Link to="/register" className="w-full text-center py-2 hover:bg-blue-700" onClick={() => setIsOpen(false)}>Register</Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
