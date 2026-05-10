import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [wishlist, setWishlist] = useState({ products: [] });
  const [cartLoading, setCartLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/cart');
      setCart(data.cart);
    } catch {}
  };

  const fetchWishlist = async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/wishlist');
      setWishlist(data.wishlist);
    } catch {}
  };

  useEffect(() => {
    if (user) { fetchCart(); fetchWishlist(); }
    else { setCart({ items: [] }); setWishlist({ products: [] }); }
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    setCartLoading(true);
    try {
      const { data } = await api.post('/cart/add', { productId, quantity });
      setCart(data.cart);
      return true;
    } catch { return false; }
    finally { setCartLoading(false); }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      const { data } = await api.put(`/cart/item/${itemId}`, { quantity });
      setCart(data.cart);
    } catch {}
  };

  const removeFromCart = async (itemId) => {
    try {
      const { data } = await api.delete(`/cart/item/${itemId}`);
      setCart(data.cart);
    } catch {}
  };

  const toggleWishlist = async (productId) => {
    try {
      const { data } = await api.post('/wishlist/toggle', { productId });
      setWishlist(data.wishlist);
      return data.added;
    } catch { return false; }
  };

  const isInWishlist = (productId) => wishlist?.products?.some((p) => (p._id || p) === productId);
  const isInCart = (productId) => cart?.items?.some((i) => (i.product?._id || i.product) === productId);
  const cartCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, wishlist, cartLoading, addToCart, updateCartItem, removeFromCart, toggleWishlist, isInWishlist, isInCart, cartCount, fetchCart, fetchWishlist }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
