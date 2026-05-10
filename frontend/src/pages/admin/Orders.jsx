import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Eye, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const statusColors = {
  Placed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Confirmed: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  Processing: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
  Cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};
const statusOptions = ['Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['adminOrders', page, statusFilter],
    queryFn: () => api.get(`/orders?page=${page}&limit=15${statusFilter ? `&status=${statusFilter}` : ''}`).then(r => r.data),
  });

  const handleStatusUpdate = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      toast.success(`Order status updated to ${status}`);
      qc.invalidateQueries(['adminOrders']);
    } catch {} finally { setUpdatingId(null); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl font-bold">Orders</h1>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="input py-2 w-44 text-sm">
          <option value="">All Status</option>
          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-border text-left">
                {['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="pb-3 pr-4 text-xs text-gray-400 font-medium uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {data?.orders?.map(order => (
                <tr key={order._id} className="hover:bg-primary/5 transition-colors">
                  <td className="py-3 pr-4">
                    <p className="font-mono text-xs text-gray-300">#{order._id.slice(-8).toUpperCase()}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <p className="text-white font-medium">{order.user?.name}</p>
                    <p className="text-xs text-gray-400">{order.user?.email}</p>
                  </td>
                  <td className="py-3 pr-4 text-gray-400">{order.items?.length} item(s)</td>
                  <td className="py-3 pr-4 font-semibold text-white">₹{order.totalPrice?.toLocaleString()}</td>
                  <td className="py-3 pr-4">
                    <span className={`badge border px-2 py-0.5 text-xs ${order.isPaid ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`}>
                      {order.isPaid ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="relative">
                      <select
                        value={order.status}
                        onChange={e => handleStatusUpdate(order._id, e.target.value)}
                        disabled={updatingId === order._id || order.status === 'Cancelled' || order.status === 'Delivered'}
                        className={`badge border pl-2 pr-6 py-1 text-xs appearance-none cursor-pointer disabled:cursor-not-allowed ${statusColors[order.status] || ''}`}
                      >
                        {statusOptions.map(s => <option key={s} value={s} className="bg-dark text-white">{s}</option>)}
                      </select>
                      <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-gray-400 text-xs">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="py-3">
                    <Link to={`/orders/${order._id}`} className="p-2 hover:bg-primary/10 rounded-lg text-gray-400 hover:text-primary transition-all inline-flex" target="_blank">
                      <Eye size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!data?.orders?.length) && <p className="text-center text-gray-400 py-10">No orders found</p>}
        </div>
      )}

      {data && data.pages > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {Array.from({ length: data.pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 rounded-lg text-sm font-medium cursor-pointer transition-all ${page === p ? 'bg-primary text-white' : 'bg-dark-card border border-dark-border text-gray-400 hover:border-primary'}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
