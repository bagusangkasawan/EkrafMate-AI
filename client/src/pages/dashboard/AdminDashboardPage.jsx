import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  Users, FolderOpen, Trash2, Pencil, Shield, Loader2, Search,
  UserCircle, ChevronRight, Mail, CheckCircle2, XCircle
} from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const StatCard = ({ icon: Icon, title, value, gradient }) => (
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

const AdminDashboardPage = () => {
  const { userInfo } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirm, setConfirm] = useState({ open: false, title: '', message: '', onConfirm: null });

  const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, projectsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`, config),
        axios.get(`${import.meta.env.VITE_API_URL}/api/admin/projects`, config),
      ]);
      setUsers(usersRes.data);
      setProjects(projectsRes.data);
    } catch {
      toast.error('Gagal memuat data.');
    } finally {
      setLoading(false);
    }
  }, [userInfo.token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDeleteUser = (id, name) => {
    setConfirm({
      open: true,
      title: 'Hapus Pengguna',
      message: `Yakin ingin menghapus pengguna "${name}"? Tindakan ini tidak bisa dibatalkan.`,
      onConfirm: async () => {
        try {
          await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/users/${id}`, config);
          toast.success('Pengguna dihapus.');
          setUsers(prev => prev.filter(u => u._id !== id));
        } catch {
          toast.error('Gagal menghapus pengguna.');
        }
        setConfirm(prev => ({ ...prev, open: false }));
      },
    });
  };

  const handleDeleteProject = (id, title) => {
    setConfirm({
      open: true,
      title: 'Hapus Proyek',
      message: `Yakin ingin menghapus proyek "${title}"?`,
      onConfirm: async () => {
        try {
          await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/projects/${id}`, config);
          toast.success('Proyek dihapus.');
          setProjects(prev => prev.filter(p => p._id !== id));
        } catch {
          toast.error('Gagal menghapus proyek.');
        }
        setConfirm(prev => ({ ...prev, open: false }));
      },
    });
  };

  const filteredUsers = users.filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredProjects = projects.filter(p => p.title?.toLowerCase().includes(searchTerm.toLowerCase()));

  const tabs = [
    { key: 'users', label: 'Pengguna', icon: Users, count: users.length },
    { key: 'projects', label: 'Proyek', icon: FolderOpen, count: projects.length },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          {/* Header */}
          <motion.div variants={fadeUp} className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Admin Dashboard</h1>
            </div>
            <p className="text-gray-500 mt-1 ml-13">Kelola pengguna dan proyek pada platform.</p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
            <StatCard icon={Users} title="Total Pengguna" value={users.length} gradient="from-primary-500 to-blue-500" />
            <StatCard icon={FolderOpen} title="Total Proyek" value={projects.length} gradient="from-purple-500 to-pink-500" />
          </div>

          {/* Tabs + Search */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => { setActiveTab(tab.key); setSearchTerm(''); }}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                    <span className={`text-xs px-1.5 py-0.5 rounded-md ${activeTab === tab.key ? 'bg-primary-50 text-primary-600' : 'bg-gray-200 text-gray-500'}`}>{tab.count}</span>
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Cari..."
                  className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all w-full sm:w-64"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              </div>
            ) : activeTab === 'users' ? (
              /* Users Table */
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                      <th className="px-6 py-3">Pengguna</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan="4" className="text-center py-12 text-gray-400">Tidak ada pengguna ditemukan.</td></tr>
                    ) : filteredUsers.map(user => (
                      <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                              {user.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" /> {user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-lg ${user.role === 'creative' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                            {user.role === 'creative' ? 'Creative' : 'Client'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {user.isVerified ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600"><CheckCircle2 className="w-3.5 h-3.5" /> Verified</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-600"><XCircle className="w-3.5 h-3.5" /> Unverified</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/admin/user/${user._id}/edit`} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Edit">
                              <Pencil className="w-4 h-4" />
                            </Link>
                            <button onClick={() => handleDeleteUser(user._id, user.name)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Projects Table */
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                      <th className="px-6 py-3">Proyek</th>
                      <th className="px-6 py-3">Pemilik</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProjects.length === 0 ? (
                      <tr><td colSpan="4" className="text-center py-12 text-gray-400">Tidak ada proyek ditemukan.</td></tr>
                    ) : filteredProjects.map(project => {
                      const statusCfg = {
                        open: { label: 'Terbuka', cls: 'bg-green-50 text-green-700' },
                        in_progress: { label: 'Berlangsung', cls: 'bg-blue-50 text-blue-700' },
                        closed: { label: 'Selesai', cls: 'bg-gray-100 text-gray-600' },
                      };
                      const s = statusCfg[project.status] || statusCfg.open;
                      return (
                        <tr key={project._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <Link to={`/project/${project._id}`} className="font-semibold text-gray-900 hover:text-primary-600 transition-colors">{project.title}</Link>
                          </td>
                          <td className="px-6 py-4 text-gray-500">{project.owner?.name || 'N/A'}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-lg ${s.cls}`}>{s.label}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => handleDeleteProject(project._id, project.title)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>

      <ConfirmDialog
        isOpen={confirm.open}
        onClose={() => setConfirm(prev => ({ ...prev, open: false }))}
        onConfirm={confirm.onConfirm}
        title={confirm.title}
        message={confirm.message}
      />
    </div>
  );
};

export default AdminDashboardPage;
