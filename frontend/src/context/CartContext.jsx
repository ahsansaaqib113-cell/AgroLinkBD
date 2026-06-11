import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product._id === product._id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product._id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product._id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
    setCouponError('');
  };

  // Calculate Subtotal dynamically taking into account wholesale vs retail
  const cartSubtotal = cartItems.reduce((total, item) => {
    const { product, quantity } = item;
    const isWholesale = quantity >= product.minWholesaleQty;
    const price = isWholesale ? product.wholesalePrice : product.price;
    return total + price * quantity;
  }, 0);

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const applyCouponCode = async (code) => {
    try {
      setCouponError('');
      const response = await api.post('/orders/coupons/validate', {
        code,
        amount: cartSubtotal,
      });

      if (response.data.success) {
        setCoupon({
          code: code.toUpperCase(),
          discountType: response.data.discountType,
          discountValue: response.data.discountValue,
        });
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid coupon code';
      setCouponError(msg);
      return { success: false, message: msg };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponError('');
  };

  const cartDiscount = coupon
    ? coupon.discountType === 'percentage'
      ? parseFloat(((cartSubtotal * coupon.discountValue) / 100).toFixed(2))
      : Math.min(coupon.discountValue, cartSubtotal)
    : 0;

  const cartTotal = parseFloat((cartSubtotal - cartDiscount).toFixed(2));

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartSubtotal,
        cartDiscount,
        cartTotal,
        coupon,
        couponError,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCouponCode,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
