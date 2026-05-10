import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Check, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const emptyCategory = { name: '', description: '', parent: '', order: 0, isActive: true };

export default function AdminCategories() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyCategory);
  const [saving, setSaving] = useState(false);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: () => api.get('/categories/all').then(r => r.data.categories),
  });

  const roots = categories.filter(c => !c.parent);
  const getChildren = (parentId) => categories.filter(c => c.parent?.toString() === parentId?.toString());

  const openNew = () => { setForm(emptyCategory); setEditing(null); setShowForm(true); };
  const openEdit = (c) => { setForm({ ...c, parent: c.parent || '' }); setEditing(c._id); setShowForm(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/categories/${editing}`, form);
        toast.success('Category updated');
      } else {
        await api.post('/categories', form);
        toast.success('Category created');
      }
      qc.invalidateQueries(['adminCategories']);
      qc.invalidateQueries(['categories']);
      setShowForm(false);
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    await api.delete(`/categories/${id}`);
    toast.success('Category deleted');
    qc.invalidateQueries(['adminCategories']);
  };

  const CategoryRow = ({ cat, depth = 0 }) => {
    const children = getChildren(cat._id);
    return (
      <>
        <tr className="hover:bg-primary/5 transition-colors">
          <td className="py-3 pr-4">
            <div className="flex items-center gap-2" style={{ paddingLeft: depth * 24 }}>
              {depth > 0 && <ChevronRight size={14} className="text-gray-500 shrink-0" />}
              <span className="font-medium text-white">{cat.name}</span>
              {depth === 0 && <span className="badge bg-primary/20 text-primary border border-primary/30 text-xs px-1.5">Root</span>}
              {depth === 1 && <span className="badge bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs px-1.5">Sub</span>}
              {depth >= 2 && <span className="badge bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs px-1.5">Sub-sub</span>}
            </div>
          </td>
          <td className="py-3 pr-4 text-gray-400 text-sm">{cat.description || '-'}</td>
          <td className="py-3 pr-4">{cat.order}</td>
          <td className="py-3 pr-4">
            <span className={`badge border text-xs px-2 py-0.5 ${cat.isActive ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
              {cat.isActive ? 'Active' : 'Inactive'}
            </span>
          </td>
          <td className="py-3">
            <div className="flex gap-2">
              <button onClick={() => openEdit(cat)} className="p-1.5 hover:bg-primary/10 rounded-lg text-gray-400 hover:text-primary cursor-pointer transition-all"><Edit2 size={14} /></button>
              <button onClick={() => handleDelete(cat._id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 cursor-pointer transition-all"><Trash2 size={14} /></button>
            </div>
          </td>
        </tr>
        {children.map(child => <CategoryRow key={child._id} cat={child} depth={depth + 1} />)}
      </>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Categories</h1>
        <button onClick={openNew} className="btn-primary text-sm"><Plus size={16} /> Add Category</button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-border text-left">
                {['Name', 'Description', 'Order', 'Status', 'Actions'].map(h => (
                  <th key={h} className="pb-3 pr-4 text-xs text-gray-400 font-medium uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {roots.map(cat => <CategoryRow key={cat._id} cat={cat} />)}
            </tbody>
          </table>
          {!categories.length && <p className="text-center text-gray-400 py-10">No categories yet</p>}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-dark-border">
                <h2 className="font-semibold text-lg">{editing ? 'Edit Category' : 'Add Category'}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-primary/10 rounded-lg cursor-pointer"><X size={18} /></button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block font-medium">Name *</label>
                  <input required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="input py-2 text-sm" placeholder="Category name" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block font-medium">Description</label>
                  <textarea rows={2} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} className="input py-2 text-sm resize-none" placeholder="Optional description" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block font-medium">Parent Category (optional)</label>
                  <select value={form.parent} onChange={e => setForm(f => ({...f, parent: e.target.value}))} className="input py-2 text-sm">
                    <option value="">None (Root)</option>
                    {categories.filter(c => c._id !== editing).map(c => (
                      <option key={c._id} value={c._id}>{'—'.repeat(c.level)} {c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block font-medium">Display Order</label>
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
                  <button type="submit" disabled={saving} className="btn-primary text-sm"><Check size={15} /> {saving ? 'Saving...' : 'Save'}</button>
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
