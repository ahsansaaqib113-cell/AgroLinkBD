import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Users,
  ShieldCheck,
  TrendingUp,
  Percent,
  Sprout,
  XCircle,
  Check,
  Ban,
  Tag,
  Inbox
} from 'lucide-react';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('overview');

  // Coupon Form State
  const [newCode, setNewCode] = useState('');
  const [newType, setNewType] = useState('percentage');
  const [newValue, setNewValue] = useState('');
  const [newMinOrder, setNewMinOrder] = useState('0');
  const [newExpiry, setNewExpiry] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [analRes, userRes, prodRes, coupRes] = await Promise.all([
        api.get('/analytics/admin'),
        api.get('/auth/users'),
        api.get('/products?status=approved'), // Get products. We want pending ones so we can moderate them.
        api.get('/orders/coupons') // Admin only coupons route
      ]);

      if (analRes.data.success) setAnalytics(analRes.data.analytics);
      if (userRes.data.success) setUsers(userRes.data.users);
      if (coupRes.data.success) setCoupons(coupRes.data.coupons);

      // Fetch products that are "pending" or "approved" to simulate moderation.
      // Since productController returns all filtered status, let's fetch products with ?status=pending.
      // If there are none, we will show sample list.
      const pendingRes = await api.get('/products?status=pending');
      if (pendingRes.data.success) {
        setPendingProducts(pendingRes.data.products);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUser = async (id) => {
    try {
      const res = await api.put(`/auth/users/${id}/status`);
      if (res.data.success) {
        setUsers(prev =>
          prev.map(u => (u._id === id ? { ...u, status: res.data.user.status } : u))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle user status');
    }
  };

  const handleModerateProduct = async (productId, status) => {
    try {
      const res = await api.put(`/products/${productId}/moderate`, { status });
      if (res.data.success) {
        setPendingProducts(prev => prev.filter(p => p._id !== productId));
        fetchAdminData(); // update stats
      }
    } catch (err) {
      alert('Moderation update failed');
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!newCode || !newValue || !newExpiry) {
      alert('Please fill out all required fields.');
      return;
    }

    try {
      const payload = {
        code: newCode,
        discountType: newType,
        discountValue: Number(newValue),
        minOrderAmount: Number(newMinOrder),
        expiryDate: new Date(newExpiry),
      };

      const res = await api.post('/orders/coupons', payload);
      if (res.data.success) {
        setCouponSuccess('Coupon created successfully!');
        setNewCode('');
        setNewValue('');
        setNewMinOrder('0');
        setNewExpiry('');
        fetchAdminData();
        setTimeout(() => setCouponSuccess(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create coupon');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Admin Command Center</h1>
          <p className="text-xs text-slate-400">Moderate crops listings, manage users suspension, and configure coupon codes.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b dark:border-slate-800 pb-px mb-8">
        {[
          { id: 'overview', label: 'Platform Stats' },
          { id: 'users', label: 'Users Control' },
          { id: 'moderation', label: 'Crop Moderation' },
          { id: 'coupons', label: 'Coupons Control' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`py-2 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === t.id
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && analytics && (
            <div className="space-y-8">
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'Total Users', value: analytics.totalUsers, icon: <Users className="h-5 w-5 text-emerald-500" /> },
                  { label: 'Platform Sales', value: `৳${analytics.totalSales}`, icon: <TrendingUp className="h-5 w-5 text-emerald-500" /> },
                  { label: 'Commission (5%)', value: `৳${analytics.platformCommission}`, icon: <ShieldCheck className="h-5 w-5 text-emerald-500" /> },
                  { label: 'Total Products', value: analytics.totalProducts, icon: <Sprout className="h-5 w-5 text-emerald-500" /> }
                ].map((stat, idx) => (
                  <div key={idx} className="glass-card rounded-2xl p-5 flex items-center justify-between border shadow-sm dark:border-slate-800/10">
                    <div>
                      <span className="text-[10px] text-slate-400 block">{stat.label}</span>
                      <span className="text-xl font-bold dark:text-white block mt-1">{stat.value}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">{stat.icon}</div>
                  </div>
                ))}
              </div>

              {/* Commission Charts simulation */}
              <div className="glass-card rounded-[24px] p-6 border border-slate-100 dark:border-slate-800 space-y-4">
                <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-emerald-500" /> Commission Revenue History
                </span>
                <div className="space-y-3 pt-3">
                  {analytics.adminSalesChart.map((s, idx) => (
                    <div key={idx} className="flex items-center text-xs">
                      <span className="w-10 text-slate-400 font-semibold">{s.month}</span>
                      <div className="flex-grow bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden mx-3">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(s.commission / 8000) * 100}%` }}></div>
                      </div>
                      <span className="w-24 text-right font-bold text-slate-700 dark:text-slate-200">৳{s.commission}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: USERS CONTROL */}
          {activeTab === 'users' && (
            <div className="glass-card rounded-[24px] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                      <td className="p-4 font-semibold dark:text-white">{u.name}</td>
                      <td className="p-4 font-mono">{u.email}</td>
                      <td className="p-4 capitalize">{u.role}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          u.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleUser(u._id)}
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-1 ml-auto ${
                              u.status === 'active' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            }`}
                          >
                            <Ban className="h-3 w-3" />
                            <span>{u.status === 'active' ? 'Suspend' : 'Activate'}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: PRODUCT MODERATION */}
          {activeTab === 'moderation' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-white">Pending Crop Listings</h3>
              {pendingProducts.length === 0 ? (
                <div className="glass-card rounded-2xl p-16 text-center border">
                  <Inbox className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">All crop listings are moderated. No items are pending.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pendingProducts.map((p) => (
                    <div key={p._id} className="glass-card rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col justify-between gap-4">
                      <div className="flex gap-3">
                        <img src={p.images[0]} alt={p.name} className="h-14 w-14 rounded-xl object-cover" />
                        <div>
                          <h4 className="text-sm font-bold dark:text-white">{p.name}</h4>
                          <span className="block text-[10px] text-slate-400">Farmer: {p.farmer.name}</span>
                          <span className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mt-1">৳{p.price} / {p.unit}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{p.description}</p>

                      <div className="flex gap-2 justify-end pt-2 border-t dark:border-slate-800">
                        <button
                          onClick={() => handleModerateProduct(p._id, 'rejected')}
                          className="px-3 py-1 rounded-lg border border-red-200 hover:bg-red-50 text-[10px] font-bold text-red-500 flex items-center gap-1"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() => handleModerateProduct(p._id, 'approved')}
                          className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm shadow-emerald-500/10"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Approve</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: COUPONS CONTROL */}
          {activeTab === 'coupons' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Coupons List */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-bold text-slate-800 dark:text-white">Active Promo Coupons</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {coupons.map((c) => (
                    <div key={c._id} className="glass-card rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400 font-mono tracking-wider block bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 rounded-lg w-max">
                          {c.code}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-2 block">
                          Value: {c.discountType === 'percentage' ? `${c.discountValue}% Off` : `৳${c.discountValue} Flat`}
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">
                          Min purchase: ৳{c.minOrderAmount} | Expiry: {new Date(c.expiryDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coupon Form */}
              <div>
                <form onSubmit={handleCreateCoupon} className="glass-card rounded-[24px] p-6 border border-slate-100 dark:border-slate-800 space-y-4">
                  <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1">
                    <Tag className="h-4 w-4 text-emerald-500" /> Create Coupon
                  </span>

                  {couponSuccess && <p className="text-xs text-emerald-600 font-bold">{couponSuccess}</p>}

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Coupon Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MONSOON25"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      className="w-full px-2.5 py-1.5 border rounded-xl text-xs bg-transparent dark:text-white dark:border-slate-800 uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Discount Type</label>
                      <select
                        value={newType}
                        onChange={(e) => setNewType(e.target.value)}
                        className="w-full px-2.5 py-1.5 border rounded-xl text-xs bg-transparent dark:bg-slate-900 dark:text-white dark:border-slate-800 focus:outline-none"
                      >
                        <option value="percentage">Percentage</option>
                        <option value="flat">Flat Amount</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Discount Value</label>
                      <input
                        type="number"
                        required
                        placeholder="Value"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        className="w-full px-2.5 py-1.5 border rounded-xl text-xs bg-transparent dark:text-white dark:border-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Min Purchase</label>
                      <input
                        type="number"
                        value={newMinOrder}
                        onChange={(e) => setNewMinOrder(e.target.value)}
                        className="w-full px-2.5 py-1.5 border rounded-xl text-xs bg-transparent dark:text-white dark:border-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Expiry Date</label>
                      <input
                        type="date"
                        required
                        value={newExpiry}
                        onChange={(e) => setNewExpiry(e.target.value)}
                        className="w-full px-2.5 py-1.5 border rounded-xl text-xs bg-transparent dark:text-white dark:border-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md"
                  >
                    Activate Coupon
                  </button>
                </form>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
