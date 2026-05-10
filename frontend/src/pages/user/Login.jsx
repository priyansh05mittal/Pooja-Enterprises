import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(null);
  const [otp, setOtp] = useState('');

  useEffect(() => {
  /* global google */

  if (window.google) {
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,

      callback: async (response) => {
        try {
          setLoading(true);

          const decoded = jwtDecode(response.credential);

          const { data } = await api.post('/auth/google', {
            name: decoded.name,
            email: decoded.email,
            googleId: decoded.sub,
            avatar: decoded.picture,
          });

          login(data.user, data.token);

          toast.success(`Welcome ${data.user.name}!`);

          navigate(
            data.user.role === 'admin'
              ? '/admin/dashboard'
              : '/home'
          );
        } catch (error) {
          toast.error(
            error.response?.data?.message ||
              'Google login failed'
          );
        } finally {
          setLoading(false);
        }
      },
    });

    window.google.accounts.id.renderButton(
      document.getElementById('googleSignInDiv'),
      {
        theme: 'outline',
        size: 'large',
        width: '100%',
        shape: 'pill',
      }
    );
  }
}, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate(data.user.role === 'admin' ? '/admin/dashboard' : '/home');
    } catch (err) {
      if (err.response?.data?.userId) setOtpStep(err.response.data.userId);
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { userId: otpStep, otp });
      login(data.user, data.token);
      toast.success('Email verified! Welcome!');
      navigate('/');
    } catch {} finally { setLoading(false); }
  };

  if (otpStep) return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="card">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold mb-2">Verify Email</h1>
            <p className="text-gray-400 text-sm">Enter the 6-digit OTP sent to your email</p>
          </div>
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <input value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter 6-digit OTP" maxLength={6} required className="input text-center text-2xl tracking-widest font-mono" />
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button type="button" onClick={async () => { await api.post('/auth/resend-otp', { userId: otpStep }); toast.success('OTP resent!'); }} className="w-full text-sm text-primary hover:underline cursor-pointer">
              Resend OTP
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="font-display text-4xl font-bold"><span className="text-primary">Shop</span>Elite</Link>
          <p className="text-gray-400 mt-2">Welcome back! Sign in to continue.</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block font-medium uppercase tracking-wide">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} required placeholder="you@example.com" className="input pl-10" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block font-medium uppercase tracking-wide">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} required placeholder="••••••••" className="input pl-10 pr-10" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="remember" checked={form.remember} onChange={e => setForm(f => ({...f, remember: e.target.checked}))} className="rounded border-gray-600 bg-dark-bg text-primary focus:ring-primary" />
                <label htmlFor="remember" className="text-sm text-gray-400">Remember Me</label>
              </div>
              <Link to="/forgot-password" className="text-sm text-primary hover:text-primary-light transition-colors">Forgot password?</Link>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center text-base py-3 disabled:opacity-60">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-dark-border" /></div>
            <div className="relative flex justify-center"><span className="bg-dark-card px-3 text-xs text-gray-500">OR CONTINUE WITH</span></div>
          </div>

          <div id="googleSignInDiv" className="flex justify-center mb-2" />

          <p className="text-center text-sm text-gray-400 mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:text-primary-light font-medium transition-colors">Sign up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
