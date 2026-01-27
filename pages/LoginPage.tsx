
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage({ onLogin }: { onLogin: (user: any) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        if (authError.message.includes('Email not confirmed')) {
          throw new Error('Verification required. Please check your inbox.');
        }
        throw authError;
      }

      if (!data.user) throw new Error('Authentication returned no user context.');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      onLogin(profile);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Access denied. Verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 selection:bg-blue-600/30">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="mb-12 text-center text-white">
          <div className="inline-flex w-20 h-20 bg-blue-600 rounded-[2rem] items-center justify-center font-black text-4xl mb-8 shadow-2xl shadow-blue-500/20 rotate-3 transition-transform hover:rotate-0">
            X
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-3 italic">SYSTEM ACCESS</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">xMDR Portal Environment</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Identity Endpoint</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input
                    type="email"
                    required
                    disabled={loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@xmdr.com"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-14 pr-6 text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600/50 transition-all placeholder:text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Secure Keyphrase</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input
                    type="password"
                    required
                    disabled={loading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-14 pr-6 text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600/50 transition-all placeholder:text-slate-700"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-bold text-center animate-in shake duration-300">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : (
                <>Establish Session <ArrowRight size={20} /></>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
              No access token?{' '}
              <Link to="/signup" className="text-blue-500 hover:text-blue-400 transition-colors">
                Request Onboarding
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
