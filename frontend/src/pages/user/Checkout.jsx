import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, CreditCard, Banknote, Plus, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Checkout() {
  const { user } = useAuth();
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();
  const [selectedAddress, setSelectedAddress] = useState(user?.addresses?.findIndex(a => a.isDefault) || 0);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ name: '', phone: '', street: '', city: '', state: '', pincode: '', type: 'Home' });

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0);
  const shipping = subtotal > 500 ? 0 : 50;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/address', newAddress);
      toast.success('Address added');
      setShowAddressForm(false);
      window.location.reload();
    } catch {}
  };

  const loadRazorpay = () => new Promise(resolve => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handlePlaceOrder = async () => {
    if (!user?.addresses?.length) { toast.error('Please add a delivery address'); return; }
    const address = user.addresses[selectedAddress];
    if (!address) { toast.error('Please select a delivery address'); return; }

    setLoading(true);
    const orderItems = items.map(i => ({ product: i.product?._id || i.product, quantity: i.quantity }));
    const orderData = { items: orderItems, shippingAddress: address, paymentMethod };

    try {
      const { data } = await api.post('/orders', orderData);

      if (paymentMethod === 'Razorpay' && data.razorpayOrder) {
        const ok = await loadRazorpay();
        if (!ok) { toast.error('Payment gateway failed to load'); return; }

        const options = {
          key: data.key,
          amount: data.razorpayOrder.amount,
          currency: 'INR',
          name: 'Pooja Enterprises',
          description: `Order #${data.order._id}`,
          order_id: data.razorpayOrder.id,
          handler: async (response) => {
            try {
              await api.post('/orders/verify-payment', {
                orderId: data.order._id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              await fetchCart();
              toast.success('Payment successful!');
              navigate(`/orders/${data.order._id}`);
            } catch { toast.error('Payment verification failed'); }
          },
          prefill: { name: user.name, email: user.email, contact: user.phone },
          theme: { color: '#e94560' },
          modal: { ondismiss: () => toast.error('Payment cancelled') },
        };
        new window.Razorpay(options).open();
      } else {
        await fetchCart();
        toast.success('Order placed successfully!');
        navigate(`/orders/${data.order._id}`);
      }
    } catch {} finally { setLoading(false); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address */}
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-lg flex items-center gap-2"><MapPin size={18} className="text-primary" /> Delivery Address</h2>
              {user?.addresses?.length < 5 && (
                <button onClick={() => setShowAddressForm(!showAddressForm)} className="btn-outline py-1.5 px-4 text-sm">
                  <Plus size={14} /> Add New
                </button>
              )}
            </div>

            {showAddressForm && (
              <motion.form onSubmit={handleAddAddress} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-5 p-4 bg-dark border border-dark-border rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[['name', 'Full Name'], ['phone', 'Phone'], ['street', 'Street Address'], ['city', 'City'], ['state', 'State'], ['pincode', 'Pincode']].map(([k, label]) => (
                  <input key={k} required placeholder={label} value={newAddress[k]} onChange={e => setNewAddress(a => ({...a, [k]: e.target.value}))} className="input py-2 text-sm" />
                ))}
                <div className="sm:col-span-2 flex gap-3">
                  <button type="submit" className="btn-primary text-sm py-2">Save Address</button>
                  <button type="button" onClick={() => setShowAddressForm(false)} className="btn-outline text-sm py-2">Cancel</button>
                </div>
              </motion.form>
            )}

            {user?.addresses?.length === 0 ? (
              <p className="text-gray-400 text-sm">No addresses saved. Please add one.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {user?.addresses?.map((addr, i) => (
                  <button key={i} onClick={() => setSelectedAddress(i)} className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedAddress === i ? 'border-primary bg-primary/5' : 'border-dark-border hover:border-primary/50'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-sm">{addr.name}</p>
                        <p className="text-xs text-gray-400 mt-1">{addr.street}, {addr.city}</p>
                        <p className="text-xs text-gray-400">{addr.state} - {addr.pincode}</p>
                        <p className="text-xs text-gray-400 mt-1">{addr.phone}</p>
                      </div>
                      {selectedAddress === i && <Check size={16} className="text-primary shrink-0" />}
                    </div>
                    <span className="badge bg-dark-border text-gray-400 text-xs mt-2">{addr.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="card">
            <h2 className="font-semibold text-lg flex items-center gap-2 mb-5"><CreditCard size={18} className="text-primary" /> Payment Method</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'COD', icon: Banknote, label: 'Cash on Delivery', desc: 'Pay when you receive' },
                { id: 'Razorpay', icon: CreditCard, label: 'Online Payment', desc: 'UPI, Cards, Wallets' },
              ].map(m => (
                <button key={m.id} onClick={() => setPaymentMethod(m.id)} className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${paymentMethod === m.id ? 'border-primary bg-primary/5' : 'border-dark-border hover:border-primary/50'}`}>
                  <m.icon size={22} className={paymentMethod === m.id ? 'text-primary' : 'text-gray-400'} />
                  <div className="text-left">
                    <p className="font-semibold text-sm">{m.label}</p>
                    <p className="text-xs text-gray-400">{m.desc}</p>
                  </div>
                  {paymentMethod === m.id && <Check size={16} className="text-primary ml-auto" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="card h-fit sticky top-24">
          <h2 className="font-display text-xl font-bold mb-5">Order Summary</h2>
          <div className="space-y-3 mb-5">
            {items.map(item => (
              <div key={item._id} className="flex gap-3">
                <img src={item.product?.images?.[0]?.url} alt="" className="w-12 h-12 rounded-lg object-cover border border-dark-border shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white line-clamp-2">{item.product?.name}</p>
                  <p className="text-xs text-gray-400">Qty: {item.quantity} × ₹{item.price?.toLocaleString()}</p>
                </div>
                <p className="text-sm font-semibold shrink-0">₹{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-dark-border pt-4 space-y-2 text-sm mb-5">
            <div className="flex justify-between text-gray-300"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between text-gray-300"><span>Shipping</span><span className={shipping === 0 ? 'text-green-400' : ''}>{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
            <div className="flex justify-between text-gray-300"><span>Tax (18%)</span><span>₹{tax.toLocaleString()}</span></div>
            <div className="flex justify-between font-bold text-lg text-white pt-2 border-t border-dark-border"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
          </div>
          <button onClick={handlePlaceOrder} disabled={loading || items.length === 0} className="btn-primary w-full justify-center text-base disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Placing Order...' : paymentMethod === 'Razorpay' ? 'Pay Now' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}
