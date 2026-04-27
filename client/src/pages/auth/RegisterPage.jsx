import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { register, clearAuthState } from '../../redux/slices/authSlice';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Sparkles, UserPlus, CheckCircle2, Briefcase, Palette } from 'lucide-react';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('creative');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo, loading, error } = useAuth();

  useEffect(() => {
    dispatch(clearAuthState());
  }, [dispatch]);

  useEffect(() => {
    if (userInfo) navigate('/dashboard');
  }, [userInfo, navigate]);

  useEffect(() => {
    if (turnstileRef.current && window.turnstile) {
      const widgetId = window.turnstile.render(turnstileRef.current, {
        sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
        callback: (token) => setTurnstileToken(token),
        'expired-callback': () => setTurnstileToken(''),
        theme: 'light',
      });
      return () => {
        if (widgetId) window.turnstile.remove(widgetId);
      };
    }
  }, [success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!turnstileToken) return;
    const result = await dispatch(register({ name, username, email, password, role, turnstileToken }));
    if (result.meta.requestStatus === 'fulfilled') {
      setSuccess(true);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex">
      {/* Left - Decorative Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden mesh-gradient items-center justify-center p-12">
        <div className="absolute top-20 right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative text-center max-w-md"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary-500/30">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Bergabung Sekarang!</h2>
          <p className="text-gray-600 leading-relaxed">
            Buat akun gratismu dan mulai menemukan peluang kreatif terbaik yang dicocokkan oleh kecerdasan buatan.
          </p>

          <div className="mt-8 space-y-4 text-left">
            {['AI-powered job matching', 'Gratis untuk memulai', 'Verifikasi akun terpercaya'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center max-w-md"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Registrasi Berhasil!</h2>
              <p className="text-gray-600 leading-relaxed">
                Kami telah mengirimkan email verifikasi. Silakan cek inbox atau folder spam Anda untuk mengaktifkan akun.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 mt-8 px-8 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl hover:shadow-lg transition-all"
              >
                Masuk ke Akun
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md"
            >
              <div className="lg:hidden flex items-center gap-2.5 mb-8">
                <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-extrabold gradient-text">EkrafMate AI</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Buat Akun Baru</h1>
              <p className="mt-2 text-gray-500">
                Sudah punya akun?{' '}
                <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
                  Masuk di sini
                </Link>
              </p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                {/* Role Toggle */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Daftar Sebagai</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('creative')}
                      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold border-2 transition-all duration-200 ${role === 'creative'
                          ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                    >
                      <Palette className="w-4 h-4" />
                      Creative
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('client')}
                      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold border-2 transition-all duration-200 ${role === 'client'
                          ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                    >
                      <Briefcase className="w-4 h-4" />
                      Client
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Lengkap</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Nama kamu"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="username_unik"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="nama@email.com"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Min. 6 karakter"
                      className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div ref={turnstileRef} className="flex justify-center" />

                <button
                  type="submit"
                  disabled={loading || !turnstileToken}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-primary-500/25 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-300"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Buat Akun
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RegisterPage;
