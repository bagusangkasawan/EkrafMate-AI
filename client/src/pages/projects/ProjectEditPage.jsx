import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';
import { Save, Wand2, ArrowLeft, Loader2 } from 'lucide-react';

const ProjectEditPage = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const [project, setProject] = useState({ title: '', description: '', requiredSkills: '', budget: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [genLoading, setGenLoading] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/projects/${projectId}`, config);
        setProject({ ...data, requiredSkills: data.requiredSkills.join(', ') });
      } catch (error) {
        toast.error('Gagal memuat detail proyek.');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    if (userInfo) fetchProject();
  }, [projectId, navigate, userInfo]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const skillsArray = project.requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
      await axios.put(`${import.meta.env.VITE_API_URL}/api/projects/${projectId}`, { ...project, requiredSkills: skillsArray }, config);
      toast.success('Proyek berhasil diperbarui!');
      if (userInfo.role === 'admin') navigate('/dashboard/admin');
      else navigate('/dashboard/client');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui proyek.');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateDescription = async () => {
    setGenLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const keyPoints = `Judul: ${project.title}, Keahlian: ${project.requiredSkills}, Anggaran: Rp${project.budget}`;
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/projects/generate-description`, { keyPoints }, config);
      setProject(p => ({ ...p, description: data.description }));
      toast.success('Deskripsi berhasil dibuat oleh AI!');
    } catch (error) {
      toast.error('Gagal membuat deskripsi.');
    } finally {
      setGenLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50/50">
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Edit Proyek</h1>
            <button
              onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <form onSubmit={handleUpdate} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Judul Proyek</label>
                <input
                  type="text"
                  value={project.title}
                  onChange={e => setProject({ ...project, title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deskripsi</label>
                <textarea
                  value={project.description}
                  onChange={e => setProject({ ...project, description: e.target.value })}
                  rows="6"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all resize-none"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={genLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:shadow-lg disabled:opacity-60 transition-all"
                  >
                    {genLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                    {genLoading ? 'Membuat...' : 'Buat dengan AI'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Keahlian (pisahkan koma)</label>
                <input
                  type="text"
                  value={project.requiredSkills}
                  onChange={e => setProject({ ...project, requiredSkills: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Anggaran (Rp)</label>
                <input
                  type="text"
                  value={project.budgetFormatted || project.budget}
                  onChange={e => {
                    const onlyNums = e.target.value.replace(/\D/g, '');
                    const formatted = onlyNums.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                    setProject(prev => ({ ...prev, budget: onlyNums, budgetFormatted: formatted }));
                  }}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-primary-500/25 hover:-translate-y-0.5 disabled:opacity-60 transition-all duration-300"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectEditPage;
