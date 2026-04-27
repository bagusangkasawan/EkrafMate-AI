import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50/50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        {/* Big 404 */}
        <div className="relative mb-6">
          <span className="text-[10rem] sm:text-[12rem] font-black leading-none gradient-text select-none">404</span>
          <div className="absolute inset-0 bg-gradient-to-br from-primary-400/20 to-purple-400/20 blur-3xl -z-10 rounded-full" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 -mt-8 mb-3">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-500 mb-8">Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl hover:shadow-lg transition-all duration-300"
          >
            <Home className="w-4 h-4" /> Kembali ke Beranda
          </Link>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
          >
            <Search className="w-4 h-4" /> Cari Sesuatu
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
