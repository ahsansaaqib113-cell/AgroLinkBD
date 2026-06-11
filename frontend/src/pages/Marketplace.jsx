import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { Search, SlidersHorizontal, ArrowUpDown, CornerDownRight, Inbox } from 'lucide-react';

const Marketplace = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/products/categories');
        if (res.data.success) setCategories(res.data.categories);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    // Keep filter input synchronized when URL parameters change (e.g. category selected from Home)
    setKeyword(searchParams.get('keyword') || '');
    setSelectedCategory(searchParams.get('category') || '');
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (keyword) queryParams.append('keyword', keyword);
      if (selectedCategory) queryParams.append('category', selectedCategory);
      if (minPrice) queryParams.append('minPrice', minPrice);
      if (maxPrice) queryParams.append('maxPrice', maxPrice);

      const res = await api.get(`/products?${queryParams.toString()}`);
      if (res.data.success) {
        let items = res.data.products;

        // Apply frontend sorting
        if (sortBy === 'price-low') {
          items.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-high') {
          items.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'rating') {
          items.sort((a, b) => b.rating - a.rating);
        }

        setProducts(items);
      }
    } catch (err) {
      console.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [keyword, selectedCategory, minPrice, maxPrice, sortBy]);

  const handleClearFilters = () => {
    setKeyword('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setSearchParams({});
  };

  const handleCategorySelect = (slug) => {
    setSelectedCategory(slug);
    if (slug) {
      setSearchParams({ category: slug });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      
      {/* 1. Page Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">AgroLink Bazaar</h1>
          <p className="text-xs text-slate-400">Buy fresh farm crops directly from verified Bangladeshi growers.</p>
        </div>

        {/* Global Catalog Search */}
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search crop name, location, farmer..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-xl text-xs focus:outline-none focus:border-emerald-500 dark:text-white"
          />
        </div>
      </div>

      {/* 2. Layout Grid: Filter Column + Catalog Column */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filter Panel (Desktop View) */}
        <div className="hidden lg:block space-y-6">
          <div className="glass-card rounded-2xl p-5 border border-white/20 dark:border-slate-800/10">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold dark:text-white flex items-center space-x-1.5">
                <SlidersHorizontal className="h-4 w-4 text-emerald-500" />
                <span>Bazaar Filters</span>
              </span>
              <button
                onClick={handleClearFilters}
                className="text-[10px] font-semibold text-red-500 hover:underline"
              >
                Reset All
              </button>
            </div>

            {/* Category Filter */}
            <div className="space-y-2 mb-6">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Categories</label>
              <div className="flex flex-col space-y-1.5 text-xs">
                <button
                  onClick={() => handleCategorySelect('')}
                  className={`text-left px-2 py-1.5 rounded-lg transition-colors ${
                    !selectedCategory ? 'bg-emerald-500/10 text-emerald-600 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => handleCategorySelect(c.slug)}
                    className={`text-left px-2 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                      selectedCategory === c.slug ? 'bg-emerald-500/10 text-emerald-600 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-2 mb-6">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Price Range (BDT)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-transparent dark:text-white"
                />
                <span className="text-slate-400 text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-transparent dark:text-white"
                />
              </div>
            </div>

            {/* Sorting */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sort By</label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-transparent dark:bg-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="newest">Newest Harvest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* Catalog Column */}
        <div className="lg:col-span-3">
          
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 mb-6">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center space-x-1 text-xs font-semibold text-emerald-600"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Show Filters</span>
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1 text-xs bg-transparent focus:outline-none border-none dark:text-white"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low-High</option>
              <option value="price-high">Price: High-Low</option>
              <option value="rating">Ratings</option>
            </select>
          </div>

          {/* Mobile Filter Drawer (Conditional Modal/Dropdown) */}
          {showMobileFilters && (
            <div className="lg:hidden p-4 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 mb-6 space-y-4 shadow-sm">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCategorySelect('')}
                  className={`px-3 py-1 rounded-full text-xs ${!selectedCategory ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}
                >
                  All
                </button>
                {categories.map(c => (
                  <button
                    key={c._id}
                    onClick={() => handleCategorySelect(c.slug)}
                    className={`px-3 py-1 rounded-full text-xs ${selectedCategory === c.slug ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min Price"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-1/2 p-2 border rounded-lg text-xs bg-transparent dark:text-white"
                />
                <input
                  type="number"
                  placeholder="Max Price"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-1/2 p-2 border rounded-lg text-xs bg-transparent dark:text-white"
                />
              </div>
              <button
                onClick={() => {
                  handleClearFilters();
                  setShowMobileFilters(false);
                }}
                className="w-full py-2 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 rounded-lg text-xs"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Catalog Grid */}
          {loading ? (
            <div className="flex h-96 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="glass-card rounded-2xl p-16 text-center border border-slate-100 dark:border-slate-800">
              <Inbox className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-1">No crops match filters</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">We couldn't find any listings matching your selection. Try clearing filters or changing search terms.</p>
              <button
                onClick={handleClearFilters}
                className="rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-600 shadow-md transition-all"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default Marketplace;
