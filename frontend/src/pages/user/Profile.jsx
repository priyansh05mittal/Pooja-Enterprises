import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, MapPin, Package, Heart, ShoppingCart, Edit2, Check, X, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Profile() {
  const { user, setUser } = useAuth();
  const { cartCount } = useCart();
  const [activeTab, setActiveTab] = useState('info');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [loading, setLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ name: '', phone: '', street: '', city: '', state: '', pincode: '', type: 'Home' });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/auth/profile', form);
      setUser(data.user);
      toast.success('Profile updated!');
      setEditing(false);
    } catch {} finally { setLoading(false); }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/address', newAddress);
      setUser(u => ({ ...u, addresses: data.addresses }));
      toast.success('Address added');
      setShowAddressForm(false);
      setNewAddress({ name: '', phone: '', street: '', city: '', state: '', pincode: '', type: 'Home' });
    } catch {}
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const { data } = await api.delete(`/auth/address/${addressId}`);
      setUser(u => ({ ...u, addresses: data.addresses }));
      toast.success('Address deleted');
    } catch {}
  };

  const tabs = [
    { id: 'info', label: 'Personal Info', icon: User },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
  ];

  const quickLinks = [
    { to: '/orders', icon: Package, label: 'My Orders', color: 'text-blue-400' },
    { to: '/wishlist', icon: Heart, label: 'Wishlist', color: 'text-red-400' },
    { to: '/cart', icon: ShoppingCart, label: `Cart (${cartCount})`, color: 'text-green-400' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card text-center">
            <div className="w-20 h-20 rounded-full bg-primary/20 border-4 border-primary/30 flex items-center justify-center mx-auto mb-3 text-3xl font-bold text-primary">
              {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : user?.name?.[0]}
            </div>
            <p className="font-semibold text-lg">{user?.name}</p>
            <p className="text-gray-400 text-sm">{user?.email}</p>
            <span className="badge bg-primary/20 text-primary border border-primary/30 mt-2 px-3 py-1 capitalize">{user?.role}</span>
          </div>

          <div className="card space-y-1">
            <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Quick Links</p>
            {quickLinks.map(({ to, icon: Icon, label, color }) => (
              <Link key={to} to={to} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary/5 transition-colors text-sm">
                <Icon size={16} className={color} /> {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Main */}
        <div className="lg:col-span-3">
          <div className="flex border-b border-dark-border mb-6">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)} className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all cursor-pointer ${activeTab === id ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'}`}>
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>

          {activeTab === 'info' && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-lg">Personal Information</h2>
                {!editing && (
                  <button onClick={() => setEditing(true)} className="btn-outline py-1.5 px-4 text-sm">
                    <Edit2 size={14} /> Edit
                  </button>
                )}
              </div>
              {editing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block font-medium">Full Name</label>
                    <input className="input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block font-medium">Phone</label>
                    <input className="input" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="+91 xxxxx xxxxx" />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" disabled={loading} className="btn-primary text-sm py-2">
                      <Check size={14} /> {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button type="button" onClick={() => setEditing(false)} className="btn-outline text-sm py-2">
                      <X size={14} /> Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    ['Name', user?.name],
                    ['Email', user?.email],
                    ['Phone', user?.phone || 'Not set'],
                    ['Member Since', new Date(user?.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-dark border border-dark-border rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">{label}</p>
                      <p className="text-sm font-medium text-white">{value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">Saved Addresses</h2>
                {(user?.addresses?.length || 0) < 5 && (
                  <button onClick={() => setShowAddressForm(!showAddressForm)} className="btn-primary text-sm py-2 px-4">
                    <Plus size={14} /> Add Address
                  </button>
                )}
              </div>

              {showAddressForm && (
                <motion.form onSubmit={handleAddAddress} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[['name', 'Full Name'], ['phone', 'Phone Number'], ['street', 'Street Address'], ['city', 'City'], ['state', 'State'], ['pincode', 'Pincode']].map(([k, label]) => (
                    <input key={k} required placeholder={label} value={newAddress[k]} onChange={e => setNewAddress(a => ({...a, [k]: e.target.value}))} className="input py-2 text-sm" />
                  ))}
                  <select value={newAddress.type} onChange={e => setNewAddress(a => ({...a, type: e.target.value}))} className="input py-2 text-sm">
                    {['Home', 'Work', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <div className="sm:col-span-2 flex gap-3">
                    <button type="submit" className="btn-primary text-sm py-2">Save</button>
                    <button type="button" onClick={() => setShowAddressForm(false)} className="btn-outline text-sm py-2">Cancel</button>
                  </div>
                </motion.form>
              )}

              {(!user?.addresses?.length) ? (
                <div className="card text-center py-10">
                  <MapPin size={40} className="text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No addresses saved yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.addresses.map((addr) => (
                    <div key={addr._id} className="card relative">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="badge bg-primary/20 text-primary border border-primary/30 text-xs px-2">{addr.type}</span>
                          {addr.isDefault && <span className="badge bg-green-500/20 text-green-400 border border-green-500/30 text-xs px-2">Default</span>}
                        </div>
                        <button onClick={() => handleDeleteAddress(addr._id)} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors cursor-pointer rounded hover:bg-red-500/10">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="font-semibold text-sm text-white">{addr.name}</p>
                      <p className="text-xs text-gray-400 mt-1">{addr.street}</p>
                      <p className="text-xs text-gray-400">{addr.city}, {addr.state} - {addr.pincode}</p>
                      <p className="text-xs text-gray-400 mt-1">{addr.phone}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
