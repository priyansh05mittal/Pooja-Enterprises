import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, ChevronRight, Minus, Plus, Shield, Truck, RotateCcw, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const fetchProduct = (slug) => api.get(`/products/${slug}`).then(r => r.data.product);

export default function ProductDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { addToCart, toggleWishlist, isInWishlist, cartLoading } = useCart();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const { data: product, isLoading, refetch } = useQuery({ queryKey: ['product', slug], queryFn: () => fetchProduct(slug) });

  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="skeleton aspect-square rounded-2xl" />
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-6 rounded w-full" style={{ width: `${[60,90,40,70,50,80][i]}%` }} />)}
      </div>
    </div>
  );

  if (!product) return <div className="text-center py-20"><h2 className="font-display text-2xl">Product not found</h2></div>;

  const discountPct = product.discountedPrice
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please login first'); return; }
    const ok = await addToCart(product._id, qty);
    if (ok) toast.success('Added to cart!');
  };

  const handleWishlist = async () => {
    if (!user) { toast.error('Please login first'); return; }
    const added = await toggleWishlist(product._id);
    toast.success(added ? 'Added to wishlist' : 'Removed from wishlist');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to review'); return; }
    setSubmittingReview(true);
    try {
      await api.post(`/products/${product._id}/review`, reviewForm);
      toast.success('Review submitted!');
      refetch();
      setReviewForm({ rating: 5, comment: '' });
    } catch {} finally { setSubmittingReview(false); }
  };

  const inWishlist = isInWishlist(product._id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={14} />
        <Link to="/products" className="hover:text-primary transition-colors">Products</Link>
        <ChevronRight size={14} />
        <span className="text-white">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">
        {/* Images */}
        <div>
          <motion.div
            key={activeImg}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-square rounded-2xl overflow-hidden bg-dark-card border border-dark-border mb-4"
          >
            <img
              src={product.images?.[activeImg]?.url || '/placeholder.jpg'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </motion.div>
          {product.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-20 h-20 rounded-xl border-2 overflow-hidden shrink-0 cursor-pointer transition-all ${activeImg === i ? 'border-primary' : 'border-dark-border hover:border-primary/50'}`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.brand && <p className="text-primary font-medium text-sm mb-2">{product.brand}</p>}
          <h1 className="font-display text-3xl font-bold text-white mb-4">{product.name}</h1>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={16} className={s <= Math.round(product.ratings) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
              ))}
            </div>
            <span className="text-sm text-gray-400">{product.ratings} ({product.numReviews} reviews)</span>
          </div>

          <div className="flex items-baseline gap-4 mb-6">
            <span className="font-display text-4xl font-bold text-white">₹{(product.discountedPrice || product.price).toLocaleString()}</span>
            {discountPct > 0 && (
              <>
                <span className="text-lg text-gray-400 line-through">₹{product.price.toLocaleString()}</span>
                <span className="badge bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1">
                  {discountPct}% OFF
                </span>
              </>
            )}
          </div>

          <p className="text-gray-300 leading-relaxed mb-6 text-sm">{product.description}</p>

          {product.features?.length > 0 && (
            <ul className="space-y-2 mb-6">
              {product.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <Check size={15} className="text-primary shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
          )}

          {product.attributes?.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              {product.attributes.map((attr, i) => (
                <div key={i} className="bg-dark border border-dark-border rounded-lg px-3 py-2">
                  <p className="text-xs text-gray-500 mb-0.5">{attr.key}</p>
                  <p className="text-sm font-medium text-white">{attr.value}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 mb-5">
            <span className="text-sm text-gray-400">Status:</span>
            <span className={`badge ${product.stock > 0 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'} px-3 py-1`}>
              {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
            </span>
          </div>

          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm text-gray-400">Quantity:</span>
              <div className="flex items-center border border-dark-border rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-primary/10 transition-colors cursor-pointer"><Minus size={15} /></button>
                <span className="w-12 text-center font-semibold">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-primary/10 transition-colors cursor-pointer"><Plus size={15} /></button>
              </div>
            </div>
          )}

          <div className="flex gap-3 mb-8">
            <button onClick={handleAddToCart} disabled={product.stock === 0 || cartLoading} className="btn-primary flex-1 justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              <ShoppingCart size={17} /> {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button onClick={handleWishlist} className={`p-3 rounded-xl border transition-all cursor-pointer ${inWishlist ? 'bg-primary border-primary text-white' : 'border-dark-border hover:border-primary text-gray-400 hover:text-primary'}`}>
              <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              [Truck, 'Free Shipping', 'Over ₹500'],
              [Shield, 'Secure Pay', 'Razorpay'],
              [RotateCcw, 'Easy Return', '7 days'],
            ].map(([Icon, title, sub]) => (
              <div key={title} className="card text-center py-3">
                <Icon size={20} className="text-primary mx-auto mb-1.5" />
                <p className="text-xs font-semibold">{title}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="border-t border-dark-border pt-10">
        <h2 className="font-display text-2xl font-bold mb-8">Customer Reviews</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            {product.reviews?.length === 0 ? (
              <p className="text-gray-400">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-5">
                {product.reviews.map((r, i) => (
                  <div key={i} className="card">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center">{r.name[0]}</div>
                        <span className="font-semibold text-sm">{r.name}</span>
                      </div>
                      <div className="flex">
                        {[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />)}
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm">{r.comment}</p>
                    <p className="text-xs text-gray-500 mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {user && (
            <form onSubmit={handleReviewSubmit} className="card">
              <h3 className="font-semibold mb-4">Write a Review</h3>
              <div className="mb-4">
                <label className="text-xs text-gray-400 mb-2 block">Rating</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onClick={() => setReviewForm(f => ({...f, rating: s}))} className="cursor-pointer">
                      <Star size={24} className={s <= reviewForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="text-xs text-gray-400 mb-2 block">Comment</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(f => ({...f, comment: e.target.value}))}
                  rows={4}
                  required
                  className="input resize-none"
                  placeholder="Share your thoughts..."
                />
              </div>
              <button type="submit" disabled={submittingReview} className="btn-primary w-full justify-center">
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
