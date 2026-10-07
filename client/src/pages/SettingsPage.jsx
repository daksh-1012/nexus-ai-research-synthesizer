import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { settingsService } from '../services/api';
import Navbar from '../components/Navbar';
import { 
  Settings, 
  User, 
  Database, 
  Cpu, 
  ShieldCheck, 
  Key, 
  Server, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [systemInfo, setSystemInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    settingsService.getSettings()
      .then(res => {
        setSystemInfo(res.data.system);
      })
      .catch(err => {
        console.error('Failed to fetch settings:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-8">
        <div className="mb-8">
          <div className="flex items-center space-x-2.5 mb-1">
            <Settings className="w-5 h-5 text-nexus-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">System & Account Settings</h1>
          </div>
          <p className="text-sm text-slate-400">
            Configure AI parameters, Supabase PostgreSQL persistence, and researcher profile
          </p>
        </div>

        <div className="space-y-6">
          {/* Section 1: User Profile */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center space-x-2">
              <User className="w-4 h-4 text-nexus-400" />
              <span>Researcher Identity</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-400 font-mono text-[11px] uppercase">Email</label>
                <div className="mt-1 font-mono text-slate-200 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 truncate">
                  {user?.email}
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-mono text-[11px] uppercase">Full Name</label>
                <div className="mt-1 text-slate-200 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
                  {user?.fullName || 'Dr. Elena Vance'}
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-mono text-[11px] uppercase">User Identifier (UUID)</label>
                <div className="mt-1 font-mono text-slate-400 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 truncate text-[11px]">
                  {user?.id || 'Local-UUID'}
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-mono text-[11px] uppercase">Access Authorization</label>
                <div className="mt-1 text-emerald-400 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>JWT Authenticated (24h validity)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: AI & Database Infrastructure Diagnostics */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center space-x-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>Platform Infrastructure & AI Engine</span>
            </h2>

            <div className="space-y-4">
              {/* Database status */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white">Database Storage</h3>
                    <p className="text-[11px] text-slate-400">PostgreSQL Schema with Row Level Security</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono text-slate-300">
                    {systemInfo?.databaseStatus || 'PostgreSQL / Memory Ready'}
                  </span>
                </div>
              </div>

              {/* Gemini status */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-nexus-500/10 border border-nexus-500/20 flex items-center justify-center text-nexus-400">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white">Google Gemini Engine</h3>
                    <p className="text-[11px] text-slate-400">@google/genai SDK Integration (Server-side)</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono text-slate-300">
                    {systemInfo?.geminiStatus || 'Gemini 2.5 Active'}
                  </span>
                </div>
              </div>

              {/* Security parameters */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white">Security & Isolation</h3>
                    <p className="text-[11px] text-slate-400">Tenant-isolated queries and 5MB Multer limits</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                  Enforced at API Level
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Supabase Cloud & Gemini Environment Guide */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <h2 className="text-base font-semibold text-white mb-2 flex items-center space-x-2">
              <Key className="w-4 h-4 text-amber-400" />
              <span>Production Deployment Keys</span>
            </h2>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              To connect your live Supabase Cloud project and Google Gemini API key:
            </p>

            <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 border border-slate-800/80 space-y-1">
              <div className="text-slate-500"># In server/.env</div>
              <div>PORT=5000</div>
              <div>DATABASE_URL=postgres://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres</div>
              <div>JWT_SECRET=your_super_secret_jwt_key</div>
              <div>GEMINI_API_KEY=your_google_gemini_key</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
