import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { useDispatch } from 'react-redux';
import { fetchUserProfile } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import VerificationNotice from '../../components/layout/VerificationNotice';
import {
  Briefcase, FolderOpen, DollarSign, Plus, Edit, Trash2, Eye, Users,
  Wand2, X, Loader2, CheckCircle2, Clock, ChevronDown, UserCheck
} from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const StatCard = ({ icon: Icon, title, value, color, gradient }) => (
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

const ClientDashboardPage = () => {
  const { userInfo } = useAuth();
  const dispatch = useDispatch();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isApplicantsOpen, setIsApplicantsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', requiredSkills: '', budget: '' });
  const [creating, setCreating] = useState(false);
  const [genLoading, setGenLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/projects/myprojects`, config);
      setProjects(data);
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

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const skillsArray = form.requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
      await axios.post(`${import.meta.env.VITE_API_URL}/api/projects`, { ...form, requiredSkills: skillsArray }, config);
      toast.success('Proyek berhasil dibuat!');
      setForm({ title: '', description: '', requiredSkills: '', budget: '' });
      setIsCreateOpen(false);
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal membuat proyek.');
    } finally {
      setCreating(false);
    }
  };

  const handleAcceptCreative = async (projectId, creativeId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`${import.meta.env.VITE_API_URL}/api/projects/${projectId}/accept`, { creativeId }, config);
      toast.success('Pelamar berhasil diterima!');
      setIsApplicantsOpen(false);
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menerima pelamar.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setIsConfirmOpen(false);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/projects/${deleteTargetId}`, config);
      toast.success('Proyek berhasil dihapus.');
      fetchProjects();
    } catch (error) {
      toast.error('Gagal menghapus proyek.');
    } finally {
      setDeleteTargetId(null);
    }
  };

  const handleGenerateDescription = async () => {
    if (!form.title.trim()) {
      toast.error('Isi judul proyek terlebih dahulu sebelum generate deskripsi.');
      return;
    }
    setGenLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const keyPoints = `Judul: ${form.title}, Keahlian: ${form.requiredSkills}, Anggaran: Rp${form.budget}`;
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/projects/generate-description`, { keyPoints }, config);
      setForm(f => ({ ...f, description: data.description }));
      toast.success('Deskripsi dibuat AI!');
    } catch (error) {
      toast.error('Gagal membuat deskripsi.');
    } finally {
      setGenLoading(false);
    }
  };

  const totalBudget = projects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
  const activeCount = projects.filter(p => p.status === 'open' || p.status === 'in_progress').length;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {!userInfo.isVerified && <VerificationNotice />}

        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          {/* Header */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Dashboard Client</h1>
              <p className="text-gray-500 mt-1">Kelola proyek dan temukan talenta terbaik.</p>
            </div>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-primary-500/25 hover:-translate-y-0.5 transition-all duration-300"
            >
              <Plus className="w-4 h-4" /> Buat Proyek Baru
            </button>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            <StatCard icon={Briefcase} title="Total Proyek" value={projects.length} gradient="from-primary-500 to-blue-500" />
            <StatCard icon={FolderOpen} title="Proyek Aktif" value={activeCount} gradient="from-green-500 to-emerald-500" />
            <StatCard icon={DollarSign} title="Total Anggaran" value={`Rp ${totalBudget.toLocaleString('id-ID')}`} gradient="from-purple-500 to-pink-500" />
          </div>

          {/* Projects */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Daftar Proyek</h2>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-16">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Belum ada proyek. Buat proyek pertamamu!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {projects.map(project => {
                  const status = statusConfig[project.status] || statusConfig.open;
                  return (
                    <div key={project._id} className="px-6 py-5 hover:bg-gray-50/50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Link to={`/project/${project._id}`} className="text-base font-bold text-gray-900 hover:text-primary-600 truncate transition-colors">
                              {project.title}
                            </Link>
                            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-1">{project.description}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => { setSelectedProject(project); setIsApplicantsOpen(true); }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                          >
                            <Users className="w-3.5 h-3.5" /> {project.applicants?.length || 0}
                          </button>
                          <Link
                            to={`/project/${project._id}/edit`}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => { setDeleteTargetId(project._id); setIsConfirmOpen(true); }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Create Project Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Buat Proyek Baru</h2>
                <button onClick={() => setIsCreateOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Judul</label>
                  <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deskripsi</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows="4" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all resize-none" />
                  <div className="flex justify-end mt-2">
                    <button type="button" onClick={handleGenerateDescription} disabled={genLoading || !form.title.trim()} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all">
                      {genLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                      {genLoading ? 'Membuat...' : 'Buat dengan AI'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Keahlian (pisahkan koma)</label>
                  <input type="text" value={form.requiredSkills} onChange={e => setForm({ ...form, requiredSkills: e.target.value })} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Anggaran (Rp)</label>
                  <input
                    type="text"
                    value={form.budgetFormatted || form.budget}
                    onChange={e => {
                      const onlyNums = e.target.value.replace(/\D/g, '');
                      const formatted = onlyNums.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                      setForm(prev => ({ ...prev, budget: onlyNums, budgetFormatted: formatted }));
                    }}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all"
                  />
                </div>
                <button type="submit" disabled={creating} className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl hover:shadow-lg disabled:opacity-60 transition-all duration-300">
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {creating ? 'Membuat...' : 'Buat Proyek'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Applicants Modal */}
      <AnimatePresence>
        {isApplicantsOpen && selectedProject && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Pelamar</h2>
                <button onClick={() => setIsApplicantsOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-6">
                {selectedProject.applicants?.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Belum ada pelamar.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedProject.applicants?.map(applicant => (
                      <div key={applicant._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <Link
                          to={`/profile/${applicant._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setIsApplicantsOpen(false)}
                          className="flex items-center gap-3 flex-1 min-w-0 group"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-bold">{applicant.name?.charAt(0)?.toUpperCase()}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 truncate">{applicant.name}</p>
                            <p className="text-xs text-gray-500 truncate">{applicant.headline || applicant.email}</p>
                          </div>
                        </Link>
                        {selectedProject.status === 'open' && (
                          <button
                            onClick={() => handleAcceptCreative(selectedProject._id, applicant._id)}
                            className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg hover:shadow-md hover:shadow-green-500/25 transition-all"
                          >
                            <UserCheck className="w-3.5 h-3.5" /> Terima
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Hapus Proyek"
        message="Apakah Anda yakin ingin menghapus proyek ini? Tindakan ini tidak dapat dibatalkan."
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ClientDashboardPage;
