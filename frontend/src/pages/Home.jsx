import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import WeatherWidget from '../components/WeatherWidget';
import MarketPriceWidget from '../components/MarketPriceWidget';
import ProductCard from '../components/ProductCard';
import { Search, ChevronRight, Users, ShieldCheck, Sprout, BadgeDollarSign, Quote } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/products/categories'),
          api.get('/products?limit=4') // Limit to 4 for home
        ]);

        if (catRes.data.success) setCategories(catRes.data.categories);
        if (prodRes.data.success) setFeaturedProducts(prodRes.data.products.slice(0, 4));
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?keyword=${searchQuery}`);
    }
  };

  return (
    <div className="space-y-16 pb-16">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-emerald-900 text-white py-20 px-6 sm:px-12 md:py-28 rounded-b-[40px] shadow-lg">
        {/* Soft Background Accent circles */}
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-10 h-72 w-72 rounded-full bg-lime-500/15 blur-3xl"></div>

        <div className="relative mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-4 py-1.5 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
              <Sprout className="h-3.5 w-3.5" /> Direct Farmer Connection
            </span>
            <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl tracking-tight leading-tight">
              Eliminate Middlemen. <br />
              <span className="text-emerald-400">Fresh Produce</span> to You.
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-lg">
              AgroLink BD empowers local Bangladeshi farmers to sell their harvests directly to households, wholesalers, and restaurants. Fair pricing, freshness, and traceabilty guaranteed.
            </p>

            {/* Search Box */}
            <form onSubmit={handleSearchSubmit} className="flex max-w-md items-center bg-white rounded-2xl p-1.5 shadow-xl text-slate-800">
              <div className="flex items-center pl-3 flex-grow">
                <Search className="h-5 w-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search fresh vegetables, rice, fish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent pl-2 text-sm focus:outline-none placeholder:text-slate-400 py-2"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20 shrink-0"
              >
                Search
              </button>
            </form>
          </div>

          {/* Right Banner Image Illustration */}
          <div className="relative flex justify-center">
            <div className="glass-card rounded-[32px] overflow-hidden p-3 border border-white/10 shadow-2xl relative z-10 w-full max-w-md aspect-video bg-emerald-950/30">
              <img
                src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800"
                alt="Bangladeshi Agricultural fields"
                className="rounded-2xl h-full w-full object-cover shadow-inner"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Stats Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Verified Farmers', value: '5,000+', icon: <Users className="h-6 w-6 text-emerald-500" /> },
            { label: 'Fresh Products', value: '10,000+', icon: <Sprout className="h-6 w-6 text-emerald-500" /> },
            { label: 'Middlemen Fee', value: '0%', icon: <BadgeDollarSign className="h-6 w-6 text-emerald-500" /> },
            { label: 'Secure Payments', value: 'bKash/Nagad', icon: <ShieldCheck className="h-6 w-6 text-emerald-500" /> }
          ].map((stat, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-5 text-center flex flex-col items-center border border-white/20 dark:border-slate-800/10 shadow-sm">
              <div className="mb-2 p-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20">{stat.icon}</div>
              <span className="text-2xl font-bold dark:text-white">{stat.value}</span>
              <span className="text-xs text-slate-400 mt-1">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Category Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold dark:text-white">Explore Categories</h2>
            <p className="text-xs text-slate-400">Discover fresh harvests by food groups</p>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map((c) => (
              <Link
                key={c._id}
                to={`/marketplace?category=${c.slug}`}
                className="glass-card flex flex-col items-center p-4 rounded-2xl border border-white/20 hover:border-emerald-500/30 transition-card group text-center"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-slate-800 flex items-center justify-center mb-3 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                  <Sprout className="h-6 w-6 text-emerald-600 dark:text-emerald-400 group-hover:text-white" />
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-emerald-500 transition-colors line-clamp-1">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 4. Smart features: weather and pricing widgets */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <WeatherWidget />
        <MarketPriceWidget />
      </section>

      {/* 5. Featured Products */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold dark:text-white">Featured Harvests</h2>
            <p className="text-xs text-slate-400">Picked fresh, priced fairly, ready to ship</p>
          </div>
          <Link to="/marketplace" className="flex items-center space-x-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
            <span>View All</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* 6. Testimonials */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-xl font-bold dark:text-white">What Our Community Says</h2>
          <p className="text-xs text-slate-400">Connecting hearts and harvests across Bangladesh</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: 'I used to sell tomatoes at 20 BDT/kg to wholesalers. On AgroLink BD, I directly connect with customers and sell at 45 BDT/kg. My income has doubled!',
              author: 'Rahim Ali',
              role: 'Vegetable Farmer, Bogra'
            },
            {
              quote: 'For our restaurant chain, procurement was a major challenge. Now we order wholesale rice and vegetables directly from verified farmers. Outstanding quality and prices.',
              author: 'Sajid Ahmed',
              role: 'Restaurant Proprietor, Dhaka'
            },
            {
              quote: 'The organic mustard oil is completely pure. Knowing exactly which farmer grew my oil seeds gives me total peace of mind. Highly recommend the payment system!',
              author: 'Dr. Farhana',
              role: 'Consumer, Sylhet'
            }
          ].map((t, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-6 border border-white/20 dark:border-slate-800/10 flex flex-col justify-between shadow-sm">
              <Quote className="h-8 w-8 text-emerald-500/20 mb-4" />
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 italic mb-4">
                "{t.quote}"
              </p>
              <div>
                <span className="block text-xs font-bold dark:text-white">{t.author}</span>
                <span className="block text-[10px] text-slate-400 mt-0.5">{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;
