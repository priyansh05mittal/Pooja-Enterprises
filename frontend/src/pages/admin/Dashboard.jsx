import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingBag, Users, Package, TrendingUp } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../api/axios';

const COLORS = ['#e94560', '#0ea5e9', '#22c55e', '#f59e0b', '#a855f7', '#ec4899'];

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: () => api.get('/analytics/dashboard').then(r => r.data),
    refetchInterval: 60000,
  });

  const statCards = data ? [
    { label: 'Total Revenue', value: `₹${data.stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
    { label: 'Total Orders', value: data.stats.totalOrders, icon: ShoppingBag, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Total Users', value: data.stats.totalUsers, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { label: 'Total Products', value: data.stats.totalProducts, icon: Package, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    { label: 'Recent Orders (30d)', value: data.stats.recentOrders, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
  ] : [];

  if (isLoading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}
      </div>
    </div>
  );

  const tooltipStyle = { backgroundColor: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: '8px', color: '#fff' };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className={`card border ${card.bg}`}>
            <div className="flex items-start justify-between mb-3">
              <card.icon size={20} className={card.color} />
            </div>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-gray-400 mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card">
          <h3 className="font-semibold mb-4">Revenue (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data?.salesByDay || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis dataKey="_id" tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => v?.slice(5)} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#e94560" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="card">
          <h3 className="font-semibold mb-4">Orders (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.salesByDay || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis dataKey="_id" tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => v?.slice(5)} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="orders" fill="#e94560" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="card">
          <h3 className="font-semibold mb-4">Category Distribution</h3>
          {data?.categoryDistribution?.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={data.categoryDistribution} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                    {data.categoryDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {data.categoryDistribution.map((c, i) => (
                  <div key={c.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-gray-300">{c.name}</span>
                    <span className="text-gray-500 ml-auto pl-3">{c.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <p className="text-gray-400 text-sm">No data</p>}
        </div>

        {/* Top Products */}
        <div className="card">
          <h3 className="font-semibold mb-4">Top Selling Products</h3>
          <div className="space-y-3">
            {data?.topProducts?.map((p, i) => (
              <div key={p._id} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.totalSold} sold · ₹{p.revenue?.toLocaleString()}</p>
                </div>
                <div className="w-24 bg-dark rounded-full h-1.5">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: `${(p.totalSold / (data.topProducts[0].totalSold || 1)) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Analysis */}
        <div className="card">
          <h3 className="font-semibold mb-4">Stock Analysis</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'In Stock', value: data?.stockAnalysis?.inStock || 0, color: 'text-green-400', bg: 'bg-green-500/10' },
              { label: 'Low Stock', value: data?.stockAnalysis?.lowStock || 0, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
              { label: 'Out of Stock', value: data?.stockAnalysis?.outOfStock || 0, color: 'text-red-400', bg: 'bg-red-500/10' },
              { label: 'Inactive', value: data?.stockAnalysis?.inactive || 0, color: 'text-gray-400', bg: 'bg-dark-border' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Orders by Status */}
        <div className="card">
          <h3 className="font-semibold mb-4">Orders by Status</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data?.ordersByStatus || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis dataKey="_id" type="category" tick={{ fill: '#6b7280', fontSize: 11 }} width={80} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#e94560" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
