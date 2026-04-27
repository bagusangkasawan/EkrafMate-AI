import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';
import { ArrowLeft, Briefcase, DollarSign, Tag, Clock, User, Send, CheckCircle2, Loader2, AlertTriangle, GraduationCap, Star } from 'lucide-react';

const statusConfig = {
  open: { label: 'Terbuka', color: 'bg-green-50 text-green-700 border-green-200' },
  in_progress: { label: 'Berlangsung', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  closed: { label: 'Selesai', color: 'bg-gray-50 text-gray-600 border-gray-200' },
};

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const config = {};
        if (userInfo?.token) {
          config.headers = { Authorization: `Bearer ${userInfo.token}` };
        }
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/projects/${id}`, config);
        setProject(data);
      } catch (error) {
        toast.error('Gagal memuat detail proyek.');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleApply = async () => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    setApplying(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(`${import.meta.env.VITE_API_URL}/api/projects/${id}/apply`, {}, config);
      toast.success('Lamaran berhasil dikirim!');
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/projects/${id}`);
      setProject(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal melamar proyek.');
    } finally {
      setApplying(false);
    }
  };

  const formatBudget = (num) => {
    if (!num) return '-';
    return 'Rp ' + Number(num).toLocaleString('id-ID');
  };

  const hasApplied = project?.applicants?.some(a => (a._id || a) === userInfo?._id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-700">Proyek tidak ditemukan</h3>
      </div>
    );
  }

  const status = statusConfig[project.status] || statusConfig.open;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/projects'))}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">{project.title}</h1>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border ${status.color}`}>
                    <Clock className="w-3 h-3" /> {status.label}
                  </span>
                </div>
              </div>

              <div className="prose prose-sm max-w-none text-gray-600">
                {project.description?.split('\n').map((line, i) => (
                  <p key={i} className="text-justify leading-relaxed">{line}</p>
                ))}
              </div>
            </div>

            {/* Skills */}
            {project.requiredSkills?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-primary-500" /> Keahlian Dibutuhkan
                </h2>
                <div className="flex flex-wrap gap-2">
                  {project.requiredSkills.map((skill) => (
                    <span key={skill} className="px-4 py-2 bg-primary-50 text-primary-700 text-sm font-medium rounded-xl border border-primary-100">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AI Job Match Analysis */}
            {project.matchAnalysis && (
              <div className="bg-white rounded-2xl border border-gray-100 p-8">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Analisis Kecocokan AI</h2>
                    <p className="text-sm text-gray-500">Berdasarkan profil kreatif Anda</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 mb-6">
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 italic mb-4">"{project.matchAnalysis.reasoning}"</p>
                  </div>
                  <div className="flex gap-4 flex-shrink-0">
                    <div className="text-center">
                      <div className="text-3xl font-extrabold text-primary-600">{project.matchAnalysis.matchScore}%</div>
                      <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Match</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-extrabold text-emerald-600">{project.matchAnalysis.successScore}%</div>
                      <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Peluang</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Skill Gap Analyzer */}
                  <div className="bg-white p-5 rounded-xl border border-red-50">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <span className="text-sm font-bold text-gray-900">Skill yang Kurang</span>
                    </div>
                    {project.matchAnalysis.skillGap?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {project.matchAnalysis.skillGap.map((skill, i) => (
                          <span key={i} className="px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-medium border border-red-100">
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">Profil Anda memenuhi semua requirement!</p>
                    )}
                  </div>
                  
                  {/* AI Learning Recommendation */}
                  <div className="bg-white p-5 rounded-xl border border-blue-50">
                    <div className="flex items-center gap-2 mb-3">
                      <GraduationCap className="w-5 h-5 text-blue-500" />
                      <span className="text-sm font-bold text-gray-900">Saran Belajar</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{project.matchAnalysis.learningRecommendation?.message}</p>
                    {project.matchAnalysis.learningRecommendation?.topics?.length > 0 && (
                      <ul className="list-disc list-inside text-xs text-blue-700 space-y-1">
                        {project.matchAnalysis.learningRecommendation.topics.map((topic, i) => (
                          <li key={i}>{topic}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Budget Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Info Proyek</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-green-600 font-medium">Anggaran</p>
                    <p className="text-lg font-bold text-green-700">{formatBudget(project.budget)}</p>
                  </div>
                </div>

                {project.owner && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-purple-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{project.owner.name?.charAt(0)?.toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Pemilik Proyek</p>
                      <p className="text-sm font-semibold text-gray-900">{project.owner.name}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Pelamar</p>
                    <p className="text-sm font-semibold text-gray-900">{project.applicants?.length || 0} orang</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Apply Button */}
            {userInfo?.role === 'creative' && project.status === 'open' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                {hasApplied ? (
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <p className="text-sm font-semibold text-green-700">Anda sudah melamar</p>
                  </div>
                ) : (
                  <button
                    onClick={handleApply}
                    disabled={applying}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-primary-500/25 hover:-translate-y-0.5 disabled:opacity-60 transition-all duration-300"
                  >
                    {applying ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Lamar Proyek
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
