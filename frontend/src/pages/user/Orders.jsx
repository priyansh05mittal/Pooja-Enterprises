import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ChevronRight, Clock } from 'lucide-react';
import api from '../../api/axios';

const statusColors = {
  Placed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Confirmed: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  Processing: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
  Cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function Orders() {
  const { data, isLoading } = useQuery({
    queryKey: ['myOrders'],
    queryFn: () => api.get('/orders/my').then(r => r.data.orders),
  });

  if (isLoading) return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
    </div>
  );

  if (!data?.length) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <Package size={72} className="text-gray-600 mx-auto mb-6" />
      <h2 className="font-display text-3xl font-bold mb-3">No orders yet</h2>
      <p className="text-gray-400 mb-8">Start shopping to see your orders here.</p>
      <Link to="/products" className="btn-primary">Browse Products</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl font-bold mb-8">My Orders</h1>
      <div className="space-y-4">
        {data.map((order, i) => (
          <motion.div key={order._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link to={`/orders/${order._id}`} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/40 transition-all block group">
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-xl bg-dark border border-dark-border overflow-hidden shrink-0">
                  <img src={order.items?.[0]?.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Order #{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-white font-medium line-clamp-1">
                    {order.items?.map(i => i.name).join(', ')}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Clock size={11} /> {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <p className="text-primary font-bold mt-1">₹{order.totalPrice?.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge border px-3 py-1.5 text-xs font-medium ${statusColors[order.status] || ''}`}>
                  {order.status}
                </span>
                <ChevronRight size={16} className="text-gray-500 group-hover:text-primary transition-colors" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
