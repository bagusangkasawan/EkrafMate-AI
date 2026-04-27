import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, UserCheck, Star, Loader2, Users, ArrowRight } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.08 } }),
};

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/search/creatives`, { query });
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)]">
      {/* Hero Search Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-purple-600 to-accent-600 py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-10" />
        <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" /> AI Semantic Search
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
              Temukan Talenta <span className="text-yellow-300">Kreatif</span>
            </h1>
            <p className="text-white/70 max-w-xl mx-auto mb-8">
              Cari berdasarkan keahlian, deskripsi, atau kebutuhan proyek. AI kami memahami konteks pencarian Anda.
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
                placeholder='Contoh: "Desainer UI/UX berpengalaman di e-commerce"'
                className="w-full pl-14 pr-36 py-5 bg-white rounded-2xl shadow-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-gradient-to-r from-primary-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg disabled:opacity-60 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cari'}
              </button>
            </div>
          </motion.form>
        </div>
      </section>

      {/* Results */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-500 text-sm">Mencari talenta terbaik...</p>
            </motion.div>
          ) : searched && results.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">Tidak Ada Hasil</h3>
              <p className="text-gray-500 text-sm">Coba gunakan kata kunci yang berbeda atau lebih umum.</p>
            </motion.div>
          ) : results.length > 0 ? (
            <motion.div key="results" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
              <p className="text-sm text-gray-500 mb-6">
                Ditemukan <span className="font-semibold text-gray-700">{results.length}</span> talenta
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {results.map((user) => (
                  <motion.div key={user._id} variants={fadeUp}>
                    <Link
                      to={`/profile/${user._id}`}
                      className="block bg-white rounded-2xl border border-gray-100 p-6 hover-card group"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-purple-400 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-lg">{user.name?.charAt(0)?.toUpperCase()}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                            {user.name}
                          </h3>
                          <p className="text-sm text-primary-600 font-medium truncate">{user.headline || 'Creative'}</p>
                        </div>
                        {user.isVerified && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full flex-shrink-0">
                            <UserCheck className="w-3 h-3" /> Verified
                          </span>
                        )}
                      </div>

                      {user.description && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{user.description}</p>
                      )}

                      {user.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {user.skills.slice(0, 4).map((skill) => (
                            <span key={skill} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                              {skill}
                            </span>
                          ))}
                          {user.skills.length > 4 && (
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-400 text-xs font-medium rounded-lg">
                              +{user.skills.length - 4}
                            </span>
                          )}
                        </div>
                      )}

                      {user.score != null && (
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <span className="text-xs text-gray-400">Relevansi</span>
                          <div className="flex items-center gap-1.5">
                            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full"
                                style={{ width: `${Math.min(user.score * 100, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-primary-600">
                              {(user.score * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        Lihat Profil <ArrowRight className="w-4 h-4" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="initial" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Search className="w-9 h-9 text-primary-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">Cari Talenta Kreatif</h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                Gunakan pencarian semantik berbasis AI untuk menemukan talenta kreatif yang tepat untuk proyekmu.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
};

export default SearchPage;
