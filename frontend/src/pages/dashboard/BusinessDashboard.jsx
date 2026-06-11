import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  TrendingUp,
  FileSpreadsheet,
  Plus,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  Inbox,
  Clock,
  Briefcase
} from 'lucide-react';

const BusinessDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [bulks, setBulks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Tab: 'my-requests' | 'new-request' | 'market-insights'
  const [activeTab, setActiveTab] = useState('my-requests');

  // New Request Form State
  const [prodName, setProdName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [targetPrice, setTargetPrice] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Proposals modal inspect details
  const [inspectRequest, setInspectRequest] = useState(null);

  const fetchBusinessData = async () => {
    setLoading(true);
    try {
      const [analRes, bulkRes, catRes] = await Promise.all([
        api.get('/analytics/business'),
        api.get('/bulk/my'), // my bulk requests
        api.get('/products/categories')
      ]);

      if (analRes.data.success) setAnalytics(analRes.data.analytics);
      if (bulkRes.data.success) setBulks(bulkRes.data.bulks);
      if (catRes.data.success) setCategories(catRes.data.categories);
    } catch (err) {
      console.error('Failed to load business buyer details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinessData();
  }, []);

  const handleCreateBulk = async (e) => {
    e.preventDefault();
    if (!prodName || !quantity || !targetPrice || !deliveryDate || !category) {
      alert('Please complete all required parameters.');
      return;
    }

    try {
      const payload = {
        productName: prodName,
        category,
        quantityRequired: Number(quantity),
        unit,
        targetPrice: Number(targetPrice),
        deliveryDate: new Date(deliveryDate),
        description,
      };

      const res = await api.post('/bulk', payload);
      if (res.data.success) {
        setFormSuccess('Bulk request published successfully!');
        setProdName('');
        setQuantity('');
        setTargetPrice('');
        setDeliveryDate('');
        setDescription('');
        fetchBusinessData();
        setActiveTab('my-requests');
        setTimeout(() => setFormSuccess(''), 3000);
      }
    } catch (err) {
      alert('Failed to publish request.');
    }
  };

  const handleAcceptProposal = async (requestId, proposalId) => {
    if (window.confirm('Accept this proposal? This will award the contract to this farmer and close the request.')) {
      try {
        const res = await api.put(`/bulk/${requestId}/proposals/${proposalId}/accept`);
        if (res.data.success) {
          alert('Proposal accepted. The farmer has been notified to arrange delivery.');
          setInspectRequest(null);
          fetchBusinessData();
        }
      } catch (err) {
        alert('Could not accept proposal');
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Business Procurement Center</h1>
          <p className="text-xs text-slate-400">Request bulk pricing quotes directly from verified growers.</p>
        </div>
      </div>

      {/* Stats Summary */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Published Bulk Requests', value: analytics.myBulkRequestsCount, icon: <Briefcase className="h-5 w-5 text-emerald-500" /> },
            { label: 'Open Quotes Requests', value: analytics.activeBulkRequestsCount, icon: <Clock className="h-5 w-5 text-amber-500" /> },
            { label: 'Platform Verification Fee', value: '0%', icon: <ShieldCheck className="h-5 w-5 text-emerald-500" /> }
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
      )}

      {/* Tabs */}
      <div className="flex space-x-2 border-b dark:border-slate-800 pb-px mb-8">
        {[
          { id: 'my-requests', label: 'My Requests & Proposals' },
          { id: 'new-request', label: 'Publish Bulk Request' },
          { id: 'market-insights', label: 'Regional Demand Insights' }
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
        <div className="flex h-64 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* TAB 1: MY REQUESTS & PROPOSALS */}
          {activeTab === 'my-requests' && (
            <div className="space-y-4">
              {bulks.length === 0 ? (
                <div className="glass-card rounded-2xl p-16 text-center border">
                  <Inbox className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No bulk requests published yet.</p>
                </div>
              ) : (
                bulks.map((b) => (
                  <div key={b._id} className="glass-card rounded-2xl p-5 border border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <h4 className="font-extrabold dark:text-white text-sm">{b.productName}</h4>
                        <span className="text-[10px] text-slate-400">Required: {b.quantityRequired} {b.unit} | Target Price: ৳{b.targetPrice}</span>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
                          b.status === 'open' ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'
                        }`}>
                          {b.status}
                        </span>
                        <span className="block text-[9px] text-slate-400 mt-1">Delivery by: {new Date(b.deliveryDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t dark:border-slate-800 flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-semibold">{b.proposals.length} Proposals Submitted</span>
                      {b.status === 'open' && b.proposals.length > 0 && (
                        <button
                          onClick={() => setInspectRequest(b)}
                          className="flex items-center text-emerald-500 font-bold hover:underline"
                        >
                          <span>Inspect Proposals</span>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: PUBLISH BULK REQUEST */}
          {activeTab === 'new-request' && (
            <div className="max-w-xl mx-auto">
              <form onSubmit={handleCreateBulk} className="glass-card rounded-[24px] p-6 border border-slate-100 dark:border-slate-800 space-y-4">
                <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1">
                  <Plus className="h-4 w-4 text-emerald-500" /> Publish Buy Request
                </span>

                {formSuccess && <p className="text-xs text-emerald-600 font-bold">{formSuccess}</p>}

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Crop Commodity Required</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Miniket Rice, Red Potato"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-xl text-xs bg-transparent dark:text-white dark:border-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Category</label>
                  <select
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-xl text-xs bg-transparent dark:bg-slate-900 dark:text-white dark:border-slate-800 focus:outline-none"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Quantity Required</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 100"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-2.5 py-1.5 border rounded-xl text-xs bg-transparent dark:text-white dark:border-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Unit Type</label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full px-2.5 py-1.5 border rounded-xl text-xs bg-transparent dark:bg-slate-900 dark:text-white dark:border-slate-800 focus:outline-none"
                    >
                      <option value="kg">kg</option>
                      <option value="maund">maund</option>
                      <option value="piece">piece</option>
                      <option value="sack">sack</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Target Price BDT / Unit</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 1500"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      className="w-full px-2.5 py-1.5 border rounded-xl text-xs bg-transparent dark:text-white dark:border-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Required Delivery Date</label>
                    <input
                      type="date"
                      required
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 border rounded-xl text-xs bg-transparent dark:text-white dark:border-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Additional Specifications</label>
                  <textarea
                    placeholder="Moisture levels, package type, quality specifications..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-xl text-xs bg-transparent dark:text-white dark:border-slate-800 h-16"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Publish Bulk Tender Request
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: REGIONAL DEMAND INSIGHTS */}
          {activeTab === 'market-insights' && analytics && (
            <div className="glass-card rounded-[24px] p-6 border border-slate-100 dark:border-slate-800 space-y-4">
              <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <TrendingUp className="h-5 w-5 text-emerald-500" /> Crop Regional Demand Map Insights
              </span>
              
              <div className="overflow-x-auto pt-3">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 pb-2 text-slate-400">
                      <th className="py-2">Crop Commodity</th>
                      <th className="py-2">Major Growing Hub</th>
                      <th className="py-2">System Demand Index</th>
                      <th className="py-2 text-right">Avg wholesale Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {analytics.regionalDemand.map((r, idx) => (
                      <tr key={idx}>
                        <td className="py-3 font-semibold dark:text-white">{r.crop}</td>
                        <td className="py-3 text-slate-500">{r.region}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase ${
                            r.demandIndex.includes('High') ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-600'
                          }`}>
                            {r.demandIndex}
                          </span>
                        </td>
                        <td className="py-3 text-right font-bold">৳{r.avgPrice} / unit</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Proposals Inspector Dialog Modal */}
      {inspectRequest && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[24px] shadow-2xl border dark:border-slate-800 overflow-hidden flex flex-col h-[400px]">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
              <span className="font-bold text-xs dark:text-white">Proposals: {inspectRequest.productName}</span>
              <button onClick={() => setInspectRequest(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <div className="flex-grow p-4 overflow-y-auto space-y-3">
              {inspectRequest.proposals.map((p) => (
                <div key={p._id} className="p-3 border dark:border-slate-800 rounded-xl flex justify-between items-center gap-4">
                  <div>
                    <span className="font-bold text-xs block dark:text-white">{p.farmName}</span>
                    <span className="text-[10px] text-slate-500 italic block mt-0.5">"{p.message}"</span>
                    <span className="text-[9px] text-slate-400 block mt-1">Bid placed: {new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-sm text-emerald-600 block">৳{p.proposedPrice}</span>
                    <button
                      onClick={() => handleAcceptProposal(inspectRequest._id, p._id)}
                      className="mt-2 flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] px-3 py-1 rounded-lg shadow-sm"
                    >
                      <CheckCircle className="h-3 w-3" />
                      <span>Accept Bid</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BusinessDashboard;
