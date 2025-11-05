import { useState } from 'react';
import { Phone, Mail, User } from 'lucide-react';

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export default function AuthPanel({ onLogin }) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const sendOtp = (e) => {
    e.preventDefault();
    if (!/^[0-9]{10,}$/.test(phone)) {
      alert('Enter a valid phone number');
      return;
    }
    setOtpSent(true);
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData();
      form.append('phone', phone);
      form.append('otp', otp);
      const res = await fetch(`${API}/auth_otp`, { method: 'POST', body: form });
      const data = await res.json();
      if (data.authenticated) {
        const profile = {
          name: name || data.name || 'Farmer',
          phone,
          method: 'otp',
        };
        onLogin(profile);
      } else {
        alert('Invalid OTP. Use 123456 for demo.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while verifying OTP');
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    setLoading(true);
    try {
      const form = new FormData();
      form.append('token', 'demo');
      const res = await fetch(`${API}/auth_google`, { method: 'POST', body: form });
      const data = await res.json();
      if (data.authenticated) {
        const profile = {
          name: name || data.name || 'Google Farmer',
          email: data.email || 'farmer@example.com',
          method: 'google',
        };
        onLogin(profile);
      } else {
        alert('Google sign-in failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network error during Google sign-in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white/70 backdrop-blur border border-gray-200 rounded-2xl p-6 shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Secure Sign In</h2>
      <p className="text-gray-600 mb-6">Login with your phone (OTP) or Gmail. This demo talks to the server for verification.</p>

      <form onSubmit={otpSent ? verifyOtp : sendOtp} className="space-y-4">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-gray-500" />
          <input
            type="tel"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        {otpSent && (
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Enter OTP (use 123456)"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        )}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-emerald-600 text-white rounded-lg px-4 py-2 hover:bg-emerald-700 transition disabled:opacity-60"
          >
            {otpSent ? (loading ? 'Verifying…' : 'Verify OTP') : 'Send OTP'}
          </button>
          <button
            type="button"
            onClick={googleLogin}
            disabled={loading}
            className="flex-1 bg-gray-900 text-white rounded-lg px-4 py-2 hover:bg-black transition disabled:opacity-60"
          >
            Sign in with Google
          </button>
        </div>
      </form>
    </div>
  );
}
