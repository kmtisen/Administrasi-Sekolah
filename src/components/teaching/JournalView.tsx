import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Printer,
  Download,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
  Save,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { TeacherJournal, ClassItem, User, SchoolConfig } from '../../types';
import { generateFormalJournalHtml, getDocumentStyles, downloadDocFile } from '../../services/docExportHelper';

interface JournalViewProps {
  journals: TeacherJournal[];
  classes: ClassItem[];
  currentUser: User;
  schoolConfig: SchoolConfig;
  onSaveJournals: (journals: TeacherJournal[]) => void;
}

export const JournalView: React.FC<JournalViewProps> = ({
  journals,
  classes,
  currentUser,
  schoolConfig,
  onSaveJournals,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [jamKe, setJamKe] = useState('1 - 2');
  const [kelas, setKelas] = useState(classes[0]?.namaKelas || 'Kelas VII-A');
  const [pertemuanKe, setPertemuanKe] = useState(1);
  const [materiPokok, setMateriPokok] = useState('');
  const [tujuanPembelajaran, setTujuanPembelajaran] = useState('');
  const [catatanPerkembangan, setCatatanPerkembangan] = useState('');
  const [kegiatanKbc, setKegiatanKbc] = useState('');

  // Filter journals for current teacher or selected class
  const userJournals = journals.filter(
    (j) =>
      (currentUser.role === 'admin' || j.guruId === currentUser.id) &&
      (selectedClass === 'all' || j.kelas === selectedClass)
  );

  const handleOpenAdd = () => {
    setTanggal(new Date().toISOString().slice(0, 10));
    setJamKe('1 - 2');
    setKelas(classes[0]?.namaKelas || 'Kelas VII-A');
    setPertemuanKe(userJournals.length + 1);
    setMateriPokok('');
    setTujuanPembelajaran('');
    setCatatanPerkembangan('Siswa aktif berdiskusi dan antusias mempraktikkan materi.');
    setKegiatanKbc('Pembiasaan Berdoa Khusyuk, Ice Breaking Kasih Sayang, & Refleksi Syukur');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Hapus Catatan Jurnal?',
      text: 'Catatan agenda mengajar ini akan dihapus permanen.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    }).then((res) => {
      if (res.isConfirmed) {
        const updated = journals.filter((j) => j.id !== id);
        onSaveJournals(updated);
        Swal.fire({
          icon: 'success',
          title: 'Jurnal Dihapus',
          timer: 1200,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();

    const newJournal: TeacherJournal = {
      id: `jrn-${Date.now()}`,
      guruId: currentUser.id,
      guruNama: currentUser.nama,
      mapel: currentUser.mapel,
      kelas,
      tanggal,
      jamKe,
      materiPokok,
      tujuanPembelajaran,
      kegiatanPembelajaran: kegiatanKbc || 'Pembelajaran Aktif Berbasis Deep Learning',
      refleksiDanTindakLanjut: catatanPerkembangan || 'KBM berjalan tertib dan bermakna.',
      jumlahHadir: 32,
      jumlahTidakHadir: 0,
      status: 'Selesai',
    };

    onSaveJournals([newJournal, ...journals]);
    setIsModalOpen(false);

    Swal.fire({
      icon: 'success',
      title: 'Jurnal Mengajar Tersimpan',
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handlePrintFormal = () => {
    const formalHtml = generateFormalJournalHtml(
      userJournals,
      schoolConfig,
      currentUser.nama,
      currentUser.mapel
    );

    const printWin = window.open('', '_blank');
    if (!printWin) {
      Swal.fire('Info', 'Mohon izinkan popup window untuk mencetak.', 'info');
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Jurnal Agenda Mengajar Guru - ${currentUser.nama}</title>
          <style>${getDocumentStyles(true)}</style>
        </head>
        <body onload="window.print();">
          ${formalHtml}
        </body>
      </html>
    `);
    printWin.document.close();
  };

  const handleExportWord = () => {
    const formalHtml = generateFormalJournalHtml(
      userJournals,
      schoolConfig,
      currentUser.nama,
      currentUser.mapel
    );
    downloadDocFile(`Jurnal_Mengajar_${currentUser.nama.replace(/\s+/g, '_')}`, formalHtml, true);
    Swal.fire({
      icon: 'success',
      title: 'File Word Berhasil Diunduh!',
      timer: 1500,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Agenda & Jurnal Harian Guru Mengajar
            </h1>
            <p className="text-xs text-slate-500">
              Dokumentasi pelaksanaan KBM harian, ketercapaian TP, pembiasaan nilai cinta (KBC), dan refleksi kelas.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrintFormal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak Jurnal Formal
          </button>

          <button
            onClick={handleExportWord}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Download Word (.doc)
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-950/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Tambah Catatan Jurnal
          </button>
        </div>
      </div>

      {/* Filter by class */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-slate-600">Filter Kelas:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Kelas</option>
            {classes.map((c) => (
              <option key={c.id} value={c.namaKelas}>
                {c.namaKelas}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          Total {userJournals.length} Catatan Terdaftar
        </span>
      </div>

      {/* Journal Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5 pl-5 w-12 text-center">No</th>
                <th className="p-3.5">Hari / Tanggal</th>
                <th className="p-3.5">Jam & Ptm</th>
                <th className="p-3.5">Kelas</th>
                <th className="p-3.5">Materi Pokok / TP</th>
                <th className="p-3.5">Pembiasaan KBC</th>
                <th className="p-3.5">Catatan / Refleksi</th>
                <th className="p-3.5 pr-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {userJournals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Belum ada agenda jurnal mengajar yang dicatat. Klik tombol "Tambah Catatan Jurnal" di atas.
                  </td>
                </tr>
              ) : (
                userJournals.map((j, idx) => (
                  <tr key={j.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 pl-5 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-3.5 font-medium text-slate-900 whitespace-nowrap">{j.tanggal}</td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="font-semibold text-slate-700">Jam {j.jamKe}</span>
                      <div className="text-[10px] text-emerald-600 font-bold">Ptm Ke-{j.pertemuanKe}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-cyan-50 border border-cyan-200 text-cyan-800 font-bold rounded text-[10px]">
                        {j.kelas}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{j.materiPokok}</div>
                      {j.tujuanPembelajaran && (
                        <div className="text-[10px] text-slate-500 line-clamp-1">{j.tujuanPembelajaran}</div>
                      )}
                    </td>
                    <td className="p-3.5 text-rose-700 font-medium">
                      {j.kegiatanKbc || '-'}
                    </td>
                    <td className="p-3.5 text-slate-600 max-w-xs">{j.catatanPerkembangan}</td>
                    <td className="p-3.5 pr-5 text-right">
                      <button
                        onClick={() => handleDelete(j.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus Jurnal"
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

      {/* Modal Add */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="font-bold text-sm">Tambah Agenda Jurnal Guru</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tanggal KBM
                  </label>
                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Jam Pembelajaran Ke-
                  </label>
                  <input
                    type="text"
                    value={jamKe}
                    onChange={(e) => setJamKe(e.target.value)}
                    placeholder="Contoh: 1 - 2 (07.00 - 08.20)"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Pertemuan Ke-
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={pertemuanKe}
                    onChange={(e) => setPertemuanKe(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Materi Pokok / Pembahasan
                </label>
                <input
                  type="text"
                  value={materiPokok}
                  onChange={(e) => setMateriPokok(e.target.value)}
                  placeholder="Contoh: Persamaan Linear Satu Variabel & Pengamalan Kasih Sayang"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tujuan Pembelajaran (TP)
                </label>
                <input
                  type="text"
                  value={tujuanPembelajaran}
                  onChange={(e) => setTujuanPembelajaran(e.target.value)}
                  placeholder="Peserta didik mampu menyelesaikan model matematika secara teliti..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Pembiasaan Nilai Cinta / Karakter KBC
                </label>
                <input
                  type="text"
                  value={kegiatanKbc}
                  onChange={(e) => setKegiatanKbc(e.target.value)}
                  placeholder="Doa Bersama Penuh Penghayatan & Saling Menghargai Pendapat Teman"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Catatan Refleksi & Hambatan Kelas
                </label>
                <textarea
                  rows={3}
                  value={catatanPerkembangan}
                  onChange={(e) => setCatatanPerkembangan(e.target.value)}
                  placeholder="Catatan keaktifan siswa atau tindak lanjut pembelajaran..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  Simpan Jurnal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
