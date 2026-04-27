import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { useDispatch } from 'react-redux';
import { fetchUserProfile, updateUserInfo } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import VerificationNotice from '../../components/layout/VerificationNotice';
import {
  Briefcase, FolderOpen, DollarSign, Save, Wand2, Plus, X, Loader2,
  Sparkles, Clock, CheckCircle2, Tag, ChevronDown, TrendingUp, Expand, Shield
} from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const StatCard = ({ icon: Icon, title, value, gradient }) => (
  <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 p-6 hover-card">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-extrabold text-gray-900">{value}</p>
      </div>
    </div>
  </motion.div>
);

const statusConfig = {
  open: { label: 'Terbuka', color: 'bg-green-50 text-green-700' },
  in_progress: { label: 'Berlangsung', color: 'bg-blue-50 text-blue-700' },
  closed: { label: 'Selesai', color: 'bg-gray-100 text-gray-600' },
};

const CreativeDashboardPage = () => {
  const { userInfo } = useAuth();
  const dispatch = useDispatch();
  const [activeProjects, setActiveProjects] = useState([]);
  const [completedProjects, setCompletedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile form
  const [headline, setHeadline] = useState(userInfo?.headline || '');
  const [description, setDescription] = useState(userInfo?.description || '');
  const [skills, setSkills] = useState(userInfo?.skills?.join(', ') || '');
  const [saving, setSaving] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [expandModal, setExpandModal] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/projects/assigned`, config);
      setActiveProjects(data.filter(p => p.status === 'open' || p.status === 'in_progress'));
      setCompletedProjects(data.filter(p => p.status === 'closed'));
    } catch (error) {
      toast.error('Gagal memuat proyek.');
    } finally {
      setLoading(false);
    }
  }, [userInfo.token]);

  useEffect(() => {
    dispatch(fetchUserProfile());
    fetchProjects();
  }, [dispatch, fetchProjects]);

  useEffect(() => {
    if (userInfo) {
      setHeadline(userInfo.headline || '');
      setDescription(userInfo.description || '');
      setSkills(userInfo.skills?.join(', ') || '');
    }
  }, [userInfo]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
      const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/api/users/profile`, { headline, description, skills: skillsArray }, config);
      dispatch(updateUserInfo(data));
      toast.success('Profil berhasil diperbarui!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui profil.');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!headline.trim()) {
      toast.error('Isi headline terlebih dahulu sebelum generate deskripsi.');
      return;
    }
    setGenLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const keyPoints = `Headline: ${headline}, Keahlian: ${skills}`;
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/generate-description`, { keyPoints }, config);
      setDescription(data.description);
      toast.success('Deskripsi dibuat AI!');
    } catch (error) {
      toast.error('Gagal membuat deskripsi.');
    } finally {
      setGenLoading(false);
    }
  };

  const totalEarnings = completedProjects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);

  const calculateTrustScore = () => {
    let score = 0;
    if (userInfo?.headline) score += 20;
    if (userInfo?.description) score += 20;
    if (userInfo?.skills?.length > 0) score += 20;
    if (userInfo?.isVerified) score += 20;
    if (completedProjects.length > 0) score += 20;
    return score;
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {!userInfo.isVerified && <VerificationNotice />}

        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          {/* Header */}
          <motion.div variants={fadeUp} className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Dashboard Creative</h1>
            <p className="text-gray-500 mt-1">Kelola profil dan pantau proyek aktifmu.</p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
            <StatCard icon={FolderOpen} title="Proyek Aktif" value={activeProjects.length} gradient="from-primary-500 to-blue-500" />
            <StatCard icon={CheckCircle2} title="Proyek Selesai" value={completedProjects.length} gradient="from-green-500 to-emerald-500" />
            <StatCard icon={DollarSign} title="Total Pendapatan" value={`Rp ${totalEarnings.toLocaleString('id-ID')}`} gradient="from-purple-500 to-pink-500" />
            <StatCard icon={Shield} title="Trust Score" value={`${calculateTrustScore()}/100`} gradient="from-amber-500 to-orange-500" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Profile Section */}
            <motion.div variants={fadeUp} className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Profil Saya</h2>
                    <p className="text-xs text-gray-500">Perbarui profil agar lebih mudah ditemukan</p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Headline</label>
                    <input
                      type="text"
                      value={headline}
                      onChange={e => setHeadline(e.target.value)}
                      placeholder="Contoh: UI/UX Designer"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-semibold text-gray-700">Deskripsi</label>
                      <button type="button" onClick={() => setExpandModal(true)} className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                        <Expand className="w-3 h-3" /> Expand
                      </button>
                    </div>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      rows="4"
                      placeholder="Ceritakan tentang dirimu..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all resize-none"
                    />
                    <div className="flex justify-end mt-2">
                      <button type="button" onClick={handleGenerateDescription} disabled={genLoading || !headline.trim()} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all">
                        {genLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                        {genLoading ? 'Membuat...' : 'AI Generate'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Keahlian (pisahkan koma)</label>
                    <input
                      type="text"
                      value={skills}
                      onChange={e => setSkills(e.target.value)}
                      placeholder="React, Node.js, UI Design"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all"
                    />
                  </div>

                  <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl hover:shadow-lg disabled:opacity-60 transition-all duration-300">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Menyimpan...' : 'Simpan Profil'}
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Projects Section */}
            <motion.div variants={fadeUp} className="lg:col-span-2 space-y-6">
              {/* Active Projects */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-primary-500" />
                  <h2 className="text-lg font-bold text-gray-900">Proyek Aktif</h2>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                  </div>
                ) : activeProjects.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Belum ada proyek aktif.</p>
                    <Link to="/projects" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 mt-2 hover:text-primary-700">
                      Jelajahi Proyek
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {activeProjects.map(project => {
                      const status = statusConfig[project.status] || statusConfig.open;
                      return (
                        <Link key={project._id} to={`/project/${project._id}`} className="block px-6 py-4 hover:bg-gray-50/50 transition-colors">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-bold text-gray-900 hover:text-primary-600 truncate">{project.title}</h3>
                            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md ${status.color}`}>{status.label}</span>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-1">{project.description}</p>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Completed Projects */}
              {completedProjects.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <h2 className="text-lg font-bold text-gray-900">Riwayat Proyek</h2>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {completedProjects.map(project => (
                      <Link key={project._id} to={`/project/${project._id}`} className="block px-6 py-4 hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-gray-900 truncate">{project.title}</h3>
                          <span className="text-xs font-semibold text-green-600">Rp {Number(project.budget || 0).toLocaleString('id-ID')}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Expand Description Modal */}
      <AnimatePresence>
        {expandModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Edit Deskripsi</h2>
                <button onClick={() => setExpandModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="p-6">
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows="12"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all resize-none"
                />
                <div className="flex justify-end gap-3 mt-4">
                  <button type="button" onClick={handleGenerateDescription} disabled={genLoading || !headline.trim()} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all">
                    {genLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                    {genLoading ? 'Membuat...' : 'AI Generate'}
                  </button>
                  <button onClick={() => setExpandModal(false)} className="px-4 py-2 text-xs font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors">
                    Selesai
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreativeDashboardPage;
