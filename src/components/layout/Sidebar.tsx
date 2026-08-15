import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  BookOpen,
  GraduationCap,
  Sparkles,
  Heart,
  Users,
  Building,
  Settings,
  Archive,
  Layers,
  FileCheck,
  ChevronRight,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { User, SchoolConfig } from '../../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: User;
  schoolConfig: SchoolConfig;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  schoolConfig,
  isOpen,
  onCloseMobile,
}) => {
  const role = currentUser.role;

  const handleTabClick = (tab: string) => {
    onSelectTab(tab);
    if (window.innerWidth < 1024) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-72 bg-[#1e293b] text-slate-200 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-950/50">
              KBC
            </div>
            <div className="overflow-hidden">
              <h1 className="font-bold text-sm text-slate-100 tracking-tight leading-snug line-clamp-1">
                {schoolConfig.namaSekolah || 'Sistem Sekolah KBC'}
              </h1>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                Kurikulum Merdeka & Cinta
              </p>
            </div>
          </div>
        </div>

        {/* Current User Badge */}
        <div className="px-4 py-2.5 bg-slate-800/50 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-slate-700 border-2 border-emerald-500 text-emerald-300 flex items-center justify-center font-bold text-xs">
              {currentUser.nama.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate leading-tight">{currentUser.nama}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span
                  className={`inline-block px-1.5 py-0.2 text-[9px] font-bold rounded uppercase tracking-wider ${
                    role === 'admin'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : role === 'walikelas'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {role === 'admin' ? 'Admin' : role === 'walikelas' ? 'Wali Kelas' : 'Guru'}
                </span>
                {currentUser.kelasBinaan && (
                  <span className="text-[10px] text-slate-400 truncate">({currentUser.kelasBinaan})</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar text-xs">
          {/* Main Group */}
          <div>
            <div className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Utama
            </div>
            <button
              onClick={() => handleTabClick('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-indigo-400" />
              <span>Dashboard Overview</span>
            </button>
          </div>

          {/* Daily Teaching Group */}
          <div>
            <div className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Pembelajaran Harian
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleTabClick('attendance')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  currentTab === 'attendance'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CalendarCheck className="w-4 h-4 text-emerald-400" />
                  <span>Absensi & Jurnal Harian</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => handleTabClick('journal')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  currentTab === 'journal'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>Agenda & Jurnal Guru</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => handleTabClick('grades')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  currentTab === 'grades'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-4 h-4 text-indigo-300" />
                  <span>Input Nilai & Asesmen</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            </div>
          </div>

          {/* Homeroom Special Menu (Wali Kelas & Admin) */}
          {(role === 'walikelas' || role === 'admin') && (
            <div>
              <div className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Bimbingan Wali Kelas</span>
              </div>
              <button
                onClick={() => handleTabClick('homeroom')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  currentTab === 'homeroom'
                    ? 'bg-amber-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-4 h-4 text-amber-400" />
                  <span>Bimbingan & Rekap Kelas</span>
                </div>
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-500/30 text-amber-200 rounded">
                  Khusus
                </span>
              </button>
            </div>
          )}

          {/* Curriculum Generator AI */}
          <div>
            <div className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Generator AI Kurikulum</span>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleTabClick('adm-merdeka')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  currentTab === 'adm-merdeka'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileCheck className="w-4 h-4 text-indigo-400" />
                  <span>6 Dokumen Standar Merdeka</span>
                </div>
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                  ADM
                </span>
              </button>

              <button
                onClick={() => handleTabClick('deep-learning')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  currentTab === 'deep-learning'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Modul Ajar & Asesmen AI</span>
                </div>
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-purple-500/20 text-purple-300 rounded border border-purple-500/30">
                  DL
                </span>
              </button>

              <button
                onClick={() => handleTabClick('kbc-10')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  currentTab === 'kbc-10'
                    ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-4 h-4 text-emerald-400" />
                  <span>10 Dokumen KBC & PPRA</span>
                </div>
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                  KBC
                </span>
              </button>

              <button
                onClick={() => handleTabClick('saved-docs')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  currentTab === 'saved-docs'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Archive className="w-4 h-4 text-amber-400" />
                  <span>Arsip Dokumen Tersimpan</span>
                </div>
              </button>
            </div>
          </div>

          {/* School & Admin Management */}
          <div>
            <div className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Master Data & Konfigurasi
            </div>
            <div className="space-y-1">
              {role === 'admin' && (
                <button
                  onClick={() => handleTabClick('users')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    currentTab === 'users'
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span>Kelola Pengguna (Users)</span>
                  </div>
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                </button>
              )}

              <button
                onClick={() => handleTabClick('students')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  currentTab === 'students'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4 text-sky-400" />
                  <span>Data & Import Siswa</span>
                </div>
              </button>

              <button
                onClick={() => handleTabClick('classes')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  currentTab === 'classes'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Building className="w-4 h-4 text-emerald-400" />
                  <span>Kelola Kelas & Fase</span>
                </div>
              </button>

              {role === 'admin' && (
                <button
                  onClick={() => handleTabClick('config')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    currentTab === 'config'
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Settings className="w-4 h-4 text-amber-400" />
                    <span>Konfigurasi Sekolah</span>
                  </div>
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-2.5 border-t border-slate-800 text-[10px] text-slate-400 bg-slate-950/40 text-center font-medium">
          <span>T.A {schoolConfig.tahunPelajaran} &bull; Smt {schoolConfig.semesterAktif}</span>
        </div>
      </aside>
    </>
  );
};
