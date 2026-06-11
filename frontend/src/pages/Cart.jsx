import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, ArrowRight, Tag, X } from 'lucide-react';

const Cart = () => {
  const {
    cartItems,
    cartSubtotal,
    cartDiscount,
    cartTotal,
    coupon,
    couponError,
    updateQuantity,
    removeFromCart,
    applyCouponCode,
    removeCoupon
  } = useCart();

  const navigate = useNavigate();
  const [couponCodeInput, setCouponCodeInput] = useState('');

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCodeInput.trim()) {
      applyCouponCode(couponCodeInput.trim());
    }
  };

  const handleProceedCheckout = () => {
    if (cartItems.length > 0) {
      navigate('/checkout');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold dark:text-white mb-8">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="glass-card rounded-[24px] p-16 text-center border border-slate-100 dark:border-slate-800">
          <ShoppingBag className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4 animate-bounce" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-1">Your cart is empty</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">Looks like you haven't added any fresh produce yet. Go to the marketplace to explore.</p>
          <Link
            to="/marketplace"
            className="inline-flex items-center space-x-1.5 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-600 shadow-md transition-all"
          >
            <span>Explore Produce</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Items Column */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const { product, quantity } = item;
              const isWholesale = quantity >= product.minWholesaleQty;
              const itemPrice = isWholesale ? product.wholesalePrice : product.price;

              return (
                <div
                  key={product._id}
                  className="glass-card rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={product.images && product.images[0] ? product.images[0] : '/images/placeholder.jpg'}
                      alt={product.name}
                      className="h-14 w-14 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">{product.name}</h4>
                      <p className="text-[10px] text-slate-400">Farmer: {product.farmer?.name || 'Rahim Uddin'}</p>
                      {isWholesale ? (
                        <span className="inline-block mt-1 text-[9px] bg-emerald-500/10 text-emerald-600 font-semibold px-2 py-0.5 rounded-md">
                          Wholesale Price Applied
                        </span>
                      ) : (
                        product.wholesalePrice && (
                          <span className="block text-[8px] text-slate-400 mt-1">
                            Buy {product.minWholesaleQty} {product.unit} to unlock wholesale (৳{product.wholesalePrice})
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Quantity Control & Delete */}
                  <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t sm:border-none pt-3 sm:pt-0">
                    <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                      <button
                        onClick={() => updateQuantity(product._id, quantity - 1)}
                        className="px-2 py-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        -
                      </button>
                      <span className="px-3 text-xs font-bold dark:text-white">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product._id, quantity + 1)}
                        className="px-2 py-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-slate-800 dark:text-white">
                        ৳{itemPrice * quantity}
                      </span>
                      <span className="block text-[9px] text-slate-400">৳{itemPrice} / {product.unit}</span>
                    </div>

                    <button
                      onClick={() => removeFromCart(product._id)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Pricing Summary Column */}
          <div className="space-y-6">
            <div className="glass-card rounded-[24px] p-6 border border-slate-100 dark:border-slate-800 space-y-6">
              <h3 className="font-bold text-slate-800 dark:text-white pb-3 border-b dark:border-slate-800">Order Summary</h3>

              {/* Coupon Box */}
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Promo Coupon</label>
                {coupon ? (
                  <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl px-3 py-2 text-xs">
                    <div className="flex items-center space-x-1.5 font-bold">
                      <Tag className="h-3.5 w-3.5" />
                      <span>{coupon.code} Applied</span>
                    </div>
                    <button onClick={removeCoupon} className="text-slate-400 hover:text-slate-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. FRESH10"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value)}
                      className="flex-grow px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-transparent dark:text-white uppercase focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs px-4 rounded-xl shadow-md shadow-emerald-500/10"
                    >
                      Apply
                    </button>
                  </div>
                )}
                {couponError && <p className="text-[10px] font-bold text-red-500 mt-1">{couponError}</p>}
                {!coupon && <p className="text-[9px] text-slate-400">Use coupon <span className="font-bold">FRESH10</span> (10% off) for testing.</p>}
              </form>

              {/* Bill Details */}
              <div className="space-y-3 text-xs border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex justify-between text-slate-500">
                  <span>Cart Subtotal</span>
                  <span>৳{cartSubtotal}</span>
                </div>
                {cartDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount Coupon</span>
                    <span>-৳{cartDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Delivery Charge</span>
                  <span>৳60 (Standard)</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-800 dark:text-white pt-2 border-t dark:border-slate-800">
                  <span>Total Amount</span>
                  <span>৳{cartTotal + 60}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleProceedCheckout}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-emerald-500 text-sm font-bold text-white rounded-xl shadow-md shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </button>

            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Cart;
