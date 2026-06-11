import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ShieldCheck, CreditCard, Lock, Sparkles } from 'lucide-react';

const Checkout = () => {
  const { cartItems, cartTotal, coupon, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form Fields
  const [village, setVillage] = useState(user?.address?.village || '');
  const [upazila, setUpazila] = useState(user?.address?.upazila || '');
  const [district, setDistrict] = useState(user?.address?.district || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState('bkash');

  // Checkout Processing States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ordersCreated, setOrdersCreated] = useState([]);

  // Payment Modal Simulator States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1); // 1: Number entry, 2: OTP, 3: PIN/Card, 4: Success
  const [accountNumber, setAccountNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [txnId, setTxnId] = useState('');

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!village || !upazila || !district || !phone) {
      alert('Please fill out all shipping details.');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          product: item.product._id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price, // backend determines wholesale vs retail
          unit: item.product.unit,
        })),
        shippingAddress: { village, upazila, district, phone },
        paymentMethod,
        couponCode: coupon ? coupon.code : '',
      };

      const res = await api.post('/orders', orderData);
      if (res.data.success) {
        setOrdersCreated(res.data.orders);
        
        // Open the appropriate payment simulator
        setShowPaymentModal(true);
        setPaymentStep(1);
        setTxnId('TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase());
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSubmit = async () => {
    // Simulated steps validation
    if (paymentMethod === 'bkash' || paymentMethod === 'nagad') {
      if (paymentStep === 1) {
        if (!accountNumber || accountNumber.length < 11) {
          alert('Please enter a valid account number.');
          return;
        }
        setPaymentStep(2);
        return;
      }
      if (paymentStep === 2) {
        if (!otpCode) {
          alert('Please enter the verification code.');
          return;
        }
        setPaymentStep(3);
        return;
      }
      if (paymentStep === 3) {
        if (!pinCode || pinCode.length < 4) {
          alert('Please enter PIN.');
          return;
        }
      }
    } else {
      // Card payment verification
      if (!cardNumber || !cardCvv || !cardName) {
        alert('Please complete card information.');
        return;
      }
    }

    // If it reaches here, process payment on backend
    try {
      setPaymentStep(0); // Loading state
      
      // Update payment status for all created orders
      for (const order of ordersCreated) {
        await api.put(`/orders/${order._id}/pay`, {
          status: 'paid',
          paymentDetails: {
            method: paymentMethod,
            account: accountNumber || cardNumber,
            transactionId: txnId,
          }
        });
      }

      setPaymentStep(4); // Success screen
      clearCart(); // clear checkout details
    } catch (err) {
      console.error(err);
      alert('Simulated payment failed, but orders have been saved.');
      setShowPaymentModal(false);
    }
  };

  const handleFinishCheckout = () => {
    setShowPaymentModal(false);
    // Redirect to Order Tracking of the first order
    if (ordersCreated.length > 0) {
      navigate(`/orders/track/${ordersCreated[0]._id}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold dark:text-white mb-8">Secure Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Checkout details Form */}
        <form onSubmit={handlePlaceOrder} className="lg:col-span-2 space-y-6">
          
          {/* Shipping details */}
          <div className="glass-card rounded-[24px] p-6 border border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center space-x-1.5">
              <Sparkles className="h-5 w-5 text-emerald-500" />
              <span>Shipping Destination</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Village/Street</label>
                <input
                  type="text"
                  required
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-transparent dark:text-white dark:border-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Upazila</label>
                <input
                  type="text"
                  required
                  value={upazila}
                  onChange={(e) => setUpazila(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-transparent dark:text-white dark:border-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">District</label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-transparent dark:text-white dark:border-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Contact Phone Number</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-transparent dark:text-white dark:border-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="glass-card rounded-[24px] p-6 border border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-white">Select Payment Provider</h3>
            
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'bkash', label: 'bKash Wallet', color: 'hover:border-pink-500 peer-checked:border-pink-500' },
                { id: 'nagad', label: 'Nagad Wallet', color: 'hover:border-orange-500 peer-checked:border-orange-500' },
                { id: 'card', label: 'Debit/Credit Card', color: 'hover:border-emerald-500 peer-checked:border-emerald-500' }
              ].map((p) => (
                <label key={p.id} className="cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value={p.id}
                    checked={paymentMethod === p.id}
                    onChange={() => setPaymentMethod(p.id)}
                    className="sr-only peer"
                  />
                  <div className={`border dark:border-slate-800 rounded-xl p-4 text-center transition-all peer-checked:bg-emerald-50/10 peer-checked:font-bold ${p.color}`}>
                    <span className="text-xs dark:text-white">{p.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-md shadow-emerald-500/15"
          >
            {isSubmitting ? 'Processing Order...' : 'Confirm Order & Pay'}
          </button>
        </form>

        {/* Invoice details Column */}
        <div className="space-y-6">
          <div className="glass-card rounded-[24px] p-6 border border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-white pb-3 border-b dark:border-slate-800">Checkout Cart</h3>
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.product._id} className="flex justify-between text-xs dark:text-slate-200">
                  <span>{item.product.name} (x{item.quantity})</span>
                  <span className="font-semibold">৳{item.product.price * item.quantity}</span>
                </div>
              ))}
              <div className="border-t dark:border-slate-800 pt-3 flex justify-between font-black text-slate-800 dark:text-white">
                <span>Grand Total</span>
                <span>৳{cartTotal + 60}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Secure Payment Sandbox Portal Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[24px] shadow-2xl border dark:border-slate-800 overflow-hidden text-center flex flex-col">
            
            {/* Dynamic Provider Branding Header */}
            <div className={`px-5 py-6 text-white ${
              paymentMethod === 'bkash' ? 'bg-pink-600' : paymentMethod === 'nagad' ? 'bg-orange-600' : 'bg-emerald-600'
            }`}>
              <span className="text-sm font-extrabold tracking-wider uppercase">
                {paymentMethod === 'bkash' ? 'bKash Checkout' : paymentMethod === 'nagad' ? 'Nagad Checkout' : 'Card Payment'}
              </span>
              <p className="text-[9px] text-white/80 mt-1 uppercase font-semibold">Sandbox Testing Gateway</p>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex-grow space-y-4">
              
              {paymentStep === 0 && (
                <div className="py-8 flex flex-col items-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent mb-3"></div>
                  <p className="text-xs text-slate-400">Verifying secure credentials...</p>
                </div>
              )}

              {/* Step 1: Wallet Account Number */}
              {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && paymentStep === 1 && (
                <div className="space-y-4 text-left">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Your Mobile Wallet Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 017XXXXXXXX"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-sm bg-transparent dark:text-white dark:border-slate-800"
                  />
                  <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-xl p-3 text-[10px] leading-relaxed">
                    <Lock className="h-3.5 w-3.5 inline mr-1 text-amber-500" />
                    Enter any 11-digit demo phone number to test verification workflow.
                  </div>
                </div>
              )}

              {/* Step 2: Verification Code OTP */}
              {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && paymentStep === 2 && (
                <div className="space-y-4 text-left">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Verification OTP Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-center text-sm bg-transparent dark:text-white dark:border-slate-800 font-mono tracking-widest"
                  />
                  <p className="text-[10px] text-slate-400 text-center">Enter code <span className="font-bold text-slate-600 dark:text-slate-200">123456</span> to pass sandbox.</p>
                </div>
              )}

              {/* Step 3: Wallet PIN entry */}
              {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && paymentStep === 3 && (
                <div className="space-y-4 text-left">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Mobile Wallet PIN</label>
                  <input
                    type="password"
                    maxLength={5}
                    placeholder="••••"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-center text-sm bg-transparent dark:text-white dark:border-slate-800 font-mono tracking-widest"
                  />
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-3 text-[9px] leading-relaxed">
                    <Lock className="h-3.5 w-3.5 inline mr-1 text-red-500" />
                    <span className="font-bold">SECURITY ALERT:</span> This is a mock sandbox demo. Never input your real PIN. Enter any 4-digit number (e.g. 1234) to confirm.
                  </div>
                </div>
              )}

              {/* Card Inputs */}
              {paymentMethod === 'card' && paymentStep === 1 && (
                <div className="space-y-3 text-left">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full px-2 py-1.5 border rounded-lg text-xs bg-transparent dark:text-white dark:border-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Card Number</label>
                    <input
                      type="text"
                      placeholder="4000 1234 5678 9010"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-2 py-1.5 border rounded-lg text-xs bg-transparent dark:text-white dark:border-slate-800"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-1/2">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-2 py-1.5 border rounded-lg text-xs bg-transparent dark:text-white dark:border-slate-800"
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">CVV</label>
                      <input
                        type="password"
                        placeholder="123"
                        maxLength={3}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full px-2 py-1.5 border rounded-lg text-xs bg-transparent dark:text-white dark:border-slate-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Success Screen */}
              {paymentStep === 4 && (
                <div className="py-6 space-y-3 flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-800 dark:text-white block">Payment Successful</span>
                    <p className="text-[10px] text-slate-400 mt-1">Transaction ID: {txnId}</p>
                  </div>
                </div>
              )}

              {/* Actions Footer */}
              {paymentStep > 0 && paymentStep < 4 && (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="w-1/2 py-2 border rounded-xl text-xs text-slate-500 dark:border-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePaymentSubmit}
                    className="w-1/2 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl dark:bg-emerald-500"
                  >
                    Continue
                  </button>
                </div>
              )}

              {paymentStep === 4 && (
                <button
                  onClick={handleFinishCheckout}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Track Order Shipping
                </button>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Checkout;
