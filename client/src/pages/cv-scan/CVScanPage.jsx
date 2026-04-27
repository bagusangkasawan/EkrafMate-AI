import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSearch, Upload, Loader2, Lock, CheckCircle2, AlertTriangle, Sparkles, ArrowRight, Briefcase, GraduationCap, Star, TrendingUp, Shield, Lightbulb, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

const ScoreGauge = ({ score, label, size = 'md' }) => {
  const radius = size === 'lg' ? 54 : 36;
  const stroke = size === 'lg' ? 7 : 5;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative">
        <svg width={(radius + stroke) * 2} height={(radius + stroke) * 2} className="-rotate-90">
          <circle cx={radius + stroke} cy={radius + stroke} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
          <motion.circle cx={radius + stroke} cy={radius + stroke} r={radius} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1.2, ease: 'easeOut' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-extrabold ${size === 'lg' ? 'text-2xl' : 'text-sm'} text-gray-900`}>{score}</span>
        </div>
      </div>
      {label && <span className="text-xs text-gray-500 font-medium text-center">{label}</span>}
    </div>
  );
};

const BlurredSection = ({ children, title, icon: Icon }) => (
  <div className="relative rounded-2xl border border-gray-100 bg-white p-6 overflow-hidden">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <h3 className="font-bold text-gray-900">{title}</h3>
    </div>
    <div className="filter blur-md select-none pointer-events-none">{children}</div>
    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 rounded-2xl">
      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
        <Lock className="w-6 h-6 text-white" />
      </div>
      <p className="text-sm font-semibold text-gray-700">Login untuk lihat detail</p>
      <div className="flex gap-2">
        <Link to="/login" className="px-4 py-2 text-xs font-semibold text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">Masuk</Link>
        <Link to="/register" className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg hover:shadow-md transition-all">Daftar Gratis</Link>
      </div>
    </div>
  </div>
);

const CVScanPage = () => {
  const { userInfo } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setDragActive(e.type === 'dragenter' || e.type === 'dragover'); }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (droppedFile.size > 5 * 1024 * 1024) {
        setError('Ukuran file terlalu besar. Maksimal 5MB.');
        setFile(null);
        return;
      }
      setFile(droppedFile);
      setError('');
      setResult(null);
    }
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('Ukuran file terlalu besar. Maksimal 5MB.');
        setFile(null);
        e.target.value = '';
        return;
      }
      setFile(selectedFile);
      setError('');
      setResult(null);
    }
  };

  const handleScan = async () => {
    if (!file) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const formData = new FormData();
      formData.append('cv', file);
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (userInfo?.token) config.headers.Authorization = `Bearer ${userInfo.token}`;
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/cv-scan`, formData, config);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menganalisis CV. Silakan coba lagi.');
    } finally { setLoading(false); }
  };

  const a = result?.analysis;

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-16 sm:py-20 mesh-gradient dot-pattern overflow-hidden">
        <div className="absolute top-10 left-10 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute bottom-0 right-10 w-64 h-64 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-primary-200 shadow-sm mb-6">
            <FileSearch className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-semibold text-primary-700">AI-Powered CV Analysis</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
            Scan CV Anda dengan <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600">Azure AI</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Dapatkan analisis mendalam tentang CV Anda menggunakan Azure Document Intelligence dan GPT 5.4 Mini. Ketahui kesiapan freelance Anda di EkrafMate!
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 pb-20">
        {/* Upload Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 mb-10">
          <div
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all ${dragActive ? 'border-primary-500 bg-primary-50/50' : file ? 'border-green-300 bg-green-50/30' : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'}`}
          >
            <input type="file" accept=".pdf,.jpg,.jpeg,.png,.bmp,.tiff" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" id="cv-upload" />
            {file ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center"><CheckCircle2 className="w-7 h-7 text-green-600" /></div>
                <div>
                  <p className="font-semibold text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button onClick={() => { setFile(null); setResult(null); }} className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"><X className="w-3 h-3" /> Hapus file</button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center"><Upload className="w-7 h-7 text-primary-600" /></div>
                <div>
                  <p className="font-semibold text-gray-900">Drag & drop CV Anda di sini</p>
                  <p className="text-sm text-gray-500 mt-1">atau klik untuk memilih file</p>
                </div>
                <p className="text-xs text-gray-400">PDF, JPEG, PNG, BMP, TIFF — maks 5MB</p>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}

          <button onClick={handleScan} disabled={!file || loading} className="w-full mt-6 py-3.5 bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/25 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all flex items-center justify-center gap-2">
            {loading ? (<><Loader2 className="w-5 h-5 animate-spin" />Menganalisis CV...</>) : (<><FileSearch className="w-5 h-5" />Scan CV Sekarang</>)}
          </button>

          {!userInfo && (
            <p className="mt-3 text-xs text-center text-gray-400 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" /> Hasil preview tanpa login. <Link to="/login" className="text-primary-600 font-medium hover:underline">Login</Link> untuk hasil lengkap.
            </p>
          )}

          <div className="mt-4 grid grid-cols-3 gap-3">
            {[{ icon: Shield, label: 'Azure Document Intelligence' }, { icon: Sparkles, label: 'GPT 5.4 Mini Analysis' }, { icon: TrendingUp, label: 'Freelance Readiness' }].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 rounded-xl">
                <item.icon className="w-4 h-4 text-primary-500" />
                <span className="text-[10px] text-gray-500 text-center font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Loading State */}
        <AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto mb-10">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-4 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-purple-500 rounded-2xl animate-pulse" />
                  <div className="absolute inset-1 bg-white rounded-xl flex items-center justify-center"><FileSearch className="w-8 h-8 text-primary-600 animate-pulse" /></div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Menganalisis CV Anda...</h3>
                <p className="text-sm text-gray-500 mb-4">Azure AI sedang membaca dan menganalisis dokumen Anda</p>
                <div className="flex justify-center gap-6 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />OCR Extraction</span>
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />AI Analysis</span>
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 bg-gray-300 rounded-full" />Scoring</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && a && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
              {/* Overview Card */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <ScoreGauge score={a.overallScore || 0} label="Skor CV" size="lg" />
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-2xl font-extrabold text-gray-900">{a.name || 'Hasil Analisis CV'}</h2>
                    {a.headline && <p className="text-sm text-primary-600 font-medium mt-1">{a.headline}</p>}
                    <p className="text-sm text-gray-500 mt-2 leading-relaxed">{a.summary}</p>
                    {a.freelanceReadiness && (
                      <div className={`inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full text-xs font-semibold ${a.freelanceReadiness.score >= 70 ? 'bg-green-100 text-green-700' : a.freelanceReadiness.score >= 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        <TrendingUp className="w-3.5 h-3.5" />{a.freelanceReadiness.verdict} — Skor {a.freelanceReadiness.score}/100
                      </div>
                    )}
                  </div>
                </div>
                {/* Score Breakdown */}
                {a.scores && (
                  <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <ScoreGauge score={a.scores.skills || 0} label="Skills" />
                    <ScoreGauge score={a.scores.experience || 0} label="Pengalaman" />
                    <ScoreGauge score={a.scores.education || 0} label="Pendidikan" />
                    <ScoreGauge score={a.scores.presentation || 0} label="Presentasi" />
                  </div>
                )}
              </div>

              {/* Detailed Sections — blurred if not authenticated */}
              {result.authenticated ? (
                <>
                  {/* Skills */}
                  {a.skills?.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                      <div className="flex items-center gap-2 mb-4"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center"><Star className="w-4 h-4 text-white" /></div><h3 className="font-bold text-gray-900">Skills Terdeteksi</h3></div>
                      <div className="flex flex-wrap gap-2">{a.skills.map((s, i) => <span key={i} className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium">{s}</span>)}</div>
                    </div>
                  )}
                  {/* Experience */}
                  {a.experience?.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                      <div className="flex items-center gap-2 mb-4"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"><Briefcase className="w-4 h-4 text-white" /></div><h3 className="font-bold text-gray-900">Pengalaman Kerja</h3></div>
                      <div className="space-y-4">{a.experience.map((e, i) => <div key={i} className="p-4 bg-gray-50 rounded-xl"><div className="flex justify-between items-start"><div><p className="font-semibold text-gray-900">{e.title}</p><p className="text-sm text-primary-600">{e.company}</p></div><span className="text-xs text-gray-400 bg-white px-2 py-1 rounded-lg">{e.duration}</span></div>{e.highlights && <p className="text-sm text-gray-500 mt-2">{e.highlights}</p>}</div>)}</div>
                    </div>
                  )}
                  {/* Education */}
                  {a.education?.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                      <div className="flex items-center gap-2 mb-4"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center"><GraduationCap className="w-4 h-4 text-white" /></div><h3 className="font-bold text-gray-900">Pendidikan</h3></div>
                      <div className="space-y-3">{a.education.map((e, i) => <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl"><div><p className="font-semibold text-gray-900">{e.degree}</p><p className="text-sm text-gray-500">{e.institution}</p></div><span className="text-xs text-gray-400">{e.year}</span></div>)}</div>
                    </div>
                  )}
                  {/* Strengths & Improvements */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {a.strengths?.length > 0 && (
                      <div className="bg-white rounded-2xl border border-gray-100 p-6">
                        <div className="flex items-center gap-2 mb-4"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-white" /></div><h3 className="font-bold text-gray-900">Kekuatan</h3></div>
                        <ul className="space-y-2">{a.strengths.map((s, i) => <li key={i} className="flex items-start gap-2 text-sm text-gray-600"><CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />{s}</li>)}</ul>
                      </div>
                    )}
                    {a.improvements?.length > 0 && (
                      <div className="bg-white rounded-2xl border border-gray-100 p-6">
                        <div className="flex items-center gap-2 mb-4"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center"><Lightbulb className="w-4 h-4 text-white" /></div><h3 className="font-bold text-gray-900">Saran Perbaikan</h3></div>
                        <ul className="space-y-2">{a.improvements.map((s, i) => <li key={i} className="flex items-start gap-2 text-sm text-gray-600"><Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />{s}</li>)}</ul>
                      </div>
                    )}
                  </div>
                  
                  {/* AI Job Matches & Skill Gap */}
                  {result.projectMatches?.length > 0 && (
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">AI Job Match & Skill Gap</h3>
                          <p className="text-sm text-gray-500">Rekomendasi proyek berdasarkan kecocokan CV Anda</p>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        {result.projectMatches.map((match, idx) => (
                          <div key={idx} className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                              <div>
                                <h4 className="font-bold text-lg text-gray-900">
                                  <Link to={`/project/${match.project._id}`} className="hover:text-primary-600 transition-colors" target="_blank">
                                    {match.project.title}
                                  </Link>
                                </h4>
                                <p className="text-sm text-gray-500 line-clamp-1">{match.project.description}</p>
                              </div>
                              <div className="flex gap-4 flex-shrink-0">
                                <div className="text-center">
                                  <div className="text-2xl font-extrabold text-primary-600">{match.matchAnalysis.matchScore}%</div>
                                  <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Match</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-extrabold text-emerald-600">{match.matchAnalysis.successScore}%</div>
                                  <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Peluang</div>
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-700 italic mb-4">"{match.matchAnalysis.reasoning}"</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Skill Gap Analyzer */}
                              <div className="bg-white p-4 rounded-xl border border-red-50">
                                <div className="flex items-center gap-1.5 mb-3">
                                  <AlertTriangle className="w-4 h-4 text-red-500" />
                                  <span className="text-sm font-semibold text-gray-900">Skill Gap Analyzer</span>
                                </div>
                                {match.matchAnalysis.skillGap?.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {match.matchAnalysis.skillGap.map((skill, i) => (
                                      <span key={i} className="px-2.5 py-1 bg-red-50 text-red-600 rounded-md text-xs font-medium border border-red-100">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-500">Anda memenuhi semua requirement!</p>
                                )}
                              </div>
                              
                              {/* AI Learning Recommendation */}
                              <div className="bg-white p-4 rounded-xl border border-blue-50">
                                <div className="flex items-center gap-1.5 mb-2">
                                  <GraduationCap className="w-4 h-4 text-blue-500" />
                                  <span className="text-sm font-semibold text-gray-900">Learning Recommendation</span>
                                </div>
                                <p className="text-xs text-gray-600 mb-2">{match.matchAnalysis.learningRecommendation?.message}</p>
                                {match.matchAnalysis.learningRecommendation?.topics?.length > 0 && (
                                  <ul className="list-disc list-inside text-xs text-blue-700 space-y-1">
                                    {match.matchAnalysis.learningRecommendation.topics.map((topic, i) => (
                                      <li key={i}>{topic}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Roles & Tips */}
                  {(a.recommendedRoles?.length > 0 || a.freelanceReadiness?.tips?.length > 0) && (
                    <div className="bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 rounded-3xl p-6 sm:p-8 text-white">
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5" /> Rekomendasi untuk EkrafMate</h3>
                      {a.recommendedRoles?.length > 0 && <div className="mb-4"><p className="text-sm text-white/70 mb-2">Peran yang cocok untuk Anda:</p><div className="flex flex-wrap gap-2">{a.recommendedRoles.map((r, i) => <span key={i} className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium">{r}</span>)}</div></div>}
                      {a.freelanceReadiness?.tips?.length > 0 && <div><p className="text-sm text-white/70 mb-2">Tips untuk meningkatkan profil:</p><ul className="space-y-2">{a.freelanceReadiness.tips.map((t, i) => <li key={i} className="flex items-start gap-2 text-sm"><ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-white/60" />{t}</li>)}</ul></div>}
                    </div>
                  )}
                </>
              ) : (
                /* Blurred sections for non-authenticated users */
                <>
                  <BlurredSection title="Skills Terdeteksi" icon={Star}>
                    <div className="flex flex-wrap gap-2">{Array(6).fill(0).map((_, i) => <span key={i} className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm">Skill placeholder {i + 1}</span>)}</div>
                  </BlurredSection>
                  <BlurredSection title="Pengalaman Kerja" icon={Briefcase}>
                    <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="p-4 bg-gray-50 rounded-xl"><p className="font-medium">Position Title {i + 1}</p><p className="text-sm text-gray-400">Company Name — 2020-2024</p></div>)}</div>
                  </BlurredSection>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <BlurredSection title="Kekuatan" icon={CheckCircle2}><ul className="space-y-2">{Array(3).fill(0).map((_, i) => <li key={i} className="text-sm">Strength point {i + 1}</li>)}</ul></BlurredSection>
                    <BlurredSection title="Saran Perbaikan" icon={Lightbulb}><ul className="space-y-2">{Array(3).fill(0).map((_, i) => <li key={i} className="text-sm">Improvement point {i + 1}</li>)}</ul></BlurredSection>
                  </div>
                  {/* CTA */}
                  <div className="bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-center text-white">
                    <Lock className="w-10 h-10 mx-auto mb-3 text-white/80" />
                    <h3 className="text-xl font-bold mb-2">Buka Hasil Lengkap</h3>
                    <p className="text-sm text-white/70 mb-5 max-w-md mx-auto">Login atau daftar gratis untuk melihat detail skills, pengalaman, rekomendasi peran, dan tips karir Anda.</p>
                    <div className="flex gap-3 justify-center">
                      <Link to="/login" className="px-6 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:shadow-lg transition-all">Masuk</Link>
                      <Link to="/register" className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/30 hover:bg-white/30 transition-all">Daftar Gratis</Link>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CVScanPage;
