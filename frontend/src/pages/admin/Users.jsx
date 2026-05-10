import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldOff, ShieldCheck, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function AdminUsers() {
  const qc = useQueryClient();
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [toggling, setToggling] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['adminUsers', page, keyword],
    queryFn: () => api.get(`/users?page=${page}&limit=15${keyword ? `&keyword=${keyword}` : ''}`).then(r => r.data),
    keepPreviousData: true,
  });

  const handleToggleBlock = async (userId, isBlocked) => {
    setToggling(userId);
    try {
      const { data: res } = await api.put(`/users/${userId}/block`);
      toast.success(res.message);
      qc.invalidateQueries(['adminUsers']);
    } catch {} finally { setToggling(null); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl font-bold">Users</h1>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={keyword}
            onChange={e => { setKeyword(e.target.value); setPage(1); }}
            placeholder="Search users..."
            className="input py-2 pl-9 w-56 text-sm"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-border text-left">
                {['User', 'Email', 'Phone', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="pb-3 pr-4 text-xs text-gray-400 font-medium uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {data?.users?.map(user => (
                <tr key={user._id} className="hover:bg-primary/5 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/20 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                        {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : user.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.isVerified ? 'Verified' : 'Unverified'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-gray-300">{user.email}</td>
                  <td className="py-3 pr-4 text-gray-400">{user.phone || '-'}</td>
                  <td className="py-3 pr-4">
                    <span className={`badge border px-2 py-0.5 text-xs ${user.isBlocked ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>
                      {user.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-400 text-xs">{new Date(user.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="py-3">
                    <button
                      onClick={() => handleToggleBlock(user._id, user.isBlocked)}
                      disabled={toggling === user._id}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all disabled:opacity-50 ${
                        user.isBlocked
                          ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30'
                          : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30'
                      }`}
                    >
                      {user.isBlocked ? <ShieldCheck size={13} /> : <ShieldOff size={13} />}
                      {user.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!data?.users?.length) && <p className="text-center text-gray-400 py-10">No users found</p>}
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
