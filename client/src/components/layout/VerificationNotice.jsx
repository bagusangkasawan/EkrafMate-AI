import React, { useState } from 'react';
import { AlertTriangle, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

const VerificationNotice = () => {
  const { userInfo } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleResendVerification = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/resend-verification`, {}, config);
      toast.success('Email verifikasi baru telah dikirim!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengirim ulang email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3" role="alert">
      <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
        <AlertTriangle className="w-5 h-5 text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-amber-800">Akun Belum Terverifikasi</p>
        <p className="text-xs text-amber-700 mt-0.5">
          Beberapa fitur mungkin terbatas. Silakan cek email Anda untuk link verifikasi.
        </p>
        <button
          onClick={handleResendVerification}
          disabled={loading}
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-amber-900 underline underline-offset-2 disabled:text-amber-400 disabled:no-underline transition-colors"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
          {loading ? 'Mengirim...' : 'Kirim Ulang Verifikasi'}
        </button>
      </div>
    </div>
  );
};

export default VerificationNotice;
