import React, { useState } from 'react';
import { FaGoogle, FaFacebookF, FaGithub, FaLinkedinIn } from 'react-icons/fa';

function SignupForm({ setIsLogin }) {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
  });

  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSendOtp = async () => {
  if (!form.email) {
    setMessage('❌ Please enter your email first.');
    return;
  }

  try {
    const endpoint = otpSent
      ? 'http://localhost:5000/api/auth/resend-otp'
      : 'http://localhost:5000/api/auth/send-otp';

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: form.email }),
    });

    const data = await res.json();
    if (res.ok) {
      setOtpSent(true);
      setMessage(otpSent ? '🔄 OTP resent successfully!' : '✅ OTP sent to your email!');
    } else {
      setMessage(`❌ ${data.message || 'Failed to send OTP.'}`);
    }
  } catch (error) {
    setMessage('❌ Network error while sending OTP.');
  }
};

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (form.password !== form.confirmPassword) {
    setMessage('❌ Passwords do not match.');
    return;
  }

  if (!otpSent || !form.otp) {
    setMessage('❌ Please verify OTP first.');
    return;
  }

  try {
    setLoading(true);

    // 🔐 1. Verify OTP first
    const otpRes = await fetch('http://localhost:5000/api/auth/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: form.email, otp: form.otp }),
    });

    const otpData = await otpRes.json();
    if (!otpRes.ok) {
      setMessage(`❌ ${otpData.message || 'Invalid OTP.'}`);
      setLoading(false);
      return; 
    }

    // ✅ 2. Proceed with registration only if OTP is valid
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: form.username,
        email: form.email,
        password: form.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(`❌ ${data.message || 'Registration failed.'}`);
    } else {
      setMessage('✅ Registration successful!');
      setForm({ username: '', email: '', password: '', confirmPassword: '', otp: '' });

      setTimeout(() => {
        setIsLogin(true);
      }, 1500);
    }
  } catch (err) {
    setMessage('❌ Something went wrong.');
  } finally {
    setLoading(false);
  }
};


  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
      <h2 className="text-3xl font-bold text-center text-blue-600">Register</h2>

      {message && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-lg mb-4">
          <p className="font-bold">Info</p>
          <p>{message}</p>
        </div>
      )}

      <div className="flex items-center border px-4 py-2 rounded-lg border-gray-300 focus-within:ring-2 ring-blue-400 transition">
        <span className="mr-3 text-gray-500">👤</span>
        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="Username"
          required
          className="w-full outline-none bg-transparent"
        />
      </div>

      <div className="flex items-center border px-4 py-2 rounded-lg border-gray-300 focus-within:ring-2 ring-blue-400 transition">
        <span className="mr-3 text-gray-500">✉️</span>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          required
          className="w-full outline-none bg-transparent"
        />
      </div>

      {otpSent && (
        <div className="flex items-center border px-4 py-2 rounded-lg border-gray-300 focus-within:ring-2 ring-blue-400 transition">
          <input
            name="otp"
            type="text"
            value={form.otp}
            onChange={handleChange}
            placeholder="Enter OTP"
            required
            className="w-full outline-none bg-transparent"
          />
        </div>
      )}

      <button
        type="button"
        onClick={handleSendOtp}
        className="w-full text-sm text-blue-600 hover:underline text-right"
      >
        {otpSent ? 'Resend OTP' : 'Send OTP'}
      </button>

      <div className="flex items-center border px-4 py-2 rounded-lg border-gray-300 focus-within:ring-2 ring-blue-400 transition">
        <span className="mr-3 text-gray-500">🔒</span>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          required
          className="w-full outline-none bg-transparent"
        />
      </div>

      <div className="flex items-center border px-4 py-2 rounded-lg border-gray-300 focus-within:ring-2 ring-blue-400 transition">
        <span className="mr-3 text-gray-500">🔒</span>
        <input
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm Password"
          required
          className="w-full outline-none bg-transparent"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? 'Registering...' : 'Register'}
      </button>

      <div className="text-center text-sm text-gray-600">or sign up with</div>
      <div className="flex justify-center gap-3">
        <div className="flex justify-center gap-3">
  <button type="button" className="w-10 h-10 flex items-center justify-center bg-white border rounded-full shadow hover:scale-105 transition">
    <FaGoogle className="text-red-500 text-lg" />
  </button>
  <button type="button" className="w-10 h-10 flex items-center justify-center bg-white border rounded-full shadow hover:scale-105 transition">
    <FaFacebookF className="text-blue-600 text-lg" />
  </button>
  <button type="button" className="w-10 h-10 flex items-center justify-center bg-white border rounded-full shadow hover:scale-105 transition">
    <FaGithub className="text-gray-800 text-lg" />
  </button>
  <button type="button" className="w-10 h-10 flex items-center justify-center bg-white border rounded-full shadow hover:scale-105 transition">
    <FaLinkedinIn className="text-blue-700 text-lg" />
  </button>
</div>

      </div>
    </form>
  );
}



export function LoginForm() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');

  const [showForgot, setShowForgot] = useState(false);
  const [resetForm, setResetForm] = useState({ email: '', otp: '', newPassword: '' });
  const [resetMessage, setResetMessage] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.username,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(`❌ ${data.message || 'Login failed'}`);
      } else {
        localStorage.setItem('token', data.token);
        setMessage('✅ Login successful!');
      }
    } catch (err) {
      setMessage('❌ Network error.');
    }
  };

  const handleForgotOtp = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetForm.email }),
      });
      const data = await res.json();
      if (!res.ok) return setResetMessage(`❌ ${data.message}`);
      setOtpSent(true);
      setResetMessage('✅ OTP sent to your email.');
    } catch (err) {
      setResetMessage('❌ Failed to send OTP.');
    }
  };

  const handleResetPassword = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resetForm),
      });
      const data = await res.json();
      setResetMessage(data.message);
      if (res.ok) {
        setTimeout(() => {
          setShowForgot(false);
          setOtpSent(false);
          setResetForm({ email: '', otp: '', newPassword: '' });
        }, 2000);
      }
    } catch (err) {
      setResetMessage('❌ Reset failed.');
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5 w-full max-w-sm">
        <h2 className="text-3xl font-bold text-center text-blue-600">Login</h2>

        {message && (
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-lg mb-4">
            <p className="font-bold">Info</p>
            <p>{message}</p>
          </div>
        )}

        <div className="flex items-center border border-gray-300 px-4 py-2 rounded-lg">
          <span className="mr-3 text-gray-500">✉️</span>
          <input
            name="username"
            type="email"
            value={form.username}
            onChange={handleChange}
            placeholder="Email"
            required
            className="w-full outline-none bg-transparent"
          />
        </div>

        <div className="flex items-center border border-gray-300 px-4 py-2 rounded-lg">
          <span className="mr-3 text-gray-500">🔒</span>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            required
            className="w-full outline-none bg-transparent"
          />
        </div>

        <p
          onClick={() => setShowForgot(true)}
          className="text-sm text-right text-blue-600 cursor-pointer hover:underline"
        >
          Forgot password?
        </p>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Login
        </button>

        <div className="text-center text-sm text-gray-600">or sign in with</div>
        <div className="flex justify-center gap-3">
          <button type="button" className="w-10 h-10 flex items-center justify-center bg-white border rounded-full shadow hover:scale-105 transition">
            <FaGoogle className="text-red-500 text-lg" />
          </button>
          <button type="button" className="w-10 h-10 flex items-center justify-center bg-white border rounded-full shadow hover:scale-105 transition">
            <FaFacebookF className="text-blue-600 text-lg" />
          </button>
          <button type="button" className="w-10 h-10 flex items-center justify-center bg-white border rounded-full shadow hover:scale-105 transition">
            <FaGithub className="text-gray-800 text-lg" />
          </button>
          <button type="button" className="w-10 h-10 flex items-center justify-center bg-white border rounded-full shadow hover:scale-105 transition">
            <FaLinkedinIn className="text-blue-700 text-lg" />
          </button>
        </div>
      </form>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 space-y-4 shadow-lg">
            <h2 className="text-lg font-bold">Forgot Password</h2>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={resetForm.email}
              onChange={(e) => setResetForm({ ...resetForm, email: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />

            {otpSent && (
              <>
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter OTP"
                  value={resetForm.otp}
                  onChange={(e) => setResetForm({ ...resetForm, otp: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
                <input
                  type="password"
                  name="newPassword"
                  placeholder="New Password"
                  value={resetForm.newPassword}
                  onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </>
            )}

            <div className="flex justify-between">
              {!otpSent ? (
                <button onClick={handleForgotOtp} className="bg-blue-600 text-white px-4 py-2 rounded">Send OTP</button>
              ) : (
                <button onClick={handleResetPassword} className="bg-green-600 text-white px-4 py-2 rounded">Reset</button>
              )}
              <button onClick={() => setShowForgot(false)} className="text-gray-600">Cancel</button>
            </div>

            {resetMessage && <p className="text-sm text-red-600">{resetMessage}</p>}
          </div>
        </div>
      )}
    </>
  );
}
