import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0d0d0d] px-5">
      <div className="w-full max-w-md bg-[#1a1a2e] rounded-2xl border border-white/10 p-10 shadow-2xl shadow-black/50 text-center">
        <div className="mb-6">
          <span className="text-4xl">📚</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
        <p className="text-white/40 text-sm mb-8">Login to your Simple Learn account</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white
                placeholder-white/20 outline-none transition-all duration-200
                focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white
                placeholder-white/20 outline-none transition-all duration-200
                focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-emerald-600 hover:bg-emerald-500
              disabled:bg-white/5 disabled:text-white/30
              text-white font-semibold rounded-xl transition-all duration-200
              shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30
              disabled:shadow-none disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-8 text-sm text-white/40">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
