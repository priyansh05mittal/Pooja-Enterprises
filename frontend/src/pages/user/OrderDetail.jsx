import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Package, MapPin, CreditCard, CheckCircle, Circle, ChevronLeft } from 'lucide-react';
import api from '../../api/axios';

const statusSteps = ['Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

const statusColors = {
  Placed: 'text-blue-400', Confirmed: 'text-indigo-400', Processing: 'text-yellow-400',
  Shipped: 'text-purple-400', Delivered: 'text-green-400', Cancelled: 'text-red-400',
};

export default function OrderDetail() {
  const { id } = useParams();
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}`).then(r => r.data.order),
  });

  if (isLoading) return <div className="max-w-4xl mx-auto px-4 py-10"><div className="skeleton h-96 rounded-2xl" /></div>;
  if (!order) return <div className="text-center py-20">Order not found</div>;

  const currentStep = order.status === 'Cancelled' ? -1 : statusSteps.indexOf(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link to="/orders" className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors mb-6 text-sm">
        <ChevronLeft size={16} /> Back to Orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold">Order Details</h1>
          <p className="text-gray-400 text-sm mt-1">#{order._id.slice(-12).toUpperCase()}</p>
        </div>
        <span className={`badge border px-4 py-1.5 text-sm font-medium ${
          order.status === 'Delivered' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
          order.status === 'Cancelled' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
          'bg-primary/20 text-primary border-primary/30'
        }`}>{order.status}</span>
      </div>

      {/* Timeline */}
      {order.status !== 'Cancelled' && (
        <div className="card mb-6">
          <h2 className="font-semibold mb-6">Order Progress</h2>
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 h-0.5 bg-dark-border top-5 z-0" />
            <div className="absolute left-0 h-0.5 bg-primary top-5 z-0 transition-all duration-700" style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }} />
            {statusSteps.map((step, i) => (
              <div key={step} className="flex flex-col items-center gap-2 z-10 relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  i <= currentStep ? 'bg-primary border-primary text-white' : 'bg-dark border-dark-border text-gray-500'
                }`}>
                  {i < currentStep ? <CheckCircle size={18} /> : <Circle size={18} />}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${i <= currentStep ? 'text-white' : 'text-gray-500'}`}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline Log */}
      {order.timeline?.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-semibold mb-4">Activity</h2>
          <div className="space-y-3">
            {[...order.timeline].reverse().map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">{t.description}</p>
                  <p className="text-xs text-gray-500">{new Date(t.date).toLocaleString('en-IN')}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Items */}
          <div className="card">
            <h2 className="font-semibold mb-4 flex items-center gap-2"><Package size={16} className="text-primary" /> Items Ordered</h2>
            <div className="space-y-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-4 pb-4 border-b border-dark-border last:border-0 last:pb-0">
                  <img src={item.image || item.product?.images?.[0]?.url} alt={item.name} className="w-16 h-16 rounded-xl object-cover border border-dark-border shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{item.name}</p>
                    <p className="text-xs text-gray-400 mt-1">Qty: {item.quantity} × ₹{item.price?.toLocaleString()}</p>
                  </div>
                  <p className="font-semibold text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card">
            <h2 className="font-semibold mb-4 flex items-center gap-2"><MapPin size={16} className="text-primary" /> Delivery Address</h2>
            <div className="text-sm text-gray-300 space-y-1">
              <p className="font-medium text-white">{order.shippingAddress?.name}</p>
              <p>{order.shippingAddress?.street}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
              <p className="text-gray-400">{order.shippingAddress?.phone}</p>
            </div>
          </div>
        </div>

        {/* Price Summary */}
        <div className="card h-fit">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><CreditCard size={16} className="text-primary" /> Payment Info</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-300"><span>Method</span><span className="font-medium text-white">{order.paymentMethod}</span></div>
            <div className="flex justify-between text-gray-300"><span>Status</span>
              <span className={order.isPaid ? 'text-green-400' : 'text-yellow-400'}>{order.isPaid ? 'Paid' : 'Pending'}</span>
            </div>
            <div className="border-t border-dark-border pt-3 mt-3 space-y-2">
              <div className="flex justify-between text-gray-300"><span>Subtotal</span><span>₹{order.itemsPrice?.toLocaleString()}</span></div>
              <div className="flex justify-between text-gray-300"><span>Shipping</span><span>{order.shippingPrice === 0 ? 'Free' : `₹${order.shippingPrice}`}</span></div>
              <div className="flex justify-between text-gray-300"><span>Tax</span><span>₹{order.taxPrice?.toLocaleString()}</span></div>
              <div className="flex justify-between font-bold text-white text-base pt-2 border-t border-dark-border">
                <span>Total</span><span className="text-primary">₹{order.totalPrice?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
