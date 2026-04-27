import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { useDispatch } from 'react-redux';
import { updateUserInfo } from '../../redux/slices/authSlice';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Save, Lock, UserCircle, Mail, AtSign, Loader2, Shield } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const ProfileSettingsPage = () => {
  const { userInfo } = useAuth();
  const dispatch = useDispatch();

  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (userInfo) {
      setUsername(userInfo.username);
      setName(userInfo.name);
      setEmail(userInfo.email);
    }
  }, [userInfo]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/api/users/profile`, { name, email }, config);
      dispatch(updateUserInfo(data));
      toast.success('Profil berhasil diperbarui!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui profil.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Password baru dan konfirmasi tidak cocok.');
      return;
    }
    setLoadingPassword(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`${import.meta.env.VITE_API_URL}/api/users/profile/change-password`, { currentPassword, newPassword, confirmPassword }, config);
      toast.success('Password berhasil diubah!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengubah password.');
    } finally {
      setLoadingPassword(false);
    }
  };

  const PasswordInput = ({ label, value, onChange, show, onToggle }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all"
          required
        />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-4xl">
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.div variants={fadeUp} className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Pengaturan Akun</h1>
            <p className="text-gray-500 mt-1">Kelola informasi profil dan keamanan akunmu.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Form */}
            <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <UserCircle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Informasi Profil</h2>
              </div>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Username</label>
                  <div className="relative">
                    <AtSign className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" value={username} disabled className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Username tidak dapat diubah.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      disabled={userInfo?.isVerified}
                      className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm transition-all ${userInfo?.isVerified ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500'}`}
                    />
                  </div>
                  {userInfo?.isVerified && <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Shield className="w-3 h-3 text-green-500" /> Email terverifikasi, tidak bisa diubah.</p>}
                </div>
                <button type="submit" disabled={loadingProfile} className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl hover:shadow-lg disabled:opacity-60 transition-all duration-300">
                  {loadingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {loadingProfile ? 'Menyimpan...' : 'Simpan Profil'}
                </button>
              </form>
            </motion.div>

            {/* Password Form */}
            <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 p-6 h-fit">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Ubah Password</h2>
              </div>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <PasswordInput label="Password Saat Ini" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} show={showCurrentPassword} onToggle={() => setShowCurrentPassword(!showCurrentPassword)} />
                <PasswordInput label="Password Baru" value={newPassword} onChange={e => setNewPassword(e.target.value)} show={showNewPassword} onToggle={() => setShowNewPassword(!showNewPassword)} />
                <PasswordInput label="Konfirmasi Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} show={showConfirmPassword} onToggle={() => setShowConfirmPassword(!showConfirmPassword)} />
                <button type="submit" disabled={loadingPassword} className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-gray-700 to-gray-900 rounded-xl hover:shadow-lg disabled:opacity-60 transition-all duration-300">
                  {loadingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  {loadingPassword ? 'Menyimpan...' : 'Ubah Password'}
                </button>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
