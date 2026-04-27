import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Briefcase, Sparkles, Clock, DollarSign, Tag, Loader2, ArrowRight, FolderOpen } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.08 } }),
};

const statusConfig = {
  open: { label: 'Terbuka', color: 'bg-green-50 text-green-700 border-green-200' },
  in_progress: { label: 'Berlangsung', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  closed: { label: 'Selesai', color: 'bg-gray-50 text-gray-600 border-gray-200' },
};

const ProjectListPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/projects`);
        setProjects(data);
      } catch (error) {
        console.error('Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    setSearchLoading(true);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/search/projects`, { query });
      setSearchResults(data);
    } catch (error) {
      console.error('Search failed');
    } finally {
      setSearchLoading(false);
    }
  };

  const displayProjects = searchResults ?? projects;

  const formatBudget = (num) => {
    if (!num) return '-';
    return 'Rp ' + Number(num).toLocaleString('id-ID');
  };

  return (
    <div className="min-h-[calc(100vh-64px)]">
      {/* Hero Search */}
      <section className="relative bg-gradient-to-br from-purple-600 via-primary-600 to-blue-600 py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-10" />
        <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6">
              <Briefcase className="w-4 h-4" /> Jelajahi Proyek
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
              Temukan Proyek <span className="text-yellow-300">Impianmu</span>
            </h1>
            <p className="text-white/70 max-w-xl mx-auto mb-8">
              Cari proyek yang sesuai dengan keahlianmu menggunakan pencarian semantik AI.
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Contoh: "Proyek desain aplikasi mobile fintech"'
                className="w-full pl-14 pr-36 py-5 bg-white rounded-2xl shadow-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all"
              />
              <button
                type="submit"
                disabled={searchLoading}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-primary-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg disabled:opacity-60 transition-all"
              >
                {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cari'}
              </button>
            </div>
          </motion.form>
        </div>
      </section>

      {/* Project List */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          {loading || searchLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-500 text-sm">Memuat proyek...</p>
            </motion.div>
          ) : displayProjects.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">Belum Ada Proyek</h3>
              <p className="text-gray-500 text-sm">Coba cari dengan kata kunci yang berbeda.</p>
            </motion.div>
          ) : (
            <motion.div key="list" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-700">{displayProjects.length}</span> proyek ditemukan
                </p>
                {searchResults && (
                  <button onClick={() => { setSearchResults(null); setQuery(''); }} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    Reset pencarian
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {displayProjects.map((project) => {
                  const status = statusConfig[project.status] || statusConfig.open;
                  return (
                    <motion.div key={project._id} variants={fadeUp}>
                      <Link
                        to={`/project/${project._id}`}
                        className="block bg-white rounded-2xl border border-gray-100 p-6 hover-card group h-full"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border ${status.color}`}>
                            <Clock className="w-3 h-3" /> {status.label}
                          </span>
                          {project.score != null && (
                            <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded-lg">
                              {(project.score * 100).toFixed(0)}% match
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                          {project.title}
                        </h3>

                        <p className="text-sm text-gray-500 line-clamp-3 mb-4">{project.description}</p>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                          <span className="flex items-center gap-1.5">
                            <DollarSign className="w-4 h-4 text-green-500" />
                            <span className="font-medium text-gray-700">{formatBudget(project.budget)}</span>
                          </span>
                        </div>

                        {project.requiredSkills?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {project.requiredSkills.slice(0, 3).map((skill) => (
                              <span key={skill} className="px-2.5 py-1 bg-purple-50 text-purple-600 text-xs font-medium rounded-lg">
                                {skill}
                              </span>
                            ))}
                            {project.requiredSkills.length > 3 && (
                              <span className="px-2.5 py-1 bg-gray-100 text-gray-400 text-xs font-medium rounded-lg">
                                +{project.requiredSkills.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-1 text-sm font-semibold text-primary-600 pt-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                          Lihat Detail <ArrowRight className="w-4 h-4" />
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
};

export default ProjectListPage;
