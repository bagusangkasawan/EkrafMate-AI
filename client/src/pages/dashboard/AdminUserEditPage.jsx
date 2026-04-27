import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Save, KeyRound, Loader2, UserCircle, Mail, Shield, CheckCircle2
} from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const AdminUserEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('creative');
  const [isVerified, setIsVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users/${id}`, config);
        setName(data.name);
        setEmail(data.email);
        setRole(data.role);
        setIsVerified(data.isVerified);
      } catch {
        toast.error('Gagal memuat data pengguna.');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/users/${id}`, { name, email, role, isVerified }, config);
      toast.success('Pengguna berhasil diperbarui!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui pengguna.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password minimum 6 karakter.');
      return;
    }
    setResetting(true);
    try {
      const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/users/${id}/reset-password`, { newPassword }, config);
      toast.success(data.message);
      setNewPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mereset password.');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50/50">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-3xl">
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          {/* Back Button */}
          <motion.div variants={fadeUp}>
            <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
            </button>
          </motion.div>

          {/* Header */}
          <motion.div variants={fadeUp} className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Edit Pengguna</h1>
            <p className="text-gray-500 mt-1">Ubah data pengguna dan kelola akses.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Info Form */}
            <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <UserCircle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Informasi Akun</h2>
              </div>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role</label>
                  <select value={role} onChange={e => setRole(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all">
                    <option value="creative">Creative</option>
                    <option value="client">Client</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <input type="checkbox" id="verified" checked={isVerified} onChange={e => setIsVerified(e.target.checked)} className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                  <label htmlFor="verified" className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Email Terverifikasi
                  </label>
                </div>
                <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl hover:shadow-lg disabled:opacity-60 transition-all duration-300">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </form>
            </motion.div>

            {/* Reset Password Form */}
            <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 p-6 h-fit">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Reset Password</h2>
              </div>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password Baru</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Minimum 6 karakter" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all" />
                </div>
                <button type="submit" disabled={resetting} className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-xl hover:shadow-lg disabled:opacity-60 transition-all duration-300">
                  {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  {resetting ? 'Mereset...' : 'Reset Password'}
                </button>
              </form>
              <p className="text-xs text-gray-400 mt-3">Password yang baru akan langsung aktif tanpa konfirmasi email.</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminUserEditPage;
