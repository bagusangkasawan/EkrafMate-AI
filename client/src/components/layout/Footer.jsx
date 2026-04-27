import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Search, Briefcase, FileSearch, Github, Mail, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-950 text-gray-400 relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-950 to-primary-950/30 pointer-events-none" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold text-white">EkrafMate AI</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              Platform job matching berbasis AI untuk menghubungkan talenta kreatif dengan peluang terbaik di Indonesia.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/search" className="text-sm hover:text-primary-400 transition-colors flex items-center gap-2">
                  <Search className="w-3.5 h-3.5" /> Cari Talenta
                </Link>
              </li>
              <li>
                <Link to="/projects" className="text-sm hover:text-primary-400 transition-colors flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5" /> Jelajahi Proyek
                </Link>
              </li>
              <li>
                <Link to="/cv-scan" className="text-sm hover:text-primary-400 transition-colors flex items-center gap-2">
                  <FileSearch className="w-3.5 h-3.5" /> Scan CV
                </Link>
              </li>
            </ul>
          </div>

          {/* Akun */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Akun</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/login" className="text-sm hover:text-primary-400 transition-colors">Masuk</Link>
              </li>
              <li>
                <Link to="/register" className="text-sm hover:text-primary-400 transition-colors">Daftar Gratis</Link>
              </li>
            </ul>
          </div>

          {/* Teknologi */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Dibangun Dengan</h4>
            <div className="flex flex-wrap gap-2">
              {['React', 'Node.js', 'MongoDB', 'Gemini AI', 'Azure AI', 'Tailwind CSS'].map(tech => (
                <span key={tech} className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-gray-800/80 text-gray-400 rounded-lg border border-gray-800">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800/50 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} EkrafMate AI. Dibuat untuk ekonomi kreatif Indonesia.
          </p>
          <div className="flex items-center gap-4">
            <a href="mailto:support@mategroup.id" className="text-gray-500 hover:text-primary-400 transition-colors">
              <Mail className="w-4 h-4" />
            </a>
            <a href="https://github.com/mategroup-id" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary-400 transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://mategroup.id" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary-400 transition-colors">
              <Globe className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
