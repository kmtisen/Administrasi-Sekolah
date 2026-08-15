import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  Shield,
  BookOpen,
  UserCheck,
  Search,
  Key,
  X,
  Save,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { User, UserRole, ClassItem } from '../../types';

interface UserManagementViewProps {
  users: User[];
  classes: ClassItem[];
  onSaveUsers: (users: User[]) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  classes,
  onSaveUsers,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formNip, setFormNip] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('guru');
  const [formMapel, setFormMapel] = useState('Matematika');
  const [formKelasBinaan, setFormKelasBinaan] = useState('');

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.mapel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.nip.includes(searchTerm);
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormName('');
    setFormNip('');
    setFormUsername('');
    setFormPassword('');
    setFormRole('guru');
    setFormMapel('Matematika');
    setFormKelasBinaan('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormName(user.nama);
    setFormNip(user.nip || '');
    setFormUsername(user.username);
    setFormPassword(user.password || '');
    setFormRole(user.role);
    setFormMapel(user.mapel);
    setFormKelasBinaan(user.kelasBinaan || '');
    setIsModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    if (users.length <= 1) {
      Swal.fire('Peringatan', 'Minimal harus ada 1 pengguna dalam sistem.', 'warning');
      return;
    }

    Swal.fire({
      title: `Hapus Akun ${user.nama}?`,
      text: `Akun dengan username "${user.username}" akan dihapus dari sistem.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    }).then((res) => {
      if (res.isConfirmed) {
        const updated = users.filter((u) => u.id !== user.id);
        onSaveUsers(updated);
        Swal.fire({
          icon: 'success',
          title: 'Akun Dihapus',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUser) {
      const updated = users.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              nama: formName,
              nip: formNip,
              username: formUsername,
              password: formPassword || 'guru123',
              role: formRole,
              mapel: formMapel,
              kelasBinaan: formRole === 'walikelas' ? formKelasBinaan : undefined,
            }
          : u
      );
      onSaveUsers(updated);
      Swal.fire({
        icon: 'success',
        title: 'Pengguna Diperbarui',
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      const newUser: User = {
        id: `u-${Date.now()}`,
        nama: formName,
        nip: formNip,
        username: formUsername,
        password: formPassword || 'guru123',
        role: formRole,
        mapel: formMapel,
        kelasBinaan: formRole === 'walikelas' ? formKelasBinaan : undefined,
      };
      onSaveUsers([newUser, ...users]);
      Swal.fire({
        icon: 'success',
        title: 'Pengguna Ditambahkan',
        timer: 1500,
        showConfirmButton: false,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Kelola Akun & Pengguna Sistem (RBAC)
            </h1>
            <p className="text-xs text-slate-500">
              Manajemen akun Administrator, Guru Mata Pelajaran, dan Wali Kelas Binaan.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-950/20 transition-all active:scale-[0.99]"
        >
          <UserPlus className="w-4 h-4" />
          Tambah Pengguna Baru
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama guru, NIP, mapel, atau username..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Filter Peran:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Peran ({users.length})</option>
            <option value="admin">Administrator</option>
            <option value="guru">Guru Mata Pelajaran</option>
            <option value="walikelas">Wali Kelas</option>
          </select>
        </div>
      </div>

      {/* User Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5 pl-5">Nama Lengkap & NIP</th>
                <th className="p-3.5">Username</th>
                <th className="p-3.5">Peran (Role)</th>
                <th className="p-3.5">Mata Pelajaran</th>
                <th className="p-3.5">Kelas Binaan</th>
                <th className="p-3.5 pr-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 pl-5">
                    <div className="font-bold text-slate-900">{u.nama}</div>
                    <div className="text-[11px] text-slate-500">NIP. {u.nip || '-'}</div>
                  </td>
                  <td className="p-3.5">
                    <span className="font-mono px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
                      {u.username}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                        u.role === 'admin'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : u.role === 'walikelas'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {u.role === 'admin' ? (
                        <>
                          <Shield className="w-3 h-3" /> Admin
                        </>
                      ) : u.role === 'walikelas' ? (
                        <>
                          <UserCheck className="w-3 h-3" /> Wali Kelas
                        </>
                      ) : (
                        <>
                          <BookOpen className="w-3 h-3" /> Guru Mapel
                        </>
                      )}
                    </span>
                  </td>
                  <td className="p-3.5 font-medium text-slate-800">{u.mapel}</td>
                  <td className="p-3.5">
                    {u.kelasBinaan ? (
                      <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold rounded text-[11px]">
                        {u.kelasBinaan}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="p-3.5 pr-5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Edit Pengguna"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus Pengguna"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="font-bold text-sm">
                {editingUser ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nama Lengkap & Gelar
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  placeholder="Contoh: Siti Rahmawati, S.Pd., M.Si."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    NIP / NUPTK
                  </label>
                  <input
                    type="text"
                    value={formNip}
                    onChange={(e) => setFormNip(e.target.value)}
                    placeholder="19840315 200801 2 007"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Peran (Role)
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="guru">Guru Mata Pelajaran</option>
                    <option value="walikelas">Wali Kelas</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    required
                    placeholder="username_guru"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Password / PIN
                  </label>
                  <input
                    type="text"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="guru123"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Mata Pelajaran yang Diampu
                </label>
                <input
                  type="text"
                  value={formMapel}
                  onChange={(e) => setFormMapel(e.target.value)}
                  required
                  placeholder="Contoh: Matematika / PAI / Bahasa Indonesia"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {formRole === 'walikelas' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Kelas Binaan (Wali Kelas)
                  </label>
                  <select
                    value={formKelasBinaan}
                    onChange={(e) => setFormKelasBinaan(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="">-- Pilih Kelas Binaan --</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.namaKelas}>
                        {c.namaKelas} ({c.fase})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md"
                >
                  <Save className="w-3.5 h-3.5" />
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
