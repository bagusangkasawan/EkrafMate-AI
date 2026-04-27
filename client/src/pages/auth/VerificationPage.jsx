import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateUserProfileInfo } from '../../redux/slices/authSlice';
import { motion } from 'framer-motion';

const VerificationPage = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const verificationHasRun = useRef(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Token verifikasi tidak ditemukan.');
        return;
      }
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const res = await fetch(`${API_URL}/api/auth/verify/${token}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Terjadi kesalahan saat verifikasi.');
        dispatch(updateUserProfileInfo(data));
        setStatus('success');
        setMessage(data.message);
        setTimeout(() => navigate('/'), 3000);
      } catch (error) {
        setStatus('error');
        setMessage(error.message);
      }
    };
    if (!verificationHasRun.current) {
      verificationHasRun.current = true;
      verifyToken();
    }
  }, [token, dispatch, navigate]);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50/50 px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center max-w-md">
        {status === 'verifying' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 bg-primary-50 rounded-2xl flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Memverifikasi...</h1>
            <p className="text-gray-500">Mohon tunggu sebentar, kami sedang memproses verifikasi akun Anda.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 bg-green-50 rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Verifikasi Berhasil!</h1>
            <p className="text-gray-500 mb-6">{message || 'Akun Anda telah berhasil diverifikasi.'} Anda akan diarahkan...</p>
            <Link to="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl hover:shadow-lg transition-all duration-300">
              Kembali ke Dashboard
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 bg-red-50 rounded-2xl flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Verifikasi Gagal</h1>
            <p className="text-gray-500 mb-6">{message || 'Link verifikasi tidak valid atau sudah kedaluwarsa.'}</p>
            <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl hover:shadow-lg transition-all duration-300">
              Kembali ke Beranda
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default VerificationPage;
