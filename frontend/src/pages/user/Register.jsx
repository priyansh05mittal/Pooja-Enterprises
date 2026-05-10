import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', terms: false });
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('register');
  const [userId, setUserId] = useState(null);
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

          navigate('/home');
        } catch (error) {
          toast.error(
            error.response?.data?.message ||
              'Google signup failed'
          );
        } finally {
          setLoading(false);
        }
      },
    });

    window.google.accounts.id.renderButton(
      document.getElementById('googleRegisterDiv'),
      {
        theme: 'outline',
        size: 'large',
        width: '100%',
        shape: 'pill',
      }
    );
  }
}, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (!form.terms) {
      return toast.error('Please accept the terms and conditions');
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      setUserId(data.userId);
      setStep('otp');
      toast.success('OTP sent to your email!');
    } catch {} finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { userId, otp });
      toast.success('Account created successfully! Please login.');
      navigate('/login');
    } catch {} finally { setLoading(false); }
  };

  if (step === 'otp') return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <div className="card">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/20 border-4 border-primary/30 text-primary text-2xl font-bold flex items-center justify-center mx-auto mb-4">✉</div>
            <h1 className="font-display text-3xl font-bold mb-2">Verify Email</h1>
            <p className="text-gray-400 text-sm">We sent a 6-digit code to <span className="text-white">{form.email}</span></p>
          </div>
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <input value={otp} onChange={e => setOtp(e.target.value)} placeholder="000000" maxLength={6} required className="input text-center text-3xl tracking-widest font-mono py-4" />
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center text-base py-3">
              {loading ? 'Verifying...' : 'Verify & Create Account'}
            </button>
            <button type="button" onClick={async () => { await api.post('/auth/resend-otp', { userId }); toast.success('OTP resent!'); }} className="w-full text-sm text-primary hover:underline cursor-pointer">
              Didn't receive? Resend OTP
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
          <p className="text-gray-400 mt-2">Create your account to get started.</p>
        </div>
        <div className="card">
          <form onSubmit={handleRegister} className="space-y-5">
            {[
              { key: 'name', label: 'Full Name', icon: User, type: 'text', placeholder: 'John Doe' },
              { key: 'email', label: 'Email', icon: Mail, type: 'email', placeholder: 'you@example.com' },
              { key: 'phone', label: 'Phone Number', icon: User, type: 'tel', placeholder: '+1 234 567 890' },
            ].map(({ key, label, icon: Icon, type, placeholder }) => (
              <div key={key}>
                <label className="text-xs text-gray-400 mb-1.5 block font-medium uppercase tracking-wide">{label}</label>
                <div className="relative">
                  <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type={type} value={form[key]} onChange={e => setForm(f => ({...f, [key]: e.target.value}))} required placeholder={placeholder} className="input pl-10" />
                </div>
              </div>
            ))}
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block font-medium uppercase tracking-wide">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} required minLength={6} placeholder="Min 6 characters" className="input pl-10 pr-10" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block font-medium uppercase tracking-wide">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type={showConfirmPw ? 'text' : 'password'} value={form.confirmPassword} onChange={e => setForm(f => ({...f, confirmPassword: e.target.value}))} required minLength={6} placeholder="Confirm password" className="input pl-10 pr-10" />
                <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer">
                  {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="terms" checked={form.terms} onChange={e => setForm(f => ({...f, terms: e.target.checked}))} className="rounded border-gray-600 bg-dark-bg text-primary focus:ring-primary" />
              <label htmlFor="terms" className="text-sm text-gray-400">I agree to the Terms and Conditions</label>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center text-base py-3 disabled:opacity-60">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <div className="relative my-6">
  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-t border-dark-border" />
  </div>

  <div className="relative flex justify-center">
    <span className="bg-dark-card px-3 text-xs text-gray-500">
      OR CONTINUE WITH
    </span>
  </div>
</div>

<div
  id="googleRegisterDiv"
  className="flex justify-center"
/>

          </form>
          <p className="text-center text-sm text-gray-400 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary-light font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}