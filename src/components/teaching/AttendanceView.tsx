import React, { useState } from 'react';
import {
  CalendarCheck,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  Printer,
  Download,
  Save,
  Check,
  FileSpreadsheet,
} from 'lucide-react';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { AttendanceRecord, ClassItem, Student, User, SchoolConfig } from '../../types';
import { generateFormalAttendanceHtml, getDocumentStyles, downloadDocFile } from '../../services/docExportHelper';

interface AttendanceViewProps {
  students: Student[];
  classes: ClassItem[];
  currentUser: User;
  schoolConfig: SchoolConfig;
  attendanceRecords: AttendanceRecord[];
  onSaveAttendance: (records: AttendanceRecord[]) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  students,
  classes,
  currentUser,
  schoolConfig,
  attendanceRecords,
  onSaveAttendance,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>(
    currentUser.kelasBinaan || classes[0]?.namaKelas || 'Kelas VII-A'
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [pertemuanKe, setPertemuanKe] = useState<number>(1);
  const [materi, setMateri] = useState<string>('Konsep Aljabar & Nilai Kasih Sayang');

  // Filter students for the active class
  const classStudents = students.filter((s) => s.kelas === selectedClass);

  // Local state for daily status map: studentId -> 'H' | 'S' | 'I' | 'A' | 'B'
  const [statusMap, setStatusMap] = useState<{ [studentId: string]: 'H' | 'S' | 'I' | 'A' | 'B' }>(
    () => {
      const initial: { [studentId: string]: 'H' | 'S' | 'I' | 'A' | 'B' } = {};
      classStudents.forEach((s) => {
        const existing = attendanceRecords.find(
          (r) => r.studentId === s.id && r.tanggal === selectedDate
        );
        initial[s.id] = existing ? existing.status : 'H';
      });
      return initial;
    }
  );

  // Stats calculation
  const totalStudents = classStudents.length;
  const hadirCount = Object.values(statusMap).filter((s) => s === 'H').length;
  const sakitCount = Object.values(statusMap).filter((s) => s === 'S').length;
  const izinCount = Object.values(statusMap).filter((s) => s === 'I').length;
  const alpaCount = Object.values(statusMap).filter((s) => s === 'A').length;
  const bolosCount = Object.values(statusMap).filter((s) => s === 'B').length;

  const handleStatusChange = (studentId: string, status: 'H' | 'S' | 'I' | 'A' | 'B') => {
    setStatusMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSetAllHadir = () => {
    const newMap: { [studentId: string]: 'H' | 'S' | 'I' | 'A' | 'B' } = {};
    classStudents.forEach((s) => {
      newMap[s.id] = 'H';
    });
    setStatusMap(newMap);
    Swal.fire({
      icon: 'success',
      title: 'Semua Hadir',
      text: 'Status seluruh siswa diatur menjadi Hadir (H).',
      timer: 1000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
    });
  };

  const handleSave = () => {
    // Generate new records for this date & class
    const otherRecords = attendanceRecords.filter(
      (r) => !(r.kelas === selectedClass && r.tanggal === selectedDate)
    );

    const newRecords: AttendanceRecord[] = classStudents.map((s) => ({
      id: `att-${s.id}-${selectedDate}`,
      studentId: s.id,
      studentName: s.nama,
      kelas: selectedClass,
      mapel: currentUser.mapel,
      guruId: currentUser.id,
      guruName: currentUser.nama,
      tanggal: selectedDate,
      pertemuanKe,
      materi,
      status: statusMap[s.id] || 'H',
    }));

    onSaveAttendance([...otherRecords, ...newRecords]);

    Swal.fire({
      icon: 'success',
      title: 'Presensi Disimpan!',
      text: `Presensi ${selectedClass} tanggal ${selectedDate} berhasil diperbarui.`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handlePrintFormalAttendance = () => {
    const studentStatusList = classStudents.map((s) => ({
      studentId: s.id,
      studentName: s.nama,
      status: (statusMap[s.id] || 'H') as any,
      catatan: '',
    }));

    const attendanceRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      tanggal: selectedDate,
      kelasId: selectedClass,
      kelasNama: selectedClass,
      mapel: currentUser.mapel,
      guruId: currentUser.id,
      guruNama: currentUser.nama,
      jamKe: `Pertemuan ${pertemuanKe}`,
      materiPembelajaran: materi,
      catatanKejadian: '',
      presensi: studentStatusList,
      createdAt: new Date().toISOString(),
    };

    const formalHtml = generateFormalAttendanceHtml(
      attendanceRecord,
      schoolConfig
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
          <title>Daftar Hadir Siswa - ${selectedClass}</title>
          <style>${getDocumentStyles(false)}</style>
        </head>
        <body onload="window.print();">
          ${formalHtml}
        </body>
      </html>
    `);
    printWin.document.close();
  };

  const handleExportExcel = () => {
    const exportData = classStudents.map((s, idx) => ({
      No: idx + 1,
      NISN: s.nisn,
      'Nama Siswa': s.nama,
      Kelas: selectedClass,
      Tanggal: selectedDate,
      'Pertemuan Ke': pertemuanKe,
      'Mata Pelajaran': currentUser.mapel,
      Status: statusMap[s.id] || 'H',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Presensi');
    XLSX.writeFile(wb, `Presensi_${selectedClass}_${selectedDate}.xlsx`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Presensi & Absensi Harian Peserta Didik
            </h1>
            <p className="text-xs text-slate-500">
              Pencatatan kehadiran per mata pelajaran & pencetakan daftar hadir formal siap tanda tangan.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSetAllHadir}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 transition-all"
          >
            <Check className="w-3.5 h-3.5" />
            Set Semua Hadir (H)
          </button>

          <button
            onClick={handlePrintFormalAttendance}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak Format Formal
          </button>

          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-300"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Excel
          </button>

          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-950/20 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            Simpan Presensi
          </button>
        </div>
      </div>

      {/* Control Panel: Class, Date, Pertemuan Ke, Materi */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block font-bold text-slate-700 uppercase mb-1">Pilih Kelas</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.namaKelas}>
                {c.namaKelas} ({c.fase})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 uppercase mb-1">Tanggal KBM</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 uppercase mb-1">Pertemuan Ke-</label>
          <input
            type="number"
            min={1}
            max={36}
            value={pertemuanKe}
            onChange={(e) => setPertemuanKe(Number(e.target.value))}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 uppercase mb-1">Materi / TP Hari Ini</label>
          <input
            type="text"
            value={materi}
            onChange={(e) => setMateri(e.target.value)}
            placeholder="Materi pokok..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Recap Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Total Siswa</div>
          <div className="text-xl font-extrabold text-slate-800">{totalStudents}</div>
        </div>

        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
          <div className="text-[10px] font-bold text-emerald-700 uppercase">Hadir (H)</div>
          <div className="text-xl font-extrabold text-emerald-800">{hadirCount}</div>
        </div>

        <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
          <div className="text-[10px] font-bold text-blue-700 uppercase">Sakit (S)</div>
          <div className="text-xl font-extrabold text-blue-800">{sakitCount}</div>
        </div>

        <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
          <div className="text-[10px] font-bold text-amber-700 uppercase">Izin (I)</div>
          <div className="text-xl font-extrabold text-amber-800">{izinCount}</div>
        </div>

        <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
          <div className="text-[10px] font-bold text-rose-700 uppercase">Alpa (A)</div>
          <div className="text-xl font-extrabold text-rose-800">{alpaCount}</div>
        </div>

        <div className="bg-purple-50 p-3 rounded-xl border border-purple-200">
          <div className="text-[10px] font-bold text-purple-700 uppercase">Bolos (B)</div>
          <div className="text-xl font-extrabold text-purple-800">{bolosCount}</div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5 pl-5 w-12 text-center">No</th>
                <th className="p-3.5">NISN</th>
                <th className="p-3.5">Nama Peserta Didik</th>
                <th className="p-3.5">L/P</th>
                <th className="p-3.5 pr-5 text-center">Status Kehadiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Belum ada siswa terdaftar di {selectedClass}.
                  </td>
                </tr>
              ) : (
                classStudents.map((s, idx) => {
                  const curStatus = statusMap[s.id] || 'H';
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 pl-5 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-3.5 font-mono text-slate-600">{s.nisn}</td>
                      <td className="p-3.5 font-bold text-slate-900">{s.nama}</td>
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
                      <td className="p-3.5 pr-5 text-center">
                        <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl gap-1 border border-slate-200">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.id, 'H')}
                            className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                              curStatus === 'H'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:bg-white'
                            }`}
                            title="Hadir"
                          >
                            Hadir (H)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.id, 'S')}
                            className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                              curStatus === 'S'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-600 hover:bg-white'
                            }`}
                            title="Sakit"
                          >
                            Sakit (S)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.id, 'I')}
                            className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                              curStatus === 'I'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'text-slate-600 hover:bg-white'
                            }`}
                            title="Izin"
                          >
                            Izin (I)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.id, 'A')}
                            className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                              curStatus === 'A'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 hover:bg-white'
                            }`}
                            title="Alpa / Tanpa Keterangan"
                          >
                            Alpa (A)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.id, 'B')}
                            className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                              curStatus === 'B'
                                ? 'bg-purple-600 text-white shadow-xs'
                                : 'text-slate-600 hover:bg-white'
                            }`}
                            title="Bolos"
                          >
                            Bolos (B)
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
