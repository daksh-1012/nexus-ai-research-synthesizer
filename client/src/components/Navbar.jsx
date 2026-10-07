import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { settingsService } from '../services/api';
import { 
  Sparkles, 
  Layers, 
  Settings, 
  LogOut, 
  FileText, 
  Activity, 
  User, 
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [health, setHealth] = useState({ online: true, aiReady: true });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    settingsService.getHealth()
      .then(res => {
        if (mounted && res.data) {
          setHealth({ online: true, aiReady: Boolean(res.data.aiEngine) });
        }
      })
      .catch(() => {
        if (mounted) setHealth({ online: false, aiReady: false });
      });
    return () => { mounted = false; };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-8">
          <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-nexus-600 to-cyan-400 p-0.5 shadow-lg shadow-nexus-500/20 group-hover:shadow-nexus-500/40 transition-all duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-nexus-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Nexus
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold bg-nexus-500/10 text-nexus-400 border border-nexus-500/20 rounded">
                  AI Synthesizer
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5">Evidence Extraction Engine</p>
            </div>
          </Link>

          {/* Main Navigation (Protected) */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                  isActive('/dashboard')
                    ? 'bg-nexus-500/15 text-nexus-300 border border-nexus-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/settings"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                  isActive('/settings')
                    ? 'bg-nexus-500/15 text-nexus-300 border border-nexus-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Link>
            </nav>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Health indicator */}
          <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <span className={`w-2 h-2 rounded-full ${health.online ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-slate-400 font-mono text-[11px]">
              {health.online ? 'API Online' : 'Connecting'}
            </span>
          </div>

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-3 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-nexus-500 to-indigo-600 flex items-center justify-center text-xs font-semibold text-white shadow-sm">
                  {user?.fullName?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-medium text-slate-200 leading-tight">
                    {user?.fullName || 'Researcher'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono leading-tight truncate max-w-[120px]">
                    {user?.email}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1.5 z-50 animate-fade-in"
                  onClick={() => setDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="text-xs font-medium text-slate-300">Signed in as</p>
                    <p className="text-xs text-nexus-400 font-mono truncate">{user?.email}</p>
                  </div>
                  
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-2 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800/80 transition-colors"
                  >
                    <Layers className="w-4 h-4 text-slate-400" />
                    <span>Research Projects</span>
                  </Link>

                  <Link
                    to="/settings"
                    className="flex items-center space-x-2 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800/80 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>System Settings</span>
                  </Link>

                  <div className="border-t border-slate-800 my-1" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-xs sm:text-sm font-medium bg-gradient-to-r from-nexus-500 to-cyan-500 hover:from-nexus-600 hover:to-cyan-600 text-white px-4 py-1.5 rounded-lg shadow-md shadow-nexus-500/20 hover:shadow-nexus-500/40 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
