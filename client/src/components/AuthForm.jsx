import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Sparkles, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AuthForm({ mode = 'login', onSubmit, loading, error }) {
  const isLogin = mode === 'login';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localErrors, setLocalErrors] = useState({});

  // Client-side quick validation matching Zod requirements
  const validate = () => {
    const errors = {};
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please provide a valid email format';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    } else if (!/\d/.test(password)) {
      errors.password = 'Password must include at least 1 number';
    }

    if (!isLogin && !fullName.trim()) {
      errors.fullName = 'Full name is required';
    }

    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ email, password, fullName });
    }
  };

  // Demo auto-fill helper for evaluators
  const fillDemoCredentials = () => {
    setEmail('demo@nexus.ai');
    setPassword('Demo1234!');
    setLocalErrors({});
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="glass-panel rounded-2xl p-8 shadow-2xl relative overflow-hidden border border-slate-800">
        {/* Glow Accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-nexus-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Title */}
        <div className="text-center mb-8 relative">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-nexus-500/10 border border-nexus-500/30 text-nexus-400 mb-3 shadow-inner">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {isLogin ? 'Welcome Back to Nexus' : 'Create Researcher Account'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {isLogin
              ? 'Access your synthesized research libraries and insights'
              : 'Join to synthesize literature with Google Gemini intelligence'}
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr. Elena Vance"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-nexus-500/40 transition-all ${
                    localErrors.fullName ? 'border-rose-500' : 'border-slate-800 focus:border-nexus-500'
                  }`}
                />
              </div>
              {localErrors.fullName && (
                <p className="text-[11px] text-rose-400 mt-1">{localErrors.fullName}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="researcher@institute.edu"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-nexus-500/40 transition-all ${
                  localErrors.email ? 'border-rose-500' : 'border-slate-800 focus:border-nexus-500'
                }`}
              />
            </div>
            {localErrors.email && (
              <p className="text-[11px] text-rose-400 mt-1">{localErrors.email}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              {isLogin && (
                <span className="text-[11px] text-slate-500">Min 8 chars, 1 number</span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-11 py-2.5 bg-slate-900/90 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-nexus-500/40 transition-all ${
                  localErrors.password ? 'border-rose-500' : 'border-slate-800 focus:border-nexus-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {localErrors.password && (
              <p className="text-[11px] text-rose-400 mt-1">{localErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-nexus-600 via-nexus-500 to-cyan-500 hover:from-nexus-500 hover:to-cyan-400 shadow-lg shadow-nexus-500/25 hover:shadow-nexus-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{isLogin ? 'Sign In to Workspace' : 'Create Researcher Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Helper Pill */}
        {isLogin && (
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="w-full py-2 px-3 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-300 hover:text-white flex items-center justify-center space-x-2 transition-all group"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-nexus-400 group-hover:scale-110 transition-transform" />
              <span>Fill Demo Credentials (<code className="text-nexus-400 font-mono">demo@nexus.ai</code>)</span>
            </button>
          </div>
        )}

        {/* Switch Link */}
        <div className="text-center mt-6 text-xs text-slate-400">
          {isLogin ? (
            <p>
              Don't have an account yet?{' '}
              <Link to="/register" className="text-nexus-400 hover:text-nexus-300 font-medium underline">
                Sign up
              </Link>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <Link to="/login" className="text-nexus-400 hover:text-nexus-300 font-medium underline">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
