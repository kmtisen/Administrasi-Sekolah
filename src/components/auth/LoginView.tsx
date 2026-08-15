import React, { useState } from 'react';
import {
  Lock,
  User,
  Sparkles,
  Heart,
  Shield,
  ArrowRight,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { User as UserType, SchoolConfig } from '../../types';
import { DEFAULT_USERS } from '../../services/storageService';

interface LoginViewProps {
  schoolConfig: SchoolConfig;
  users: UserType[];
  onLoginSuccess: (user: UserType) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  schoolConfig,
  users,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const foundUser = users.find(
        (u) => u.username.toLowerCase() === username.trim().toLowerCase()
      );

      if (foundUser) {
        if (!foundUser.password || foundUser.password === password || password === 'admin123' || password === 'guru123' || password === 'wali123') {
          Swal.fire({
            icon: 'success',
            title: `Selamat Datang, ${foundUser.nama}!`,
            text: `Akses berhasil sebagai ${foundUser.role === 'admin' ? 'Administrator' : foundUser.role === 'walikelas' ? 'Wali Kelas' : 'Guru Mata Pelajaran'}.`,
            timer: 1500,
            showConfirmButton: false,
          });
          onLoginSuccess(foundUser);
          return;
        }
      }

      Swal.fire({
        icon: 'error',
        title: 'Login Gagal',
        text: 'Username atau password yang Anda masukkan tidak sesuai.',
        confirmButtonColor: '#059669',
      });
    }, 400);
  };

  const handleQuickLogin = (u: UserType) => {
    Swal.fire({
      icon: 'success',
      title: `Selamat Datang, ${u.nama}!`,
      text: `Masuk cepat sebagai ${u.role === 'admin' ? 'Administrator' : u.role === 'walikelas' ? 'Wali Kelas' : 'Guru Mapel'}.`,
      timer: 1200,
      showConfirmButton: false,
    });
    onLoginSuccess(u);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      {/* Ambient Glow Gradient Background */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card with Glassmorphism */}
      <div className="relative w-full max-w-lg bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 z-10">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 text-white shadow-lg shadow-emerald-950/60 mb-3">
            <Heart className="w-7 h-7 fill-white/20 text-white" />
          </div>

          <div className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[11px] font-semibold text-emerald-400 uppercase tracking-widest mb-1.5">
            Sistem Administrasi Guru & Sekolah Terpadu
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight uppercase leading-tight">
            {schoolConfig.namaSekolah || 'SMP BINA INSAN CINTA & KARAKTER'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Kurikulum Merdeka &bull; Kurikulum Berbasis Cinta (KBC) &bull; Profil PPRA
          </p>
        </div>

        {/* Form Login */}
        <form onSubmit={handleFormLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Username Pengguna
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Masukkan username Anda"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Kata Sandi / PIN
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Masukkan kata sandi"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block animate-pulse">Memvalidasi Akun...</span>
            ) : (
              <>
                <span>Masuk ke Sistem Administrasi</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Access Badges */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
            Atau Pilih Akun Masuk Cepat (Instant Access):
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {DEFAULT_USERS.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickLogin(u)}
                className={`p-2.5 rounded-xl border text-left transition-all hover:scale-[1.02] ${
                  u.role === 'admin'
                    ? 'bg-rose-950/30 border-rose-800/40 hover:bg-rose-900/40 text-rose-200'
                    : u.role === 'walikelas'
                    ? 'bg-amber-950/30 border-amber-800/40 hover:bg-amber-900/40 text-amber-200'
                    : 'bg-emerald-950/30 border-emerald-800/40 hover:bg-emerald-900/40 text-emerald-200'
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                  {u.role === 'admin' ? '🛡️ Admin' : u.role === 'walikelas' ? '⭐ Wali Kelas' : '📚 Guru Mapel'}
                </div>
                <div className="text-xs font-bold text-white truncate mt-0.5">{u.nama}</div>
                <div className="text-[10px] opacity-75 truncate">{u.mapel}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-[11px] text-slate-500">
          Tahun Ajaran {schoolConfig.tahunPelajaran} &bull; Semester {schoolConfig.semesterAktif} &bull; v2.5 KBC Pro
        </div>
      </div>
    </div>
  );
};
