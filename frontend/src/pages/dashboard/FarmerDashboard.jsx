import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  TrendingUp,
  Package,
  Clock,
  DollarSign,
  Plus,
  Trash,
  CheckCircle,
  Truck,
  RotateCcw,
  Sparkles,
  Inbox
} from 'lucide-react';

const FarmerDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Tab: 'overview' | 'products' | 'orders'
  const [activeTab, setActiveTab] = useState('overview');

  // Add Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdCat, setNewProdCat] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdWholesale, setNewProdWholesale] = useState('');
  const [newProdMinWholesale, setNewProdMinWholesale] = useState('20');
  const [newProdUnit, setNewProdUnit] = useState('kg');
  const [newProdStock, setNewProdStock] = useState('');
  const [newProdImage, setNewProdImage] = useState('');

  const [formSuccess, setFormSuccess] = useState('');

  const fetchFarmerData = async () => {
    setLoading(true);
    try {
      const [analRes, ordRes, prodRes, catRes] = await Promise.all([
        api.get('/analytics/farmer'),
        api.get('/orders/farmer'),
        api.get('/products?farmer=my'), // Custom trigger or we filter on frontend, wait, we can fetch all products and filter where farmer._id matches user._id, or backend has ?farmer=<userId>
        api.get('/products/categories')
      ]);

      if (analRes.data.success) setAnalytics(analRes.data.analytics);
      if (ordRes.data.success) setOrders(ordRes.data.orders);
      if (catRes.data.success) setCategories(catRes.data.categories);

      // Fetch all products, but filter where farmer is current user.
      // Since productController returns farmer object with name/phone, we can fetch and filter.
      // Wait, getProducts allows filtering by farmer ID. Let's do that dynamically.
      // To get farmer ID, we need to know who we are. Our AuthContext has it.
      // But we can also filter products directly in the frontend since productController includes farmer ID.
      // Let's filter products by current logged-in farmer.
      const userProfile = await api.get('/auth/profile');
      if (userProfile.data.success) {
        const myId = userProfile.data.user._id;
        const myProds = prodRes.data.products.filter(p => p.farmer._id === myId || p.farmer === myId);
        setProducts(myProds);
      }
    } catch (err) {
      console.error('Failed to load farmer dashboard details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmerData();
  }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProdName || !newProdDesc || !newProdCat || !newProdPrice || !newProdStock) {
      alert('Please fill out all required crop details.');
      return;
    }

    try {
      const payload = {
        name: newProdName,
        description: newProdDesc,
        category: newProdCat,
        price: Number(newProdPrice),
        wholesalePrice: Number(newProdWholesale || newProdPrice),
        minWholesaleQty: Number(newProdMinWholesale || 20),
        unit: newProdUnit,
        stock: Number(newProdStock),
        images: newProdImage ? [newProdImage] : ['https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=600'],
      };

      const res = await api.post('/products', payload);
      if (res.data.success) {
        setFormSuccess('Crop listing added successfully!');
        setNewProdName('');
        setNewProdDesc('');
        setNewProdPrice('');
        setNewProdWholesale('');
        setNewProdStock('');
        setNewProdImage('');
        fetchFarmerData();
        setTimeout(() => setFormSuccess(''), 3000);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to add crop. Try again.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to remove this crop listing?')) {
      try {
        await api.delete(`/products/${id}`);
        setProducts(prev => prev.filter(p => p._id !== id));
      } catch (err) {
        alert('Failed to delete listing.');
      }
    }
  };

  const handleUpdateShipping = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/shipping`, { status });
      setOrders(prev =>
        prev.map(o => (o._id === orderId ? { ...o, shippingStatus: status } : o))
      );
      fetchFarmerData(); // reload stats (earnings)
    } catch (err) {
      alert('Failed to update shipment status.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Farmer Harvest Center</h1>
          <p className="text-xs text-slate-400">Manage crop inventories, shipments, and review earnings statistics.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b dark:border-slate-800 pb-px mb-8">
        {[
          { id: 'overview', label: 'Sales Overview' },
          { id: 'products', label: 'My Crops Catalog' },
          { id: 'orders', label: 'Manage Orders' }
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
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'Total Earnings', value: `৳${analytics.totalEarnings}`, icon: <DollarSign className="h-5 w-5 text-emerald-500" /> },
                  { label: 'Total Shipments', value: analytics.totalOrders, icon: <Package className="h-5 w-5 text-emerald-500" /> },
                  { label: 'Pending Shipments', value: analytics.pendingOrders, icon: <Clock className="h-5 w-5 text-amber-500" /> },
                  { label: 'Delivered', value: analytics.completedOrders, icon: <CheckCircle className="h-5 w-5 text-emerald-500" /> }
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

              {/* Monthly Earnings simulation graph/visualizer */}
              <div className="glass-card rounded-[24px] p-6 border border-slate-100 dark:border-slate-800 space-y-4">
                <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-emerald-500" /> Monthly sales forecast
                </span>
                
                {/* Horizontal Bar Visualizer */}
                <div className="space-y-3 pt-3">
                  {analytics.salesChart.map((s, idx) => (
                    <div key={idx} className="flex items-center text-xs">
                      <span className="w-10 text-slate-400 font-semibold">{s.month}</span>
                      <div className="flex-grow bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden mx-3">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(s.sales / 50000) * 100}%` }}></div>
                      </div>
                      <span className="w-20 text-right font-bold text-slate-700 dark:text-slate-200">৳{s.sales}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: MY PRODUCTS */}
          {activeTab === 'products' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Product Catalog List (Col span 2) */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-bold text-slate-800 dark:text-white mb-2">Active Crop Listings ({products.length})</h3>
                {products.length === 0 ? (
                  <div className="glass-card rounded-2xl p-12 text-center border">
                    <Inbox className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">You haven't listed any crops yet.</p>
                  </div>
                ) : (
                  products.map((p) => (
                    <div
                      key={p._id}
                      className="glass-card rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center space-x-3">
                        <img src={p.images[0]} alt={p.name} className="h-12 w-12 rounded-xl object-cover" />
                        <div>
                          <h4 className="text-sm font-bold dark:text-white">{p.name}</h4>
                          <span className="block text-[10px] text-slate-400">Stock: {p.stock} {p.unit}</span>
                          <span className="inline-block text-[9px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-md mt-1 font-semibold">
                            ৳{p.price} / {p.unit}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteProduct(p._id)}
                        className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                        title="Delete listing"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Crop Form */}
              <div>
                <form onSubmit={handleCreateProduct} className="glass-card rounded-[24px] p-6 border border-slate-100 dark:border-slate-800 space-y-4">
                  <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1">
                    <Plus className="h-4 w-4 text-emerald-500" /> List New Harvest
                  </span>
                  
                  {formSuccess && <p className="text-xs text-emerald-600 font-bold">{formSuccess}</p>}

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Crop Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Deshi Potato"
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      className="w-full px-2.5 py-1.5 border rounded-xl text-xs bg-transparent dark:text-white dark:border-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Crop Category</label>
                    <select
                      required
                      value={newProdCat}
                      onChange={(e) => setNewProdCat(e.target.value)}
                      className="w-full px-2.5 py-1.5 border rounded-xl text-xs bg-transparent dark:bg-slate-900 dark:text-white dark:border-slate-800 focus:outline-none"
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Retail Price</label>
                      <input
                        type="number"
                        required
                        placeholder="BDT/unit"
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(e.target.value)}
                        className="w-full px-2.5 py-1.5 border rounded-xl text-xs bg-transparent dark:text-white dark:border-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Wholesale Price</label>
                      <input
                        type="number"
                        placeholder="BDT/unit"
                        value={newProdWholesale}
                        onChange={(e) => setNewProdWholesale(e.target.value)}
                        className="w-full px-2.5 py-1.5 border rounded-xl text-xs bg-transparent dark:text-white dark:border-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Initial Stock</label>
                      <input
                        type="number"
                        required
                        value={newProdStock}
                        onChange={(e) => setNewProdStock(e.target.value)}
                        className="w-full px-2.5 py-1.5 border rounded-xl text-xs bg-transparent dark:text-white dark:border-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Stock Unit</label>
                      <select
                        value={newProdUnit}
                        onChange={(e) => setNewProdUnit(e.target.value)}
                        className="w-full px-2.5 py-1.5 border rounded-xl text-xs bg-transparent dark:bg-slate-900 dark:text-white dark:border-slate-800 focus:outline-none"
                      >
                        <option value="kg">kg</option>
                        <option value="maund">maund</option>
                        <option value="piece">piece</option>
                        <option value="sack">sack</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Crop description</label>
                    <textarea
                      required
                      placeholder="Details on soil, fertilizer used, etc."
                      value={newProdDesc}
                      onChange={(e) => setNewProdDesc(e.target.value)}
                      className="w-full px-2.5 py-1.5 border rounded-xl text-xs bg-transparent dark:text-white dark:border-slate-800 h-16"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Image URL (Optional)</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={newProdImage}
                      onChange={(e) => setNewProdImage(e.target.value)}
                      className="w-full px-2.5 py-1.5 border rounded-xl text-xs bg-transparent dark:text-white dark:border-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md"
                  >
                    Publish Crop Listing
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* TAB 3: MANAGE ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-white">Active Purchases Received</h3>
              {orders.length === 0 ? (
                <div className="glass-card rounded-2xl p-12 text-center border">
                  <Inbox className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No orders received yet.</p>
                </div>
              ) : (
                orders.map((o) => (
                  <div
                    key={o._id}
                    className="glass-card rounded-2xl p-5 border border-slate-100 dark:border-slate-800 space-y-4"
                  >
                    
                    {/* Header info */}
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold block dark:text-white">Order {o.trackingNumber}</span>
                        <span className="text-[10px] text-slate-400">Buyer: {o.buyer.name} (Phone: {o.buyer.phone})</span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-slate-800 dark:text-white block">৳{o.totalAmount}</span>
                        <span className="text-[9px] text-slate-400 uppercase block font-semibold">
                          Payment: <span className={o.paymentStatus === 'paid' ? 'text-emerald-500' : 'text-amber-500'}>{o.paymentStatus}</span>
                        </span>
                      </div>
                    </div>

                    {/* Order items lists */}
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {o.items.map((item, idx) => (
                        <div key={idx} className="py-2 flex justify-between text-xs text-slate-600 dark:text-slate-300">
                          <span>{item.name} (x{item.quantity} {item.unit})</span>
                          <span>৳{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Shipment Operations Controls */}
                    <div className="pt-3 border-t dark:border-slate-800 flex justify-between items-center gap-2">
                      <div className="flex items-center text-xs">
                        <span className="text-slate-400">Shipment Status: </span>
                        <span className="ml-1.5 rounded-lg bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 uppercase">
                          {o.shippingStatus}
                        </span>
                      </div>

                      {/* Dropdown status modifier */}
                      <div className="flex gap-2">
                        {o.shippingStatus === 'pending' && (
                          <button
                            onClick={() => handleUpdateShipping(o._id, 'processing')}
                            className="flex items-center space-x-1 px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-bold"
                          >
                            <Package className="h-3 w-3" />
                            <span>Mark Processing</span>
                          </button>
                        )}
                        {o.shippingStatus === 'processing' && (
                          <button
                            onClick={() => handleUpdateShipping(o._id, 'shipped')}
                            className="flex items-center space-x-1 px-3 py-1 bg-emerald-500 text-white rounded-lg text-[10px] font-bold"
                          >
                            <Truck className="h-3 w-3" />
                            <span>Mark Shipped</span>
                          </button>
                        )}
                        {o.shippingStatus === 'shipped' && (
                          <button
                            onClick={() => handleUpdateShipping(o._id, 'delivered')}
                            className="flex items-center space-x-1 px-3 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold"
                          >
                            <CheckCircle className="h-3 w-3" />
                            <span>Confirm Delivery</span>
                          </button>
                        )}
                      </div>

                    </div>

                  </div>
                ))
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default FarmerDashboard;
