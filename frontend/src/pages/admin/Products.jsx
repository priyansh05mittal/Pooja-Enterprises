import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Check, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const emptyProduct = { name: '', description: '', price: '', discountedPrice: '', brand: '', stock: '', category: '', isFeatured: false, isActive: true, attributes: [], features: [], images: [] };

export default function AdminProducts() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['adminProducts', page],
    queryFn: () => api.get(`/products/admin?page=${page}&limit=15`).then(r => r.data),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories/all').then(r => r.data.categories),
  });

  const openNew = () => { setForm(emptyProduct); setEditing(null); setShowForm(true); };
  const openEdit = (p) => {
    setForm({ ...p, category: p.category?._id || p.category, price: p.price || '', discountedPrice: p.discountedPrice || '' });
    setEditing(p._id);
    setShowForm(true);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const fd = new FormData();
    files.forEach(f => fd.append('images', f));
    try {
      const { data: res } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(f => ({ ...f, images: [...f.images, ...res.images] }));
      toast.success('Images uploaded!');
    } catch {} finally { setUploading(false); }
  };

  const addAttribute = () => setForm(f => ({ ...f, attributes: [...f.attributes, { key: '', value: '' }] }));
  const updateAttr = (i, field, val) => setForm(f => {
    const attrs = [...f.attributes];
    attrs[i] = { ...attrs[i], [field]: val };
    return { ...f, attributes: attrs };
  });
  const removeAttr = (i) => setForm(f => ({ ...f, attributes: f.attributes.filter((_, idx) => idx !== i) }));

  const addFeature = () => setForm(f => ({ ...f, features: [...f.features, ''] }));
  const updateFeature = (i, val) => setForm(f => { const feats = [...f.features]; feats[i] = val; return { ...f, features: feats }; });
  const removeFeature = (i) => setForm(f => ({ ...f, features: f.features.filter((_, idx) => idx !== i) }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/products/${editing}`, form);
        toast.success('Product updated');
      } else {
        await api.post('/products', form);
        toast.success('Product created');
      }
      qc.invalidateQueries(['adminProducts']);
      setShowForm(false);
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    toast.success('Product deleted');
    qc.invalidateQueries(['adminProducts']);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Products</h1>
        <button onClick={openNew} className="btn-primary text-sm"><Plus size={16} /> Add Product</button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-border text-left">
                {['Image', 'Name', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} className="pb-3 pr-4 text-xs text-gray-400 font-medium uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {data?.products?.map(p => (
                <tr key={p._id} className="hover:bg-primary/5 transition-colors">
                  <td className="py-3 pr-4">
                    <img src={p.images?.[0]?.url || '/placeholder.jpg'} alt="" className="w-10 h-10 rounded-lg object-cover border border-dark-border" />
                  </td>
                  <td className="py-3 pr-4">
                    <p className="font-medium text-white">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.brand}</p>
                  </td>
                  <td className="py-3 pr-4 text-gray-400">{p.category?.name || '-'}</td>
                  <td className="py-3 pr-4">
                    <p className="text-white font-medium">₹{(p.discountedPrice || p.price).toLocaleString()}</p>
                    {p.discountedPrice && <p className="text-xs text-gray-500 line-through">₹{p.price.toLocaleString()}</p>}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`badge border px-2 py-0.5 text-xs ${p.stock === 0 ? 'bg-red-500/20 text-red-400 border-red-500/30' : p.stock <= 10 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`badge border px-2 py-0.5 text-xs ${p.isActive ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="p-2 hover:bg-primary/10 rounded-lg text-gray-400 hover:text-primary transition-all cursor-pointer"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(p._id)} className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-all cursor-pointer"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.pages > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {Array.from({ length: data.pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 rounded-lg text-sm font-medium transition-all cursor-pointer ${page === p ? 'bg-primary text-white' : 'bg-dark-card border border-dark-border text-gray-400 hover:border-primary'}`}>{p}</button>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
            <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }} className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-2xl">
              <div className="flex items-center justify-between p-6 border-b border-dark-border">
                <h2 className="font-semibold text-lg">{editing ? 'Edit Product' : 'Add Product'}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-primary/10 rounded-lg cursor-pointer"><X size={18} /></button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-400 mb-1.5 block font-medium">Product Name *</label>
                    <input required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="input py-2 text-sm" placeholder="Product name" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-400 mb-1.5 block font-medium">Description *</label>
                    <textarea required rows={3} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} className="input py-2 text-sm resize-none" placeholder="Product description" />
                  </div>
                  {[['price', 'Price (₹) *', true], ['discountedPrice', 'Discounted Price (₹)', false], ['brand', 'Brand', false], ['stock', 'Stock *', true]].map(([k, label, req]) => (
                    <div key={k}>
                      <label className="text-xs text-gray-400 mb-1.5 block font-medium">{label}</label>
                      <input required={req} type={['price', 'discountedPrice', 'stock'].includes(k) ? 'number' : 'text'} value={form[k]} onChange={e => setForm(f => ({...f, [k]: e.target.value}))} className="input py-2 text-sm" placeholder={label} />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block font-medium">Category *</label>
                    <select required value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className="input py-2 text-sm">
                      <option value="">Select category</option>
                      {(categoriesData || []).map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-5 pt-4">
                    {[['isFeatured', 'Featured'], ['isActive', 'Active']].map(([k, label]) => (
                      <label key={k} className="flex items-center gap-2 cursor-pointer text-sm">
                        <input type="checkbox" checked={form[k]} onChange={e => setForm(f => ({...f, [k]: e.target.checked}))} className="w-4 h-4 accent-primary" />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Images */}
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block font-medium">Images</label>
                  <div className="flex flex-wrap gap-3 mb-3">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative">
                        <img src={img.url} alt="" className="w-16 h-16 rounded-lg object-cover border border-dark-border" />
                        <button type="button" onClick={() => setForm(f => ({...f, images: f.images.filter((_, idx) => idx !== i)}))} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center cursor-pointer">
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                    <label className="w-16 h-16 rounded-lg border-2 border-dashed border-dark-border hover:border-primary flex items-center justify-center cursor-pointer transition-colors">
                      {uploading ? <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <ImageIcon size={20} className="text-gray-500" />}
                      <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Attributes */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-gray-400 font-medium">Attributes</label>
                    <button type="button" onClick={addAttribute} className="text-xs text-primary hover:underline cursor-pointer">+ Add</button>
                  </div>
                  {form.attributes.map((attr, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input value={attr.key} onChange={e => updateAttr(i, 'key', e.target.value)} placeholder="Key" className="input py-1.5 text-sm flex-1" />
                      <input value={attr.value} onChange={e => updateAttr(i, 'value', e.target.value)} placeholder="Value" className="input py-1.5 text-sm flex-1" />
                      <button type="button" onClick={() => removeAttr(i)} className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg cursor-pointer"><X size={14} /></button>
                    </div>
                  ))}
                </div>

                {/* Features */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-gray-400 font-medium">Features</label>
                    <button type="button" onClick={addFeature} className="text-xs text-primary hover:underline cursor-pointer">+ Add</button>
                  </div>
                  {form.features.map((feat, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input value={feat} onChange={e => updateFeature(i, e.target.value)} placeholder="Feature description" className="input py-1.5 text-sm flex-1" />
                      <button type="button" onClick={() => removeFeature(i)} className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg cursor-pointer"><X size={14} /></button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-2 border-t border-dark-border">
                  <button type="submit" disabled={saving} className="btn-primary text-sm"><Check size={15} /> {saving ? 'Saving...' : 'Save Product'}</button>
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
