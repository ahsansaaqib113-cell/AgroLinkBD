import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { MapPin, Printer, ShieldCheck, Truck, Package, CheckCircle2, FileText } from 'lucide-react';

const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/orders/${id}`);
        if (res.data.success) {
          setOrder(res.data.order);
        }
      } catch (err) {
        console.error('Failed to load tracking details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const getStepNumber = (shippingStatus) => {
    switch (shippingStatus) {
      case 'pending': return 1;
      case 'processing': return 2;
      case 'shipped': return 3;
      case 'delivered': return 4;
      default: return 1;
    }
  };

  const currentStep = order ? getStepNumber(order.shippingStatus) : 1;

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      
      {loading ? (
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
        </div>
      ) : order ? (
        <div className="space-y-8 print:p-6 print:bg-white">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b dark:border-slate-800 pb-6 print:border-slate-200">
            <div>
              <span className="text-xs text-slate-400">Tracking Reference</span>
              <h1 className="text-xl font-bold dark:text-white mt-1">{order.trackingNumber}</h1>
              <p className="text-[10px] text-slate-400 mt-1">Placed on: {new Date(order.createdAt).toLocaleString('en-GB')}</p>
            </div>
            
            <button
              onClick={handlePrintInvoice}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold dark:text-white print:hidden transition-colors"
            >
              <Printer className="h-4 w-4" />
              <span>Print Invoice</span>
            </button>
          </div>

          {/* 1. Shipping Status Progress Bar */}
          <div className="glass-card rounded-[24px] p-6 border border-slate-100 dark:border-slate-800 print:hidden">
            <h3 className="font-bold text-slate-800 dark:text-white mb-6">Delivery Progress</h3>
            
            <div className="relative flex items-center justify-between">
              {/* Progress Line */}
              <div className="absolute left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 top-4 -z-10">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                ></div>
              </div>

              {[
                { step: 1, label: 'Order Confirmed', icon: <FileText className="h-4 w-4" /> },
                { step: 2, label: 'Packaging', icon: <Package className="h-4 w-4" /> },
                { step: 3, label: 'In Transit', icon: <Truck className="h-4 w-4" /> },
                { step: 4, label: 'Delivered', icon: <CheckCircle2 className="h-4 w-4" /> }
              ].map((s) => (
                <div key={s.step} className="flex flex-col items-center text-center">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center transition-all ${
                    currentStep >= s.step
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                    {s.icon}
                  </div>
                  <span className={`text-[10px] mt-2 font-semibold ${
                    currentStep >= s.step ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'
                  }`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Interactive Map Simulator */}
          <div className="glass-card rounded-[24px] p-6 border border-slate-100 dark:border-slate-800 print:hidden grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Map Frame */}
            <div className="md:col-span-2 relative h-48 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950/40 flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-inner">
              {/* Simulated Map grid elements */}
              <div className="absolute inset-0 bg-cover opacity-20 dark:opacity-10 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:16px_16px]"></div>
              
              {/* Pulsing Pin */}
              <div className="absolute flex flex-col items-center pulse-pin">
                <MapPin className="h-8 w-8 text-emerald-500 fill-emerald-500/30" />
                <span className="bg-emerald-500 text-white font-bold text-[8px] px-2 py-0.5 rounded-full shadow-md mt-1 whitespace-nowrap">
                  Courier in Savar
                </span>
              </div>
            </div>

            {/* Ship Details */}
            <div className="space-y-4 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Shipment Logistics</span>
              
              <div className="space-y-3">
                <div>
                  <span className="text-slate-400 block">Courier Status</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    {order.shippingStatus === 'pending' && 'Awaiting pickup from Bogra Farm'}
                    {order.shippingStatus === 'processing' && 'Fulfilling packages in Bogra'}
                    {order.shippingStatus === 'shipped' && 'In transit - heading to Dhaka'}
                    {order.shippingStatus === 'delivered' && 'Package handed to buyer'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block">Fulfillment Driver</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Karim Transport (01833-445566)</span>
                </div>
              </div>
            </div>

          </div>

          {/* 3. Invoice / Bill Items Details (Beautiful print view) */}
          <div className="glass-card rounded-[24px] p-8 border border-slate-100 dark:border-slate-800 space-y-6 print:border-none print:shadow-none print:bg-white print:p-0">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-extrabold text-slate-800 dark:text-white print:text-black">AgroLink BD Invoice</h3>
                <p className="text-[10px] text-slate-400">Fresh local produce direct-to-buyer</p>
              </div>
              <div className="text-right text-xs">
                <p className="font-bold text-slate-800 dark:text-white print:text-black">Ship to:</p>
                <p className="text-slate-500">{order.shippingAddress.village}</p>
                <p className="text-slate-500">{order.shippingAddress.upazila}, {order.shippingAddress.district}</p>
                <p className="text-slate-500">Phone: {order.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Bill items table */}
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b dark:border-slate-800 pb-2 text-slate-400 print:border-slate-200">
                  <th className="py-2">Item Name</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Unit Price</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 print:divide-slate-200">
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 font-semibold dark:text-white print:text-black">{item.name}</td>
                    <td className="py-3 text-center">{item.quantity} {item.unit}</td>
                    <td className="py-3 text-right">৳{item.price}</td>
                    <td className="py-3 text-right font-bold">৳{item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Payment Summary */}
            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800 print:border-slate-200">
              <div className="w-64 space-y-2 text-xs text-right">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>৳{order.totalAmount + order.discountAmount}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount Code ({order.couponCode})</span>
                    <span>-৳{order.discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Delivery fee</span>
                  <span>৳60</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-800 dark:text-white print:text-black pt-2 border-t dark:border-slate-800">
                  <span>Grand Total Paid</span>
                  <span>৳{order.totalAmount + 60}</span>
                </div>
              </div>
            </div>

            {/* Payment Success Watermark */}
            <div className="border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-xl px-4 py-3 flex items-center justify-between text-xs">
              <span className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" /> Paid via {order.paymentMethod.toUpperCase()} Sandbox
              </span>
              <span className="font-mono text-[10px]">Reference: Verified</span>
            </div>

          </div>

        </div>
      ) : (
        <div className="text-center text-slate-400 py-16">Order tracking details not found.</div>
      )}
    </div>
  );
};

export default OrderTracking;
