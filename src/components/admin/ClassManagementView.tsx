import React, { useState } from 'react';
import {
  Building,
  Plus,
  Edit2,
  Trash2,
  Users,
  GraduationCap,
  Sparkles,
  Save,
  X,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { ClassItem, User } from '../../types';

interface ClassManagementViewProps {
  classes: ClassItem[];
  users: User[];
  onSaveClasses: (classes: ClassItem[]) => void;
}

export const ClassManagementView: React.FC<ClassManagementViewProps> = ({
  classes,
  users,
  onSaveClasses,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);

  const [namaKelas, setNamaKelas] = useState('');
  const [tingkat, setTingkat] = useState('7');
  const [fase, setFase] = useState('Fase D');
  const [waliKelas, setWaliKelas] = useState('');

  const handleOpenAdd = () => {
    setEditingClass(null);
    setNamaKelas('');
    setTingkat('7');
    setFase('Fase D');
    setWaliKelas(users.find((u) => u.role === 'walikelas')?.nama || '');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: ClassItem) => {
    setEditingClass(c);
    setNamaKelas(c.namaKelas);
    setTingkat(c.tingkat.toString());
    setFase(c.fase);
    setWaliKelas(c.waliKelasNama || '');
    setIsModalOpen(true);
  };

  const handleDelete = (c: ClassItem) => {
    Swal.fire({
      title: `Hapus ${c.namaKelas}?`,
      text: 'Semua data penugasan kelas ini akan terpengaruh.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    }).then((res) => {
      if (res.isConfirmed) {
        const updated = classes.filter((item) => item.id !== c.id);
        onSaveClasses(updated);
        Swal.fire({
          icon: 'success',
          title: 'Kelas Dihapus',
          timer: 1200,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingClass) {
      const updated = classes.map((c) =>
        c.id === editingClass.id
          ? {
              ...c,
              namaKelas,
              tingkat: parseInt(tingkat, 10) || 7,
              fase,
              waliKelasNama: waliKelas,
            }
          : c
      );
      onSaveClasses(updated);
      Swal.fire({
        icon: 'success',
        title: 'Kelas Diperbarui',
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      const newClass: ClassItem = {
        id: `c-${Date.now()}`,
        namaKelas,
        tingkat: parseInt(tingkat, 10) || 7,
        fase,
        waliKelasId: 'u-wali-1',
        waliKelasNama: waliKelas,
        tahunAjaran: '2025/2026',
        jumlahSiswa: 0,
      };
      onSaveClasses([...classes, newClass]);
      Swal.fire({
        icon: 'success',
        title: 'Kelas Baru Ditambahkan',
        timer: 1500,
        showConfirmButton: false,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Kelola Rombongan Belajar (Rombel) & Fase
            </h1>
            <p className="text-xs text-slate-500">
              Konfigurasi kelas, tingkat pendidikan, pembagian Fase Kurikulum Merdeka (Fase A-F), dan penunjukan Wali Kelas.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-950/20 transition-all active:scale-[0.99]"
        >
          <Plus className="w-4 h-4" />
          Tambah Rombel Kelas
        </button>
      </div>

      {/* Class Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((c) => (
          <div
            key={c.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all group relative"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {c.fase} &bull; Tingkat {c.tingkat}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-2">{c.namaKelas}</h3>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="p-1 text-slate-400 hover:text-emerald-700 rounded transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(c)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Wali Kelas:</span>
                <span className="font-semibold text-slate-800">{c.waliKelas || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Status Fase:</span>
                <span className="text-emerald-700 font-medium">{c.fase} Merdeka</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="font-bold text-sm">
                {editingClass ? 'Edit Rombel Kelas' : 'Tambah Rombel Kelas Baru'}
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
                  Nama Rombel / Kelas
                </label>
                <input
                  type="text"
                  value={namaKelas}
                  onChange={(e) => setNamaKelas(e.target.value)}
                  required
                  placeholder="Contoh: Kelas VII-A / X-IPA 1"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tingkat Kelas
                  </label>
                  <select
                    value={tingkat}
                    onChange={(e) => setTingkat(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="7">Kelas 7 (SMP/MTs)</option>
                    <option value="8">Kelas 8 (SMP/MTs)</option>
                    <option value="9">Kelas 9 (SMP/MTs)</option>
                    <option value="10">Kelas 10 (SMA/SMK/MA)</option>
                    <option value="11">Kelas 11 (SMA/SMK/MA)</option>
                    <option value="12">Kelas 12 (SMA/SMK/MA)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Fase Kurikulum
                  </label>
                  <select
                    value={fase}
                    onChange={(e) => setFase(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Fase D">Fase D (Kelas 7-9 SMP)</option>
                    <option value="Fase E">Fase E (Kelas 10 SMA)</option>
                    <option value="Fase F">Fase F (Kelas 11-12 SMA)</option>
                    <option value="Fase A">Fase A (Kelas 1-2 SD)</option>
                    <option value="Fase B">Fase B (Kelas 3-4 SD)</option>
                    <option value="Fase C">Fase C (Kelas 5-6 SD)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Wali Kelas Penanggung Jawab
                </label>
                <input
                  type="text"
                  value={waliKelas}
                  onChange={(e) => setWaliKelas(e.target.value)}
                  placeholder="Nama Wali Kelas"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

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
                  Simpan Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
