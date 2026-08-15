import React, { useState } from 'react';
import {
  Menu,
  User,
  LogOut,
  Sparkles,
  Shield,
  Heart,
  ChevronDown,
  RotateCw,
  School,
  CheckCircle,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { User as UserType, SchoolConfig } from '../../types';
import { DEFAULT_USERS } from '../../services/storageService';

interface HeaderProps {
  currentUser: UserType;
  schoolConfig: SchoolConfig;
  onToggleMobileSidebar: () => void;
  onSwitchUser: (user: UserType) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  schoolConfig,
  onToggleMobileSidebar,
  onSwitchUser,
  onLogout,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleQuickSwitch = (u: UserType) => {
    onSwitchUser(u);
    setShowUserMenu(false);
    Swal.fire({
      icon: 'success',
      title: `Beralih ke ${u.nama}`,
      text: `Peran Aktif: ${u.role === 'admin' ? 'Administrator' : u.role === 'walikelas' ? 'Wali Kelas' : 'Guru Mapel'} (${u.mapel})`,
      timer: 1500,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
    });
  };

  return (
    <header className="sticky top-0 z-30 h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Left side: Mobile Toggle & Breadcrumb/School Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
          title="Buka Navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <School className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight line-clamp-1">
              {schoolConfig.namaSekolah || 'SMA BINTANG NUSANTARA'}
            </h1>
            <span className="hidden sm:inline-block px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-500 border border-slate-200 uppercase tracking-wider">
              {currentUser.role === 'admin' ? 'ADMIN PANEL' : currentUser.role === 'walikelas' ? 'WALI PANEL' : 'GURU PANEL'}
            </span>
          </div>
        </div>
      </div>

      {/* Right side: Fast Role Switcher & User Account Profile */}
      <div className="flex items-center gap-4 sm:gap-6 text-xs">
        {/* Active Academic Year indicator */}
        <div className="hidden md:flex flex-col items-end leading-tight">
          <span className="font-semibold text-slate-900 text-xs">
            Semester {schoolConfig.semesterAktif} {schoolConfig.tahunPelajaran}
          </span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            TAHUN PELAJARAN AKTIF
          </span>
        </div>

        <div className="hidden md:block h-6 w-px bg-slate-200" />

        {/* Quick Role Switcher Buttons */}
        <div className="hidden lg:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
          <span className="text-[9px] font-bold text-slate-400 px-1.5 uppercase">ROLE:</span>
          {DEFAULT_USERS.map((u) => {
            const isActive = u.id === currentUser.id;
            return (
              <button
                key={u.id}
                onClick={() => handleQuickSwitch(u)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
                title={`Login cepat sebagai ${u.nama} (${u.role})`}
              >
                {u.role === 'admin' ? 'Admin' : u.role === 'walikelas' ? 'Wali' : 'Guru'}
              </button>
            );
          })}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-xs"
          >
            <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs border border-emerald-500">
              {currentUser.nama.charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-800 leading-tight max-w-[120px] truncate">
                {currentUser.nama}
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div
              className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{currentUser.nama}</p>
                <p className="text-[10px] text-slate-500">NIP. {currentUser.nip || '-'}</p>
                <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">{currentUser.mapel}</p>
              </div>

              <div className="p-2 lg:hidden border-b border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase px-2 mb-1">Ganti Akun Role:</p>
                <div className="space-y-1">
                  {DEFAULT_USERS.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleQuickSwitch(u)}
                      className={`w-full text-left px-2 py-1 rounded text-xs flex items-center justify-between ${
                        u.id === currentUser.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{u.nama}</span>
                      <span className="text-[9px] uppercase opacity-70">({u.role})</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-1">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar / Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
