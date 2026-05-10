import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, MousePointer, Package, ShoppingBag } from 'lucide-react';
import api from '../../api/axios';

const COLORS = ['#e94560', '#0ea5e9', '#22c55e', '#f59e0b', '#a855f7', '#ec4899'];
const tooltipStyle = { backgroundColor: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: '8px', color: '#fff' };

export default function Analytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => api.get('/analytics/dashboard').then(r => r.data),
  });

  if (isLoading) return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-72 rounded-2xl" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Analytics</h1>

      {/* Revenue Area Chart */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp size={18} className="text-primary" />
          <h2 className="font-semibold">Revenue Trend (Last 30 Days)</h2>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data?.salesByDay || []}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e94560" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#e94560" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
            <XAxis dataKey="_id" tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => v?.slice(5)} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip contentStyle={tooltipStyle} formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']} />
            <Area type="monotone" dataKey="revenue" stroke="#e94560" strokeWidth={2} fill="url(#revenueGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="card">
          <h2 className="font-semibold mb-5">Category Distribution</h2>
          {data?.categoryDistribution?.length > 0 ? (
            <div className="flex flex-col gap-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={data.categoryDistribution} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50}>
                    {data.categoryDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2">
                {data.categoryDistribution.map((c, i) => (
                  <div key={c.name} className="flex items-center gap-2 text-sm">
                    <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-gray-300 truncate">{c.name}</span>
                    <span className="text-gray-500 ml-auto">{c.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <p className="text-gray-400 text-sm">No data available</p>}
        </div>

        {/* Orders by Status */}
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <ShoppingBag size={16} className="text-primary" />
            <h2 className="font-semibold">Orders by Status</h2>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data?.ordersByStatus || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis dataKey="_id" type="category" tick={{ fill: '#6b7280', fontSize: 11 }} width={90} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#e94560" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <Package size={16} className="text-primary" />
            <h2 className="font-semibold">Top Selling Products</h2>
          </div>
          <div className="space-y-4">
            {data?.topProducts?.map((p, i) => (
              <div key={p._id} className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{p.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-dark rounded-full h-1.5">
                      <div className="bg-primary h-1.5 rounded-full transition-all duration-700" style={{ width: `${(p.totalSold / (data.topProducts[0]?.totalSold || 1)) * 100}%` }} />
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{p.totalSold} sold</span>
                  </div>
                </div>
                <p className="text-sm font-semibold text-white shrink-0">₹{p.revenue?.toLocaleString()}</p>
              </div>
            ))}
            {!data?.topProducts?.length && <p className="text-gray-400 text-sm">No sales data yet</p>}
          </div>
        </div>

        {/* Banner Analytics */}
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <MousePointer size={16} className="text-primary" />
            <h2 className="font-semibold">Banner Click Analytics</h2>
          </div>
          <div className="space-y-3">
            {data?.bannerAnalytics?.map((b, i) => (
              <div key={b._id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{b.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-dark rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(b.clicks / (data.bannerAnalytics[0]?.clicks || 1)) * 100}%` }} />
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{b.clicks} clicks</span>
                  </div>
                </div>
              </div>
            ))}
            {!data?.bannerAnalytics?.length && <p className="text-gray-400 text-sm">No banner clicks yet</p>}
          </div>
        </div>

        {/* Stock Summary */}
        <div className="card lg:col-span-2">
          <h2 className="font-semibold mb-5">Stock Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'In Stock (>10)', value: data?.stockAnalysis?.inStock || 0, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
              { label: 'Low Stock (1-10)', value: data?.stockAnalysis?.lowStock || 0, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
              { label: 'Out of Stock', value: data?.stockAnalysis?.outOfStock || 0, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
              { label: 'Inactive', value: data?.stockAnalysis?.inactive || 0, color: 'text-gray-400', bg: 'bg-dark-border border-dark-border' },
            ].map(s => (
              <div key={s.label} className={`card border ${s.bg} text-center py-5`}>
                <p className={`text-4xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-2">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
