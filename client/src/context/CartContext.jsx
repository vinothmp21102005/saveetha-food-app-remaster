import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [shopId, setShopId] = useState(null); // Cart can only contain items from one shop

    // Load cart from local storage on init
    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        const storedShop = localStorage.getItem('cartShopId');
        if (storedCart) setCartItems(JSON.parse(storedCart));
        if (storedShop) setShopId(storedShop);
    }, []);

    // Save to local storage whenever cart changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
        if (shopId) localStorage.setItem('cartShopId', shopId);
        else localStorage.removeItem('cartShopId');
    }, [cartItems, shopId]);

    const addToCart = (item, shop, qty = 1) => {
        // If adding from a different shop, confirm reset
        if (shopId && shopId !== shop._id) {
            if (!window.confirm("Start a new order? Your cart contains items from another shop.")) {
                return;
            }
            setCartItems([]);
            setShopId(shop._id);
        } else if (!shopId) {
            setShopId(shop._id);
        }

        setCartItems(prev => {
            const existing = prev.find(i => i._id === item._id);
            const currentQty = existing ? existing.quantity : 0;
            const availableStock = item.stock;

            if (currentQty + qty > availableStock) {
                alert(`Cannot add more. Only ${availableStock} items in stock.`);
                return prev;
            }

            if (existing) {
                return prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity + qty } : i);
            }
            return [...prev, { ...item, quantity: qty }];
        });
    };

    const removeFromCart = (itemId) => {
        setCartItems(prev => {
            const newCart = prev.filter(i => i._id !== itemId);
            if (newCart.length === 0) setShopId(null);
            return newCart;
        });
    };

    const updateQuantity = (itemId, qty) => {
        if (qty < 1) {
            removeFromCart(itemId);
            return;
        }
        setCartItems(prev => prev.map(i => i._id === itemId ? { ...i, quantity: qty } : i));
    };

    const clearCart = () => {
        setCartItems([]);
        setShopId(null);
    };

    const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartTotal,
            cartCount,
            shopId
        }}>
            {children}
        </CartContext.Provider>
    );
};
