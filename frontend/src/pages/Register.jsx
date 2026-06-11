import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, Mail, Lock, Phone, User, AlertCircle, Home, Hammer } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Shared state fields
  const [role, setRole] = useState('customer'); // customer, farmer, business
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  // Address fields
  const [village, setVillage] = useState('');
  const [upazila, setUpazila] = useState('');
  const [district, setDistrict] = useState('');

  // Farmer specific fields
  const [farmName, setFarmName] = useState('');
  const [farmSize, setFarmSize] = useState('1.5');
  const [categoryFocus, setCategoryFocus] = useState('');

  // Business Buyer specific fields
  const [companyName, setCompanyName] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      setErrorMsg('Please complete all primary fields.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const regData = {
      name,
      email,
      phone,
      password,
      role,
      address: { village, upazila, district },
    };

    if (role === 'farmer') {
      regData.farmName = farmName;
      regData.farmSize = parseFloat(farmSize);
      regData.categoryFocus = categoryFocus ? categoryFocus.split(',').map(s => s.trim()) : [];
    } else if (role === 'business') {
      regData.name = companyName || name; // Override name for business reference
    }

    const result = await register(regData);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setErrorMsg(result.message || 'Registration failed. Try again.');
    }
  };

  return (
    <div className="flex min-h-[90vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="w-full max-w-lg space-y-6 glass-card rounded-[32px] p-8 border border-white/20 dark:border-slate-800/10 shadow-xl">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
            <Sprout className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold font-sans dark:text-white">Create Your Account</h2>
          <p className="text-xs text-slate-400">Join the direct agricultural ecosystem of Bangladesh</p>
        </div>

        {/* Role Tab Selector */}
        <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {[
            { id: 'customer', label: 'Customer' },
            { id: 'farmer', label: 'Farmer' },
            { id: 'business', label: 'Wholesale Buyer' }
          ].map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setRole(t.id);
                setErrorMsg('');
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                role === t.id
                  ? 'bg-white dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/25 p-3 flex gap-2 text-xs text-red-500 font-semibold items-center">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Primary Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Conditional Business Name vs Person Name */}
            {role === 'business' ? (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Company / Restaurant Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border rounded-xl text-xs bg-transparent dark:text-white dark:border-slate-800"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border rounded-xl text-xs bg-transparent dark:text-white dark:border-slate-800"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. 017XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border rounded-xl text-xs bg-transparent dark:text-white dark:border-slate-800"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border rounded-xl text-xs bg-transparent dark:text-white dark:border-slate-800"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border rounded-xl text-xs bg-transparent dark:text-white dark:border-slate-800"
                />
              </div>
            </div>

          </div>

          {/* Conditional Farmer Details */}
          {role === 'farmer' && (
            <div className="glass-card p-4 rounded-2xl border border-emerald-500/10 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Farm Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sonar Bangla Farm"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-xl text-xs bg-transparent dark:text-white dark:border-slate-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Size (Acres)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={farmSize}
                  onChange={(e) => setFarmSize(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-xl text-xs bg-transparent dark:text-white dark:border-slate-800"
                />
              </div>
              <div className="md:col-span-3 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Crop focus (Comma separated)</label>
                <input
                  type="text"
                  placeholder="Rice, Vegetables, Fruits"
                  value={categoryFocus}
                  onChange={(e) => setCategoryFocus(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-xl text-xs bg-transparent dark:text-white dark:border-slate-800"
                />
              </div>
            </div>
          )}

          {/* Address Fields */}
          <div className="glass-card p-4 rounded-2xl border dark:border-slate-800 grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">Village/Union</label>
              <input
                type="text"
                required
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full px-2 py-1.5 border rounded-lg text-xs bg-transparent dark:text-white dark:border-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">Upazila</label>
              <input
                type="text"
                required
                value={upazila}
                onChange={(e) => setUpazila(e.target.value)}
                className="w-full px-2 py-1.5 border rounded-lg text-xs bg-transparent dark:text-white dark:border-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">District</label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-2 py-1.5 border rounded-lg text-xs bg-transparent dark:text-white dark:border-slate-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/10"
          >
            {loading ? 'Creating Credentials...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-emerald-500 hover:underline">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;
