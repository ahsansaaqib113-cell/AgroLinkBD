import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Star, ShoppingCart, ArrowRight } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const isLowStock = product.stock <= 20;

  const handleAddToCart = (e) => {
    e.preventDefault(); // Stop Link navigation
    addToCart(product, 1);
  };

  return (
    <Link
      to={`/products/${product._id}`}
      className="glass-card flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-white/20 dark:border-slate-800/20 group"
    >
      {/* Product Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=600'}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Category & Stock Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-1">
          <span className="rounded-lg bg-emerald-500/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm uppercase">
            {product.category?.name || 'Produce'}
          </span>
          {isLowStock && (
            <span className="rounded-lg bg-red-500/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm">
              Low Stock: {product.stock}
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-grow p-4">
        
        {/* Farmer Info */}
        <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mb-1">
          Farmer: <span className="font-semibold text-slate-500 dark:text-slate-400">{product.farmer?.name || 'Rahim Ali'}</span>
        </p>

        {/* Title */}
        <h4 className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-emerald-500 transition-colors line-clamp-1">
          {product.name}
        </h4>

        {/* Rating */}
        <div className="flex items-center space-x-1 mt-1 mb-2">
          <div className="flex text-amber-500">
            <Star className="h-3 w-3 fill-current" />
          </div>
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
            {product.rating > 0 ? product.rating.toFixed(1) : '5.0'}
          </span>
          <span className="text-[9px] text-slate-400">
            ({product.reviewsCount || 0} reviews)
          </span>
        </div>

        {/* Description Snippet */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {product.description}
        </p>

        {/* Price & Cart Button */}
        <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
              ৳{product.price}
            </span>
            <span className="text-[10px] text-slate-400"> / {product.unit}</span>
            {product.wholesalePrice && (
              <span className="block text-[9px] text-slate-400 font-normal">
                ৳{product.wholesalePrice} bulk (≥{product.minWholesaleQty})
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white transition-all duration-200"
            title="Add to Cart"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>

      </div>
    </Link>
  );
};

export default ProductCard;
