import React, { useState } from 'react';
import {
  Save,
  Building,
  RotateCcw,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  FileSignature,
  School,
  AlertTriangle,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { SchoolConfig } from '../../types';

interface ConfigViewProps {
  config: SchoolConfig;
  onSaveConfig: (newConfig: SchoolConfig) => void;
  onResetDatabase: () => void;
}

export const ConfigView: React.FC<ConfigViewProps> = ({
  config,
  onSaveConfig,
  onResetDatabase,
}) => {
  const [formData, setFormData] = useState<SchoolConfig>({ ...config });

  const handleChange = (field: keyof SchoolConfig, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    Swal.fire({
      icon: 'success',
      title: 'Konfigurasi Disimpan!',
      text: 'Informasi sekolah dan parameter tanda tangan telah diperbarui ke seluruh dokumen akademik.',
      confirmButtonColor: '#059669',
    });
  };

  const handleResetConfirm = () => {
    Swal.fire({
      title: 'Reset Database Sekolah?',
      text: 'Semua data presensi, nilai, dokumen, dan siswa yang baru dibuat akan dikembalikan ke data awal bawaan sistem. Tindakan ini tidak dapat dibatalkan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Reset Database',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        onResetDatabase();
        Swal.fire({
          icon: 'success',
          title: 'Database Berhasil Direset',
          text: 'Data awal telah dipulihkan secara bersih.',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <School className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Konfigurasi Sistem & Identitas Satuan Pendidikan
            </h1>
            <p className="text-xs text-slate-500">
              Pengaturan ini menjadi rujukan otomatis pada Kop Surat Dokumen, Tanda Tangan Resmi, dan Kalender Akademik.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetConfirm}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Database Bawaan
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Identitas Satuan Pendidikan & Kop */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building className="w-4 h-4 text-emerald-600" />
            1. Identitas Instansi & Satuan Pendidikan (Untuk Kop Surat)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nama Dinas / Instansi Induk (Baris 1 Kop)
              </label>
              <input
                type="text"
                value={formData.namaInstansi}
                onChange={(e) => handleChange('namaInstansi', e.target.value)}
                required
                placeholder="Contoh: PEMERINTAH DAERAH PROVINSI DKI JAKARTA / DINAS PENDIDIKAN"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nama Sekolah (Baris 2 Kop)
              </label>
              <input
                type="text"
                value={formData.namaSekolah}
                onChange={(e) => handleChange('namaSekolah', e.target.value)}
                required
                placeholder="Contoh: SMP BINA INSAN CINTA & KARAKTER BANGSA"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Alamat & Kontak Sekolah (Baris 3 Kop)
              </label>
              <input
                type="text"
                value={formData.alamat}
                onChange={(e) => handleChange('alamat', e.target.value)}
                required
                placeholder="Contoh: Jl. Pendidikan No. 88, Tebet, Telp. (021) 8294711"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Email / Website Sekolah
              </label>
              <input
                type="text"
                value={formData.websiteOrEmail || ''}
                onChange={(e) => handleChange('websiteOrEmail', e.target.value)}
                placeholder="info@sekolahkbc.sch.id"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Fokus Kurikulum Utama
              </label>
              <input
                type="text"
                value={formData.kurikulumUtama}
                onChange={(e) => handleChange('kurikulumUtama', e.target.value)}
                placeholder="Kurikulum Merdeka & Kurikulum Berbasis Cinta (KBC)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Kalender & Tanda Tangan Pejabat */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileSignature className="w-4 h-4 text-emerald-600" />
            2. Pejabat Penandatangan & Kalender Akademik
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nama Kepala Sekolah (Beserta Gelar)
              </label>
              <input
                type="text"
                value={formData.namaKepsek}
                onChange={(e) => handleChange('namaKepsek', e.target.value)}
                required
                placeholder="Contoh: Dr. H. Ahmad Fauzan, M.Pd."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                NIP Kepala Sekolah
              </label>
              <input
                type="text"
                value={formData.nipKepsek}
                onChange={(e) => handleChange('nipKepsek', e.target.value)}
                required
                placeholder="Contoh: 19760514 200112 1 003"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Tempat & Tanggal Pengesahan Tanda Tangan
              </label>
              <input
                type="text"
                value={formData.tempatTanggalTtd}
                onChange={(e) => handleChange('tempatTanggalTtd', e.target.value)}
                required
                placeholder="Contoh: Jakarta, 14 Agustus 2026"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tahun Pelajaran
                </label>
                <input
                  type="text"
                  value={formData.tahunPelajaran}
                  onChange={(e) => handleChange('tahunPelajaran', e.target.value)}
                  required
                  placeholder="2025/2026"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Semester Aktif
                </label>
                <select
                  value={formData.semesterAktif}
                  onChange={(e) => handleChange('semesterAktif', e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Ganjil">Semester Ganjil (1)</option>
                  <option value="Genap">Semester Genap (2)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Live Kop & Signature Preview Box */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
            Pratinjau Format Standar Kop & Tanda Tangan Sejajar:
          </h3>
          <div className="bg-white p-6 rounded-xl border border-slate-300 text-center font-serif text-slate-900 shadow-xs">
            <div className="text-xs font-bold uppercase">{formData.namaInstansi}</div>
            <div className="text-sm font-extrabold uppercase my-0.5">{formData.namaSekolah}</div>
            <div className="text-[10px] text-slate-600">{formData.alamat}</div>
            <div className="border-b-[3px] border-double border-slate-900 my-3"></div>

            <div className="text-xs font-bold underline uppercase my-2">
              CONTOH DOKUMEN ADMINISTRASI PERANGKAT AJAR
            </div>

            <table className="w-full my-6 text-xs text-center border-none">
              <tbody>
                <tr>
                  <td className="w-1/2 align-top py-2 border-none">
                    Mengetahui,<br />
                    <strong>Kepala Sekolah</strong><br /><br /><br /><br />
                    <strong><u>{formData.namaKepsek}</u></strong><br />
                    <span>NIP. {formData.nipKepsek}</span>
                  </td>
                  <td className="w-1/2 align-top py-2 border-none">
                    {formData.tempatTanggalTtd}<br />
                    <strong>Guru Mata Pelajaran</strong><br /><br /><br /><br />
                    <strong><u>[Nama Guru Pengampu]</u></strong><br />
                    <span>NIP. [NIP Guru]</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Save Button */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-900/20 transition-all active:scale-[0.99]"
          >
            <Save className="w-4 h-4" />
            Simpan Seluruh Konfigurasi
          </button>
        </div>
      </form>
    </div>
  );
};
