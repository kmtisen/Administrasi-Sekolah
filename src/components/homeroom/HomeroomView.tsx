import React, { useState } from 'react';
import {
  Heart,
  UserCheck,
  Plus,
  Printer,
  Download,
  Calendar,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
  X,
  Save,
  Trash2,
  Users,
} from 'lucide-react';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { Student, ClassItem, AttendanceRecord, GradeRecord, User, SchoolConfig, HomeroomGuidance } from '../../types';
import { getDocumentStyles, generateStandardKopHtml, generateTwoColumnSignatureHtml, downloadDocFile } from '../../services/docExportHelper';

interface HomeroomViewProps {
  students: Student[];
  classes: ClassItem[];
  currentUser: User;
  schoolConfig: SchoolConfig;
  attendanceRecords: AttendanceRecord[];
  grades: GradeRecord[];
  guidances: HomeroomGuidance[];
  onSaveGuidances: (guidances: HomeroomGuidance[]) => void;
}

export const HomeroomView: React.FC<HomeroomViewProps> = ({
  students,
  classes,
  currentUser,
  schoolConfig,
  attendanceRecords,
  grades,
  guidances,
  onSaveGuidances,
}) => {
  const targetClass = currentUser.kelasBinaan || classes[0]?.namaKelas || 'Kelas VII-A';
  const [selectedClass, setSelectedClass] = useState<string>(targetClass);
  const [activeTab, setActiveTab] = useState<'guidance' | 'recap'>('guidance');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state for Guidance
  const classStudents = students.filter((s) => s.kelas === selectedClass);
  const [studentId, setStudentId] = useState(classStudents[0]?.id || '');
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [jenisBimbingan, setJenisBimbingan] = useState<'Akademik' | 'Karakter & KBC' | 'Sosial / Kedisiplinan' | 'Pribadi'>('Karakter & KBC');
  const [masalahKejadian, setMasalahKejadian] = useState('');
  const [tindakLanjutSolusi, setTindakLanjutSolusi] = useState('');
  const [keteranganStatus, setKeteranganStatus] = useState<'Selesai' | 'Dalam Pemantauan' | 'Perlu Koordinasi Ortu'>('Dalam Pemantauan');

  const filteredGuidances = guidances.filter((g) => g.kelas === selectedClass);

  const handleOpenAdd = () => {
    if (classStudents.length > 0) setStudentId(classStudents[0].id);
    setTanggal(new Date().toISOString().slice(0, 10));
    setJenisBimbingan('Karakter & KBC');
    setMasalahKejadian('');
    setTindakLanjutSolusi('');
    setKeteranganStatus('Dalam Pemantauan');
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === studentId);
    if (!st) return;

    const newGuidance: HomeroomGuidance = {
      id: `gui-${Date.now()}`,
      waliKelasId: currentUser.id,
      waliKelasName: currentUser.nama,
      kelas: selectedClass,
      studentId: st.id,
      studentName: st.nama,
      nisn: st.nisn,
      tanggal,
      jenisBimbingan,
      masalahKejadian,
      tindakLanjutSolusi,
      keteranganStatus,
    };

    onSaveGuidances([newGuidance, ...guidances]);
    setIsModalOpen(false);

    Swal.fire({
      icon: 'success',
      title: 'Catatan Bimbingan Tersimpan',
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleDeleteGuidance = (id: string) => {
    Swal.fire({
      title: 'Hapus Catatan Bimbingan?',
      text: 'Catatan ini akan dihapus dari riwayat bimbingan wali kelas.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    }).then((res) => {
      if (res.isConfirmed) {
        onSaveGuidances(guidances.filter((g) => g.id !== id));
        Swal.fire({
          icon: 'success',
          title: 'Catatan Dihapus',
          timer: 1200,
          showConfirmButton: false,
        });
      }
    });
  };

  // Generate Formal Print for Homeroom Guidance Book
  const handlePrintGuidanceBook = () => {
    const kop = generateStandardKopHtml(
      schoolConfig,
      'BUKU CATATAN BIMBINGAN & KONSELING WALI KELAS',
      `Kelas: ${selectedClass} | Semester: ${schoolConfig.semesterAktif} | Tahun Pelajaran: ${schoolConfig.tahunPelajaran}`
    );
    const signature = generateTwoColumnSignatureHtml(schoolConfig, currentUser.nama, currentUser.nip, 'Wali Kelas');

    const rowsHtml = filteredGuidances
      .map(
        (g, i) => `
        <tr>
          <td style="text-align:center; padding: 6px;">${i + 1}</td>
          <td style="padding: 6px;">${g.tanggal}</td>
          <td style="padding: 6px; font-weight:bold;">${g.studentName}<br/><span style="font-size:9pt; font-weight:normal; color:#555;">NISN: ${g.nisn}</span></td>
          <td style="padding: 6px;">${g.jenisBimbingan}</td>
          <td style="padding: 6px;">${g.masalahKejadian}</td>
          <td style="padding: 6px;">${g.tindakLanjutSolusi}</td>
          <td style="text-align:center; padding: 6px;"><strong>${g.keteranganStatus}</strong></td>
        </tr>
      `
      )
      .join('');

    const fullHtml = `
      ${kop}
      <div style="text-align: center; margin: 15px 0 20px 0;">
        <h3 style="margin: 0; font-size: 14pt; text-transform: uppercase; font-weight: bold;">
          BUKU CATATAN BIMBINGAN & KONSELING WALI KELAS
        </h3>
        <p style="margin: 3px 0 0 0; font-size: 11pt;">
          Kelas: <strong>${selectedClass}</strong> | Semester: <strong>${schoolConfig.semesterAktif}</strong> | Tahun Pelajaran: <strong>${schoolConfig.tahunPelajaran}</strong>
        </p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10pt;" border="1">
        <thead>
          <tr style="background-color: #f0f0f0; text-align: center; font-weight: bold;">
            <th style="width: 30px; padding: 8px;">No</th>
            <th style="width: 80px; padding: 8px;">Tanggal</th>
            <th style="width: 160px; padding: 8px;">Nama Peserta Didik</th>
            <th style="width: 110px; padding: 8px;">Bidang Bimbingan</th>
            <th style="padding: 8px;">Masalah / Kejadian</th>
            <th style="padding: 8px;">Tindak Lanjut & Pendampingan Kasih Sayang</th>
            <th style="width: 90px; padding: 8px;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="7" style="text-align:center; padding:20px;">Belum ada data bimbingan.</td></tr>'}
        </tbody>
      </table>

      ${signature}
    `;

    const printWin = window.open('', '_blank');
    if (!printWin) {
      Swal.fire('Info', 'Mohon izinkan popup window untuk mencetak.', 'info');
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Buku Bimbingan Wali Kelas - ${selectedClass}</title>
          <style>${getDocumentStyles(true)}</style>
        </head>
        <body onload="window.print();">
          ${fullHtml}
        </body>
      </html>
    `);
    printWin.document.close();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-600 text-white font-bold text-[10px] uppercase tracking-wider">
                Khusus Wali Kelas
              </span>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Bimbingan & Rekapitulasi Kelas Binaan ({selectedClass})
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Pendampingan psikososial, penanaman karakter cinta kasih (KBC), dan pemantauan perkembangan holistik siswa.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrintGuidanceBook}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak Buku Bimbingan
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-950/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Catat Bimbingan Siswa
          </button>
        </div>
      </div>

      {/* Tabs Switcher & Class Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('guidance')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'guidance'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            1. Catatan Bimbingan & Konseling ({filteredGuidances.length})
          </button>
          <button
            onClick={() => setActiveTab('recap')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'recap'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            2. Rekapitulasi Profil & Presensi Kelas
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500">Pilih Kelas:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.namaKelas}>
                {c.namaKelas} ({c.fase})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TAB 1: GUIDANCE TABLE */}
      {activeTab === 'guidance' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5 pl-5 w-10 text-center">No</th>
                  <th className="p-3.5">Tanggal</th>
                  <th className="p-3.5">Nama Peserta Didik</th>
                  <th className="p-3.5">Bidang Bimbingan</th>
                  <th className="p-3.5">Masalah / Perkembangan</th>
                  <th className="p-3.5">Tindak Lanjut & Pendekatan Cinta</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 pr-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGuidances.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      Belum ada catatan bimbingan untuk kelas {selectedClass}. Klik "Catat Bimbingan Siswa" di atas.
                    </td>
                  </tr>
                ) : (
                  filteredGuidances.map((g, idx) => (
                    <tr key={g.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 pl-5 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-3.5 font-medium text-slate-800 whitespace-nowrap">{g.tanggal}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{g.studentName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">NISN: {g.nisn}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          {g.jenisBimbingan}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-700 max-w-xs">{g.masalahKejadian}</td>
                      <td className="p-3.5 text-emerald-800 font-medium max-w-xs">{g.tindakLanjutSolusi}</td>
                      <td className="p-3.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            g.keteranganStatus === 'Selesai'
                              ? 'bg-emerald-100 text-emerald-800'
                              : g.keteranganStatus === 'Perlu Koordinasi Ortu'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {g.keteranganStatus}
                        </span>
                      </td>
                      <td className="p-3.5 pr-5 text-right">
                        <button
                          onClick={() => handleDeleteGuidance(g.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Catatan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: RECAP TAB */}
      {activeTab === 'recap' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs font-bold text-slate-400 uppercase">Jumlah Siswa Kelas</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{classStudents.length} Siswa</div>
              <p className="text-[11px] text-emerald-600 mt-1">L: {classStudents.filter((s) => s.jenisKelamin === 'L').length} &bull; P: {classStudents.filter((s) => s.jenisKelamin === 'P').length}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs font-bold text-slate-400 uppercase">Total Sesi Bimbingan</div>
              <div className="text-2xl font-black text-amber-600 mt-1">{filteredGuidances.length} Kasus</div>
              <p className="text-[11px] text-slate-500 mt-1">{filteredGuidances.filter((g) => g.keteranganStatus === 'Selesai').length} Terselesaikan</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs font-bold text-slate-400 uppercase">Wali Kelas Penanggung Jawab</div>
              <div className="text-base font-bold text-slate-900 mt-1 truncate">{currentUser.nama}</div>
              <p className="text-[11px] text-slate-500 mt-1">NIP. {currentUser.nip || '-'}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700">
              Daftar Peserta Didik Rombel {selectedClass}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold">
                  <tr>
                    <th className="p-3 pl-4 w-10">No</th>
                    <th className="p-3">NISN / NIS</th>
                    <th className="p-3">Nama Lengkap</th>
                    <th className="p-3">L/P</th>
                    <th className="p-3">Nama Orang Tua</th>
                    <th className="p-3 pr-4">Kontak WhatsApp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classStudents.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-slate-50/80">
                      <td className="p-3 pl-4 font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-mono">{s.nisn}</td>
                      <td className="p-3 font-bold text-slate-900">{s.nama}</td>
                      <td className="p-3 font-bold">{s.jenisKelamin}</td>
                      <td className="p-3 text-slate-700">{s.namaOrtu}</td>
                      <td className="p-3 pr-4 text-emerald-700 font-semibold">{s.noHpOrtu || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Guidance */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="font-bold text-sm">Catat Bimbingan & Konseling Siswa</h3>
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
                  Pilih Peserta Didik
                </label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {classStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama} ({s.nisn}) - {s.jenisKelamin}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tanggal Bimbingan
                  </label>
                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Bidang Bimbingan
                  </label>
                  <select
                    value={jenisBimbingan}
                    onChange={(e) => setJenisBimbingan(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Karakter & KBC">Karakter & Nilai Cinta (KBC)</option>
                    <option value="Akademik">Akademik & Minat Belajar</option>
                    <option value="Sosial / Kedisiplinan">Sosial & Kedisiplinan</option>
                    <option value="Pribadi">Pribadi & Emosional</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Uraian Masalah / Perilaku yang Teramati
                </label>
                <textarea
                  rows={2}
                  value={masalahKejadian}
                  onChange={(e) => setMasalahKejadian(e.target.value)}
                  required
                  placeholder="Contoh: Siswa tampak kurang bersemangat dan terlambat mengumpulkan tugas aljabar..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tindak Lanjut & Pendekatan Kasih Sayang
                </label>
                <textarea
                  rows={2}
                  value={tindakLanjutSolusi}
                  onChange={(e) => setTindakLanjutSolusi(e.target.value)}
                  required
                  placeholder="Contoh: Dilakukan dialog empatik secara personal, memotivasi potensi siswa, dan menyepakati jadwal remedial bersama..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Status Bimbingan
                </label>
                <select
                  value={keteranganStatus}
                  onChange={(e) => setKeteranganStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Dalam Pemantauan">Dalam Pemantauan</option>
                  <option value="Selesai">Selesai / Teratasi</option>
                  <option value="Perlu Koordinasi Ortu">Perlu Koordinasi Orang Tua / Guru BK</option>
                </select>
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
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-md"
                >
                  <Save className="w-3.5 h-3.5" />
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
