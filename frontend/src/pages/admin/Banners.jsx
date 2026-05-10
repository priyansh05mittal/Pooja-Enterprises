import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Check, Image as ImageIcon, MousePointer } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const emptyBanner = { title: '', subtitle: '', redirectType: 'url', redirectValue: '', startDate: '', endDate: '', isActive: true, order: 0, image: {} };

export default function AdminBanners() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyBanner);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['adminBanners'],
    queryFn: () => api.get('/banners').then(r => r.data.banners),
  });

  const openNew = () => { setForm(emptyBanner); setEditing(null); setShowForm(true); };
  const openEdit = (b) => { setForm({ ...b, startDate: b.startDate?.slice(0, 10) || '', endDate: b.endDate?.slice(0, 10) || '' }); setEditing(b._id); setShowForm(true); };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('images', file);
    try {
      const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(f => ({ ...f, image: data.images[0] }));
      toast.success('Image uploaded!');
    } catch {} finally { setUploading(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/banners/${editing}`, form);
        toast.success('Banner updated');
      } else {
        await api.post('/banners', form);
        toast.success('Banner created');
      }
      qc.invalidateQueries(['adminBanners']);
      setShowForm(false);
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this banner?')) return;
    await api.delete(`/banners/${id}`);
    toast.success('Banner deleted');
    qc.invalidateQueries(['adminBanners']);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Banners</h1>
        <button onClick={openNew} className="btn-primary text-sm"><Plus size={16} /> Add Banner</button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-52 rounded-2xl" />)}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map(banner => (
            <div key={banner._id} className="card overflow-hidden group">
              <div className="aspect-video rounded-xl overflow-hidden bg-dark mb-3">
                {banner.image?.url
                  ? <img src={banner.image.url} alt={banner.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  : <div className="w-full h-full flex items-center justify-center text-gray-600"><ImageIcon size={32} /></div>
                }
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-white">{banner.title}</h3>
                  {banner.subtitle && <p className="text-xs text-gray-400 mt-0.5">{banner.subtitle}</p>}
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`badge border text-xs px-2 py-0.5 ${banner.isActive ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <MousePointer size={11} className="text-primary" /> {banner.clicks} clicks
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(banner)} className="p-1.5 hover:bg-primary/10 rounded-lg text-gray-400 hover:text-primary cursor-pointer transition-all"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(banner._id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 cursor-pointer transition-all"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
          {!banners.length && <div className="col-span-3 text-center text-gray-400 py-16">No banners yet. Add your first banner!</div>}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-dark-border sticky top-0 bg-dark-card z-10">
                <h2 className="font-semibold text-lg">{editing ? 'Edit Banner' : 'Add Banner'}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-primary/10 rounded-lg cursor-pointer"><X size={18} /></button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block font-medium">Banner Image</label>
                  <div className="aspect-video rounded-xl overflow-hidden bg-dark border border-dark-border mb-2">
                    {form.image?.url
                      ? <img src={form.image.url} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={40} className="text-gray-600" /></div>
                    }
                  </div>
                  <label className="btn-outline text-sm py-2 cursor-pointer inline-flex">
                    {uploading ? 'Uploading...' : 'Upload Image'}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
                {[['title', 'Title *', 'text', true], ['subtitle', 'Subtitle', 'text', false]].map(([k, label, type, req]) => (
                  <div key={k}>
                    <label className="text-xs text-gray-400 mb-1.5 block font-medium">{label}</label>
                    <input type={type} required={req} value={form[k]} onChange={e => setForm(f => ({...f, [k]: e.target.value}))} className="input py-2 text-sm" />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block font-medium">Redirect Type</label>
                    <select value={form.redirectType} onChange={e => setForm(f => ({...f, redirectType: e.target.value}))} className="input py-2 text-sm">
                      {['url', 'product', 'category'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block font-medium">Redirect Value</label>
                    <input value={form.redirectValue} onChange={e => setForm(f => ({...f, redirectValue: e.target.value}))} placeholder="URL or ID" className="input py-2 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[['startDate', 'Start Date'], ['endDate', 'End Date']].map(([k, label]) => (
                    <div key={k}>
                      <label className="text-xs text-gray-400 mb-1.5 block font-medium">{label}</label>
                      <input type="date" value={form[k]} onChange={e => setForm(f => ({...f, [k]: e.target.value}))} className="input py-2 text-sm" />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block font-medium">Order</label>
                    <input type="number" value={form.order} onChange={e => setForm(f => ({...f, order: Number(e.target.value)}))} className="input py-2 text-sm" />
                  </div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({...f, isActive: e.target.checked}))} className="w-4 h-4 accent-primary" />
                      Active
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 pt-2 border-t border-dark-border">
                  <button type="submit" disabled={saving} className="btn-primary text-sm"><Check size={15} /> {saving ? 'Saving...' : 'Save Banner'}</button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-outline text-sm">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
