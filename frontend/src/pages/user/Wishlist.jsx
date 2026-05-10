import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../../context/CartContext';

export default function Wishlist() {
  const { wishlist, toggleWishlist, addToCart, isInCart, cartLoading } = useCart();
  const products = wishlist?.products || [];

  const handleRemove = async (productId) => {
    await toggleWishlist(productId);
    toast.success('Removed from wishlist');
  };

  const handleMoveToCart = async (productId) => {
    await toggleWishlist(productId);
    const ok = await addToCart(productId);
    if (ok) toast.success('Moved to cart!');
  };

  if (products.length === 0) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <Heart size={72} className="text-gray-600 mx-auto mb-6" />
      <h2 className="font-display text-3xl font-bold mb-3">Your wishlist is empty</h2>
      <p className="text-gray-400 mb-8">Save items you love to your wishlist.</p>
      <Link to="/products" className="btn-primary">Browse Products <ArrowRight size={16} /></Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl font-bold mb-8">My Wishlist <span className="text-gray-400 text-lg font-body font-normal">({products.length} items)</span></h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        <AnimatePresence>
          {products.map(product => {
            const inCart = isInCart(product._id);
            const price = product.discountedPrice || product.price;
            const discount = product.discountedPrice ? Math.round(((product.price - product.discountedPrice) / product.price) * 100) : 0;
            return (
              <motion.div
                key={product._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden hover:border-primary/40 transition-all group"
              >
                <Link to={`/products/${product.slug}`} className="block relative overflow-hidden aspect-square">
                  <img src={product.images?.[0]?.url} alt={product.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {discount > 0 && <span className="absolute top-2 left-2 badge bg-primary text-white text-xs font-bold">-{discount}%</span>}
                  <button
                    onClick={(e) => { e.preventDefault(); handleRemove(product._id); }}
                    className="absolute top-2 right-2 p-2 rounded-full bg-dark/80 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-red-500/20"
                  >
                    <Trash2 size={14} />
                  </button>
                </Link>
                <div className="p-4">
                  <Link to={`/products/${product.slug}`}>
                    <h3 className="text-sm font-semibold text-white line-clamp-2 mb-2 hover:text-primary transition-colors">{product.name}</h3>
                  </Link>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-white">₹{price?.toLocaleString()}</span>
                    {discount > 0 && <span className="text-xs text-gray-500 line-through">₹{product.price?.toLocaleString()}</span>}
                  </div>
                  <button
                    onClick={() => inCart ? null : handleMoveToCart(product._id)}
                    disabled={cartLoading || product.stock === 0}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      inCart ? 'bg-green-500/10 border border-green-500/30 text-green-400' :
                      product.stock === 0 ? 'bg-dark-border text-gray-500 cursor-not-allowed' :
                      'bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-white'
                    }`}
                  >
                    <ShoppingCart size={14} />
                    {inCart ? 'In Cart' : product.stock === 0 ? 'Out of Stock' : 'Move to Cart'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
