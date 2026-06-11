import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { TrendingUp, RefreshCw, HelpCircle } from 'lucide-react';

const MarketPriceWidget = () => {
  const [prices, setPrices] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/smart/prices');
      if (res.data.success) {
        setPrices(res.data.prices);
        setLastUpdated(res.data.lastUpdated);
      }
    } catch (err) {
      console.error('Failed to load prices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  return (
    <div className="glass-card rounded-2xl p-6 shadow-sm border border-white/20 transition-all duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-emerald-500" />
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white">Daily Market Pricing</h3>
            <p className="text-[10px] text-slate-400">Dhaka Wholesales vs Farmgate Rates</p>
          </div>
        </div>
        <button
          onClick={fetchPrices}
          className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
          title="Refresh Prices"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                  <th className="py-2 font-medium">Crop Name</th>
                  <th className="py-2 font-medium text-center text-red-500">Middlemen Rate</th>
                  <th className="py-2 font-medium text-center text-emerald-600">AgroLink Rate</th>
                  <th className="py-2 font-medium text-center">Market Retail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {prices.map((p, idx) => {
                  const profitPct = Math.round(((p.agroLinkFarmer - p.traditionalFarmer) / p.traditionalFarmer) * 100);

                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-3 font-semibold dark:text-white">
                        {p.name}
                        <span className="block text-[9px] font-normal text-slate-400">per {p.unit}</span>
                      </td>
                      <td className="py-3 text-center text-slate-600 dark:text-slate-400">
                        ৳{p.traditionalFarmer}
                      </td>
                      <td className="py-3 text-center">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">৳{p.agroLinkFarmer}</span>
                        <span className="block text-[9px] text-emerald-500 font-medium font-sans">+{profitPct}% profit</span>
                      </td>
                      <td className="py-3 text-center font-medium text-slate-800 dark:text-slate-200">
                        ৳{p.consumerRetail}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
            <span>Last Updated: {lastUpdated}</span>
            <span className="flex items-center space-x-1">
              <HelpCircle className="h-3 w-3" />
              <span>Direct farmer trading increases profits.</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketPriceWidget;
