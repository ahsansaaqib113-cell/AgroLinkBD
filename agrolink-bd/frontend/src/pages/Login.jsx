import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setErrorMsg(result.message || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="w-full max-w-md space-y-8 glass-card rounded-[32px] p-8 border border-white/20 dark:border-slate-800/10 shadow-xl">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
            <Sprout className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold font-sans dark:text-white">Sign In to AgroLink</h2>
          <p className="text-xs text-slate-400">Directly connect with fresh agricultural markets</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/25 p-3 flex gap-2 text-xs text-red-500 font-semibold items-center">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="e.g. buyer@agrolink.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-xl text-xs bg-transparent dark:text-white dark:border-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-xl text-xs bg-transparent dark:text-white dark:border-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/10"
          >
            {loading ? 'Verifying Secure Token...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials Alert helper */}
        <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
          <span className="font-bold block text-slate-600 dark:text-slate-300 mb-1">Sandbox Test Accounts (Password: password123):</span>
          <ul className="list-disc pl-4 space-y-0.5 font-mono">
            <li>Customer: <span className="font-bold">buyer@agrolink.com</span></li>
            <li>Farmer: <span className="font-bold">rahim@agrolink.com</span></li>
            <li>Business Buyer: <span className="font-bold">restaurant@agrolink.com</span></li>
            <li>Admin Role: <span className="font-bold">admin@agrolink.com</span></li>
          </ul>
        </div>

        {/* Switch Link */}
        <p className="text-center text-xs text-slate-400">
          New to AgroLink BD?{' '}
          <Link to="/register" className="font-semibold text-emerald-500 hover:underline">
            Create an Account
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
