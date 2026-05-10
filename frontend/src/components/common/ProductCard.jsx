import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const { addToCart, toggleWishlist, isInWishlist, isInCart, cartLoading } = useCart();

  const inWishlist = isInWishlist(product._id);
  const inCart = isInCart(product._id);
  const discount = product.discountedPrice
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login first'); return; }
    const ok = await addToCart(product._id);
    if (ok) toast.success('Added to cart!');
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login first'); return; }
    const added = await toggleWishlist(product._id);
    toast.success(added ? 'Added to wishlist' : 'Removed from wishlist');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group bg-dark-card border border-dark-border rounded-2xl overflow-hidden hover:border-primary/40 transition-all duration-300"
    >
      <Link to={`/products/${product.slug}`} className="block">
        <div className="relative overflow-hidden aspect-square bg-dark">
          <img
            src={product.images?.[0]?.url || '/placeholder.jpg'}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {discount > 0 && (
            <span className="absolute top-3 left-3 badge bg-primary text-white text-xs font-bold">
              -{discount}%
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-dark/70 flex items-center justify-center">
              <span className="badge bg-dark-border text-gray-400 px-4 py-2 text-sm">Out of Stock</span>
            </div>
          )}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleWishlist}
              className={`p-2.5 rounded-full backdrop-blur-sm border transition-all cursor-pointer ${
                inWishlist ? 'bg-primary border-primary text-white' : 'bg-dark/80 border-dark-border hover:border-primary text-white'
              }`}
            >
              <Heart size={14} fill={inWishlist ? 'currentColor' : 'none'} />
            </button>
            <Link
              to={`/products/${product.slug}`}
              className="p-2.5 rounded-full bg-dark/80 backdrop-blur-sm border border-dark-border hover:border-primary text-white transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <Eye size={14} />
            </Link>
          </div>
        </div>

        <div className="p-4">
          <p className="text-xs text-primary mb-1 font-medium">{product.brand}</p>
          <h3 className="text-sm font-semibold text-white line-clamp-2 mb-2 leading-tight">{product.name}</h3>
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={11} className={s <= Math.round(product.ratings) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
              ))}
            </div>
            <span className="text-xs text-gray-500">({product.numReviews})</span>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg font-bold text-white">₹{(product.discountedPrice || product.price).toLocaleString()}</span>
            {discount > 0 && <span className="text-sm text-gray-500 line-through">₹{product.price.toLocaleString()}</span>}
          </div>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0 || cartLoading}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            inCart
              ? 'bg-green-500/10 border border-green-500/30 text-green-400'
              : product.stock === 0
              ? 'bg-dark-border text-gray-500 cursor-not-allowed'
              : 'bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-white'
          }`}
        >
          <ShoppingCart size={15} />
          {inCart ? 'In Cart' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </motion.div>
  );
}
