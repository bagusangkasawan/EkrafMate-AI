import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Sparkles,
  Search,
  BrainCircuit,
  Handshake,
  Rocket,
  ArrowRight,
  Star,
  Users,
  Briefcase,
  Zap,
  Shield,
  BarChart3,
  CheckCircle2,
  MessageSquare,
  TrendingUp,
  Globe,
  FileSearch,
} from 'lucide-react';

/* ──────────── Animation Helpers ──────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const AnimatedSection = ({ children, className = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ──────────── Stats Counter ──────────── */
const StatItem = ({ icon: Icon, value, label, color }) => (
  <motion.div variants={fadeUp} className="text-center">
    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-${color}-100 mb-3`}>
      <Icon className={`w-6 h-6 text-${color}-600`} />
    </div>
    <div className="text-3xl font-extrabold text-gray-900">{value}</div>
    <div className="text-sm text-gray-500 mt-1">{label}</div>
  </motion.div>
);

/* ──────────── Feature Card ──────────── */
const FeatureCard = ({ icon: Icon, title, desc, gradient }) => (
  <motion.div
    variants={fadeUp}
    className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover-card"
  >
    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} mb-4 shadow-lg`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
  </motion.div>
);

/* ──────────── Step Card ──────────── */
const StepCard = ({ number, icon: Icon, title, desc }) => (
  <motion.div variants={fadeUp} className="relative text-center group">
    <div className="relative mx-auto w-16 h-16 mb-5">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-purple-500 rounded-2xl rotate-6 opacity-20 group-hover:rotate-12 transition-transform" />
      <div className="relative w-full h-full bg-gradient-to-br from-primary-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
        <Icon className="w-7 h-7 text-white" />
      </div>
      <span className="absolute -top-2 -right-2 w-6 h-6 bg-white border-2 border-primary-500 rounded-full flex items-center justify-center text-xs font-bold text-primary-600 shadow">
        {number}
      </span>
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">{desc}</p>
  </motion.div>
);

/* ──────────── Testimonial Card ──────────── */
const TestimonialCard = ({ name, role, text }) => (
  <motion.div
    variants={fadeUp}
    className="bg-white rounded-2xl p-6 border border-gray-100 hover-card"
  >
    <div className="flex gap-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      ))}
    </div>
    <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">"{text}"</p>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-purple-400 rounded-full flex items-center justify-center">
        <span className="text-white text-sm font-bold">{name.charAt(0)}</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">{name}</p>
        <p className="text-xs text-gray-500">{role}</p>
      </div>
    </div>
  </motion.div>
);

/* ══════════════════════════════════════════════ */
/*                  HOME PAGE                     */
/* ══════════════════════════════════════════════ */
const HomePage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="overflow-hidden">
      {/* ─────── HERO ─────── */}
      <section className="relative min-h-[92vh] flex items-center mesh-gradient dot-pattern">
        {/* Floating blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-primary-200 shadow-sm mb-8"
            >
              <Sparkles className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-semibold text-primary-700">Platform Job Matching Berbasis AI</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-gray-900 leading-tight"
            >
              Temukan{' '}
              <span className="gradient-text">Peluang</span>
              ,<br />
              Wujudkan{' '}
              <span className="gradient-text">Karya</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
            >
              EkrafMate AI adalah jembatan antara talenta kreatif di Indonesia dengan proyek-proyek inovatif yang menunggu untuk direalisasikan.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl hover:shadow-xl hover:shadow-primary-500/25 hover:-translate-y-0.5 transition-all duration-300"
              >
                Mulai Gratis
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/projects"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-gray-700 bg-white border border-gray-200 rounded-2xl hover:border-primary-300 hover:text-primary-600 hover:shadow-lg transition-all duration-300"
              >
                <Briefcase className="w-4 h-4" />
                Jelajahi Proyek
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-14 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400"
            >
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" /> Gratis untuk memulai</span>
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-blue-500" /> Aman & Terverifikasi</span>
              <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-yellow-500" /> AI-Powered Matching</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─────── STATS ─────── */}
      <section className="relative -mt-12 z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatItem icon={Users} value="500+" label="Talenta Kreatif" color="primary" />
          <StatItem icon={Briefcase} value="200+" label="Proyek Terdaftar" color="purple" />
          <StatItem icon={Handshake} value="150+" label="Proyek Selesai" color="green" />
          <StatItem icon={Star} value="4.9" label="Rating Kepuasan" color="yellow" />
        </AnimatedSection>
      </section>

      {/* ─────── FEATURES ─────── */}
      <section className="py-24 bg-gray-50/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
              <Zap className="w-3.5 h-3.5" /> Fitur Unggulan
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Mengapa Memilih <span className="gradient-text">EkrafMate AI</span>?
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 text-gray-500 max-w-2xl mx-auto">
              Platform cerdas yang memahami kebutuhan proyek dan keahlian talenta secara mendalam
            </motion.p>
          </AnimatedSection>

          <AnimatedSection className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={BrainCircuit}
              title="AI Semantic Search"
              desc="Temukan talenta dengan pencarian AI yang memahami konteks, bukan sekadar kata kunci."
              gradient="from-primary-500 to-blue-500"
            />
            <FeatureCard
              icon={Sparkles}
              title="Deskripsi AI-Generated"
              desc="Buat deskripsi proyek profesional secara otomatis dengan dukungan model AI generatif terkini."
              gradient="from-purple-500 to-pink-500"
            />
            <FeatureCard
              icon={MessageSquare}
              title="AI Chatbot Assistant"
              desc="Chatbot MateBot siap membantu navigasi platform, tips karir, dan panduan pencarian proyek."
              gradient="from-green-500 to-emerald-500"
            />
            <FeatureCard
              icon={Shield}
              title="Verifikasi Akun"
              desc="Sistem verifikasi email memastikan kredibilitas setiap pengguna di platform."
              gradient="from-orange-500 to-red-500"
            />
            <FeatureCard
              icon={BarChart3}
              title="Dashboard Interaktif"
              desc="Pantau proyek, kelola lamaran, dan lacak pendapatan melalui dashboard yang intuitif."
              gradient="from-cyan-500 to-blue-500"
            />
            <FeatureCard
              icon={TrendingUp}
              title="Smart Job Matching"
              desc="Algoritma cerdas mencocokan proyek dengan talenta berdasarkan keahlian dan pengalaman."
              gradient="from-violet-500 to-purple-500"
            />
          </AnimatedSection>
        </div>
      </section>

      {/* ─────── HOW IT WORKS ─────── */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
              <Rocket className="w-3.5 h-3.5" /> Cara Kerja
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Mulai dalam <span className="gradient-text">3 Langkah</span> Mudah
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 text-gray-500 max-w-2xl mx-auto">
              Dari registrasi hingga mendapatkan proyek atau talenta impianmu
            </motion.p>
          </AnimatedSection>

          <AnimatedSection className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
            <StepCard
              number="1"
              icon={Users}
              title="Buat Profil"
              desc="Daftar akun, pilih peranmu sebagai Creative atau Client, dan lengkapi profil dengan keahlianmu."
            />
            <StepCard
              number="2"
              icon={Search}
              title="Temukan & Cocokkan"
              desc="Gunakan AI search untuk menemukan talenta atau proyek yang paling sesuai secara semantik."
            />
            <StepCard
              number="3"
              icon={Handshake}
              title="Berkolaborasi"
              desc="Mulai berkolaborasi, kelola proyek, dan bangun portofolio kreatifmu bersama."
            />
          </AnimatedSection>
        </div>
      </section>

      {/* ─────── ROLE SPLIT ─────── */}
      <section className="py-24 bg-gray-50/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Untuk Siapa <span className="gradient-text">EkrafMate AI</span>?
            </motion.h2>
          </AnimatedSection>

          <AnimatedSection className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Creative */}
            <motion.div variants={fadeUp} className="relative bg-white rounded-3xl p-8 border border-gray-100 hover-card overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-100 to-primary-50 rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-blue-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-primary-500/20">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Untuk Creative</h3>
                <ul className="space-y-3 text-gray-600 text-sm">
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Bangun portofolio profesional secara online</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Ditemukan oleh klien melalui AI search</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Lamar proyek yang sesuai keahlianmu</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> AI membantu buat deskripsi profil menarik</li>
                </ul>
                <Link to="/register" className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-primary-600 hover:text-primary-700 group/link">
                  Daftar sebagai Creative <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>

            {/* Client */}
            <motion.div variants={fadeUp} className="relative bg-white rounded-3xl p-8 border border-gray-100 hover-card overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-purple-50 rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-purple-500/20">
                  <Globe className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Untuk Client</h3>
                <ul className="space-y-3 text-gray-600 text-sm">
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Posting proyek dan terima lamaran talenta terbaik</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Cari creative berdasarkan kebutuhan spesifik</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> AI bantu buat deskripsi proyek profesional</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Kelola semua proyek dari satu dashboard</li>
                </ul>
                <Link to="/register" className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-purple-600 hover:text-purple-700 group/link">
                  Daftar sebagai Client <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─────── TESTIMONIALS ─────── */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
              <Star className="w-3.5 h-3.5" /> Testimoni
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Dipercaya oleh <span className="gradient-text">Kreator Indonesia</span>
            </motion.h2>
          </AnimatedSection>

          <AnimatedSection className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TestimonialCard
              name="Andi Pratama"
              role="UI/UX Designer"
              text="EkrafMate membantu saya menemukan proyek yang benar-benar cocok dengan keahlian saya. AI search-nya luar biasa akurat!"
            />
            <TestimonialCard
              name="Siti Rahayu"
              role="Pemilik Bisnis"
              text="Sebagai klien, saya bisa menemukan desainer berkualitas dengan cepat. Fitur AI untuk membuat deskripsi proyek sangat menghemat waktu."
            />
            <TestimonialCard
              name="Budi Santoso"
              role="Fullstack Developer"
              text="Platform terbaik untuk freelancer kreatif di Indonesia. Dashboard-nya intuitif dan proses melamar proyek sangat mudah."
            />
          </AnimatedSection>
        </div>
      </section>

      {/* ─────── CV SCAN PROMO ─────── */}
      <section className="py-24 bg-gray-50/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <motion.div
              variants={fadeUp}
              className="relative overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-xl"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Left: Content */}
                <div className="p-8 sm:p-12 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 w-fit">
                    <FileSearch className="w-3.5 h-3.5" /> Fitur Baru
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
                    Scan CV Anda dengan{' '}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">Azure AI</span>
                  </h2>
                  <p className="mt-4 text-gray-500 leading-relaxed">
                    Upload CV Anda dan dapatkan analisis mendalam menggunakan Azure Document Intelligence & GPT 5.4 Mini. Ketahui skor kesiapan freelance, kekuatan, dan area perbaikan CV Anda.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {['Analisis AI', 'Skor Kesiapan', 'Rekomendasi Peran', 'Tips Karir'].map(tag => (
                      <span key={tag} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">{tag}</span>
                    ))}
                  </div>
                  <div className="mt-8">
                    <Link
                      to="/cv-scan"
                      className="group inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <FileSearch className="w-4 h-4" />
                      Scan CV Gratis
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
                {/* Right: Visual */}
                <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-8 sm:p-12 flex items-center justify-center min-h-[300px]">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 left-4 w-32 h-32 border-2 border-white rounded-2xl rotate-12" />
                    <div className="absolute bottom-4 right-4 w-24 h-24 border-2 border-white rounded-full" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white rounded-3xl -rotate-6" />
                  </div>
                  <div className="relative text-center text-white">
                    <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-5">
                      <FileSearch className="w-10 h-10" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                        <span className="text-sm font-medium">Tanpa login untuk preview</span>
                      </div>
                      <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                        <Shield className="w-5 h-5 text-emerald-200" />
                        <span className="text-sm font-medium">Azure Document Intelligence</span>
                      </div>
                      <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                        <Zap className="w-5 h-5 text-emerald-200" />
                        <span className="text-sm font-medium">GPT 5.4 Mini Analysis</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─────── CTA ─────── */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-purple-600 to-accent-600 p-12 sm:p-16 text-center"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-56 h-56 bg-white/10 rounded-full translate-x-1/4 translate-y-1/4" />
            <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-white/5 rounded-full" />

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
                Siap Memulai Perjalanan<br />Kreatifmu?
              </h2>
              <p className="mt-5 text-lg text-white/80 max-w-xl mx-auto">
                Bergabunglah dengan ratusan talenta kreatif dan klien yang sudah merasakan kemudahan EkrafMate AI.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-primary-700 bg-white rounded-2xl hover:bg-gray-50 hover:shadow-xl transition-all duration-300"
                >
                  Daftar Sekarang
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/search"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white border-2 border-white/30 rounded-2xl hover:bg-white/10 transition-all duration-300"
                >
                  <Search className="w-4 h-4" />
                  Cari Talenta
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
