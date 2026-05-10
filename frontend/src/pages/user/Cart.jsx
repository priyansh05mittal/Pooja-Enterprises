import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function Cart() {
  const { cart, updateCartItem, removeFromCart } = useCart();

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, i) => sum + (i.price || i.product?.price || 0) * i.quantity, 0);
  const shipping = subtotal > 500 ? 0 : 50;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  if (items.length === 0) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <ShoppingBag size={72} className="text-gray-600 mx-auto mb-6" />
      <h2 className="font-display text-3xl font-bold mb-3">Your cart is empty</h2>
      <p className="text-gray-400 mb-8">Looks like you haven't added anything yet.</p>
      <Link to="/products" className="btn-primary">Browse Products <ArrowRight size={16} /></Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl font-bold mb-8">Shopping Cart <span className="text-gray-400 text-lg font-body font-normal">({items.length} items)</span></h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {items.map(item => {
              const product = item.product;
              const price = item.price || product?.discountedPrice || product?.price || 0;
              return (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  className="card flex gap-4"
                >
                  <Link to={`/products/${product?.slug}`} className="shrink-0">
                    <img src={product?.images?.[0]?.url} alt={product?.name || item.name} className="w-24 h-24 rounded-xl object-cover border border-dark-border" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${product?.slug}`} className="font-semibold text-white hover:text-primary transition-colors line-clamp-2 text-sm">{product?.name || item.name}</Link>
                    <p className="text-primary font-bold text-lg mt-1">₹{price.toLocaleString()}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-dark-border rounded-xl overflow-hidden">
                        <button onClick={() => updateCartItem(item._id, item.quantity - 1)} className="w-9 h-9 flex items-center justify-center hover:bg-primary/10 transition-colors cursor-pointer"><Minus size={14} /></button>
                        <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                        <button onClick={() => updateCartItem(item._id, item.quantity + 1)} disabled={item.quantity >= (product?.stock || 99)} className="w-9 h-9 flex items-center justify-center hover:bg-primary/10 transition-colors cursor-pointer disabled:opacity-40"><Plus size={14} /></button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 text-sm">₹{(price * item.quantity).toLocaleString()}</span>
                        <button onClick={() => removeFromCart(item._id)} className="p-2 text-gray-500 hover:text-red-400 transition-colors cursor-pointer rounded-lg hover:bg-red-500/10">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <h2 className="font-display text-xl font-bold mb-5">Order Summary</h2>
            <div className="space-y-3 text-sm mb-5">
              <div className="flex justify-between text-gray-300"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-gray-300"><span>Shipping</span><span className={shipping === 0 ? 'text-green-400' : ''}>{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
              <div className="flex justify-between text-gray-300"><span>Tax (18%)</span><span>₹{tax.toLocaleString()}</span></div>
              <div className="border-t border-dark-border pt-3 flex justify-between font-bold text-lg text-white"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
            </div>
            {subtotal < 500 && <p className="text-xs text-yellow-400 mb-4">Add ₹{(500 - subtotal).toLocaleString()} more for free shipping!</p>}
            <Link to="/checkout" className="btn-primary w-full justify-center text-base">
              Proceed to Checkout <ArrowRight size={17} />
            </Link>
            <Link to="/products" className="btn-outline w-full justify-center text-sm mt-3">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
