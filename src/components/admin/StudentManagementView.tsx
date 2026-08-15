import React, { useState, useRef } from 'react';
import {
  Users,
  UserPlus,
  Upload,
  Download,
  Search,
  Edit2,
  Trash2,
  FileSpreadsheet,
  X,
  Save,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { Student, ClassItem } from '../../types';

interface StudentManagementViewProps {
  students: Student[];
  classes: ClassItem[];
  onSaveStudents: (students: Student[]) => void;
}

export const StudentManagementView: React.FC<StudentManagementViewProps> = ({
  students,
  classes,
  onSaveStudents,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [nama, setNama] = useState('');
  const [nisn, setNisn] = useState('');
  const [nis, setNis] = useState('');
  const [kelas, setKelas] = useState(classes[0]?.namaKelas || 'Kelas VII-A');
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P'>('L');
  const [agama, setAgama] = useState('Islam');
  const [namaOrtu, setNamaOrtu] = useState('');
  const [noHpOrtu, setNoHpOrtu] = useState('');
  const [alamat, setAlamat] = useState('');

  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nisn.includes(searchTerm) ||
      s.nis.includes(searchTerm);
    const matchClass = selectedClass === 'all' || s.kelas === selectedClass;
    return matchSearch && matchClass;
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setNama('');
    setNisn('');
    setNis('');
    setKelas(classes[0]?.namaKelas || 'Kelas VII-A');
    setJenisKelamin('L');
    setAgama('Islam');
    setNamaOrtu('');
    setNoHpOrtu('');
    setAlamat('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Student) => {
    setEditingStudent(s);
    setNama(s.nama);
    setNisn(s.nisn);
    setNis(s.nis);
    setKelas(s.kelas);
    setJenisKelamin(s.jenisKelamin);
    setAgama(s.agama);
    setNamaOrtu(s.namaOrtu);
    setNoHpOrtu(s.noHpOrtu || '');
    setAlamat(s.alamat || '');
    setIsModalOpen(true);
  };

  const handleDelete = (s: Student) => {
    Swal.fire({
      title: `Hapus Siswa ${s.nama}?`,
      text: 'Data presensi dan nilai siswa ini akan terhapus.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    }).then((res) => {
      if (res.isConfirmed) {
        const updated = students.filter((item) => item.id !== s.id);
        onSaveStudents(updated);
        Swal.fire({
          icon: 'success',
          title: 'Siswa Dihapus',
          timer: 1200,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingStudent) {
      const updated = students.map((s) =>
        s.id === editingStudent.id
          ? {
              ...s,
              nama,
              nisn,
              nis,
              kelas,
              jenisKelamin,
              agama,
              namaOrtu,
              noHpOrtu,
              alamat,
            }
          : s
      );
      onSaveStudents(updated);
      Swal.fire({
        icon: 'success',
        title: 'Data Siswa Diperbarui',
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      const newStudent: Student = {
        id: `s-${Date.now()}`,
        nama,
        nisn: nisn || `0089${Math.floor(100000 + Math.random() * 900000)}`,
        nis: nis || `247${Math.floor(100 + Math.random() * 900)}`,
        kelas,
        jenisKelamin,
        agama,
        namaOrtu,
        noHpOrtu,
        alamat,
      };
      onSaveStudents([newStudent, ...students]);
      Swal.fire({
        icon: 'success',
        title: 'Siswa Ditambahkan',
        timer: 1500,
        showConfirmButton: false,
      });
    }

    setIsModalOpen(false);
  };

  // Excel / CSV File Import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet);

        if (!rows || rows.length === 0) {
          Swal.fire('Format Kosong', 'File Excel/CSV tidak memiliki data baris.', 'error');
          return;
        }

        const importedStudents: Student[] = rows.map((r, i) => ({
          id: `imp-${Date.now()}-${i}`,
          nisn: String(r.NISN || r.nisn || `0089${100000 + i}`),
          nis: String(r.NIS || r.nis || `247${100 + i}`),
          nama: String(r.Nama || r.nama || r['Nama Siswa'] || 'Siswa Baru'),
          kelas: String(r.Kelas || r.kelas || classes[0]?.namaKelas || 'Kelas VII-A'),
          jenisKelamin: r.JK === 'P' || r.Gender === 'P' || r['Jenis Kelamin'] === 'P' ? 'P' : 'L',
          agama: String(r.Agama || r.agama || 'Islam'),
          namaOrtu: String(r['Nama Orang Tua'] || r.Ortu || r.namaOrtu || '-'),
          noHpOrtu: String(r['No HP'] || r.noHp || '-'),
          alamat: String(r.Alamat || r.alamat || '-'),
        }));

        onSaveStudents([...importedStudents, ...students]);

        Swal.fire({
          icon: 'success',
          title: `Berhasil Import ${importedStudents.length} Siswa!`,
          text: 'Data siswa telah tersimpan ke dalam database sistem.',
          confirmButtonColor: '#059669',
        });
      } catch (err) {
        console.error('Import error: ', err);
        Swal.fire('Gagal Import', 'Terjadi kesalahan membaca file Excel/CSV.', 'error');
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        NISN: '0089234501',
        NIS: '247001',
        Nama: 'Ahmad Raihan Pratama',
        Kelas: 'Kelas VII-A',
        JK: 'L',
        Agama: 'Islam',
        'Nama Orang Tua': 'Bambang Pratama',
        'No HP': '081234567890',
        Alamat: 'Jl. Melati No. 10',
      },
      {
        NISN: '0089234502',
        NIS: '247002',
        Nama: 'Annisa Fitriani',
        Kelas: 'Kelas VII-A',
        JK: 'P',
        Agama: 'Islam',
        'Nama Orang Tua': 'H. Ridwan',
        'No HP': '081234567891',
        Alamat: 'Jl. Anggrek No. 4',
      },
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template_Siswa');
    XLSX.writeFile(wb, 'Template_Import_Siswa_KBC.xlsx');
  };

  const handleExportData = () => {
    const exportData = filteredStudents.map((s, idx) => ({
      No: idx + 1,
      NISN: s.nisn,
      NIS: s.nis,
      'Nama Siswa': s.nama,
      Kelas: s.kelas,
      JK: s.jenisKelamin,
      Agama: s.agama,
      'Nama Orang Tua': s.namaOrtu,
      'No HP': s.noHpOrtu || '-',
      Alamat: s.alamat || '-',
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data_Siswa');
    XLSX.writeFile(wb, `Data_Siswa_${selectedClass}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Master Data & Import Peserta Didik
            </h1>
            <p className="text-xs text-slate-500">
              Kelola data profil siswa, NISN, wali murid, dan fasilitas import massal Excel/CSV.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-all"
            title="Import dari file Excel atau CSV"
          >
            <Upload className="w-4 h-4" />
            Import Excel / CSV
          </button>

          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-300 transition-all"
            title="Download template file format import"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Template Excel
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-950/20 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Tambah Siswa
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama siswa, NISN, atau NIS..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Pilih Kelas:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Kelas ({students.length} Siswa)</option>
            {classes.map((c) => (
              <option key={c.id} value={c.namaKelas}>
                {c.namaKelas}
              </option>
            ))}
          </select>

          <button
            onClick={handleExportData}
            className="inline-flex items-center gap-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
            title="Download rekap data siswa ke Excel"
          >
            <Download className="w-3.5 h-3.5" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5 pl-5 w-12">No</th>
                <th className="p-3.5">NISN / NIS</th>
                <th className="p-3.5">Nama Peserta Didik</th>
                <th className="p-3.5">Kelas</th>
                <th className="p-3.5">L/P</th>
                <th className="p-3.5">Agama</th>
                <th className="p-3.5">Orang Tua / No. HP</th>
                <th className="p-3.5 pr-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Tidak ditemukan data siswa yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 pl-5 font-semibold text-slate-400">{idx + 1}</td>
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-slate-800">{s.nisn}</div>
                      <div className="text-[10px] text-slate-500">NIS: {s.nis}</div>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">{s.nama}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold rounded text-[11px] border border-emerald-200">
                        {s.kelas}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-1.5 py-0.5 font-bold rounded text-[10px] ${
                          s.jenisKelamin === 'L'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {s.jenisKelamin}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-700">{s.agama}</td>
                    <td className="p-3.5">
                      <div className="text-slate-800">{s.namaOrtu}</div>
                      <div className="text-[10px] text-slate-500">{s.noHpOrtu || '-'}</div>
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit Siswa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="font-bold text-sm">
                {editingStudent ? 'Edit Data Peserta Didik' : 'Tambah Peserta Didik Baru'}
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
                  Nama Lengkap Siswa
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  required
                  placeholder="Contoh: Muhammad Farhan Al-Ghifari"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    NISN (10 Digit)
                  </label>
                  <input
                    type="text"
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    required
                    placeholder="0089123456"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    NIS Lokal
                  </label>
                  <input
                    type="text"
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                    placeholder="247001"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Kelas
                  </label>
                  <select
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.namaKelas}>
                        {c.namaKelas}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={jenisKelamin}
                    onChange={(e) => setJenisKelamin(e.target.value as 'L' | 'P')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="L">Laki-Laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Agama
                  </label>
                  <select
                    value={agama}
                    onChange={(e) => setAgama(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Islam">Islam</option>
                    <option value="Kristen">Kristen</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Konghucu">Konghucu</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nama Orang Tua / Wali
                  </label>
                  <input
                    type="text"
                    value={namaOrtu}
                    onChange={(e) => setNamaOrtu(e.target.value)}
                    placeholder="Nama Orang Tua"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    No. WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    value={noHpOrtu}
                    onChange={(e) => setNoHpOrtu(e.target.value)}
                    placeholder="08123456789"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Alamat Tempat Tinggal
                </label>
                <input
                  type="text"
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Jl. Raya..."
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
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
