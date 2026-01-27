import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

      const handleSignup = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setMessage('');

      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error || !data.user) throw error;

        // 🔴 CREATE PROFILE ROW
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email,
            display_name: name,
            role: 'user',
            approval_status: 'pending',
          });

        if (profileError) throw profileError;

        setMessage('Signup successful. Awaiting admin approval.');
        setTimeout(() => navigate('/login'), 3000);
      } catch (err: any) {
        setMessage(err.message || 'Signup failed');
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center text-white">
          <h1 className="text-3xl font-bold">Create Account</h1>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl">
          <form onSubmit={handleSignup} className="space-y-6">
            <input
              className="w-full p-3 rounded-xl bg-slate-800 text-white"
              placeholder="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />

            <input
              className="w-full p-3 rounded-xl bg-slate-800 text-white"
              placeholder="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />

            <input
              className="w-full p-3 rounded-xl bg-slate-800 text-white"
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />

            {message && (
              <p className="text-sm text-center text-slate-400">
                {message}
              </p>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-blue-600 py-3 rounded-xl font-bold text-white disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Request Access'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-blue-500 hover:underline">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
