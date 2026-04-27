import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, UserCheck, Briefcase, Sparkles, ExternalLink, Shield } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const PublicProfilePage = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/${id}`);
        setUser(data);
      } catch (error) {
        console.error('Gagal memuat profil publik');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50/50">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );

  if (!user)
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-gray-50/50">
        <p className="text-gray-500 text-lg">Profil tidak ditemukan.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-primary-600 font-semibold hover:underline">Kembali ke Beranda</button>
      </div>
    );

  const calculateTrustScore = () => {
    let score = 0;
    if (user?.headline) score += 20;
    if (user?.description) score += 20;
    if (user?.skills?.length > 0) score += 20;
    if (user?.isVerified) score += 20;
    if (user?.portfolio?.length > 0) score += 20;
    return score;
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50/50">
      {/* Hero Banner */}
      <div className="relative h-48 bg-gradient-to-br from-primary-600 via-purple-600 to-pink-500 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.1),transparent_50%)]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 -mt-20 pb-12">
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          {/* Back */}
          <motion.div variants={fadeUp} className="mb-4">
            <button onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))} className="inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>
          </motion.div>

          {/* Profile Card */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg flex-shrink-0">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{user.name}</h1>
                    {user.isVerified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold bg-green-50 text-green-700 rounded-lg border border-green-100">
                        <UserCheck className="w-3.5 h-3.5" /> Terverifikasi
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold bg-amber-50 text-amber-700 rounded-lg border border-amber-100">
                      <Shield className="w-3.5 h-3.5" /> Trust Score: {calculateTrustScore()}/100
                    </span>
                  </div>
                  {user.headline && <p className="text-lg font-semibold gradient-text mt-1">{user.headline}</p>}
                </div>
              </div>

              {/* Description */}
              {user.description && (
                <div className="mt-8">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary-500" /> Tentang
                  </h3>
                  <div className="text-gray-600 space-y-2 leading-relaxed">
                    {user.description.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {user.skills?.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Keahlian</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill) => (
                      <span key={skill} className="px-3 py-1.5 text-sm font-medium bg-primary-50 text-primary-700 rounded-lg">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Portfolio */}
              {user.portfolio?.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary-500" /> Portofolio Proyek
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {user.portfolio.map((project) => (
                      <Link
                        to={`/project/${project._id}`}
                        key={project._id}
                        className="group flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-primary-200 hover:bg-primary-50/50 transition-all duration-200"
                      >
                        <span className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{project.title}</span>
                        <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default PublicProfilePage;
